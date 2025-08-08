import { supabase } from '@/utils/supabase/client'
import { Filter } from "../_types/filters";

export const fetchAllFiltersByTopicId = async (topicId: string): Promise<Filter[]> => {
    const {data, error} = await supabase
        .from('filters')
        .select()
        .eq('topic_id', topicId);

    if (error) {
        throw new Error(`Error retrieving filters for topic: ${error.message}`);
    }

    return data || [];
}

export const fetchFilterById = async (filterId: string): Promise<Filter | null> => {
    const {data, error} = await supabase
        .from('filters')
        .select()
        .eq('id', filterId)
        .single();

    if (error) {
        throw new Error(`Error retrieving filter: ${error.message}`);
    }

    return data || null;
}

export const createFilter = async (filterName: string, topicId: string) => {
    const {error} = await supabase
        .from('filters')
        .insert({
            name: filterName,
            topic_id: topicId
        });

    if (error) {
        throw new Error(`Error creating filter: ${error.message}`);
    }
}

export const updateFilter = async (filterId: string, filterName: string, topicId: string) => {
    const {error} = await supabase
        .from('filters')
        .update({
            name: filterName,
            topic_id: topicId
        })
        .eq('id', filterId);

    if (error) {
        throw new Error(`Error updating filter: ${error.message}`);
    }
}

export const deleteFilterById = async (filterId: string) => {
    const {error} = await supabase
        .from('filters')
        .delete()
        .eq('id', filterId);

    if (error) {
        throw new Error(`Error deleting filter: ${error.message}`);
    }
}