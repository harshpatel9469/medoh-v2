import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('topicId');
    const doctorId = searchParams.get('doctorId');

    if (!topicId) {
      return NextResponse.json(
        { error: 'Missing topicId' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    let validatedDoctorId: string;

    // Authentication logic: Use impersonated doctor ID or fall back to authenticated user's doctor ID
    if (doctorId) {
      // Impersonation mode: use the provided doctor ID
      validatedDoctorId = doctorId;
      console.log('Using provided doctor ID (impersonation):', validatedDoctorId);
    } else {
      // Normal authentication flow: get user's own doctor ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        return NextResponse.json({ 
          error: 'User not authenticated' 
        }, { status: 401 });
      }

      // Get the doctor's database ID from their user_id
      const { data: doctor, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (doctorError || !doctor) {
        console.error('Doctor lookup error:', doctorError);
        return NextResponse.json({ 
          error: 'Doctor profile not found' 
        }, { status: 404 });
      }

      validatedDoctorId = doctor.id;
      console.log('Authenticated doctor ID:', validatedDoctorId);
    }

    // Get authenticated user for the RPC call (still needed for RPC function)
    const { data: { user } } = await supabase.auth.getUser();

    // Get sections for this topic (same as topic info page)
    const { data: sections, error: sectionsError } = await supabase
      .from('detailed_topics_sections')
      .select('id, name, section_order')
      .eq('topic_id', topicId)
      .order('section_order', { ascending: true });

    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
      return NextResponse.json(
        { error: 'Failed to fetch sections' },
        { status: 500 }
      );
    }

    // For each section, get videos using the same RPC as topic info page
    const sectionsWithVideos = [];
    
    for (const section of sections || []) {
      // Use the doctor-specific RPC function that already filters by doctor ID
      const { data: sectionVideos, error: videosError } = await supabase.rpc(
        'get_detailed_topic_video_details_by_section_and_doctor', 
        { 
          p_section_id: section.id, 
          p_doctor_id: validatedDoctorId 
        }
      );

      if (!videosError && sectionVideos && sectionVideos.length > 0) {
        console.log(`Found ${sectionVideos.length} videos for doctor ${validatedDoctorId} in section ${section.name}`);

                // Since the RPC function already filtered by doctor, use sectionVideos directly
        const formattedVideos = sectionVideos.map((video: any) => ({
            id: video.question_id || video.id || video.video_id, // Use question_id for URL
            video_id: video.id || video.video_id, // Keep video_id for reference  
            question_id: video.question_id, // Explicit question_id field
            name: video.name || video.question_name,
            url: video.url || video.video_url,
            doctor_id: video.doctor_id
          }));

        sectionsWithVideos.push({
          ...section,
          videos: formattedVideos
        });
      }
    }

    return NextResponse.json({ 
      sections: sectionsWithVideos,
      totalVideos: sectionsWithVideos.reduce((acc, section) => acc + section.videos.length, 0)
    });

  } catch (error) {
    console.error('Topic videos fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 