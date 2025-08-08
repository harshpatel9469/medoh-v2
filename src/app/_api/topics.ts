import { Topic } from '@/app/_types';
import { supabase } from '@/utils/supabase/client'
import { DoctorTopicData } from '../_types/doctor-topic-data';

export const fetchAllTopics = async (): Promise<Topic[]> => {
    const { data, error } = await supabase
        .from('topics')
        .select('*, body_parts(name)')
        .order('topic_order', {ascending: true});

    if (error) {
        throw new Error(`Error fetching topics: ${error.message}`);
    }

    return data;
}

export const fetchTopicById = async (topicId: string): Promise<Topic> => {
    const { data, error } = await supabase
        .from('topics')
        .select('*, body_parts(name)')
        .eq('id', topicId);

    if (error) {
        throw new Error(`Error fetching topics: ${error.message}`);
    }

    return data[0];
}

export const fetchTopicsSearch = async (term: string): Promise<Topic[]> => {
    term = term.trim();
    if (term.length < 1) return [];

    // Define stopwords to ignore
    const stopwords = new Set(['is', 'the', 'a', 'an', 'it', 'to', 'of', 'and', 'in', 'on', 'for', 'with', 'at', 'by', 'from', 'as', 'that', 'this', 'what', 'how', 'why', 'when', 'where', 'who']);

    // Split the term into words and filter out stopwords
    const words = term.split(/\s+/).map(w => w.toLowerCase()).filter(word => word.length > 1 && !stopwords.has(word));
    const patterns = [
        `%${term}%`, // Full term
        ...words.map(word => `%${word}%`)
    ];

    // Build the .or() query for all patterns
    const orQuery = patterns.map(pattern => `name.ilike.${pattern}`).join(',');

    // Search both topics and detailed_topics tables
    const [topicsResult, detailedTopicsResult] = await Promise.all([
        supabase
            .from('topics')
            .select()
            .or(orQuery)
            .limit(20),
        supabase
            .from('detailed_topics')
            .select('id, name, indication, purpose, description, image_url')
            .or(orQuery)
            .limit(20)
    ]);

    if (topicsResult.error) {
        throw new Error(`Error fetching topics: ${topicsResult.error.message}`);
    }

    if (detailedTopicsResult.error) {
        console.error(`Error fetching detailed topics: ${detailedTopicsResult.error.message}`);
    }

    // Combine and score all results
    const allTopics = [
        ...(topicsResult.data || []).map(topic => ({ ...topic, source: 'topics' })),
        ...(detailedTopicsResult.data || []).map(topic => ({ 
            ...topic, 
            source: 'detailed_topics',
            // Map detailed_topics fields to match topics structure
            description: topic.description || topic.purpose || '',
            image: topic.image_url || ''
        }))
    ];

    // Score and rank the results by improved logic
    const scoredTopics = allTopics.map(topic => {
        const nameLower = topic.name.toLowerCase();
        const descriptionLower = (topic.description || '').toLowerCase();
        const indicationLower = (topic.indication || '').toLowerCase();
        
        let score = 0;
        
        // +10 for full term match in name
        if (nameLower.includes(term.toLowerCase())) score += 10;
        
        // +5 for full term match in indication
        if (indicationLower.includes(term.toLowerCase())) score += 5;
        
        // +3 for full term match in description
        if (descriptionLower.includes(term.toLowerCase())) score += 3;
        
        // Score for each important word
        for (const word of words) {
            if (nameLower === word) {
                score += 7; // exact match in name
            } else if (nameLower.startsWith(word + ' ')) {
                score += 6; // prefix match at start
            } else if (nameLower.includes(' ' + word + ' ')) {
                score += 5; // whole word match in middle
            } else if (nameLower.endsWith(' ' + word)) {
                score += 5; // whole word match at end
            } else if (nameLower.startsWith(word)) {
                score += 5; // prefix match
            } else if (nameLower.includes(word)) {
                score += 2; // partial match in name
            }
            
            // Also check indication and description
            if (indicationLower.includes(word)) score += 3;
            if (descriptionLower.includes(word)) score += 1;
        }
        
        // Boost detailed topics slightly as they're more comprehensive
        if (topic.source === 'detailed_topics') score += 1;
        
        return { ...topic, relevanceScore: score };
    });

    return scoredTopics
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 30) // Return top 30 combined results
        .map(({ relevanceScore, source, indication, ...rest }) => rest);
}

