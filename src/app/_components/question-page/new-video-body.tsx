'use client';
import VideoPlayer from "../video-player";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { fetchUserViewCountForVideo, insertUserViewCount, updateUserViewCount } from "@/app/_api/user-view-count";
import { supabase } from '@/utils/supabase/client';

export default function VideoCardNoArrows({ video }: { video: any }) {
    const [progression, setProgression] = useState<any>(null);
    const [viewId, setViewId] = useState<string>('');
    const [startTime, setStartTime] = useState<number | null>(null);

    const handleProgression = (progressObj: any) => {
        setProgression(progressObj);
    };

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

    useEffect(() => {
        if (video?.id) {
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
    }, [video?.id]);

    // If video or URL is missing, return a 403 message
    if (!video || !video.url) {
        return (
            <div className='flex flex-col w-full items-center p-4 border rounded-lg bg-gray-100 text-red-600 text-lg'>
                403 - Video not available
            </div>
        );
    }

    return (
        <div className='flex flex-col w-full items-center'>
            {startTime !== null && (
                <VideoPlayer
                    id={video.id}
                    url={video.url}
                    name={video.name}
                    autoplay={true}
                    updateProgression={handleProgression}
                    viewId={viewId}
                    setViewId={setViewId}
                    startTime={startTime}
                />
            )}

            <p className='w-full max-w-[400px] border-gray-700 mt-4 border-2 p-2 rounded-lg'>
                <ExclamationTriangleIcon className='text-yellow-300 inline-flex h-5 mr-2' />
                Please note that the information provided in this video is for educational purposes only and does not constitute medical advice; always consult a healthcare professional for personalized care.
            </p>
        </div>
    );
}
