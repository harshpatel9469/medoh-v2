import { supabase } from '@/utils/supabase/client';

export interface DoctorStats {
  doctor_id: string;
  doctor_name: string;
  total_videos: number;
  total_likes: number;
  total_views: number;
  total_unique_viewers: number;
}

export interface DoctorVideoInfo {
  video_id: string;
  video_name: string;
  video_thumbnail: string;
  likes: number;
  views: number;
  unique_viewers: number;
  created_at: string;
  topic_id?: string;
  topic_name?: string;
  section_name?: string;
}

export interface DoctorWithStats {
  doctor_id: string;
  doctor_name: string;
  total_videos: number;
  total_likes: number;
  total_views: number;
  total_unique_viewers: number;
  videos: DoctorVideoInfo[];
}

// Get aggregated stats for all doctors
export const fetchAllDoctorStats = async (): Promise<DoctorStats[]> => {
  const { data, error } = await supabase.rpc('get_all_doctor_stats');
  
  if (error) {
    throw new Error(`Error fetching doctor stats: ${error.message}`);
  }
  
  return data || [];
};

// Get detailed stats for a specific doctor including their videos
export const fetchDoctorWithDetailedStats = async (doctorId: string): Promise<DoctorWithStats | null> => {
  try {
    console.log('[DOCTOR STATS] Fetching detailed stats for doctor:', doctorId);
    
    // Get doctor info
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('id, name')
      .eq('id', doctorId)
      .single();

    if (doctorError || !doctor) {
      console.error('[DOCTOR STATS] Error fetching doctor:', doctorError);
      return null;
    }

    console.log(`[DOCTOR STATS] Step 1: Getting topics for doctor ${doctorId} (${doctor.name})`);

    // Get doctor's topics (same as SMS distribution)
    const { data: topicsWithPrivacy } = await supabase
      .from('detailed_topics_sections_videos')
      .select(`
        videos!inner(doctor_id),
        detailed_topics_sections!inner(
          detailed_topics!inner(id, name)
        )
      `)
      .eq('videos.doctor_id', doctorId);

    // Extract unique topics
    const uniqueTopicsMap = new Map();
    if (topicsWithPrivacy && topicsWithPrivacy.length > 0) {
      topicsWithPrivacy.forEach((item: any) => {
        const detailedTopics = item.detailed_topics_sections?.detailed_topics;
        if (detailedTopics) {
          const topicArray = Array.isArray(detailedTopics) ? detailedTopics : [detailedTopics];
          topicArray.forEach((topic: any) => {
            if (topic && topic.id && !uniqueTopicsMap.has(topic.id)) {
              uniqueTopicsMap.set(topic.id, topic);
            }
          });
        }
      });
    }

    const doctorTopics = Array.from(uniqueTopicsMap.values());
    console.log(`[DOCTOR STATS] Step 2: Found ${doctorTopics.length} topics`);

    // Collect videos using the SAME method as SMS distribution
    console.log(`[DOCTOR STATS] Step 3: Collecting videos using same RPC as SMS`);
    const allDoctorVideos: any[] = [];

    for (const topic of doctorTopics) {
      console.log(`[DOCTOR STATS] Processing topic: ${topic.name}`);
      
      try {
        // Get sections for this topic
        const { data: sections, error: sectionsError } = await supabase
          .from('detailed_topics_sections')
          .select('id, name, section_order')
          .eq('topic_id', topic.id)
          .order('section_order', { ascending: true });

        if (sectionsError || !sections) {
          console.error(`[DOCTOR STATS] Error fetching sections for topic ${topic.name}:`, sectionsError);
          continue;
        }

        let topicVideoCount = 0;
        for (const section of sections) {
          // Use the SAME RPC function as SMS distribution and topic-videos API
          const { data: sectionVideos, error: videosError } = await supabase.rpc(
            'get_detailed_topic_video_details_by_section_and_doctor', 
            { 
              p_section_id: section.id, 
              p_doctor_id: doctorId 
            }
          );

          if (!videosError && sectionVideos && sectionVideos.length > 0) {
            topicVideoCount += sectionVideos.length;
            
            // Add topic info to each video
            const videosWithTopic = sectionVideos.map((video: any) => ({
              ...video,
              topic_id: topic.id,
              topic_name: topic.name,
              section_name: section.name
            }));
            allDoctorVideos.push(...videosWithTopic);
          }
        }
        
        console.log(`[DOCTOR STATS] ⚠️  COMPARISON: Topic ${topic.name} - Stats found ${topicVideoCount} videos, SMS shows ??? videos`);
        console.log(`[DOCTOR STATS] Topic ${topic.name} video IDs:`, allDoctorVideos.filter(v => v.topic_id === topic.id).map(v => v.video_id || v.id));
      } catch (topicError) {
        console.error(`[DOCTOR STATS] Error processing topic ${topic.name}:`, topicError);
      }
    }

            console.log(`[DOCTOR STATS] Step 4: Total videos collected: ${allDoctorVideos.length} (should match SMS totals)`);

        const doctorVideos = allDoctorVideos;

        // Get video IDs for stats lookup
        const videoIds = doctorVideos.map(v => v.video_id || v.id);
        console.log(`[DOCTOR STATS] Step 5: Fetching likes/views for ${videoIds.length} video IDs:`, videoIds.slice(0, 5));
    
    if (videoIds.length === 0) {
      return {
        doctor_id: doctorId,
        doctor_name: doctor.name,
        total_videos: 0,
        total_likes: 0,
        total_views: 0,
        total_unique_viewers: 0,
        videos: []
      };
    }

    // Get views for these videos
    console.log(`[DOCTOR STATS] Step 6: Querying user_view_counts for video IDs...`);
    const { data: views, error: viewsError } = await supabase
      .from('user_view_counts')
      .select('video_id, user_id')
      .in('video_id', videoIds);

    if (viewsError) {
      console.error('[DOCTOR STATS] Error fetching views:', viewsError);
    } else {
      console.log(`[DOCTOR STATS] Found ${views?.length || 0} view records from database`);
    }

    // Get likes for these videos
    console.log(`[DOCTOR STATS] Step 7: Querying user_likes for video IDs...`);
    const { data: likes, error: likesError } = await supabase
      .from('user_likes')
      .select('video_id, user_id')
      .in('video_id', videoIds)
      .eq('like', true);

    if (likesError) {
      console.error('[DOCTOR STATS] Error fetching likes:', likesError);
    } else {
              console.log(`[DOCTOR STATS] Found ${likes?.length || 0} like records from database`);
    }

    const allViews = views || [];
    const allLikes = likes || [];
    
    console.log(`[DOCTOR STATS] Step 8: Data analysis - Video IDs we're looking for:`, videoIds.slice(0, 3));
    console.log(`[DOCTOR STATS] Step 8: Sample view records from DB:`, allViews.slice(0, 3));
    console.log(`[DOCTOR STATS] Step 8: Sample like records from DB:`, allLikes.slice(0, 3));
    
    // 🔍 CRITICAL DEBUG: Check for video ID mismatch
    if (allViews.length > 0 && videoIds.length > 0) {
      const viewVideoIds = allViews.map(v => v.video_id).slice(0, 5);
      const ourVideoIds = videoIds.slice(0, 5);
      console.log(`[DOCTOR STATS] 🔍 MISMATCH CHECK:`);
      console.log(`[DOCTOR STATS] Our video IDs:`, ourVideoIds);
      console.log(`[DOCTOR STATS] View table video IDs:`, viewVideoIds);
      console.log(`[DOCTOR STATS] Do any match?`, ourVideoIds.some(id => viewVideoIds.includes(id)));
    }

    // Clean up potential duplicate views (same user + video combination)
    // This can happen if users refresh pages or due to tracking bugs
    const cleanViews = allViews.reduce((acc, view) => {
      const key = `${view.video_id}-${view.user_id}`;
      if (!acc.seen.has(key)) {
        acc.seen.add(key);
        acc.views.push(view);
      }
      return acc;
    }, { seen: new Set(), views: [] as any[] }).views;

    if (cleanViews.length !== allViews.length) {
      console.log(`Cleaned ${allViews.length - cleanViews.length} duplicate view entries`);
    }

    // Calculate stats for each video
    const videoStats: DoctorVideoInfo[] = doctorVideos.map(video => {
      // 🔧 FIX: Use video.video_id instead of video.id
      const videoViews = cleanViews.filter(v => v.video_id === video.video_id);
      const videoLikes = allLikes.filter(l => l.video_id === video.video_id);
      
      // 🔍 DEBUG: Log filtering for first video
      if (video === allDoctorVideos[0]) {
        console.log(`[DOCTOR STATS] 🔧 FILTERING DEBUG for video:`, video.video_id);
        console.log(`[DOCTOR STATS] Found ${videoViews.length} views for this video`);
        console.log(`[DOCTOR STATS] Found ${videoLikes.length} likes for this video`);
      }
      // Get unique viewers for this specific video only
      const uniqueViewers = new Set(videoViews.map(v => v.user_id)).size;

      // Debug logging for suspicious numbers
      const viewsPerViewer = uniqueViewers > 0 ? videoViews.length / uniqueViewers : 0;
      if (viewsPerViewer > 10) {
        console.warn(`Suspicious views per viewer for video ${video.name}:`, {
          totalViews: videoViews.length,
          uniqueViewers: uniqueViewers,
          viewsPerViewer: viewsPerViewer,
          sampleViews: videoViews.slice(0, 5)
        });
      }

      return {
        video_id: video.video_id || video.id,
        video_name: video.name || video.question_name,
        video_thumbnail: video.thumbnail_url || video.url || '',
        likes: videoLikes.length,
        views: videoViews.length,
        unique_viewers: uniqueViewers,
        created_at: video.created_at || new Date().toISOString(),
        topic_id: video.topic_id,
        topic_name: video.topic_name,
        section_name: video.section_name
      };
    });

    // Calculate totals
    const totalLikes = videoStats.reduce((sum, v) => sum + v.likes, 0);
    const totalViews = videoStats.reduce((sum, v) => sum + v.views, 0);
    // Calculate total unique viewers across ALL videos (not sum of individual video unique viewers)
    const allUniqueViewers = new Set(cleanViews.map(v => v.user_id));
    const totalUniqueViewers = allUniqueViewers.size;

    console.log(`Doctor ${doctorId} stats (100% real database data):`, {
      videos: videoStats.length,
      totalLikes: totalLikes,
      totalViews: totalViews,
      totalUniqueViewers: totalUniqueViewers,
      dataSource: {
        views: `${cleanViews.length} records from user_view_counts table`,
        likes: `${allLikes.length} records from user_likes table`,
        uniqueViewers: `${allUniqueViewers.size} distinct user IDs`
      }
    });
    
    // Debug: Show sample video stats with topic info
    console.log(`[DOCTOR STATS] Step 9: Sample video with topic info:`, videoStats.slice(0, 2));

    return {
      doctor_id: doctorId,
      doctor_name: doctor.name,
      total_videos: videoStats.length,
      total_likes: totalLikes,
      total_views: totalViews,
      total_unique_viewers: totalUniqueViewers,
      videos: videoStats
    };
  } catch (error) {
    console.error('Error in fetchDoctorWithDetailedStats:', error);
    console.error('Error details:', {
      message: (error as any)?.message,
      stack: (error as any)?.stack,
      doctorId: doctorId
    });
    throw error;
  }
};

