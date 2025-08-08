'use client'

import { fetchDetailedTopicById, fetchAllDetailedTopics } from "@/app/_api/detailed-topics";
import { fetchDetailedTopicSections, partialFetchVideosByDetailedTopicSectionId } from "@/app/_api/detailed-topic-sections";
import LoadingSpinner from "@/app/_components/loading-spinner";
import { Video } from "@/app/_types";
import type { DetailedTopic } from "@/app/_types/detailed-topic"
import { DetailedTopicSection } from "@/app/_types/detailed-topic-section";
import { ArrowRightIcon, ArrowUpOnSquareIcon, ClipboardDocumentCheckIcon, HomeIcon, InformationCircleIcon, PlayIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ShareModal from "@/app/_components/overlays/share-modal";
import { fetchFilterById } from "@/app/_api/filters";
import VideoCard from "@/app/_components/cards/video-card";
import { getUserId } from "@/app/_api/get-user";
import GoogleTranslateWidget from "@/app/_components/google-translate-widget";
import PrivateSideBar from '@/app/_components/navigation/private-side-bar';
import SideBar from '@/app/_components/navigation/side-bar';

const LANGUAGE_SUFFIXES = ["(Spanish)", "(French)", "(Mandarin)", "(Hindi)"];

function stripLanguageSuffix(name: string) {
    for (const suffix of LANGUAGE_SUFFIXES) {
        if (name.trim().endsWith(suffix)) {
            return name.replace(suffix, '').trim();
        }
    }
    return name.trim();
}

function getLanguageFromName(name: string) {
    for (const suffix of LANGUAGE_SUFFIXES) {
        if (name.trim().endsWith(suffix)) {
            return suffix.replace(/[()]/g, '');
        }
    }
    return 'English';
}

function DetailedTopic({ params: { id } }: any) {
    const [detailedTopic, setDetailedTopic] = useState<DetailedTopic | null>(null);
    const [sections, setSections] = useState<DetailedTopicSection[]>([]);
    const [videos, setVideos] = useState<Map<string, any[]>>();
    const [isLoading, setIsLoading] = useState(true);
    const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
    const [filterName, setFilterName] = useState<string>('');
    const [languageVersions, setLanguageVersions] = useState<any[]>([]);
    const [currentLanguage, setCurrentLanguage] = useState<string>('English');
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const fetchData = async () => {
            // Set details for topic top box
            const topicRes = await fetchDetailedTopicById(id);
            setDetailedTopic(topicRes);

            // Redirect to private page if topic is private
            if (topicRes?.is_private) {
                router.replace(`/dashboard/topics/info/private/${id}`);
                return;
            }

            // Get the filter name for topic
            if(topicRes.filter_id) {
                const filterData = await fetchFilterById(topicRes.filter_id);

                if (filterData) {
                    setFilterName(filterData?.name);
                }
            }

            // Get sections for topic
            const sectionRes = await fetchDetailedTopicSections(id);
            setSections(sectionRes);

            // Language toggle logic
            const allTopics = await fetchAllDetailedTopics();
            const baseName = stripLanguageSuffix(topicRes.name);
            const versions = allTopics.filter(t => stripLanguageSuffix(t.name) === baseName);
            setLanguageVersions(versions);
            setCurrentLanguage(getLanguageFromName(topicRes.name));
        }

        fetchData();
    }, []);


    useEffect(() => {
        const fetchVideos = async () => {
            // Check if user is logged in
            const userId = await getUserId();

            // Fetch videos if there are topics
            let sectionsData = new Map<string, any[]>();
            for (const section of sections) {
                const sectionVideos = await partialFetchVideosByDetailedTopicSectionId(section.id, userId);
                sectionsData.set(section.id, sectionVideos);
            }
            setVideos(sectionsData);
        };

        fetchVideos();
        setIsLoading(false);
    }, [sections]);

    return (
        <div className="flex-grow">
            <div className="md:mx-4 mx-1">
                <div className="flex justify-end mt-2 mb-2">
                    <GoogleTranslateWidget />
                </div>
                {isLoading && <LoadingSpinner />}
                {detailedTopic && <div className="bg-card-background-primary-gradient w-full flex text-white rounded-xl shadow-sm items-center justify-between">
                    <div className="flex flex-col m-4 gap-2 w-full md:w-2/3 items-center md:items-start justify-center">
                        <Link className="flex gap-1 items-center font-bold mb-6 self-start" href={`/dashboard/topics/${detailedTopic.topic_id}`}>
                            <p>&lt;</p>
                            <p>Back</p>
                        </Link>

                        <div className='flex gap-2 items-center'>
                            <h1 className="text-3xl font-bold">{detailedTopic.name}</h1>
                            <button onClick={() => setShareModalOpen(true)}>
                                <ArrowUpOnSquareIcon className="w-7 " />
                            </button>
                        </div>

                        {/* Language Toggle */}
                        {languageVersions.length > 1 && (
                            <div className="flex gap-2 mt-2">
                                {languageVersions.map((ver) => (
                                    <Link
                                        key={ver.id}
                                        href={`/dashboard/topics/info/${ver.id}`}
                                        className={`px-3 py-1 rounded-full border text-sm font-semibold transition-colors ${getLanguageFromName(ver.name) === currentLanguage ? 'bg-white text-primary-color border-primary-color' : 'bg-transparent text-white border-white hover:bg-white hover:text-primary-color'}`}
                                    >
                                        {getLanguageFromName(ver.name)}
                                    </Link>
                                ))}
                            </div>
                        )}

                        <img
                            src={detailedTopic.image_url || ''}
                            alt="DetailedTopic Picture"
                            className="w-72 h-72 rounded-lg object-cover block md:hidden" />

                        {detailedTopic.indication && <div className="flex gap-2 self-start items-start">
                            <div className="flex gap-1 items-center">
                                <InformationCircleIcon className="w-5" />
                                <p>Indication:</p>
                            </div>
                            <p>{detailedTopic.indication}</p>
                        </div>}

                        {detailedTopic.purpose && <div className="flex gap-2 self-start items-start">
                            <div className="flex gap-1 items-center">
                                <ClipboardDocumentCheckIcon className="w-5" />
                                <p>Purpose:</p>
                            </div>
                            <p>{detailedTopic.purpose}</p>
                        </div>}

                        {detailedTopic.filter_id && <div className="flex gap-1 self-start">
                            <HomeIcon className="w-5" />
                            <p>{filterName}</p>
                        </div>}

                        {detailedTopic.description && <p className="bg-white/20 backdrop-filter backdrop-blur-md px-2 py-3 rounded-lg text-sm mt-4">
                            {detailedTopic.description}
                        </p>}
                    </div>

                    <img
                        src={detailedTopic.image_url || ''}
                        alt="DetailedTopic Picture"

                        className="w-72 h-72 rounded-lg object-cover mr-4 hidden md:block" />
                </div>}

                {sections && videos && <div className="grid auto-rows-auto grid-cols-1 gap-6 mt-6">
                    {sections.map((section) => (
                        <div key={section.id}>
                            <Link href={`/dashboard/topics/details/${section.id}`} className='flex items-center gap-2 mb-3'>
                                <span className="text-xl font-semibold">{section.name}</span>
                                <ArrowRightIcon className='w-5 h-7' aria-hidden="true" />
                            </Link>

                            <div className='flex flex-row flex-nowrap overflow-x-auto gap-4'>
                                {videos.get(section.id)?.map((sectionVideo, index) => (
                                    <VideoCard
                                        key={index}
                                        name={sectionVideo.name}
                                        questionId={sectionVideo.question_id}
                                        thumbnailUrl={sectionVideo.thumbnail_url}
                                        progression={sectionVideo.progression} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>}

                {shareModalOpen && pathname && (
                    <ShareModal path={pathname} onClose={() => setShareModalOpen(false)} />
                )}
            </div>
        </div>
    );
}

export default DetailedTopic;