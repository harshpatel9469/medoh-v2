import { Section } from '@/app/_types';
import { supabase } from '@/utils/supabase/client'
import { partialFetchVideosBySectionId } from './section-videos';

export const fetchAllSectionsByTopicId = async (topicId: string): Promise<Section[]> => {
    const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('topic_id', topicId)
        .order('section_order', {ascending: true});

    if (error) {
        throw new Error(`Error fetching sections: ${error.message}`);
    }

    return data;
}

export const fetchSectionBySectionId = async (sectionId: string): Promise<Section> => {
    const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('id', sectionId)
        .single();

    if (error) {
        throw new Error(`Error fetching sections: ${error.message}`);
    }

    return data;
}

export const createSection = async (sectionText: string, topicId: string): Promise<void> => {
    const { error } = await supabase
        .from('sections')
        .insert({
            name: sectionText,
            topic_id: topicId
        })

    if (error) {
        throw new Error(`Error creating section: ${error.message}`);
    }
}


export const updateSection = async (sectionText: string, sectionId: string): Promise<void> => {
    const { error } = await supabase
        .from('sections')
        .update({
            name: sectionText
        })
        .eq('id', sectionId);

    if (error) {
        throw new Error(`Error updating section: ${error.message}`);
    }
}

export const deleteSectionById = async (sectionId: string): Promise<void> => {
    const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', sectionId);

    if (error) {
        throw new Error(`Error deleting section: ${error.message}`);
    }
}

export const updateSectionOrder = async (sectionId: string, order: number): Promise<void> => {
    const { error } = await supabase
        .from('sections')
        .update({
            section_order: order
        })
        .eq('id', sectionId);

    if (error) {
        throw new Error(`Error updating section order: ${error.message}`);
    }
}

// New function to search sections for a specific condition/topic
export const searchSectionsForCondition = async (condition: string): Promise<any[]> => {
    // First find the topic that matches the condition
    const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select('id, is_detailed')
        .eq('name', condition)
        .single();

    if (topicError || !topicData) {
        console.error(`Topic not found for condition: ${condition}`);
        return [];
    }

    // If it's a detailed topic, fetch from detailed_topics_sections
    if (topicData.is_detailed) {
        // Get the detailed topic first
        const { data: detailedTopicData, error: detailedTopicError } = await supabase
            .from('detailed_topics')
            .select('id')
            .eq('topic_id', topicData.id)
            .single();

        if (detailedTopicError || !detailedTopicData) {
            console.error(`Detailed topic not found for condition: ${condition}`);
            return [];
        }

        // Fetch detailed topic sections
        const { data, error } = await supabase
            .from('detailed_topics_sections')
            .select('*')
            .eq('topic_id', detailedTopicData.id)
            .order('section_order', {ascending: true});

        if (error) {
            throw new Error(`Error fetching detailed topic sections for condition: ${error.message}`);
        }

        return data || [];
    } else {
        // For regular topics, fetch from regular sections
        const { data, error } = await supabase
            .from('sections')
            .select('*')
            .eq('topic_id', topicData.id)
            .order('section_order', {ascending: true});

        if (error) {
            throw new Error(`Error fetching sections for condition: ${error.message}`);
        }

        return data || [];
    }
}