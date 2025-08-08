'use client'
import { useEffect, useState } from "react"
import Loading from "../../loading";
import { useRouter } from "next/navigation";
import { supabase } from '@/utils/supabase/client';
import { fetchAllUserViewCount } from "@/app/_api/user-view-count";
import ExpandedVideoCards from "@/app/_components/cards/expanded-video-cards";

export default function LastWatchedView() {
    const [videos, setVideos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsLoading(false);
                setVideos([]);
                return;
            }
            // Fetch view count data
            const viewCountData = await fetchAllUserViewCount(user.id);
            setVideos(viewCountData);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    return (<div className="ml-4">
        {isLoading ? <Loading /> : <div>
            <h1 className="text-3xl font-bold mb-9">Last Watched</h1>
            {videos.length === 0 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl semibold text-center">Sign in to see your last watched videos</h2>
                <a href="/auth/login" className="mx-auto text-lg text-center text-white rounded-lg font-semibold p-4 bg-primary-color hover:bg-primary-color-light shadow-sm hover:outline-primary-color-dark">Sign In</a>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos && videos.map((video, index) => (
                    <ExpandedVideoCards 
                        key={index} 
                        name={video.videos.name}  
                        thumbnailUrl={video.videos.thumbnail_url} 
                        questionId={video.videos.question_id} 
                        progression={video.progression} />
                ))}
            </div>
        </div>
        }
    </div>)
}