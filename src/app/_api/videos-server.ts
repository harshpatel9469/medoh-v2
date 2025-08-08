import { Video } from '@/app/_types';
import { createClient } from '@/utils/supabase/server'

export const fetchVideosByQuestionIdsServer = async (id: string): Promise<any[]> => {
    const supabase = createClient()

    const {data, error} = await supabase
        .from('question_videos')
        .select(`videos(
            *,
            doctors(*)
        )`)
        .eq('question_id', id)
        // Removed .single() to allow multiple or no resultsimage.png

    if (error) {
        throw new Error(`Error fetching video: ${error.message}`);
    }

    // Return an empty array if no videos found
    return data || [];
}