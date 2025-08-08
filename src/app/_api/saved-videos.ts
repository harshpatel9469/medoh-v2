import { supabase } from '@/utils/supabase/client'

// Save a video for a user
export const saveVideo = async (userId: string, videoId: string): Promise<void> => {
    const { data, error } = await supabase
        .from('saved_videos')
        .insert({
            user_id: userId,
            video_id: videoId
        })
        .select();

    if (error) {
        console.error('Error saving video:', error);
        throw new Error(`Error saving video: ${error.message}`);
    }
};

// Remove a saved video for a user
export const unsaveVideo = async (userId: string, videoId: string): Promise<void> => {
    const { error } = await supabase
        .from('saved_videos')
        .delete()
        .eq('user_id', userId)
        .eq('video_id', videoId);

    if (error) {
        throw new Error(`Error removing saved video: ${error.message}`);
    }
};

// Check if a video is saved by a user
export const isVideoSaved = async (userId: string, videoId: string): Promise<boolean> => {
    const { data, error } = await supabase
        .from('saved_videos')
        .select('id')
        .eq('user_id', userId)
        .eq('video_id', videoId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw new Error(`Error checking saved video: ${error.message}`);
    }

    return !!data;
};

// Get all saved videos for a user with video details
export const getSavedVideos = async (userId: string): Promise<any[]> => {
    const { data, error } = await supabase
        .from('saved_videos')
        .select(`
            id,
            created_at,
            videos (
                id,
                name,
                url,
                thumbnail_url,
                doctor_id,
                question_id,
                created_at
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Error fetching saved videos: ${error.message}`);
    }

    return data || [];
};

// Get partial saved videos for homepage (limited count)
export const getPartialSavedVideos = async (userId: string, limit: number = 6): Promise<any[]> => {
    const { data, error } = await supabase
        .from('saved_videos')
        .select(`
            id,
            created_at,
            videos (
                id,
                name,
                url,
                thumbnail_url,
                doctor_id,
                question_id,
                created_at
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        throw new Error(`Error fetching partial saved videos: ${error.message}`);
    }

    return data || [];
};

// Toggle save status for a video
export const toggleSaveVideo = async (userId: string, videoId: string): Promise<boolean> => {
    const isSaved = await isVideoSaved(userId, videoId);
    
    if (isSaved) {
        await unsaveVideo(userId, videoId);
        return false; // Now unsaved
    } else {
        await saveVideo(userId, videoId);
        return true; // Now saved
    }
}; 