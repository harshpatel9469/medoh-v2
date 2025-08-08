'use client'

import { fetchDoctorById } from "@/app/_api/doctors";
import LoadingSpinner from "@/app/_components/loading-spinner";
import { Doctor, Section, Topic, Video } from "@/app/_types"
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpOnSquareIcon, ChevronDownIcon, ChevronUpIcon, DocumentTextIcon, HomeModernIcon } from "@heroicons/react/24/outline";
import DoctorBioModal from "./doctor-bio-modal";
import ShareModal from "@/app/_components/overlays/share-modal";
import VideoCard from "@/app/_components/cards/video-card";
import Link from "next/link";
import { fetchTopicsAndSectionsByDoctorId, fetchPublicTopicsAndSectionsByDoctorId } from "@/app/_api/topics";
import { fetchDetailedTopicVideosBySectionIdAndDoctorId, fetchVideosBySectionIdAndDoctorId } from "@/app/_api/videos";

export interface DetailedTopicData {
    topic_id: string,
    topic_name: string,
    sections: { [key: string]: SectionData }
};

export interface SectionData {
    section_id: string,
    section_name: string
};

export interface SectionedTopicData {
    topic_id: string,
    topic_name: string,
    is_detailed: boolean,
    sections: { [key: string]: SectionData },
    detailed_topic: { [key: string]: DetailedTopicData }
};

