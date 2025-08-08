import { supabase } from '@/utils/supabase/client'
import { UserViewCount } from "../_types/user-view-count";

interface ViewCountResponse {
    id: string;
    user_id: string;
    video_id: string;
    progression?: number;
}

export const insertUserViewCount = async (videoId: string, progression: number): Promise<string | null> => {
    const viewCountData = await supabase
        .from('user_view_counts')
        .insert({
            video_id: videoId,
            progression: progression,
        })
        .select()
        .single();

    if (viewCountData.error) {
        throw new Error(`Error creating user view count: ${viewCountData.error.message}`);
    }

    return viewCountData.data?.id || null;
};

export const updateUserViewCount = async (progression: number, id: string) => {
    // Check if view count exists
    const viewCountInfo = await supabase
        .from('user_view_counts')
        .select()
        .eq('id', id);

    if (viewCountInfo.error) {
        throw new Error(`Error retrieving user view data: ${viewCountInfo.error.message}`);
    }

    const viewCountData = await supabase
        .from('user_view_counts')
        .update({
            progression: progression,
        })
        .eq('id', id);

    if (viewCountData.error) {
        throw new Error(`Error creating user view count: ${viewCountData.error.message}`);
    }
};
export const insertAnonymousView = async (videoId: string, progression: number = 0) => {
        //Get view of the unsigned user.
  
    const { error } = await supabase.from('user_view_counts').insert({
      user_id: null, // anonymous view
      video_id: videoId,
      progression,
      last_viewed: new Date().toISOString(),
    });
  
    if (error) {
      throw new Error(`Error inserting anonymous view: ${error.message}`);
    }
  };

export const fetchPartialUserViewCount = async (userId: string) => {
    const viewCountInfo = await supabase.rpc('get_partial_user_view_count', {userid: userId, video_limit: 6});

    if (viewCountInfo.error) {
        throw new Error(`Error retrieving user view data: ${viewCountInfo.error.message}`);
    }

    // Filter out any entries where videos data is missing or incomplete
    return (viewCountInfo.data || []).filter((item: any) => 
        item.videos && 
        item.videos.question_id && 
        item.videos.name && 
        item.videos.thumbnail_url
    );
};

export const fetchAllUserViewCount = async (userId: string): Promise<any[]> => {
    const { data, error } = await supabase
        .from('user_view_counts')
        .select(`
            progression,
            videos(*)
        `)
        .eq('user_id', userId)
        .order('last_viewed', {ascending: false});

    if (error) {
        throw new Error(`Error finding view count data: ${error.message}`);
    }

    return data || [];
};

export const fetchUserViewCountForVideo = async (userId: string, videoId: string): Promise<UserViewCount | null> => {
    const { data, error } = await supabase
        .from('user_view_counts')
        .select()
        .eq('user_id', userId)
        .eq('video_id', videoId)
        .limit(1)
        .single();

    if (error || !data) {
        return null;
    }

    return data;
};

export const createUserViewCount = async (userId: string, videoId: string): Promise<string | null> => {
    const viewCountData = await supabase
        .from('user_view_count')
        .insert({
            user_id: userId,
            video_id: videoId
        })
        .select()
        .single();

    if (viewCountData.error) {
        throw new Error(`Error creating user view count: ${viewCountData.error.message}`);
    }

    return viewCountData.data?.id || null;
};

export const createUserViewCountIfNotExists = async (userId: string, videoId: string) => {
    const viewCountData = await supabase
        .from('user_view_count')
        .insert({
            user_id: userId,
            video_id: videoId
        });

    if (viewCountData.error) {
        throw new Error(`Error creating user view count: ${viewCountData.error.message}`);
    }
};

export const fetchPartialViewCountData = async (userId: string) => {
    const { data, error } = await supabase.rpc('get_partial_user_view_count', {userid: userId, video_limit: 6});

    if (error) {
        throw new Error(`Error finding partial view count data: ${error.message}`);
    }

    return data || [];
};

export const fetchAllViewCountData = async (userId: string) => {
    const { data, error } = await supabase.rpc('get_all_user_view_count', {userid: userId});

    if (error) {
        throw new Error(`Error finding view count data: ${error.message}`);
    }

    return data || [];
};

export const fetchRecentlyWatchedVideos = async (userID: string, limit: number = 6) => {
    try {
        const { data, error } = await supabase.rpc('get_recently_watched_videos', { userid: userID });
        if (error) {
            console.error('RPC Error:', error);
            return []; // Return empty array instead of throwing
        }
        return data || [];
    } catch (err) {
        console.error('Fetch Error:', err);
        return []; // Return empty array on any error
    }
};

