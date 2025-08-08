import { supabase } from '@/utils/supabase/client'
import { Question } from '@/app/_types';

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

export const fetchQuestionsSearch = async (term: string): Promise<Question[]> => {
    // Don't search if term is too short
    if (term.trim().length < 1) {
        return [];
    }

    // Use more flexible ILIKE patterns for partial matching
    const searchPatterns = [
        `%${term}%`, // Contains the term anywhere
        ...term.split(' ').filter(word => word.length > 1).map(word => `%${word}%`), // Each word separately
    ];

    const { data, error } = await supabase
        .from('questions')
        .select()
        .or(searchPatterns.map(pattern => `question_text.ilike.${pattern}`).join(','))
        .limit(50); // Get more results to rank from

    if (error) {
        throw new Error(`Error fetching questions: ${error.message}`);
    }

    // Return top 20 results
    return (data || []).slice(0, 20);
};

export const fetchAllQuestions = async (): Promise<Question[]> => {
    const { data, error } = await supabase
        .from('questions')
        .select()
        .limit(20);

    if (error) {
        throw new Error(`Error fetching questions: ${error.message}`);
    }

    return data || [];
};

export const updateQuestion = async (question: Question, questionText: string, questionId: string): Promise<void> => {
    const { error } = await supabase.from('questions').upsert({
        id: question.id,
        question_text: questionText,
    })
    .eq('id', questionId)

    if (error) {
        throw new Error(`Error update question: ${error.message}`);
    }

    // Generate new embedding for the updated question text
    try {
        const embedding = await generateEmbedding(questionText);
        
        // Update the question with the new embedding
        const { error: updateError } = await supabase
            .from('questions')
            .update({ embedding })
            .eq('id', questionId);

        if (updateError) {
            console.error(`Error updating question with embedding: ${updateError.message}`);
        } else {
            console.log(`✅ Updated embedding for question: ${questionId}`);
        }
    } catch (embeddingError) {
        console.error(`Error generating embedding for question ${questionId}:`, embeddingError);
    }

    const questionVideos = await supabase.from('question_videos').select('video_id').eq('question_id', questionId);

    if (questionVideos.error) {
        throw new Error(`Error getting question_videos: ${questionVideos.error.message}`);
    }

    const videoIds = questionVideos.data.map((video:any, index:any) => video.video_id);
    
    const videosRes = await supabase
        .from('videos')
        .update({
            name: questionText
        })
        .in('id', videoIds)
        
    if (videosRes.error) {
        throw new Error(`Error getting question_videos: ${videosRes.error.message}`);
    }
};

export const createQuestion = async (questionText: string): Promise<Question> => {
    // First, create the question
    const { data, error } = await supabase.from('questions').insert({
        question_text: questionText,
    }).select().single();

    if (error) {
        throw new Error(`Error creating question: ${error.message}`);
    }

    // Generate embedding for the question text
    try {
        const embedding = await generateEmbedding(questionText);
        
        // Update the question with the embedding
        const { error: updateError } = await supabase
            .from('questions')
            .update({ embedding })
            .eq('id', data.id);

        if (updateError) {
            console.error(`Error updating question with embedding: ${updateError.message}`);
            // Don't throw error - question was created successfully, just embedding failed
        } else {
            console.log(`✅ Generated embedding for question: ${data.id}`);
        }
    } catch (embeddingError) {
        console.error(`Error generating embedding for question ${data.id}:`, embeddingError);
        // Don't throw error - question was created successfully, just embedding failed
    }

    return data;
};

export const deleteQuestion = async (id: string): Promise<void> => {
    const { error } = await supabase.from('questions').delete().eq('id', id);

    if (error) {
        throw new Error(`Error deleting question: ${error.message}`);
    }
};

export const fetchQuestionById = async(id: string): Promise<Question> => {
    const { data, error } = await supabase.from('questions').select().eq('id', id).single();

    if (error) {
        throw new Error(`Error fetching question: ${error.message}`);
    }

    return data;
}

