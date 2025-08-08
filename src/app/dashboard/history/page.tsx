
'use client';
import { fetchPartialLikedVideos } from "@/app/_api/user-likes";
import { fetchPartialUserViewCount } from "@/app/_api/user-view-count";
import LoadingSpinner from "@/app/_components/loading-spinner";
import { supabase } from '@/utils/supabase/client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loading from "../loading";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import VideoCard from "@/app/_components/cards/video-card";

export default function HistoryView() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [lastWatchedVideos, setLastWatchedVideos] = useState<any[]>([]);
    const [likedVideos, setLikedVideos] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            // If user is not signed in, we redirect to login
            if (!user) {
                router.push('/auth/login')
                return;
            }

            // Check if user has a complete profile (not a guest)
            const { data: profile } = await supabase
                .from('profiles')
                .select('first_name, last_name, zip_code')
                .eq('id', user.id)
                .single();

            const isGuest = !profile || !profile.first_name || !profile.last_name || !profile.zip_code;
            if (isGuest) {
                router.push('/auth/login');
                return;
            }

            // Fetch partial like and view count data
            const viewCountData = await fetchPartialUserViewCount(user.id);
            setLastWatchedVideos(viewCountData);

            const likeData = await fetchPartialLikedVideos(user.id);
            setLikedVideos(likeData);
            setIsLoading(false);
        };
        
        fetchData();
    }, []);

    return (
        <div className="ml-4">
            {isLoading ? <Loading /> : <div>
                <h1 className="text-3xl font-bold mb-9">History</h1>

                {lastWatchedVideos.length === 0 && <div className="flex flex-col gap-6">
                    <h2 className="text-xl semibold text-center">No videos watched yet</h2>
                    <Link
                        href={'/dashboard/home'}
                        className="mx-auto text-lg text-center text-white rounded-lg font-semibold p-4 bg-primary-color hover:bg-primary-color-light shadow-sm hover:outline-primary-color-dark"
                    >
                        Start Watching
                    </Link>
                </div>}

                <div className="grid auto-rows-auto grid-cols-1 gap-6">
                    {lastWatchedVideos.length === 0 ? (
                        <div>No history data found.</div>
                    ) : (
                        lastWatchedVideos.map((videoData, index) => {
                            const video = videoData.videos;
                            return video && video.question_id ? (
                                <VideoCard
                                    key={index}
                                    questionId={video.question_id}
                                    name={video.name}
                                    thumbnailUrl={video.thumbnail_url}
                                    progression={videoData.progression}
                                />
                            ) : null;
                        })
                    )}

                    {lastWatchedVideos.length !== 0 && <div>
                        <Link href={`/dashboard/history/last-watched`} className='flex items-center gap-2 mb-3'>
                            <span className="text-xl font-semibold">Last watched</span>
                            <ArrowRightIcon className='w-5 h-7' aria-hidden="true" />
                        </Link>

                        <div className='flex flex-row flex-nowrap overflow-x-auto gap-4'>
                            {lastWatchedVideos.map((videoData, index) => {
                                const video = videoData.videos;
                                return video && video.question_id && video.name && video.thumbnail_url ? (
                                    <VideoCard 
                                        key={index} 
                                        questionId={video.question_id} 
                                        name={video.name} 
                                        thumbnailUrl={video.thumbnail_url}
                                        progression={videoData.progression} />
                                ) : null;
                            })}
                        </div>
                    </div>}

                    {likedVideos.length !== 0 && <div>
                        <Link href={`/dashboard/history/likes`} className='flex items-center gap-2 mb-3'>
                            <span className="text-xl font-semibold">Liked Videos</span>
                            <ArrowRightIcon className='w-5 h-7' aria-hidden="true" />
                        </Link>

                        <div className='flex flex-row flex-nowrap overflow-x-auto gap-4'>
                            {likedVideos.map((videoData, index) => {
                                const video = videoData.videos;
                                return video && video.question_id && video.name && video.thumbnail_url ? (
                                    <VideoCard 
                                        key={index} 
                                        questionId={video.question_id} 
                                        name={video.name} 
                                        thumbnailUrl={video.thumbnail_url} 
                                        progression={videoData.progression}
                                    />
                                ) : null;
                            })}
                        </div>
                    </div>}
                </div>

            </div>}
        </div>
    )

};