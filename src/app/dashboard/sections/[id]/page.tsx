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
import ShareModal from '@/app/_components/overlays/share-modal';
import ExpandedVideoCards from '@/app/_components/cards/expanded-video-cards';
import { getUserId } from '@/app/_api/get-user';

export default function Sections({ params: { id } }: any) {
    const [section, setSection] = useState<Section>();
    const [videos, setVideos] = useState<any[]>();
    const [loading, setLoading] = useState<boolean>(false);
    const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchSectionData = async () => {
            const data = await fetchSectionBySectionId(id);
            setSection(data);
        }

        const fetchVideos = async () => {
            const userId = await getUserId();

            const vid = await fetchAllVideosBySectionId(id, userId);
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
                            <Link href={`/dashboard/home/${section.topic_id}`} className='contents'>
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
                                    thumbnailUrl={video.thumbnail_url} 
                                    questionId={video.question_id} 
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