export default function DoctorView({ params: { id } }: any) {
    const [doctor, setDoctor] = useState<Doctor>();
    const [topics, setTopics] = useState<{ [key: string]: SectionedTopicData }>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
    const [selectedSections, setSelectedSections] = useState<string[]>([]);
    const [videos, setVideos] = useState<{ [key: string]: Partial<Video>[] }>({});
    const router = useRouter();

    useEffect(() => {
        const getDoctor = async () => {
            const doctorInfo = await fetchDoctorById(id);
            setDoctor(doctorInfo);
        }

        getDoctor();
    }, [])

    useEffect(() => {
        const fetchVideos = async () => {
            // filter out detailed topics from regularTopics
            const regularTopics = (await fetchTopicsAndSectionsByDoctorId(id)).filter(t => !t.is_detailed);
            const publicDetailedTopics = await fetchPublicTopicsAndSectionsByDoctorId(id);

            

            const data = [
                ...regularTopics,
                ...publicDetailedTopics.map(t => ({
                    ...t,
                    is_detailed: true
                }))
            ];

            let topicData: { [key: string]: SectionedTopicData } = {};
            let selections: { [key: string]: boolean } = {};

            data.forEach((value) => {
                if (!topicData[value.topic_id]) {
                    topicData[value.topic_id] = {
                        topic_id: value.topic_id,
                        topic_name: value.topic_name,
                        is_detailed: value.is_detailed,
                        sections: {},
                        detailed_topic: {}
                    };
                }

                if (value.is_detailed) {
                    if (!topicData[value.topic_id].detailed_topic[value.detailed_topic_id]) {
                        topicData[value.topic_id].detailed_topic[value.detailed_topic_id] = {
                            topic_id: value.detailed_topic_id,
                            topic_name: value.detailed_topic_name,
                            sections: {}
                        };
                    }

                    topicData[value.topic_id].detailed_topic[value.detailed_topic_id].sections[value.detailed_topic_section_id] = {
                        section_id: value.detailed_topic_section_id,
                        section_name: value.detailed_topic_section_name
                    };

                    selections[value.detailed_topic_section_id] = false;
                } else {
                    topicData[value.topic_id].sections[value.section_id] = {
                        section_id: value.section_id,
                        section_name: value.section_name
                    };

                    selections[value.section_id] = false;
                }
            });

            setTopics(topicData);
        }

        setIsLoading(true);
        fetchVideos();
        setIsLoading(false);
    }, []);

    const pathname = usePathname();

    const handleCollapse = async (sectionId: string, isDetailed: boolean) => {
        if (!selectedSections.includes(sectionId)) {
            setSelectedSections([...selectedSections, sectionId]);

            if (!isDetailed && !videos[sectionId]) {
                const data = await fetchVideosBySectionIdAndDoctorId(sectionId, id);
                setVideos(prev => ({ ...prev, [sectionId]: data }));
            } else if (isDetailed && !videos[sectionId]) {
                const data = await fetchDetailedTopicVideosBySectionIdAndDoctorId(sectionId, id);
                setVideos(prev => ({ ...prev, [sectionId]: data }));
            }
        } else {
            setSelectedSections(selectedSections.filter(value => value !== sectionId));
        }
    }

    return (
        <div className="mx-4">
            {doctor &&
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 bg-card-background-primary-gradient rounded-lg text-white items-center">
                    <img
                        src={doctor.picture_url}
                        alt="Doctor Picture"
                        className="w-32 h-44 min-w-32 rounded-lg object-cover" />

                    <div className="flex flex-col gap-4 text-sm">
                        <div className="flex gap-2 items-center md:justify-start justify-center">
                            <h1 className="text-2xl font-semibold">{doctor.name}</h1>
                            <button onClick={() => setShareModalOpen(true)}>
                                <ArrowUpOnSquareIcon className="text-white w-7 " />
                            </button>
                        </div>
                        {(doctor.city || doctor.state) && <div className="flex gap-1 self-start">
                            <HomeModernIcon className="w-5" />
                            <p>Location:</p>
                            {doctor.city && doctor.state && <p>{doctor.city}, {doctor.state}</p>}
                            {doctor.city && !doctor.state && <p>{doctor.city}</p>}
                            {!doctor.city && doctor.state && <p>{doctor.state}</p>}
                        </div>}

                        {doctor.specialty && <div className="flex gap-1 self-start">
                            <DocumentTextIcon className="w-5" />
                            <p>Specialty:</p>
                            <p>{doctor.specialty}</p>
                        </div>}
                        <p className="bg-white/20 backdrop-filter backdrop-blur-md px-2 py-3 rounded-lg mt-4 cursor-pointer"
                            onClick={() => setModalOpen(true)}>
                            {doctor.bio?.slice(0, 250)}
                            {doctor.bio && doctor.bio.length > 250 && "...read more"}
                        </p>
                    </div>
                </div>
            }
            <h2 className="text-2xl font-semibold mt-6 mb-3">Featured Videos</h2>

            {isLoading && <LoadingSpinner />}
            {!isLoading && <div className="grid auto-rows-auto grid-cols-1 gap-6">
                {Object.entries(topics).map(([key, topic]) => (
                    <div className="flex flex-col gap-4" key={key}>
                        <Link
                            href={!topic.is_detailed ? `/dashboard/home/${topic.topic_id}` : `/dashboard/topics/${topic.topic_id}`}
                            className="text-xl font-semibold hover:underline hover:text-primary-color size-fit"
                        >
                            {topic.topic_name}
                        </Link>

                        {!topic.is_detailed && Object.entries(topic.sections).map(([key, section]) => (
                            <div key={key} className="ml-4">
                                <div className="flex items-center gap-2 hover:cursor-pointer size-fit">
                                    <div onClick={() => handleCollapse(section.section_id, false)}>
                                        {selectedSections.includes(section.section_id) ? <ChevronUpIcon className="w-5" /> : <ChevronDownIcon className="w-5" />}
                                    </div>

                                    <Link
                                        href={`/dashboard/sections/${section.section_id}`}
                                        className="text-lg font-medium hover:underline hover:text-primary-color">
                                        {section.section_name}
                                    </Link>
                                </div>

                                {selectedSections.includes(section.section_id) && <div className='flex flex-row flex-nowrap overflow-x-auto gap-4 mt-4'>
                                    {videos[section.section_id]?.map((video, index) => (
                                        <VideoCard 
                                            questionId={video.question_id || ''} 
                                            name={video.name || ''} 
                                            thumbnailUrl={video.thumbnail_url || ''} 
                                            videoId={video.id}
                                            key={index} />
                                    ))}
                                </div>}
                            </div>
                        ))}

                        {topic.is_detailed && Object.entries(topic.detailed_topic).map(([key, detailedTopic]) => (
                            <div key={key} className="ml-4 flex flex-col gap-4">
                                <Link
                                    href={`/dashboard/topics/info/${detailedTopic.topic_id}`}
                                    className="font-semibold text-xl hover:underline hover:text-primary-color"
                                >
                                    {detailedTopic.topic_name}
                                </Link>

                                {Object.entries(detailedTopic.sections).map(([key, section]) => (
                                    <div key={key} className="ml-4">
                                        <div className="flex items-center gap-2 hover:cursor-pointer size-fit">
                                            <div onClick={() => handleCollapse(section.section_id, true)}>
                                                {selectedSections.includes(section.section_id) ? <ChevronUpIcon className="w-5" /> : <ChevronDownIcon className="w-5" />}
                                            </div>

                                            <Link
                                                href={`/dashboard/topics/details/${section.section_id}`}
                                                className="text-lg font-medium hover:underline hover:text-primary-color"
                                            >
                                                {section.section_name}
                                            </Link>
                                        </div>

                                        {selectedSections.includes(section.section_id) && <div className='flex flex-row flex-nowrap overflow-x-auto gap-4 mt-4'>
                                            {videos[section.section_id]?.map((video, index) => (
                                                <VideoCard 
                                                    questionId={video.question_id || ''} 
                                                    name={video.name || ''} 
                                                    thumbnailUrl={video.thumbnail_url || ''} 
                                                    videoId={video.id}
                                                    key={index} />
                                            ))}
                                        </div>}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>}

            {modalOpen && doctor && <DoctorBioModal
                doctor={doctor}
                onClose={() => setModalOpen(false)}
            />}

            {shareModalOpen && pathname && <ShareModal
                path={pathname}
                doctorName={doctor?.name}
                title="profile"
                onClose={() => setShareModalOpen(false)} />}
        </div>
    )
}
