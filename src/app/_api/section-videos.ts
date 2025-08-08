import { Section, Video } from '@/app/_types';
import { supabase } from '@/utils/supabase/client'

export const partialFetchVideosBySectionId = async (sectionId: string, userId: string | null = null): Promise<any[]> => {
    const videos = await supabase.rpc('get_partial_videos_by_section', {p_section_id: sectionId, p_user_id: userId});

    if (videos.error) {
        throw new Error(`Error fetching videos: ${videos.error.message}`);
    }

    return videos.data || [];
}

export const fetchAllVideosBySectionIdAdminPanel = async (sectionId: string) => {
    const videos = await supabase
        .from('section_videos')
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

export const fetchAllVideosBySectionId = async (sectionId: string, userId: string | null = null): Promise<any[]> => {
    const videos = await supabase.rpc('get_all_videos_by_section', {p_section_id: sectionId, p_user_id: userId});

    
    if (videos.error) {
        throw new Error(`Error fetching videos: ${videos.error.message}`);
    }

    return videos.data || [];
}

export const deleteSectionVideoByVideoId = async (videoId: string): Promise<void> => {
    const {data, error} = await supabase
        .from('section_videos')
        .select()
        .eq('video_id', videoId);

    if (error) {
        return;
    }

    const sectionVideoRes = await supabase
        .from('section_videos')
        .delete()
        .eq('video_id', videoId);

    if (sectionVideoRes.error) {
        throw new Error(`Error fetching sections: ${sectionVideoRes.error.message}`);
    }
}

export const fetchSectionbyVideoId = async (videoId: string): Promise<Section | null> => {
    const videoSectionRes = await supabase
        .from('section_videos')
        .select('section_id')
        .eq('video_id', videoId)
        .single();

    // video not in section
    if (videoSectionRes.error) {
        return null;
    }

    const {data, error} = await supabase
        .from('sections')
        .select()
        .eq('id', videoSectionRes.data.section_id)
        .single()

    if (error) {
        return null
    }

    return data
}

export const updateSectionVideosByVideoId = async(videoId: string, sectionId: string, videoOrder: number): Promise<void> => {
    const {data, error} = await supabase
        .from('section_videos')
        .select()
        .eq('video_id', videoId)
        .single();

    if (error) {
        createSectionVideos(videoId, sectionId, videoOrder);
        return;
    }

    const updateError = await supabase
        .from('section_videos')
        .update({
            section_id: sectionId,
            video_order: videoOrder
        })
        .eq('video_id', videoId);

    if (updateError.error) {
        throw new Error(`Error updating section_videos: ${updateError.error.message}`);
    }
} 

export const createSectionVideos = async(videoId: string, sectionId: string, order: number): Promise<void> => {
    const {error} = await supabase
        .from('section_videos')
        .insert({
            section_id: sectionId,
            video_id: videoId,
            video_order: order
        });

    if (error) {
        throw new Error(`Error updating section_videos: ${error.message}`);
    }
}

export const updateOrder = async(videoId: string, sectionId: string, order: number): Promise<void> => {
    const {error} = await supabase
        .from('section_videos')
        .update({
            video_order: order
        })
        .eq('video_id', videoId)
        .eq('section_id', sectionId);

    if (error) {
        throw new Error(`Error updating section_videos order: ${error.message}`);
    }
}

export const fetchVideoOrder = async(videoId: string, sectionId: string): Promise<number> => {
    const {data, error} = await supabase
        .from('section_videos')
        .select()
        .eq('video_id', videoId)
        .eq('section_id', sectionId)
        .single();
        
        if (error) {
            throw new Error(`Error updating section_videos order: ${error.message}`);
        }
        
        return data.video_order || 0
}

export const fetchSectionVideos = async (sectionId: string) => {
    const videos = await supabase.rpc('get_section_videos', { section_id: sectionId });
    if (videos.error) {
        throw new Error(`Error fetching videos: ${videos.error.message}`);
    }
    return videos.data || [];
};

export const fetchSectionVideosByDoctorId = async (sectionId: string, doctorId: string) => {
    const videos = await supabase.rpc('get_section_videos_by_doctor_id', { section_id: sectionId, doctor_id: doctorId });
    if (videos.error) {
        throw new Error(`Error fetching videos: ${videos.error.message}`);
    }
    return videos.data || [];
};

export const fetchSectionVideosByDoctorIdAndTopicId = async (sectionId: string, doctorId: string, topicId: string) => {
    const videos = await supabase.rpc('get_section_videos_by_doctor_id_and_topic_id', { section_id: sectionId, doctor_id: doctorId, topic_id: topicId });
    if (videos.error) {
        throw new Error(`Error fetching videos: ${videos.error.message}`);
    }
    return videos.data || [];
};

export const fetchSectionVideosBySectionId = async (sectionId: string) => {
    const sectionVideoRes = await supabase.rpc('get_section_videos_by_section_id', { section_id: sectionId });
    if (sectionVideoRes.error) {
        throw new Error(`Error fetching sections: ${sectionVideoRes.error.message}`);
    }
    return sectionVideoRes.data || [];
};

export const updateSectionVideo = async (sectionVideoId: string, videoId: string) => {
    const updateError = await supabase
        .from('section_videos')
        .update({ video_id: videoId })
        .eq('id', sectionVideoId);
    if (updateError.error) {
        throw new Error(`Error updating section_videos: ${updateError.error.message}`);
    }
};

export const updateSectionVideos = async (sectionId: string, videoIds: string[]) => {
    const { error } = await supabase
        .from('section_videos')
        .update({ video_ids: videoIds })
        .eq('section_id', sectionId);
    if (error) {
        throw new Error(`Error updating section_videos: ${error.message}`);
    }
};

export const updateSectionVideosOrder = async (sectionId: string, order: number) => {
    const { error } = await supabase
        .from('section_videos')
        .update({ order })
        .eq('section_id', sectionId);
    if (error) {
        throw new Error(`Error updating section_videos order: ${error.message}`);
    }
};