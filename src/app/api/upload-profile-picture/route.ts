import { NextRequest, NextResponse } from 'next/server';
import { uploadProfilePicture } from '@/utils/bunny/uploadProfilePicture';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const doctorId = formData.get('doctorId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    // Upload to Bunny.net
    const uploadResult = await uploadProfilePicture(file, doctorId);
    
    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error },
        { status: 400 }
      );
    }

    // Update doctor's profile in Supabase
    const supabase = createRouteHandlerClient({ cookies });
    
    const { error: updateError } = await supabase
      .from('doctors')
      .update({ picture_url: uploadResult.url })
      .eq('id', doctorId);

    if (updateError) {
      console.error('Error updating doctor profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Wait a moment for CDN propagation
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      message: 'Profile picture uploaded successfully. It may take a few moments to appear.'
    });

  } catch (error) {
    console.error('Profile picture upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 