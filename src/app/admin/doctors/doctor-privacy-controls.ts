import { supabase } from '@/utils/supabase/client';
import { Topic } from '@/app/_types';

export interface VideoWithPrivacy {
  id: string;
  name: string;
  url: string;
  thumbnail_url: string;
  description?: string;
  duration?: number;
  doctor_id?: string;
  question_id?: string;
  created_at: Date;
  updated_at?: string;
  is_private: boolean;
}

export interface TopicWithPrivacy extends Topic {
  is_private: boolean;
}

export const fetchVideosWithPrivacyByDoctorId = async (doctorId: string): Promise<VideoWithPrivacy[]> => {
  console.log('Fetching videos for doctor ID:', doctorId);
  
  // Fetch videos directly with privacy field
  const { data: videos, error: videosError } = await supabase
    .from('videos')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  console.log('Videos query result:', { videos, videosError });

  if (videosError) {
    console.error('Error fetching videos:', videosError);
    throw new Error(`Error fetching videos: ${videosError.message}`);
  }

  if (!videos || videos.length === 0) {
    console.log('No videos found for doctor');
    return [];
  }

  console.log(`Found ${videos.length} videos for doctor`);

  // Transform the data to ensure is_private exists (default to false if not present)
  const videosWithPrivacy = videos.map(video => ({
    ...video,
    is_private: video.is_private || false
  }));

  console.log('Final videos with privacy:', videosWithPrivacy);
  return videosWithPrivacy;
};

export const toggleVideoPrivacy = async (videoId: string, doctorId: string, makePrivate: boolean): Promise<void> => {
  console.log(`Toggling privacy for video ${videoId} to ${makePrivate}`);
  
  const { error } = await supabase
    .from('videos')
    .update({ is_private: makePrivate })
    .eq('id', videoId)
    .eq('doctor_id', doctorId);

  if (error) {
    console.error('Error toggling video privacy:', error);
    throw new Error(`Error updating video privacy: ${error.message}`);
  }
  
  console.log(`Successfully updated video ${videoId} privacy to ${makePrivate}`);
};

export const updateMultipleVideoPrivacy = async (
  changes: { videoId: string; makePrivate: boolean }[],
  doctorId: string
): Promise<void> => {
  console.log('Updating multiple video privacy settings:', changes);
  
  // Process each change individually for better error handling
  for (const change of changes) {
    await toggleVideoPrivacy(change.videoId, doctorId, change.makePrivate);
  }
  
  console.log('Successfully updated all video privacy settings');
}; 

export const fetchTopicsWithPrivacyByDoctorId = async (doctorId: string): Promise<TopicWithPrivacy[]> => {
  console.log('Fetching topics with privacy by doctor ID:', doctorId);
  
  const uniqueTopicsMap = new Map();

  // Query regular topics through section_videos
  const { data: sectionVideosData, error: sectionError } = await supabase
    .from('section_videos')
    .select(`
      videos!inner(doctor_id),
      sections!inner(
        topics!inner(*)
      )
    `)
    .eq('videos.doctor_id', doctorId);

  console.log('Section videos query result:', { sectionVideosData, sectionError });

  if (sectionError) {
    console.error('Error fetching regular topics:', sectionError);
  } else if (sectionVideosData && sectionVideosData.length > 0) {
    console.log('Raw section videos data:', sectionVideosData);
    
    sectionVideosData.forEach((item: any) => {
      const topics = item.sections?.topics;
      if (topics) {
        const topicArray = Array.isArray(topics) ? topics : [topics];
        topicArray.forEach((topic: any) => {
          if (topic && topic.id && !uniqueTopicsMap.has(topic.id)) {
            const topicWithPrivacy = {
              ...topic,
              is_private: topic.is_private ?? false
            };
            uniqueTopicsMap.set(topic.id, topicWithPrivacy);
          }
        });
      }
    });
  }

  // Query detailed topics through detailed_topics_sections_videos
  const { data: detailedTopicsData, error: detailedError } = await supabase
    .from('detailed_topics_sections_videos')
    .select(`
      videos!inner(doctor_id),
      detailed_topics_sections!inner(
        detailed_topics!inner(*)
      )
    `)
    .eq('videos.doctor_id', doctorId);

  console.log('Detailed topics query result:', { detailedTopicsData, detailedError });

  if (detailedError) {
    console.error('Error fetching detailed topics:', detailedError);
  } else if (detailedTopicsData && detailedTopicsData.length > 0) {
    console.log('Raw detailed topics data:', detailedTopicsData);
    
    detailedTopicsData.forEach((item: any) => {
      const detailedTopics = item.detailed_topics_sections?.detailed_topics;
      if (detailedTopics) {
        const topicArray = Array.isArray(detailedTopics) ? detailedTopics : [detailedTopics];
        topicArray.forEach((topic: any) => {
          if (topic && topic.id && !uniqueTopicsMap.has(topic.id)) {
            const topicWithPrivacy = {
              ...topic,
              is_private: topic.is_private ?? false
            };
            uniqueTopicsMap.set(topic.id, topicWithPrivacy);
          }
        });
      }
    });
  }

  const finalTopics = Array.from(uniqueTopicsMap.values());
  console.log(`Found ${finalTopics.length} unique topics for doctor ${doctorId}:`, finalTopics);
  
  return finalTopics;
};

