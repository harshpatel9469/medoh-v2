'use client';
import Link from "next/link";
import VideoPlayer from "../video-player";
import { ExclamationTriangleIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { fetchUserViewCountForVideo, insertUserViewCount, updateUserViewCount } from "@/app/_api/user-view-count";
import { supabase } from '@/utils/supabase/client';
import { useContentStore } from '@/utils/stores/content-store';

export interface VideoBodyProps {
    prevVideo: any;
    video: any;
    nextVideos: any[];
    backPageData: any;
};

export default function VideoBody({ prevVideo, video, nextVideos, backPageData }: VideoBodyProps) {
    const [progression, setProgression] = useState<any>(null);
    const [viewId, setViewId] = useState<string>('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [expanded, setExpanded] = useState(false);
    const charLimit = 60;
    const isLong = video.name && video.name.length > charLimit;
    const displayText = expanded || !isLong ? video.name : video.name?.slice(0, charLimit) + "...";
    const { setSavedVideos } = useContentStore();

    const handleProgression = (progressObj: any) => {
        setProgression(progressObj);
    };

    // Save or update user view count
    const upsertViewCount = async () => {
        if (!progression) return;
        const progressPercent = (progression.seconds / progression.duration) * 100;

        if (viewId) {
            updateUserViewCount(progressPercent, viewId);
        } else {
            const viewDataId = await insertUserViewCount(video.id, progressPercent);

            if (viewDataId) setViewId(viewDataId);
        }
    };

    // Function to refresh saved videos
    const refreshSavedVideos = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { getPartialSavedVideos } = await import('@/app/_api/saved-videos');
                const savedVideosData = await getPartialSavedVideos(user.id, 6);
                setSavedVideos(savedVideosData);
            }
        } catch (error) {
            console.error('Error refreshing saved videos:', error);
        }
    };

    // Check if user has viewed video previously
    useEffect(() => {
        if (video.id) {
            const fetchData = async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setStartTime(0);
                    return;
                }
                const userViewData = await fetchUserViewCountForVideo(user.id, video.id);
                if (userViewData) {
                    setViewId(userViewData.id);
                    setStartTime(userViewData.progression);
                } else {
                    setStartTime(0);
                }
            };
            fetchData();
        }
    }, [video.id]);

    return (
        <div className='flex flex-col w-full items-center'>
            {/* Video with Up/Down arrows (Desktop) */}
            <div className="py-4 flex items-center justify-center md:gap-6 gap-1 w-full">
                <div className='md:flex flex-1 justify-center hidden'>
                    {prevVideo && (
                        <Link
                            className='w-12 h-12 flex items-center justify-center bg-primary-color rounded-full shadow-sm hover:bg-primary-color-light'
                            href={`/dashboard/question/${prevVideo.question_id}`}
                            onClick={() => upsertViewCount()}>
                            <ArrowUpIcon className="text-white w-6 h-6" />
                        </Link>
                    )}
                </div>

                {startTime !== null && <VideoPlayer 
                    id={video.id} 
                    url={video.url} 
                    name={video.name} 
                    autoplay={true} 
                    updateProgression={handleProgression} 
                    viewId={viewId} 
                    setViewId={setViewId} 
                    startTime={startTime}
                    onVideoInteraction={refreshSavedVideos}
                />}

                <div className='md:flex flex-1 justify-center hidden'>
                    {nextVideos.length !== 0 && (
                        <Link
                            className='w-12 h-12 flex items-center justify-center bg-primary-color rounded-full shadow-sm hover:bg-primary-color-light'
                            href={`/dashboard/question/${nextVideos[0].question_id}`}
                            onClick={() => upsertViewCount()}>
                            <ArrowDownIcon className="text-white w-6 h-6" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Up/Down arrows */}
            <div className='flex justify-around w-full max-w-[400px] md:hidden'>
                <div className='flex justify-center px-4'>
                    {prevVideo && (
                        <Link
                            className='w-12 h-12 flex items-center justify-center bg-primary-color rounded-full shadow-sm hover:bg-primary-color-light'
                            href={`/dashboard/question/${prevVideo.question_id}`}
                            onClick={() => upsertViewCount()}>
                            <ArrowUpIcon className="text-white w-6 h-6" />
                        </Link>
                    )}
                </div>

                <div className='flex justify-center px-4'>
                    {nextVideos.length !== 0 && (
                        <Link
                            className='w-12 h-12 flex items-center justify-center bg-primary-color rounded-full shadow-sm hover:bg-primary-color-light'
                            href={`/dashboard/question/${nextVideos[0].question_id}`}
                            onClick={() => upsertViewCount()}>
                            <ArrowDownIcon className="text-white w-6 h-6" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Back Button */}
            <Link
                href={!backPageData ? '/dashboard/home' :
                    backPageData.sections ? `/dashboard/home/${backPageData.sections.topics.id}` :
                        `/dashboard/topics/info/${backPageData.detailed_topics_sections.detailed_topics.id}`}
                className='md:hidden mt-6 flex justify-center rounded-md px-3 py-1.5 leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-color-dark bg-primary-color hover:bg-primary-color-light'
            >
                <p className='text-md font-semibold'>
                    {!backPageData ? "Back To Home" : "Back To Topic"}
                </p>
            </Link>

            {/* Disclaimer */}
            <p className='w-full max-w-[400px] border-gray-700 mt-4 border-2 p-2 rounded-lg'>
                <ExclamationTriangleIcon className='text-yellow-300 inline-flex h-5 mr-2' />
                Please note that the information provided in this video is for educational purposes only and does not constitute medical advice; always consult a healthcare professional for personalized care.
            </p>
        </div>
    )
};