export const createTopic = async (topicText: string, description: string, image: string, order = 0, isDetailed: boolean, bodyPartId?: string): Promise<void> => {
    if (!topicText) {
        throw new Error('Topic cannot be empty');
    }
    const { data: conditionData, error: conditionError } = await supabase.from('conditions').select();
    if(conditionError) {
        throw new Error(`Error loading condition: ${conditionError.message}`);
    }
    const { error: topicError } = await supabase.from('topics').insert({
        name: topicText,
        description: description,
        condition_id: conditionData[0].id,
        image: image,
        topic_order: order,
        is_detailed: isDetailed,
        body_part_id: bodyPartId || null
    });
    if (topicError) {
        throw new Error(`Error creating topic: ${topicError.message}`);
    }
};

export const updateTopic = async (topicText: string, description: string, image: string, id: string, order: number, isDetailed: boolean, bodyPartId?: string): Promise<void> => {
    if (!topicText) {
        throw new Error('Topic cannot be empty');
    }
    const { error } = await supabase
        .from('topics')
        .update({
            name: topicText,
            description: description,
            image: image,
            topic_order: order,
            is_detailed: isDetailed,
            body_part_id: bodyPartId || null
        })
        .eq('id', id);
    if (error) {
        throw new Error(`Error updating topic: ${error.message}`);
    }
};

export const deleteTopicById = async(id: string): Promise<void> => {
    const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`Error deleting topic: ${error.message}`);
    }
}

export const fetchTopicsAndSectionsByDoctorId = async(doctorId: string): Promise<DoctorTopicData[]> => {
    const { data, error } = await supabase.rpc('get_topics_and_sections_by_doctor_id', { p_doctor_id: doctorId });

    if (error) {
        throw new Error(`Error getting topics and sections for doctor: ${error.message}`);
    }

    return data || [];
}

export const toggleDetailedTopicPrivacy = async (topicId: string, makePrivate: boolean): Promise<void> => {
    const { error } = await supabase
      .from('detailed_topics')
      .update({ is_private: makePrivate })
      .eq('id', topicId);
  
    if (error) {
      throw new Error(`Error updating detailed topic privacy: ${error.message}`);
    }
};

export const fetchPublicTopicsAndSectionsByDoctorId = async (doctorId: string): Promise<DoctorTopicData[]> => {
    const { data, error } = await supabase.rpc('get_public_detailed_topics_by_doctor_id', {
      p_doctor_id: doctorId
    });
  
    if (error) {
      throw new Error(`Error getting public doctor topics/sections: ${error.message}`);
    }
  
    return data || [];
};

// Fetch all public topics (both regular topics and detailed topics that are not private)
export const fetchAllPublicTopics = async (): Promise<any[]> => {
    // Get regular topics (these don't have privacy settings, so they're all public)
    const { data: regularTopics, error: regularError } = await supabase
        .from('topics')
        .select(`
            id,
            name,
            description,
            image,
            topic_order,
            is_detailed,
            body_parts(name)
        `)
        .order('topic_order', { ascending: true });

    if (regularError) {
        throw new Error(`Error fetching regular topics: ${regularError.message}`);
    }

    // Get public detailed topics (where is_private = false or null)
    const { data: detailedTopics, error: detailedError } = await supabase
        .from('detailed_topics')
        .select(`
            id,
            name,
            description,
            image,
            topic_order,
            is_private
        `)
        .or('is_private.is.null,is_private.eq.false')
        .order('topic_order', { ascending: true });

    if (detailedError) {
        throw new Error(`Error fetching detailed topics: ${detailedError.message}`);
    }

    // Combine and mark the source
    const allPublicTopics = [
        ...(regularTopics || []).map(topic => ({ ...topic, is_detailed: false, source: 'regular' })),
        ...(detailedTopics || []).map(topic => ({ ...topic, is_detailed: true, source: 'detailed' }))
    ];

    // Sort by topic_order
    return allPublicTopics.sort((a, b) => (a.topic_order || 0) - (b.topic_order || 0));
};
  
  