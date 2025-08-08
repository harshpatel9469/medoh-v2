'use client';
import { useState } from 'react';
import type { Video } from '@/app/_types/video';
import VideoPlayer from './video-player';
import Image from 'next/image';

interface ExpandedVideoCardsProps {
    videos: Video[];
}

export const ExpandedVideoCards = ({ videos }: ExpandedVideoCardsProps) => {
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
                <div
                    key={video.id}
                    className="relative aspect-video cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                >
                    <div className="relative w-full h-full">
                        <Image
                            src={video.thumbnail_url}
                            alt={video.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                </div>
            ))}
            {selectedVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="relative w-full max-w-4xl aspect-video">
                        <VideoPlayer
                            id={selectedVideo.id}
                            url={selectedVideo.url}
                            name={selectedVideo.name}
                            width="100%"
                            height="100%"
                        />
                        <button
                            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
                            onClick={() => setSelectedVideo(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}; 