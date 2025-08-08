'use client';
import Link from 'next/link'
import { useEffect, useState } from 'react';
import { fetchSectionBySectionId } from '@/app/_api/sections';
import { Section } from '@/app/_types';
import { ArrowLeftIcon, ArrowUpOnSquareIcon, PlayIcon } from '@heroicons/react/24/outline';
import { fetchAllVideosBySectionId } from '@/app/_api/section-videos';
import { Video } from '@/app/_types';
import LoadingSpinner from '@/app/_components/loading-spinner';
import { usePathname, useRouter } from 'next/navigation';
import { fetchDetailedTopicById } from '@/app/_api/detailed-topics';
import { DetailedTopicSection } from '@/app/_types/detailed-topic-section';
import { fetchDetailedTopicSectionById, fetchVideosByDetailedTopicSectionId } from '@/app/_api/detailed-topic-sections';
import ShareModal from '@/app/_components/overlays/share-modal';
import ExpandedVideoCards from '@/app/_components/cards/expanded-video-cards';
import { getUserId } from '@/app/_api/get-user';
import withAuth from '@/app/_components/auth/with-auth';

function Sections({ params: { id } }: any) {
    const [section, setSection] = useState<DetailedTopicSection>();
    const [videos, setVideos] = useState<any[]>();
    const [loading, setLoading] = useState<boolean>(false);
    const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchSectionData = async () => {
            const data = await fetchDetailedTopicSectionById(id);
            setSection(data);
        }
        
        const fetchVideos = async () => {
            // Check if user is logged in
            const userId = await getUserId();

            // Fetch videos
            const vid = await fetchVideosByDetailedTopicSectionId(id, userId);
            setVideos(vid);
        }

        setLoading(true);
        fetchSectionData();
        fetchVideos();
        setLoading(false);
    }, []);

    return (
        <div className='ml-4'>

            {loading ? <LoadingSpinner /> :
                <div>
                    {section &&
                        <div className='flex gap-2 items-center mb-12'>
                        <Link href={`/dashboard/topics/info/${section.topic_id}`} className='contents'>
                            <ArrowLeftIcon className='w-7 h-10' aria-hidden="true" />
                        </Link>
                        <h1 className="text-3xl font-bold">{section.name}</h1>
                        <button onClick={() => setShareModalOpen(true)}>
                            <ArrowUpOnSquareIcon className="w-7 " />
                        </button>
                    </div>
                    }

                    {videos &&
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
                            {videos && videos.map((video, index) => (
                                <ExpandedVideoCards
                                    key={index}
                                    name={video.name}
                                    questionId={video.question_id}
                                    thumbnailUrl={video.thumbnail_url}
                                    videoId={video.id}
                                    progression={video.progression}/>
                            ))}
                        </div>
                    }
                    
                    {shareModalOpen && pathname && (
                        <ShareModal path={pathname} onClose={() => setShareModalOpen(false)} />
                    )}
                </div>}
        </div>
    )
}

export default withAuth(Sections);