// Get stats for doctors with public content only
export const fetchPublicDoctorStats = async (): Promise<DoctorStats[]> => {
  try {
    console.log('Fetching public doctor stats...');
    
    // Get all videos with their like counts and doctor info
    // Note: There's no is_private column in videos table, so all videos are considered public
    const { data: allVideos, error: videosError } = await supabase
      .from('videos')
      .select(`
        doctor_id,
        id,
        name,
        thumbnail_url,
        created_at
      `)
      .order('created_at', { ascending: false });
      
    console.log('All videos fetched:', allVideos?.length);

    if (videosError) {
      console.error('Error fetching videos:', videosError);
      throw new Error(`Error fetching doctor videos: ${videosError.message}`);
    }

    // Since there's no is_private column, all videos are considered public
    const publicVideos = allVideos || [];
    
    console.log('Public videos (all videos):', publicVideos.length);

    if (!publicVideos || publicVideos.length === 0) {
      console.log('No videos found');
      return [];
    }

    // Get unique doctor IDs and fetch their names
    const uniqueDoctorIds = Array.from(new Set(publicVideos.map(v => v.doctor_id).filter(Boolean)));
    
    const { data: doctors, error: doctorsError } = await supabase
      .from('doctors')
      .select('id, name')
      .in('id', uniqueDoctorIds);

    if (doctorsError) {
      console.error('Error fetching doctor names:', doctorsError);
    }

    // Create a map for quick doctor name lookup
    const doctorNameMap = new Map();
    (doctors || []).forEach(doc => doctorNameMap.set(doc.id, doc.name));

    // Get video IDs for views and likes lookup
    const videoIds = publicVideos.map(v => v.id);
    console.log('Total video IDs for views and likes lookup:', videoIds.length);

    // Get views for these videos in chunks to avoid 414 Request-URI Too Large error
    const chunkSize = 100; // Process 100 video IDs at a time
    const allViews = [];
    
    console.log('Fetching views in chunks...');
    for (let i = 0; i < videoIds.length; i += chunkSize) {
      const chunk = videoIds.slice(i, i + chunkSize);
      console.log(`Fetching views for chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(videoIds.length/chunkSize)} (${chunk.length} videos)`);
      
      const { data: chunkViews, error: chunkError } = await supabase
        .from('user_view_counts')
        .select('video_id, user_id')
        .in('video_id', chunk);

      if (chunkError) {
        console.error(`Error fetching views for chunk ${Math.floor(i/chunkSize) + 1}:`, chunkError);
      } else {
        allViews.push(...(chunkViews || []));
      }
    }

    const views = allViews;
    console.log('Total views fetched:', views.length);

    // Get likes for these videos in chunks
    const allLikes = [];
    
    console.log('Fetching likes in chunks...');
    for (let i = 0; i < videoIds.length; i += chunkSize) {
      const chunk = videoIds.slice(i, i + chunkSize);
      console.log(`Fetching likes for chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(videoIds.length/chunkSize)} (${chunk.length} videos)`);
      
      const { data: chunkLikes, error: chunkError } = await supabase
        .from('user_likes')
        .select('video_id, user_id')
        .in('video_id', chunk)
        .eq('like', true);

      if (chunkError) {
        console.error(`Error fetching likes for chunk ${Math.floor(i/chunkSize) + 1}:`, chunkError);
      } else {
        allLikes.push(...(chunkLikes || []));
      }
    }

    const likes = allLikes;
    console.log('Total likes fetched:', likes.length);
    console.log('Sample likes:', likes.slice(0, 3));

    // Aggregate stats by doctor
    const doctorStatsMap = new Map<string, {
      doctor_id: string;
      doctor_name: string;
      total_videos: number;
      total_likes: number;
      total_views: number;
      total_unique_viewers: number;
      videos: Set<string>;
    }>();

    // Initialize doctor stats and calculate video counts
    publicVideos.forEach(video => {
      const doctorId = video.doctor_id;
      if (!doctorId) return;

      if (!doctorStatsMap.has(doctorId)) {
        doctorStatsMap.set(doctorId, {
          doctor_id: doctorId,
          doctor_name: doctorNameMap.get(doctorId) || 'Unknown Doctor',
          total_videos: 0,
          total_likes: 0,
          total_views: 0,
          total_unique_viewers: 0,
          videos: new Set()
        });
      }

      const stats = doctorStatsMap.get(doctorId)!;
      stats.videos.add(video.id);
      stats.total_videos = stats.videos.size;
    });

    console.log('Doctor stats after video processing:', Array.from(doctorStatsMap.values()).map(d => ({
      name: d.doctor_name,
      videos: d.total_videos,
      likes: d.total_likes
    })));

    // Add likes from user_likes table
    likes.forEach(like => {
      const video = publicVideos.find(v => v.id === like.video_id);
      if (video?.doctor_id) {
        const stats = doctorStatsMap.get(video.doctor_id);
        if (stats) {
          stats.total_likes++;
        }
      }
    });

    console.log('Doctor stats after adding likes:', Array.from(doctorStatsMap.values()).map(d => ({
      name: d.doctor_name,
      videos: d.total_videos,
      likes: d.total_likes
    })));

    // Add views and unique viewers
    const viewersByDoctor = new Map<string, Set<string>>();
    let viewsProcessed = 0;
    
    views.forEach(view => {
      const video = publicVideos.find(v => v.id === view.video_id);
      if (video?.doctor_id) {
        const stats = doctorStatsMap.get(video.doctor_id);
        if (stats) {
          stats.total_views++;
          viewsProcessed++;
          
          if (!viewersByDoctor.has(video.doctor_id)) {
            viewersByDoctor.set(video.doctor_id, new Set());
          }
          viewersByDoctor.get(video.doctor_id)!.add(view.user_id);
        }
      }
    });

    console.log('Views processed and added to stats:', viewsProcessed);
    console.log('Viewers by doctor map size:', viewersByDoctor.size);

    // Update unique viewers count
    viewersByDoctor.forEach((viewers, doctorId) => {
      const stats = doctorStatsMap.get(doctorId);
      if (stats) {
        stats.total_unique_viewers = viewers.size;
        console.log(`Doctor ${stats.doctor_name}: ${viewers.size} unique viewers`);
      }
    });

    console.log('Final doctor stats:', Array.from(doctorStatsMap.values()).map(d => ({
      name: d.doctor_name,
      videos: d.total_videos,
      likes: d.total_likes,
      views: d.total_views,
      unique_viewers: d.total_unique_viewers
    })));

    // Convert to array and sort by total engagement (likes + views)
    return Array.from(doctorStatsMap.values())
      .map(stats => ({
        doctor_id: stats.doctor_id,
        doctor_name: stats.doctor_name,
        total_videos: stats.total_videos,
        total_likes: stats.total_likes,
        total_views: stats.total_views,
        total_unique_viewers: stats.total_unique_viewers
      }))
      .sort((a, b) => (b.total_likes + b.total_views) - (a.total_likes + a.total_views));

  } catch (error) {
    console.error('Error in fetchPublicDoctorStats:', error);
    throw error;
  }
}; 