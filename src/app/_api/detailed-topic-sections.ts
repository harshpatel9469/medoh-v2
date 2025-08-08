import { supabase } from '@/utils/supabase/client';
import { DetailedTopicSection } from "../_types/detailed-topic-section";

export const fetchDetailedTopicSections = async (treatmentId: string) : Promise<DetailedTopicSection[]>=> {
    const {data, error} = await supabase
        .from('detailed_topics_sections')
        .select()
        .eq('topic_id', treatmentId)
        .order('section_order', {ascending: true});

    if (error) {
        throw new Error(`Error fetching treatments: ${error.message}`);
    }

    return data || [];
}


export const fetchVideosByDetailedTopicSectionId = async (sectionId: string, userId: string | null = null) : Promise<any[]> => {
    const {data, error} = await supabase.rpc('get_all_detailed_topic_section_videos', {p_section_id: sectionId, p_user_id: userId});

    if (error) {
        throw new Error(`Error fetching treatments: ${error.message}`);
    }

    return data || [];
}

export const partialFetchVideosByDetailedTopicSectionId = async (sectionId: string, userId: string | null = null) : Promise<any[]> => {
    const {data, error} = await supabase.rpc('get_partial_detailed_topic_section_videos', {p_section_id: sectionId, p_user_id: userId});

    if (error) {
        throw new Error(`Error fetching treatments: ${error.message}`);
    }

    return data || [];
}

export const updateDetailedTopicSectionOrder = async (sectionId: string, order: number) => {
    const {error} = await supabase
        .from('detailed_topics_sections')
        .update({
            section_order: order
        })
        .eq('id', sectionId);

    if (error) {
        throw new Error(`Error updating treatment sections: ${error.message}`);
    }
}

export const updateDetailedTopicSection = async (sectionName: string, sectionId: string) => {
    const {error} = await supabase
        .from('detailed_topics_sections')
        .update({
            name: sectionName
        })
        .eq('id', sectionId);

    if (error) {
        throw new Error(`Error updating treatment sections: ${error.message}`);
    }
}

export const createDetailedTopicSection = async (sectionName: string, treatmentId: string) => {
    const {error} = await supabase
        .from('detailed_topics_sections')
        .insert({
            name: sectionName,
            topic_id: treatmentId
        })

    if (error) {
        throw new Error(`Error creating treatment sections: ${error.message}`);
    }
}


export const deleteDetailedTopicSectionById = async (sectionId: string) => {
    const {error} = await supabase
        .from('detailed_topics_sections')
        .delete()
        .eq('id', sectionId);

    if (error) {
        throw new Error(`Error deleting treatment sections: ${error.message}`);
    }
}

export const fetchDetailedTopicSectionById = async (sectionId: string) : Promise<DetailedTopicSection> => {
    const {data, error} = await supabase
        .from('detailed_topics_sections')
        .select()
        .eq('id', sectionId)
        .single();

        if (error) {
            throw new Error(`Error fetching treatment section: ${error.message}`);
        }

    return data;
}

export const fetchPublicDetailedTopicSections = async (treatmentId: string): Promise<DetailedTopicSection[]> => {
    const { data, error } = await supabase
        .from('detailed_topics_sections')
        .select()
        .eq('topic_id', treatmentId)
        .eq('is_private', false)
        .order('section_order', { ascending: true });

    if (error) {
        throw new Error(`Error fetching public treatment sections: ${error.message}`);
    }

    return data || [];
};