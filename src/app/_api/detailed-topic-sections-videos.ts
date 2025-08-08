import { supabase } from '@/utils/supabase/client';

export const deleteDetailedTopicSectionVideoByVideoId = async (videoId: string): Promise<void> => {
    const {data, error} = await supabase
    .from('detailed_topics_sections_videos')
    .select()
    .eq('video_id', videoId);

    if (error) {
        return;
    }

    const sectionVideoRes = await supabase
        .from('detailed_topics_sections_videos')
        .delete()
        .eq('video_id', videoId);

    if (sectionVideoRes.error) {
        throw new Error(`Error deleting video from treatment section: ${sectionVideoRes.error.message}`);
    }
}

export const updateDetailedTopicVideoOrder = async(videoId: string, sectionId: string, order: number): Promise<void> => {
    const {error} = await supabase
        .from('detailed_topics_sections_videos')
        .update({
            video_order: order
        })
        .eq('video_id', videoId)
        .eq('section_id', sectionId);

    if (error) {
        throw new Error(`Error updating video order in treatment section: ${error.message}`);
    }
}

export const fetchDetailedTopicSectionByVideoId = async (videoId: string): Promise<any> => {
    const {data, error} = await supabase
        .from('detailed_topics_sections_videos')
        .select(`detailed_topics_sections(*), video_order`)
        .eq('video_id', videoId)
        .single();

    if (error) {
        return null;
    }

    return data;
}

export const updateDetailedTopicSectionVideosByVideoId = async(videoId: string, sectionId: string, videoOrder: number): Promise<void> => {
    const {data, error} = await supabase
        .from('detailed_topics_sections_videos')
        .select()
        .eq('video_id', videoId)
        .single();

    if (error) {
        createDetailedTopicSectionVideos(videoId, sectionId, videoOrder);
        return;
    }

    const updateError = await supabase
        .from('detailed_topics_sections_videos')
        .update({
            section_id: sectionId,
            video_order: videoOrder
        })
        .eq('video_id', videoId);

    if (updateError.error) {
        throw new Error(`Error updating section_videos: ${updateError.error.message}`);
    }
} 

export const createDetailedTopicSectionVideos = async(videoId: string, sectionId: string, order: number): Promise<void> => {
    const {error} = await supabase
        .from('detailed_topics_sections_videos')
        .insert({
            section_id: sectionId,
            video_id: videoId,
            video_order: order
        });

    if (error) {
        throw new Error(`Error creating section_videos: ${error.message}`);
    }
}

export const fetchAllDetailedTopicSectionVideosbyVideoId = async (videoId: string): Promise<any[]> => {
    const treatmentSectionRes = await supabase
        .from('detailed_topics_sections_videos')
        .select('section_id')
        .eq('video_id', videoId)
        .single();

    if (!treatmentSectionRes.data) {
        return [];
    }

    const {data, error} = await supabase
        .from('detailed_topics_sections_videos')
        .select(`
            section_id,
            video_id,
            videos (
              id,
              name,
              thumbnail_url,
              question_id,
              doctors(*)
            )
        `)
        .eq('section_id', treatmentSectionRes.data.section_id)
        .order('video_order', {ascending: true});

    if (error) {
        throw new Error(`Error getting treatment videos: ${error.message}`);
    }

    return data || [];
}

export const fetchNextDetailedTopicSectionVideos = async (sectionId: string, userId: string | null = null, topicId: string, sectionOrder: number) => {
    const nextSectionData = await supabase
        .from('detailed_topics_sections')
        .select('id')
        .gt('section_order', sectionOrder)
        .eq('topic_id', topicId)
        .order('section_order', {ascending: true})
        .limit(1)
        .single();

    if (nextSectionData.error) {
        return [];
    }

    const { data, error } = await supabase.rpc('get_all_detailed_topic_section_videos', {p_section_id: nextSectionData.data.id, p_user_id: userId});

    if (error) {
        return [];
    }

    return data || [];
}

export const fetchLastVideoFromPreviousDetailedTopicSection = async (sectionId: string, userId: string | null = null, topicId: string, sectionOrder: number): Promise<any> => {
    const prevSectionData = await supabase
        .from('detailed_topics_sections')
        .select('id')
        .lt('section_order', sectionOrder)
        .eq('topic_id', topicId)
        .order('section_order', {ascending: false})
        .limit(1)
        .single();
        
    if (prevSectionData.error) {
        return null;
    }

    const { data, error } = await supabase.rpc('get_all_detailed_topic_section_videos', {p_section_id: prevSectionData.data.id, p_user_id: userId});

    if (error) {
        return null;
    }

    return data.at(-1) || null;
}

export const fetchAllVideosByDetailedSectionIdAdminPanel = async (sectionId: string) => {
    const videos = await supabase
        .from('detailed_topics_sections_videos')
        .select(`
            video_order,
            videos(*)
        `)
        .eq('section_id', sectionId)
        .order('video_order', {ascending: true});
    
    if (videos.error) {
        throw new Error(`Error fetching videos: ${videos.error.message}`);
    }

    return videos.data || [];
}