'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  ArrowUpOnSquareIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

import OtherVideos from '@/app/_components/other-videos';
import VideoCardNoArrows from '@/app/_components/question-page/new-video-body';

import { fetchQuestionIdByVideoId, fetchPrivateVideosByVideoId } from '@/app/_api/private-pages';

type VideoItem = {
  id: string;
  name: string;
  url: string;
  question_id?: string;
  thumbnail_url: string | null;
  progression?: number | null;
  doctors?: {
    id: string;
    name: string;
    specialty?: string;
    picture_url?: string;
    city?: string;
    state?: string;
  };
};

export default function PrivateVideoPage({
  params,
  searchParams,
}: {
  params: {
    topicId: string;
    id: string;
    detailedTopicId: string;
    videoId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { id: privatePageId, topicId, detailedTopicId, videoId } = params;

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        // Verify current video exists
        const questionId = await fetchQuestionIdByVideoId(videoId);
        if (!questionId) {
          setLoading(false);
          return;
        }

        // Fetch all videos for this private page (includes video_url)
        const data = await fetchPrivateVideosByVideoId(privatePageId, videoId);

        // Debug check
        console.log("Fetched videos:", data);

        // Map videos to required structure
        const allVideos = data.map((v: any) => ({
          id: v.video_id,
          name: v.name,
          url: v.video_url || '', // ensure we use video_url
          question_id: v.question_id,
          thumbnail_url: v.thumbnail_url,
        }));

        const currentIdx = allVideos.findIndex((v) => v.id === videoId);
        setVideos(allVideos);
        setCurrentIndex(currentIdx >= 0 ? currentIdx : 0);
      } catch (error) {
        console.error('Error loading videos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, [videoId, privatePageId]);

  if (loading) {
    return <div className="p-6 text-lg text-gray-600">Loading videos...</div>;
  }

  if (videos.length === 0) {
    return (
      <div className="p-6 text-red-600 text-lg">
        No videos available for this detailed topic.
      </div>
    );
  }

  const currentVideo = videos[currentIndex];

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentIndex < videos.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:space-x-4 max-sm:space-y-4 items-start">
      {/* Left Section (Video Player + Arrows) */}
      <div className="w-full lg:w-2/3 p-4 flex flex-col items-center">
        {/* Back Button */}
        <div className="flex md:items-center md:flex-row flex-col justify-center w-full mb-4">
          <div className="md:flex-1 hidden md:block">
            <Link
              href={`/private-page-patient/${privatePageId}/topics/${topicId}/${detailedTopicId}`}
              className="contents"
            >
              <ArrowLeftIcon className="w-7 md:w-10 hover:text-primary-color-light" />
            </Link>
          </div>
          <Link
            href={'?modal=true'}
            className="bg-card-background-primary-gradient rounded-full md:p-4 p-2 aspect-square w-10 h-10 md:w-16 md:h-16"
          >
            <ArrowUpOnSquareIcon className="text-white" />
          </Link>
        </div>

        {/* Video Player with Arrows */}
        <div className="flex items-center justify-center gap-4 w-full">
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="bg-gray-200 p-3 rounded-full hover:bg-gray-300"
            >
              <ArrowUpIcon className="w-5 h-5" />
            </button>
          )}

          <div className="flex-1 max-w-4xl">
            {/* Main Video Player */}
            <VideoCardNoArrows video={currentVideo} />
          </div>

          {currentIndex < videos.length - 1 && (
            <button
              onClick={handleNext}
              className="bg-gray-200 p-3 rounded-full hover:bg-gray-300"
            >
              <ArrowDownIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Section (Other Videos Preview) */}
      <div className="w-full lg:w-1/3 p-4 lg:h-screen lg:overflow-y-auto">
        <OtherVideos
          results={videos.map((v) => ({
            video_id: v.id,
            name: v.name,
            thumbnail_url: v.thumbnail_url,
            question_id: v.question_id,
          }))}
          topicName="Private Topic"
          sectionName="Private Section"
          currVideoIdx={currentIndex}
          nextSectionName=""
          videoTotal={videos.length}
          isDetailed={true}
          topicId={topicId}
          sectionId={detailedTopicId}
          nextSectionId=""
        />
      </div>
    </div>
  );
}
