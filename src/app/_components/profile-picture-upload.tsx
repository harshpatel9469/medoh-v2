'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { UserIcon, CameraIcon } from '@heroicons/react/24/outline';

// Helper function to preload images
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
};

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  doctorId: string;
  onUploadSuccess?: (newImageUrl: string) => void;
  onUploadError?: (error: string) => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function ProfilePictureUpload({
  currentImageUrl,
  doctorId,
  onUploadSuccess,
  onUploadError,
  size = 'large',
  className = ''
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24', 
    large: 'w-32 h-32'
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('doctorId', doctorId);

      const response = await fetch('/api/upload-profile-picture', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setImageError(false);
        // Wait a bit longer for CDN propagation before updating the image
        setTimeout(async () => {
          // Preload the image to ensure it's accessible
          try {
            await preloadImage(result.url);
            onUploadSuccess?.(result.url);
          } catch (preloadError) {
            console.warn('Image preload failed, but proceeding anyway:', preloadError);
            onUploadSuccess?.(result.url);
          }
        }, 2000);
      } else {
        onUploadError?.(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Profile picture container */}
      <div 
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl border-4 border-white relative cursor-pointer group`}
        onClick={!isUploading ? handleFileSelect : undefined}
      >
        {/* Main image */}
        {currentImageUrl && !imageError ? (
          <Image
            src={currentImageUrl}
            alt="Profile picture"
            fill
            className="object-cover transition-all duration-200 group-hover:brightness-50 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center transition-all duration-200 group-hover:brightness-75">
            <UserIcon className={`${size === 'large' ? 'h-16 w-16' : size === 'medium' ? 'h-12 w-12' : 'h-8 w-8'} text-white`} />
          </div>
        )}

        {/* Upload overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isUploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
              <div className="text-xs text-white font-medium">Uploading...</div>
            </div>
          ) : (
            <div className="text-center">
              <CameraIcon className="h-6 w-6 text-white mx-auto mb-1" />
              <div className="text-xs text-white font-medium">Upload</div>
            </div>
          )}
        </div>

        {/* Progress indicator */}
        {isUploading && uploadProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-orange-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Upload status indicator */}
      {size === 'large' && (
        <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
          <CameraIcon className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
} 