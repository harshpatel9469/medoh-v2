import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkEmbeddings() {
    console.log('Checking embeddings in database...');

    try {
        // Check total number of questions
        const { data: allQuestions, error: allError } = await supabase
            .from('questions')
            .select('id, question_text, embedding')
            .limit(5);

        if (allError) {
            throw new Error(`Error fetching questions: ${allError.message}`);
        }

        console.log(`\n📊 Database Status:`);
        console.log(`Total questions fetched: ${allQuestions?.length || 0}`);
        
        if (allQuestions && allQuestions.length > 0) {
            console.log(`\n📋 Sample questions:`);
            allQuestions.forEach((q, i) => {
                console.log(`${i + 1}. ID: ${q.id}`);
                console.log(`   Text: "${q.question_text.substring(0, 50)}..."`);
                console.log(`   Has embedding: ${q.embedding ? '✅ YES' : '❌ NO'}`);
                if (q.embedding) {
                    console.log(`   Embedding length: ${Array.isArray(q.embedding) ? q.embedding.length : 'Not an array'}`);
                }
                console.log('');
            });
        }

        // Check how many questions have embeddings
        const { data: withEmbeddings, error: withError } = await supabase
            .from('questions')
            .select('id')
            .not('embedding', 'is', null);

        if (withError) {
            throw new Error(`Error checking embeddings: ${withError.message}`);
        }

        console.log(`\n🔍 Embedding Status:`);
        console.log(`Questions WITH embeddings: ${withEmbeddings?.length || 0}`);

        // Check how many questions don't have embeddings
        const { data: withoutEmbeddings, error: withoutError } = await supabase
            .from('questions')
            .select('id')
            .is('embedding', null);

        if (withoutError) {
            throw new Error(`Error checking missing embeddings: ${withoutError.message}`);
        }

        console.log(`Questions WITHOUT embeddings: ${withoutEmbeddings?.length || 0}`);

        // Check if embedding column exists
        const { data: sampleRow, error: sampleError } = await supabase
            .from('questions')
            .select('*')
            .limit(1);

        if (sampleError) {
            console.log(`\n❌ Error accessing questions table: ${sampleError.message}`);
        } else if (sampleRow && sampleRow.length > 0) {
            const columns = Object.keys(sampleRow[0]);
            console.log(`\n📋 Available columns in questions table:`);
            columns.forEach(col => {
                console.log(`   - ${col}`);
            });
            
            if (columns.includes('embedding')) {
                console.log(`\n✅ Embedding column exists!`);
            } else {
                console.log(`\n❌ Embedding column does NOT exist!`);
            }
        }

    } catch (error) {
        console.error('Error checking embeddings:', error);
    }
}

// Run the script
checkEmbeddings(); 