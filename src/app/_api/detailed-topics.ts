import { supabase } from '@/utils/supabase/client'
import { DetailedTopic } from "../_types/detailed-topic";

export const fetchAllDetailedTopicsById = async (topicId: string) : Promise<DetailedTopic[]> => {
    const {data, error} = await supabase
        .from('detailed_topics')
        .select()
        .eq('topic_id', topicId)
        .order('topic_order', {ascending: true});

    if (error) {
        throw new Error(`Error fetching detailedTopics: ${error.message}`);
    }

    return data || [];
}

export const fetchDetailedTopicById = async (id: string) : Promise<DetailedTopic> => {
    const {data, error} = await supabase
        .from('detailed_topics')
        .select()
        .eq('id', id)
        .single();

    if (error) {
        throw new Error(`Error fetching detailedTopics: ${error.message}`);
    }

    return data || [];
}

export const fetchDetailedTopicsSearch = async (term: string): Promise<DetailedTopic[]> => {
    const { data, error } = await supabase
        .from('detailed_topics')
        .select()
        .ilike('name', `%${term}%`)
        .limit(20)
        .order('topic_order', {ascending: true});

    if (error) {
        throw new Error(`Error fetching detailedTopics: ${error.message}`);
    }

    return data || [];
}

export const createDetailedTopic = async (detailedTopicText: string, description: string, image: string, order: number, indication: string, purpose: string, treatmentType: string, topicId: string) => {
    const {error} = await supabase
        .from('detailed_topics')
        .insert({
            'name': detailedTopicText,
            'description': description,
            'image_url': image,
            'indication': indication,
            'purpose': purpose,
            'filter_id': treatmentType,
            'topic_order': order,
            'topic_id': topicId
        });

    if (error) {
        throw new Error(`Error creating detailedTopic: ${error.message}`);
    }
}

export const updateDetailedTopic = async (detailedTopicText: string, description: string, image: string, id: string, order: number, indication: string, purpose: string, treatmentType: string): Promise<void> => {
    if (!detailedTopicText) {
        throw new Error('DetailedTopic cannot be empty');
    }
    
    const { error } = await supabase
        .from('detailed_topics')
        .update({
            name: detailedTopicText,
            description: description,
            image_url: image,
            topic_order: order,
            indication: indication,
            purpose: purpose,
            filter_id: treatmentType
        })
        .eq('id', id);

    if (error) {
        throw new Error(`Error updating detailedTopic: ${error.message}`);
    }
};

export const deleteDetailedTopicById = async(id: string): Promise<void> => {
    const { error } = await supabase
        .from('detailed_topics')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`Error deleting detailedTopic: ${error.message}`);
    }
}

export const fetchAllDetailedTopics = async () : Promise<DetailedTopic[]> => {
    const {data, error} = await supabase
        .from('detailed_topics')
        .select()
        .order('topic_order', {ascending: true});

    if (error) {
        throw new Error(`Error fetching detailedTopics: ${error.message}`);
    }

    return data || [];
}