export const toggleTopicPrivacy = async (topicId: string, makePrivate: boolean): Promise<void> => {
  console.log(`=== TOGGLE PRIVACY DEBUG ===`);
  console.log(`Topic ID: ${topicId}`);
  console.log(`Make Private: ${makePrivate} (type: ${typeof makePrivate})`);
  
  try {
    // First, try updating detailed_topics table
    console.log('Attempting to update detailed_topics table...');
    const { data, error } = await supabase
      .from('detailed_topics')
      .update({ is_private: makePrivate })
      .eq('id', topicId)
      .select('*');

    console.log('Detailed topics update result:', { 
      data, 
      error,
      rowsAffected: data?.length || 0
    });

    if (error) {
      console.error('Error updating detailed_topics:', error);
      // If no rows affected, try regular topics table as fallback
      if (error.message.includes('0 rows')) {
        console.log('No rows in detailed_topics, trying topics table...');
        
        const { data: topicsData, error: topicsError } = await supabase
          .from('topics')
          .update({ is_private: makePrivate })
          .eq('id', topicId)
          .select('*');

        console.log('Topics table update result:', { topicsData, topicsError });
        
        if (topicsError) {
          throw new Error(`Failed to update both detailed_topics and topics: ${topicsError.message}`);
        }
        
        if (!topicsData || topicsData.length === 0) {
          throw new Error(`Topic with id ${topicId} not found in either table`);
        }
        
        console.log('Successfully updated regular topic privacy to:', makePrivate);
        return;
      }
      
      throw new Error(`Failed to update detailed topic: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      // Try regular topics table as fallback
      console.log('No detailed topic found, trying topics table...');
      
      const { data: topicsData, error: topicsError } = await supabase
        .from('topics')
        .update({ is_private: makePrivate })
        .eq('id', topicId)
        .select('*');

      console.log('Topics table fallback result:', { topicsData, topicsError });

      if (topicsError || !topicsData || topicsData.length === 0) {
        throw new Error(`Topic with id ${topicId} not found in either detailed_topics or topics table`);
      }
      
      console.log('Successfully updated regular topic privacy to:', makePrivate);
      return;
    }
    
    console.log('=== SUCCESS ===');
    console.log('Updated detailed topic data:', data[0]);
    console.log('New is_private value:', data[0]?.is_private);
    console.log('Successfully updated detailed topic privacy to:', makePrivate);
  } catch (err) {
    console.error('=== ERROR ===');
    console.error('Unexpected error in toggleTopicPrivacy:', err);
    throw err;
  }
};

export const updateMultipleTopicPrivacy = async (
  changes: { topicId: string; makePrivate: boolean }[]
): Promise<void> => {
  console.log('Updating multiple topic privacy settings:', changes);
  
  // Process each change
  for (const change of changes) {
    await toggleTopicPrivacy(change.topicId, change.makePrivate);
  }
  
  console.log('Successfully updated all topic privacy settings');
}; 