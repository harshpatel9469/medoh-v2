export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadProfilePicture(file: File, doctorId: string): Promise<UploadResult> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Please upload a valid image file (JPG, PNG, or WebP)'
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Image must be smaller than 5MB'
      };
    }

    // Create file extension based on type
    const extension = file.type === 'image/jpeg' ? 'jpg' : 
                     file.type === 'image/png' ? 'png' : 'webp';
    
    // Generate filename: match the exact pattern of the working URL
    const fileName = `doctor-${doctorId}-profile.${extension}`;
    
    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Upload to Bunny.net
    const uploadUrl = `https://la.storage.bunnycdn.com/west-coast-medoh/${fileName}`;
    console.log('Uploading to:', uploadUrl);
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': 'aab4a451-6880-46f4-bad563d52c91-e2ff-43ee',
        'Content-Type': file.type,
      },
      body: arrayBuffer,
    });

    console.log('Upload response status:', response.status);
    console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error response:', errorText);
      throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
    }

    // Return the Storage CDN URL - same pattern as working image in root directory
    const cdnUrl = `https://medoh.b-cdn.net/${fileName}`;
    console.log('Generated CDN URL (root directory):', cdnUrl);
    
    // Try to verify the file exists by checking storage API
    try {
      const verifyResponse = await fetch(`https://la.storage.bunnycdn.com/west-coast-medoh/${fileName}`, {
        method: 'HEAD',
        headers: {
          'AccessKey': 'aab4a451-6880-46f4-bad563d52c91-e2ff-43ee',
        },
      });
      console.log('File verification status:', verifyResponse.status);
    } catch (verifyError) {
      console.warn('Could not verify file upload:', verifyError);
    }
    
    return {
      success: true,
      url: cdnUrl
    };

  } catch (error) {
    console.error('Profile picture upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
} 