import { supabase } from '@/utils/supabase/client';
import { UserLike } from "../_types/user-like";

export const fetchLikeByVideoId = async (videoId: string, userId: string): Promise<UserLike | null> => {
    // Get like information
    const likeData = await supabase
        .from('user_likes')
        .select()
        .eq('user_id', userId)
        .eq('video_id', videoId)
        .single();

    // If we cannot find like for user we return null
    if (likeData.error || !likeData.data) {
        return null
    }

    return likeData.data;
};

export const createLikeByVideoId = async (videoId: string, like: boolean, dislike: boolean) => {
    // Create like
    const {error} = await supabase
        .from('user_likes')
        .insert({
            video_id: videoId,
            like: like,
            dislike: dislike
        });

    if (error) {
        throw new Error(`Error creating like: ${error.message}`);
    }
};

export const updateLikeByVideoId = async (videoId: string, userId: string, like: boolean, dislike: boolean) => {
    // Update like
    const {error} = await supabase
        .from('user_likes')
        .update({
            video_id: videoId,
            like: like,
            dislike: dislike
        })
        .eq('video_id', videoId)
        .eq('user_id', userId);

    if (error) {
        throw new Error(`Error creating like: ${error.message}`);
    }
};

export const fetchPartialLikedVideos = async (userId: string): Promise<any[]> => {
    const { data, error } = await supabase
        .from('user_likes')
        .select(`
            user_id,
            video_id,
            like,
            dislike,
            updated_at,
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
        .eq('like', true)
        .order('updated_at', { ascending: false })
        .limit(6);

    if (error) {
        throw new Error(`Error fetching partial liked videos: ${error.message}`);
    }

    // Filter out any entries where videos data is missing or incomplete
    return (data || []).filter((item: any) => 
        item.videos && 
        item.videos.question_id && 
        item.videos.name && 
        item.videos.thumbnail_url
    );
};

export const fetchAllLikedVideos = async (userId: string): Promise<any[]> => {
    const { data, error } = await supabase
        .from('user_likes')
        .select(`
            user_id,
            video_id,
            like,
            dislike,
            updated_at,
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
        .eq('like', true)
        .order('updated_at', { ascending: false });

    if (error) {
        throw new Error(`Error fetching all liked videos: ${error.message}`);
    }

    return data || [];
};