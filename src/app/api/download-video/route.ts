import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const filename = searchParams.get('filename');

    if (!videoId || !filename) {
      return NextResponse.json(
        { error: 'Missing videoId or filename' },
        { status: 400 }
      );
    }
    
    console.log('🔍 Download request for videoId:', videoId, 'filename:', filename);

    const supabase = createClient();

    // Get the video URL - handle both direct video ID and question ID
    let video, videoError;
    
    // First try to find video by direct ID
    const { data: directVideo, error: directError } = await supabase
      .from('videos')
      .select('id, url')
      .eq('id', videoId)
      .single();
    
    if (directVideo && !directError) {
      console.log('✅ Found video by direct ID:', directVideo);
      video = directVideo;
      videoError = directError;
    } else {
      console.log('❌ Direct video lookup failed, trying through questions table...');
      // If not found, try to find video through questions table
      const { data: questionVideo, error: questionError } = await supabase
        .from('questions')
        .select('videos!public_videos_question_id_fkey(id, url)')
        .eq('id', videoId)
        .single();
        
      console.log('Question video lookup result:', { questionVideo, questionError });
        
      if (questionVideo?.videos && !questionError) {
        // Handle if videos is an array or single object
        video = Array.isArray(questionVideo.videos) ? questionVideo.videos[0] : questionVideo.videos;
        videoError = questionError;
        console.log('✅ Found video through questions table:', video);
      } else {
        video = null;
        videoError = questionError || directError;
        console.log('❌ Failed to find video through any method');
      }
    }

    if (videoError || !video) {
      console.error('Video fetch error:', videoError);
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Extract video ID from the embed URL and build proper CDN URL
    console.log('Original video URL:', video.url);
    
    const embedMatch = video.url.match(/\/embed\/\d+\/([a-f0-9-]+)/);
    if (!embedMatch) {
      return NextResponse.json(
        { error: 'Invalid video URL format' },
        { status: 400 }
      );
    }
    
    const extractedVideoId = embedMatch[1];
    console.log('Extracted video ID:', extractedVideoId);
    
    // Build the direct CDN URL
    const baseUrl = process.env.BUNNY_CDN_BASE_URL || 'https://vz-240b2c8d-3e2.b-cdn.net';
    const directVideoUrl = `${baseUrl}/${extractedVideoId}/play_720p.mp4`;
    
    console.log('Proxying video from:', directVideoUrl);

    // Fetch the video from Bunny.net
    const videoResponse = await fetch(directVideoUrl);
    
    if (!videoResponse.ok) {
      console.error('Failed to fetch video:', videoResponse.status, videoResponse.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch video' },
        { status: videoResponse.status }
      );
    }

    // Get the video content
    const videoBuffer = await videoResponse.arrayBuffer();
    
    // Return the video with proper download headers
    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': videoBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Video download error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 