export const fetchCommonlyAskedQuestions = async(): Promise<any> => {
    const { data, error } = await supabase.rpc('get_common_questions')

    if (error) {
        throw new Error(`Error getting common question: ${error.message}`);
    }

    // Get all question IDs
    const questionIds = (data || []).map((q: any) => q.id);
    
    if (questionIds.length === 0) {
        return [];
    }

    // Fetch all videos for all questions in a single query
    const { data: allVideos, error: videosError } = await supabase
        .from('question_videos')
        .select(`
            question_id,
            videos (
                id,
                name,
                url,
                thumbnail_url
            )
        `)
        .in('question_id', questionIds);

    if (videosError) {
        console.error('Error fetching videos:', videosError);
        return data || [];
    }

    // Group videos by question_id
    const videosByQuestion: Record<string, any[]> = {};
    (allVideos || []).forEach((qv: any) => {
        if (!videosByQuestion[qv.question_id]) {
            videosByQuestion[qv.question_id] = [];
        }
        if (qv.videos) {
            videosByQuestion[qv.question_id].push(qv.videos);
        }
    });

    // Combine questions with their videos
    const questionsWithVideos = (data || []).map((question: any) => ({
        ...question,
        videos: videosByQuestion[question.id] || []
    }));

    // Filter out questions with no videos
    const questionsWithVideosOnly = questionsWithVideos.filter((q: any) => q.videos.length > 0);

    return questionsWithVideosOnly;
}

export const fetchQuestionsSearchUsingRPC = async (term: string): Promise<any> => {
    term = term.trim();
    term = term.replace(/\s{2,}/g,' ');

    if (term.length < 1) {
        return [];
    }

    const { data, error } = await supabase.rpc('search_questions', {search_term: term});

    if (error) {
        throw new Error(`Error searching questions: ${error.message}`);
    }

    // Return the RPC results directly
    return data || [];
};

