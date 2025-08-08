import { supabase } from '@/utils/supabase/client'
import { Video } from '@/app/_types';

export const fetchVideosSearch = async (term: string): Promise<Video[]> => {
    const { data, error } = await supabase
        .from('videos')
        .select()
        .ilike('name', `%${term}%`)
        .limit(20);

    if (error) {
        throw new Error(`Error fetching videos: ${error.message}`);
    }

    return data || [];
};

export const fetchAllVideos = async (): Promise<Video[]> => {
    const { data, error } = await supabase
        .from('videos')
        .select();

    if (error) {
        throw new Error(`Error fetching videos: ${error.message}`);
    }

    return data || [];
};

export const updateVideo = async (id: string, name: string, url: string, thumbnail_url: string, doctor_id: string, question_id: string): Promise<void> => {
    const { error } = await supabase.from('videos').update({
        name: name,
        url: url,
        thumbnail_url: thumbnail_url,
        doctor_id: doctor_id,
        question_id: question_id
    }).eq('id', id);

    if (error) {
        throw new Error(`Error updating video: ${error.message}`);
    }
};

export const createVideo = async (name: string, url: string, thumbnail_url: string, doctor_id: string, question_id: string ): Promise<Video> => {
    const { data, error } = await supabase.from('videos').insert({
        name: name,
        url: url,
        thumbnail_url: thumbnail_url,
        doctor_id: doctor_id,
        question_id: question_id
    })
    .select()
    .single()

    if (error) {
        throw new Error(`Error creating video: ${error.message}`);
    }

    const questionVideoRes = await supabase.from('question_videos').insert({
        question_id: question_id,
        video_id: data.id
    }) 

    if (questionVideoRes.error) {
        throw new Error(`Error creating question video: ${questionVideoRes.error.message}`);
    }

    return data;
};

export const deleteVideo = async (id: string): Promise<void> => {
    const { error } = await supabase.from('videos').delete().eq('id', id);

    if (error) {
        throw new Error(`Error deleting video: ${error.message}`);
    }
};

export const fetchVideosByQuestionIds = async (id: string): Promise<Video | null> => {
    const questionVideoRes = await supabase
        .from('question_videos')
        .select('video_id')
        .eq('question_id', id)
        .single()

    if (questionVideoRes.error) {
        return null;
    }

    const video = await supabase
        .from('videos')
        .select('*')
        .eq('id', questionVideoRes?.data?.video_id)
        .single()

    if (video.error) {
        throw new Error(`Error fetching video: ${video.error.message}`);
    }

    return video.data;
};

export const fetchVideosByQuestionIdsBatch = async (questionIds: string[]): Promise<Record<string, any[]>> => {
    if (!questionIds || questionIds.length === 0) {
        return {};
    }

    // Fetch all videos for all question IDs in a single query
    const { data, error } = await supabase
        .from('question_videos')
        .select(`
            question_id,
            videos (
                id,
                name,
                url,
                thumbnail_url,
                doctor_id
            )
        `)
        .in('question_id', questionIds);

    if (error) {
        console.error('Error fetching videos by question IDs:', error);
        return {};
    }

    // Group videos by question_id
    const videosByQuestion: Record<string, any[]> = {};
    (data || []).forEach((qv: any) => {
        if (!videosByQuestion[qv.question_id]) {
            videosByQuestion[qv.question_id] = [];
        }
        if (qv.videos) {
            videosByQuestion[qv.question_id].push(qv.videos);
        }
    });

    return videosByQuestion;
};

export const fetchNextSectionVideos = async (sectionId: string, topicId: string, sectionOrder: number, userId: string | null = null): Promise<any[]> => {
    const nextSectionData = await supabase
        .from('sections')
        .select('id')
        .gt('section_order', sectionOrder)
        .eq('topic_id', topicId)
        .neq('id', sectionId)
        .order('section_order', {ascending: true})
        .limit(1)
        .single();

    if (nextSectionData.error) {
        return [];
    }

    const { data, error } = await supabase.rpc('get_all_videos_by_section', {p_section_id: nextSectionData.data.id, p_user_id: userId});

    if (error) {
        return [];
    }

    return data || [];
};

export const fetchLastVideoFromPreviousSection = async (topicId: string, userId: string | null = null, sectionId: string, sectionOrder: number): Promise<any> => {
    const prevSectionData = await supabase
        .from('sections')
        .select('id')
        .lt('section_order', sectionOrder)
        .eq('topic_id', topicId)
        .neq('id', sectionId)
        .order('section_order', {ascending: false})
        .limit(1)
        .single();

    if (prevSectionData.error) {
        return null;
    }

    const { data, error } = await supabase.rpc('get_all_videos_by_section', {p_section_id: prevSectionData.data.id, p_user_id: userId});

    if (error) {
        return null;
    }

    return data.at(-1) || null;
};

export const fetchBackPageDataByVideoId = async (videoId: string): Promise<any> => {
    const sectionData = await supabase
        .from('section_videos')
        .select(`
            section_id,
            sections(topics(id, name), section_order, name)
        `)
        .eq('video_id', videoId)
        .single();
            
    if(sectionData.error){
        const treatmentData = await supabase
            .from('detailed_topics_sections_videos')
            .select(`section_id, detailed_topics_sections(detailed_topics(name, id), section_order, name)`)
            .eq('video_id', videoId)
            .single();

        if(treatmentData.error) {
            return null;
        }

        return treatmentData.data;
    }

    return sectionData.data;
}

export const fetchVideosBySectionIdAndDoctorId = async (sectionId: string, doctorId: string): Promise<Partial<Video>[]> => {
    const { data, error } = await supabase.rpc('get_video_details_by_section_and_doctor', {p_section_id: sectionId, p_doctor_id: doctorId});

    if (error) {
        throw new Error(`Error getting videos: ${error.message}`);
    }

    return data || [];
}

export const fetchDetailedTopicVideosBySectionIdAndDoctorId = async (sectionId: string, doctorId: string): Promise<any[]> => {
    const { data, error } = await supabase.rpc('get_detailed_topic_video_details_by_section_and_doctor', {p_section_id: sectionId, p_doctor_id: doctorId})

    if (error) {
        throw new Error(`Error getting videos: ${error.message}`);
    }

    return data || [];
}

export const fetchTotalVideoCount = async (): Promise<number> => {
    const { count, error } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true });

    if (error) {
        throw new Error(`Error fetching video count: ${error.message}`);
    }

    return count || 0;
};

export const fetchVideos = async () => {
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Error fetching videos: ${error.message}`);
    }

    return data || [];
};

export const fetchVideosByDoctorId = async (doctorId: string) => {
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Error fetching videos by doctor: ${error.message}`);
    }

    return data || [];
};

export const fetchVideosByQuestionId = async (questionId: string) => {
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('question_id', questionId)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Error fetching videos by question: ${error.message}`);
    }

    return data || [];
};

export const fetchVideosCount = async () => {
    const { count, error } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true });

    if (error) {
        throw new Error(`Error fetching videos count: ${error.message}`);
    }

    return count || 0;
};