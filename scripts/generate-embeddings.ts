import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to generate embeddings using OpenAI API
const generateEmbedding = async (text: string): Promise<number[]> => {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            input: text,
            model: 'text-embedding-3-small',
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
};

async function generateEmbeddingsForAllQuestions() {
    console.log('Starting embedding generation...');

    try {
        // First, let's check how many questions we have total
        const { data: totalQuestions, error: totalError } = await supabase
            .from('questions')
            .select('id');

        if (totalError) {
            throw new Error(`Error fetching total questions: ${totalError.message}`);
        }

        console.log(`Total questions in database: ${totalQuestions?.length || 0}`);

        // Fetch all questions that don't have embeddings yet
        const { data: questions, error } = await supabase
            .from('questions')
            .select('id, question_text')
            .is('embedding', null);

        if (error) {
            throw new Error(`Error fetching questions: ${error.message}`);
        }

        if (!questions || questions.length === 0) {
            console.log('No questions found without embeddings.');
            return;
        }

        console.log(`Found ${questions.length} questions without embeddings.`);

        // Process questions in batches to avoid rate limits
        const batchSize = 10;
        let processed = 0;
        let failed = 0;

        for (let i = 0; i < questions.length; i += batchSize) {
            const batch = questions.slice(i, i + batchSize);
            
            console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(questions.length / batchSize)}...`);

            // Process each question in the batch
            for (const question of batch) {
                try {
                    console.log(`Generating embedding for: "${question.question_text.substring(0, 50)}..."`);
                    
                    // Generate embedding
                    const embedding = await generateEmbedding(question.question_text);
                    
                    console.log(`Generated embedding with ${embedding.length} dimensions`);
                    
                    // Update the question with the embedding
                    const { data: updateData, error: updateError } = await supabase
                        .from('questions')
                        .update({ embedding })
                        .eq('id', question.id)
                        .select('id, embedding');

                    if (updateError) {
                        console.error(`❌ Error updating question ${question.id}:`, updateError.message);
                        failed++;
                    } else {
                        processed++;
                        console.log(`✅ Updated question ${question.id}`);
                        
                        // Verify the update worked
                        if (updateData && updateData.length > 0) {
                            console.log(`   Verified: embedding saved with ${Array.isArray(updateData[0].embedding) ? updateData[0].embedding.length : 'unknown'} dimensions`);
                        }
                    }

                    // Small delay to avoid rate limits
                    await new Promise(resolve => setTimeout(resolve, 100));

                } catch (error) {
                    console.error(`❌ Error processing question ${question.id}:`, error);
                    failed++;
                }
            }

            // Delay between batches
            if (i + batchSize < questions.length) {
                console.log('Waiting 2 seconds before next batch...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        console.log(`\n📊 Final Results:`);
        console.log(`✅ Successfully processed: ${processed} questions`);
        console.log(`❌ Failed: ${failed} questions`);
        console.log(`📈 Success rate: ${((processed / (processed + failed)) * 100).toFixed(1)}%`);

    } catch (error) {
        console.error('Error generating embeddings:', error);
    }
}

// Run the script
generateEmbeddingsForAllQuestions(); 