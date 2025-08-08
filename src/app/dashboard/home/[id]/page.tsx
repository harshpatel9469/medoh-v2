'use client';
import Link from 'next/link'
import { useEffect, useState } from 'react';
import { fetchAllSectionsByTopicId } from '@/app/_api/sections';
import { fetchTopicById } from '@/app/_api/topics';
import { Section, Topic } from '@/app/_types';
import { ArrowRightIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import { partialFetchVideosBySectionId } from '@/app/_api/section-videos';
import LoadingSpinner from '@/app/_components/loading-spinner';
import { usePathname, useRouter } from 'next/navigation';
import ShareModal from '@/app/_components/overlays/share-modal';
import { getUserId } from '@/app/_api/get-user';
import VideoCard from '@/app/_components/cards/video-card';

export default function AllSections({ params: { id } }: any) {
    const [sections, setSections] = useState<Section[]>([]);
    const [topic, setTopic] = useState<Topic>();
    const [videos, setVideos] = useState<Map<string, any[]>>();
    const [loading, setLoading] = useState<boolean>(true);
    const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchSectionsData = async () => {
            const data = await fetchAllSectionsByTopicId(id);
            setSections(data);
        };

        const fetchTopicData = async () => {
            const data = await fetchTopicById(id);
            setTopic(data);
        }

        fetchSectionsData();
        fetchTopicData();
    }, [id]);

    useEffect(() => {
        const fetchVideos = async () => {
            const userId = await getUserId();

            let videos = new Map<string, any[]>();
            for (var section of sections) {
                const vid = await partialFetchVideosBySectionId(section.id, userId);
                videos.set(section.id, vid);
            }
            setVideos(videos);
        }

        fetchVideos();
        setLoading(false);
    }, [sections]);

    return (
        <div className='ml-4'>
            {loading ? <LoadingSpinner /> : <div>
                {topic &&
                    <div className='display flex flex-col justify-center gap-3'>
                        <div className='flex gap-2 items-center'>
                            <h1 className="text-3xl font-bold">{topic.name}</h1>
                            <button onClick={() => setShareModalOpen(true)}>
                                <ArrowUpOnSquareIcon className="w-7 " />
                            </button>
                        </div>
                        {topic.description && <p className="text-base mb-12">{topic.description}</p>}
                        {!topic.description && <p className="text-base mb-9"></p>}
                    </div>
                }

                {sections && <div className="grid auto-rows-auto grid-cols-1 gap-6">
                    {sections.map((section) => (
                        <div key={section.id}>
                            <Link href={`/dashboard/sections/${section.id}`} className='flex items-center gap-2 mb-3'>
                                <span className="text-xl font-semibold">{section.name}</span>
                                <ArrowRightIcon className='w-5 h-7' aria-hidden="true" />
                            </Link>

                            <div className='flex flex-row flex-nowrap overflow-x-auto gap-4'>
                                {videos && videos.get(section.id)?.map((sectionVideos, index) => (
                                    <VideoCard 
                                        key={index}
                                        name={sectionVideos.name}
                                        questionId={sectionVideos.question_id}
                                        thumbnailUrl={sectionVideos.thumbnail_url}
                                        videoId={sectionVideos.id}
                                        progression={sectionVideos.progression}/>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>}

                {shareModalOpen && pathname && (
                    <ShareModal path={pathname} onClose={() => setShareModalOpen(false)} />
                )}
            </div>}
        </div>
    )
}