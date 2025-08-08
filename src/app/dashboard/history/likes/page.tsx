'use client'
import { useEffect, useState } from "react";
import Loading from "../../loading";
import ExpandedVideoCards from "@/app/_components/cards/expanded-video-cards";
import { fetchAllLikedVideos } from "@/app/_api/user-likes";
import { supabase } from '@/utils/supabase/client';
import { useRouter } from "next/navigation";


export default function LikesView() {
    const [videos, setVideos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        const fetchVideos = async () => {
            // Get User
            const { data: { user } } = await supabase.auth.getUser();

            // If user is not signed in, we redirect to login
            if (!user) {
                router.push('/auth/login')
                return;
            }

            // Get liked videos
            const likedVideos = await fetchAllLikedVideos(user.id);
            setVideos(likedVideos);
            setIsLoading(false);
        };

        fetchVideos();
    }, []);

    return (<div>
        {isLoading ? <Loading /> : <div className="ml-4">
            <h1 className="text-3xl font-bold mb-9">Liked Videos</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos && videos.map((videos, index) => (
                    <ExpandedVideoCards key={index} name={videos.name} thumbnailUrl={videos.thumbnail_url} questionId={videos.question_id} progression={videos.progression}/>
                ))}
            </div>
        </div>}
    </div>)
}