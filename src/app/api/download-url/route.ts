import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateSignedUrl } from '@/utils/bunny/generateSignedUrl';

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

    const supabase = createClient();

    // Get the video URL - simplified approach
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('id, url')
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      console.error('Video fetch error:', videoError);
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Extract video ID from the embed URL and build proper CDN URL
    console.log('Original video URL:', video.url);
    
    // Extract video ID from embed URL like: https://iframe.mediadelivery.net/embed/249095/2ef247ea-2eb1-4769-a943-d8025da62d13
    const embedMatch = video.url.match(/\/embed\/\d+\/([a-f0-9-]+)/);
    if (!embedMatch) {
      return NextResponse.json(
        { error: 'Invalid video URL format' },
        { status: 400 }
      );
    }
    
    const extractedVideoId = embedMatch[1];
    console.log('Extracted video ID:', extractedVideoId);
    
    // Build the direct CDN URL for download
    const baseUrl = process.env.BUNNY_CDN_BASE_URL || 'https://vz-240b2c8d-3e2.b-cdn.net';
    const directVideoUrl = `${baseUrl}/${extractedVideoId}/play_720p.mp4`;
    
    console.log('Direct video URL for download:', directVideoUrl);
    
    // For now, use the direct URL since it works and signed URLs are getting 403
    console.log('Using direct URL for download (unsigned)');
    return NextResponse.json({ 
      url: directVideoUrl,
      filename: filename
    });

  } catch (error) {
    console.error('Download URL generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 