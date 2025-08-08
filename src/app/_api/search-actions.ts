'use server'

import { createClient } from '@/utils/supabase/server';
import { Mistral } from '@mistralai/mistralai';

// Initialize Mistral client
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY! });

// Helper function to generate embeddings using Mistral API
const generateMistralEmbedding = async (text: string): Promise<number[]> => {
    const response = await mistral.embeddings.create({
        model: "mistral-embed",
        inputs: [text],
    });

    if (!response.data[0]?.embedding) {
        throw new Error('Failed to generate Mistral embedding');
    }

    return response.data[0].embedding;
};

export async function searchContent(term: string) {
    try {
        if (!term || term.trim().length < 1) {
            return [];
        }
        
        // Generate embedding for the search term
        const searchEmbedding = await generateMistralEmbedding(term);

        // Search questions using vector similarity
        const supabase = createClient();
        
        // Use the RPC function for Mistral vector search
        const { data, error } = await supabase
            .rpc('match_questions_mistral', {
                query_embedding: searchEmbedding,
                match_threshold: 0.3, // Lower threshold to get more results
                match_count: 20
            });

        if (error) {
            throw new Error(`Error searching questions: ${error.message}`);
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Get question IDs for video mapping
        const questionIds = data.map((item: any) => item.id);

        // Fetch associated videos for these questions
        const { data: questionVideosData } = await supabase
            .from('question_videos')
            .select('question_id, video_id')
            .in('question_id', questionIds);

        // Create mapping of question_id to video_id
        const questionToVideoMap: Record<string, string> = {};
        if (questionVideosData) {
            questionVideosData.forEach((item: any) => {
                questionToVideoMap[item.question_id] = item.video_id;
            });
        }

        // Format results to match expected structure
        const results = data.map((item: any) => ({
            id: item.id,
            question_text: item.question_text,
            question_id: item.id,
            type: 'question',
            video_id: questionToVideoMap[item.id] || null,
            similarity: item.similarity, // Include similarity score
            section_id: item.section_id, // Include section_id from question
        }));

        console.log('Search results with section_id:', results);
        return results;

    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

// New function for condition-specific search
export async function searchContentWithCondition(term: string, condition: string) {
    try {
        if (!term || term.trim().length < 1) {
            return [];
        }
        
        // Combine user query with condition name for more targeted search
        const combinedQuery = `${term} ${condition}`.trim();
        
        // Generate embedding for the combined search term
        const searchEmbedding = await generateMistralEmbedding(combinedQuery);

        // Search questions using vector similarity
        const supabase = createClient();
        
        // Use the RPC function for Mistral vector search
        const { data, error } = await supabase
            .rpc('match_questions_mistral', {
                query_embedding: searchEmbedding,
                match_threshold: 0.3, // Lower threshold to get more results
                match_count: 20
            });

        if (error) {
            throw new Error(`Error searching questions: ${error.message}`);
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Get question IDs for video mapping
        const questionIds = data.map((item: any) => item.id);

        // Fetch associated videos for these questions
        const { data: questionVideosData } = await supabase
            .from('question_videos')
            .select('question_id, video_id')
            .in('question_id', questionIds);

        // Create mapping of question_id to video_id
        const questionToVideoMap: Record<string, string> = {};
        if (questionVideosData) {
            questionVideosData.forEach((item: any) => {
                questionToVideoMap[item.question_id] = item.video_id;
            });
        }

        // Format results to match expected structure
        const results = data.map((item: any) => ({
            id: item.id,
            question_text: item.question_text,
            question_id: item.id,
            type: 'question',
            video_id: questionToVideoMap[item.id] || null,
            similarity: item.similarity, // Include similarity score
            section_id: item.section_id, // Include section_id from question
        }));

        return results;

    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
} 