export const fetchQuestions = async () => {
    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Error fetching questions: ${error.message}`);
    }

    return data || [];
};

// New: Search both questions and videos using the new RPC with relevance ranking
export const fetchContentSearch = async (term: string): Promise<any[]> => {
    term = term.trim();
    if (term.length < 1) return [];

    try {
        // Generate embedding for the search term
        const searchEmbedding = await generateEmbedding(term);

        // Search questions using vector similarity
        const { data, error } = await supabase
            .from('questions')
            .select(`
                id,
                question_text,
                embedding,
                section_id
            `)
            .not('embedding', 'is', null) // Only search questions that have embeddings
            .order(`embedding <=> '[${searchEmbedding.join(',')}]'::vector`)
            .limit(20); // Return top 20 most similar results

        if (error) {
            throw new Error(`Error searching questions: ${error.message}`);
        }

        if (!data || data.length === 0) return [];

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
            section_id: item.section_id,
        }));

        return results;

    } catch (error) {
        console.error('Vector search error:', error);
        // Fallback to simple text search if vector search fails
        return await fetchQuestionsSearch(term);
    }
};

// New: Fetch questions relevant to specific health concerns
export const fetchQuestionsByHealthConcerns = async (healthConcerns: string[]): Promise<any[]> => {
    if (!healthConcerns || healthConcerns.length === 0) {
        return fetchCommonlyAskedQuestions();
    }

    // Create a search query that combines all health concerns
    const searchTerms = healthConcerns.map(concern => 
        concern.toLowerCase().split(' ').filter(word => word.length > 2)
    ).flat();

    // Get questions that match any of the health concerns
    const { data, error } = await supabase
        .from('questions')
        .select('*')
        .or(searchTerms.map(term => `question_text.ilike.%${term}%`).join(','))
        .limit(10);

    if (error) {
        console.error('Error fetching questions by health concerns:', error);
        // Fallback to common questions
        return fetchCommonlyAskedQuestions();
    }

    // Get all question IDs
    const questionIds = (data || []).map((q: any) => q.id);
    
    if (questionIds.length === 0) {
        return [];
    }

    // Fetch all videos for all questions in a single query
    const { data: allVideos, error: videosError } = await supabase
        .from('question_videos')
        .select(`
            question_id,
            videos (
                id,
                name,
                url,
                thumbnail_url
            )
        `)
        .in('question_id', questionIds);

    if (videosError) {
        console.error('Error fetching videos:', videosError);
        return data || [];
    }

    // Group videos by question_id
    const videosByQuestion: Record<string, any[]> = {};
    (allVideos || []).forEach((qv: any) => {
        if (!videosByQuestion[qv.question_id]) {
            videosByQuestion[qv.question_id] = [];
        }
        if (qv.videos) {
            videosByQuestion[qv.question_id].push(qv.videos);
        }
    });

    // Combine questions with their videos
    const questionsWithVideos = (data || []).map((question: any) => ({
        ...question,
        videos: videosByQuestion[question.id] || []
    }));

    // Filter out questions with no videos
    const questionsWithVideosOnly = questionsWithVideos.filter((q: any) => q.videos.length > 0);

    return questionsWithVideosOnly;
};

// New: Fetch questions for each health concern separately using the same ranking system as search
export const fetchQuestionsByHealthConcernsSeparately = async (healthConcerns: string[]): Promise<Record<string, any[]>> => {
    if (!healthConcerns || healthConcerns.length === 0) {
        return {};
    }

    const questionsByConcern: Record<string, any[]> = {};

    // Fetch questions for each health concern separately
    await Promise.all(
        healthConcerns.map(async (concern) => {
            try {
                // Use the search_content RPC for each concern
                const { data, error } = await supabase.rpc('search_content', { 
                    search_term: concern 
                });

                if (error) {
                    console.error(`Error fetching questions for ${concern}:`, error);
                    questionsByConcern[concern] = [];
                    return;
                }

                // Collect all IDs for batch fetching
                const videoIds: string[] = [];
                const questionIds: string[] = [];
                
                // Separate items by type and collect IDs
                const videoItems = (data || []).slice(0, 5).filter((item: any) => item.type === 'video' || !item.question_text);
                const questionItems = (data || []).slice(0, 5).filter((item: any) => item.type !== 'video' && item.question_text);
                
                videoItems.forEach((item: any) => videoIds.push(item.id));
                questionItems.forEach((item: any) => questionIds.push(item.id));

                // Batch fetch all question_videos for videos
                let questionVideosMap: Record<string, string> = {};
                if (videoIds.length > 0) {
                    const { data: questionVideosData } = await supabase
                        .from('question_videos')
                        .select('video_id, question_id')
                        .in('video_id', videoIds);
                    
                    if (questionVideosData) {
                        questionVideosMap = questionVideosData.reduce((acc: Record<string, string>, item: any) => {
                            acc[item.video_id] = item.question_id;
                            return acc;
                        }, {});
                    }
                }

                // Collect all question IDs (both direct and from videos)
                const allQuestionIds = [...questionIds];
                Object.values(questionVideosMap).forEach((questionId: string) => {
                    if (!allQuestionIds.includes(questionId)) {
                        allQuestionIds.push(questionId);
                    }
                });

                // Batch fetch all questions
                let questionsMap: Record<string, any> = {};
                if (allQuestionIds.length > 0) {
                    const { data: questionsData } = await supabase
                        .from('questions')
                        .select('*')
                        .in('id', allQuestionIds);
                    
                    if (questionsData) {
                        questionsMap = questionsData.reduce((acc: Record<string, any>, item: any) => {
                            acc[item.id] = item;
                            return acc;
                        }, {});
                    }
                }

                // Batch fetch all videos for all questions
                let videosMap: Record<string, any[]> = {};
                if (allQuestionIds.length > 0) {
                    const { data: videosData } = await supabase
                        .from('question_videos')
                        .select(`
                            question_id,
                            videos (
                                id,
                                name,
                                url,
                                thumbnail_url
                            )
                        `)
                        .in('question_id', allQuestionIds);
                    
                    if (videosData) {
                        videosMap = videosData.reduce((acc: Record<string, any[]>, item: any) => {
                            if (!acc[item.question_id]) {
                                acc[item.question_id] = [];
                            }
                            if (item.videos) {
                                acc[item.question_id].push(item.videos);
                            }
                            return acc;
                        }, {});
                    }
                }

                // Map the data back to results
                const questionsWithVideos = (data || []).slice(0, 5).map((item: any) => {
                    let questionId = item.id; // Default to item.id (for questions)
                    
                    // If this is a video result, get the question_id from batch data
                    if (item.type === 'video' || !item.question_text) {
                        questionId = questionVideosMap[item.id] || item.id;
                    }

                    const questionData = questionsMap[questionId];
                    if (!questionData) return null;

                    return {
                        ...questionData,
                        videos: videosMap[questionId] || []
                    };
                });

                // Filter out null results and questions with no videos
                const validQuestions = questionsWithVideos
                    .filter((q: any) => q !== null && q.videos.length > 0)
                    .slice(0, 5);

                questionsByConcern[concern] = validQuestions;
            } catch (error) {
                console.error(`Error processing questions for ${concern}:`, error);
                questionsByConcern[concern] = [];
            }
        })
    );

    return questionsByConcern;
};