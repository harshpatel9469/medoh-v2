'use client'
import { fetchAllDoctors, fetchDoctorById, fetchDoctorsSearch } from "@/app/_api/doctors";
import { fetchQuestionById } from "@/app/_api/questions";
import { createSectionVideos, deleteSectionVideoByVideoId, fetchSectionbyVideoId, fetchVideoOrder, updateOrder, updateSectionVideosByVideoId } from "@/app/_api/section-videos";
import { fetchAllSectionsByTopicId, fetchSectionBySectionId } from "@/app/_api/sections";
import { fetchAllTopics, fetchTopicById } from "@/app/_api/topics";
import { fetchDetailedTopicSectionById, fetchDetailedTopicSections } from "@/app/_api/detailed-topic-sections";
import { createDetailedTopicSectionVideos, deleteDetailedTopicSectionVideoByVideoId, fetchDetailedTopicSectionByVideoId, updateDetailedTopicSectionVideosByVideoId, updateDetailedTopicVideoOrder } from "@/app/_api/detailed-topic-sections-videos";
import { fetchAllDetailedTopicsById, fetchDetailedTopicById } from "@/app/_api/detailed-topics";
import { createVideo, deleteVideo, fetchVideosByQuestionIds, updateVideo } from "@/app/_api/videos";
import SearchBar from "@/app/_components/forms/search-bar";
import { Video, Doctor, Topic, Section, Question } from "@/app/_types";
import { DetailedTopic } from "@/app/_types/detailed-topic";
import { DetailedTopicSection } from "@/app/_types/detailed-topic-section";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import LoadingSpinner from "@/app/_components/loading-spinner";
import DoctorSearchBar from "@/app/_components/forms/doctor-search-bar";

export default function VideosView({ params: { id } }: any) {
    const [question, setQuestion] = useState<Question>();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isCreation, setIsCreation] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState(true);
    const [selectingDoctors, setSelectingDoctors] = useState(true);
    const [allTopics, setAllTopics] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [allDetailedTopics, setAllDetailedTopics] = useState<DetailedTopic[]>([]);
    const [selectedDetailedTopic, setSelectedDetailedTopic] = useState<DetailedTopic | null>(null);
    const [selectedSection, setSelectedSection] = useState<DetailedTopicSection | Section | null>(null);
    const [allSections, setAllSections] = useState<DetailedTopicSection[] | Section[]>([]);
    const [videoOrder, setVideoOrder] = useState<number>(0);
    const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
    const [url, setUrl] = useState<string>('');
    const [doctorId, setDoctorId] = useState<string>('');
    const [videoId, setVideoId] = useState<any>();
    const router = useRouter();

    useEffect(() => {
        const fetchInitData = async () => {
            // Get question
            const questionData = await fetchQuestionById(id);
            setQuestion(questionData);

            // Get video info
            const videoData = await fetchVideosByQuestionIds(id);

            if (videoData) {
                setVideoId(videoData.id);
                setUrl(videoData.url);
                setThumbnailUrl(videoData.thumbnail_url);
                setDoctorId(videoData.doctor_id as string);
                setIsCreation(false);

                // Get doctor name
                const doctorInfo = await fetchDoctorById(videoData.doctor_id!)
                setSearchTerm(doctorInfo.name);

                // Get section
                let videoSectionData: DetailedTopicSection | Section | null = await fetchSectionbyVideoId(videoData.id);
                if (videoSectionData) {
                    setSelectedSection(videoSectionData);

                    // Get topic
                    const topicData = await fetchTopicById(videoSectionData.topic_id);
                    setSelectedTopic(topicData);

                    // Get video order
                    const orderInfo = await fetchVideoOrder(videoData.id, videoSectionData.id);
                    setVideoOrder(orderInfo);
                }
                else {
                    // Get section
                    const sectionData = await fetchDetailedTopicSectionByVideoId(videoData.id);
                    if (!sectionData) {
                        setSelectedSection(null);
                        return;
                    }
                    videoSectionData = sectionData.detailed_topics_sections;
                    setSelectedSection(videoSectionData);
                    setVideoOrder(sectionData.video_order);

                    // Get detailed topic
                    const detailedTopic = await fetchDetailedTopicById(videoSectionData!.topic_id);
                    setSelectedDetailedTopic(detailedTopic);

                    // Get topic
                    const topicData = await fetchTopicById(detailedTopic.topic_id);
                    setSelectedTopic(topicData);
                }
            }
        }

        fetchInitData();
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const getAllTopics = async () => {
            // Get all topics
            const allTopicsData = await fetchAllTopics();
            setAllTopics(allTopicsData);
        }

        getAllTopics();
    }, []);

    useEffect(() => {
        const fetchDetailedTopic = async () => {
            if (selectedTopic) {
                const allDetailedTopicsData = await fetchAllDetailedTopicsById(selectedTopic.id);
                setAllDetailedTopics(allDetailedTopicsData);
            }
        }

        fetchDetailedTopic();
    }, [selectedTopic]);


    useEffect(() => {
        const fetchAllSections = async () => {
            if (selectedTopic?.is_detailed && selectedDetailedTopic) {
                const sectionData = await fetchDetailedTopicSections(selectedDetailedTopic.id);
                setAllSections(sectionData);
            }
            else if (selectedTopic && !selectedTopic?.is_detailed) {
                const sectionData = await fetchAllSectionsByTopicId(selectedTopic.id);
                setAllSections(sectionData);
            }
        }

        fetchAllSections();
    }, [selectedTopic, selectedDetailedTopic]);

    const upsertVideo = async () => {
        // check if it is an update or creation
        if (question) {
            if (!isCreation) {
                await updateVideo(videoId, question.question_text, url, thumbnailUrl, doctorId, id);

                if (selectedTopic?.is_detailed && selectedDetailedTopic && selectedSection) {
                    await updateDetailedTopicSectionVideosByVideoId(videoId, selectedSection.id, videoOrder);
                    await deleteSectionVideoByVideoId(videoId);
                }
                else if (selectedSection && !selectedTopic?.is_detailed) {
                    await updateSectionVideosByVideoId(videoId, selectedSection.id, videoOrder);
                    await deleteDetailedTopicSectionVideoByVideoId(videoId);
                }
            }
            else {
                const videoData = await createVideo(question?.question_text, url, thumbnailUrl, doctorId, id)

                if (selectedTopic?.is_detailed && selectedDetailedTopic && selectedSection) {
                    await createDetailedTopicSectionVideos(videoData.id, selectedSection.id, videoOrder)
                }
                else if (selectedSection && !selectedTopic?.is_detailed) {
                    await createSectionVideos(videoData.id, selectedSection.id, videoOrder)
                }
            }
        }

        router.push('/admin/questions');
    }

    const fetchSectionData = async (id: string) => {
        if (selectedTopic?.is_detailed) {
            const sectionData = await fetchDetailedTopicSectionById(id);
            setSelectedSection(sectionData);
        }
        else {
            const sectionData = await fetchSectionBySectionId(id);
            setSelectedSection(sectionData);
        }
    }

    const getDoctors = useCallback(async (term?: string) => {
        if (!!term && !!searchTerm) {
            const data = await fetchAllDoctors()
            setDoctors(data)
        } else {
            const data = await fetchDoctorsSearch(term || searchTerm)
            setDoctors(data)
        }
    }, [])

    const debouncedFetch = useCallback(debounce((term: string) => getDoctors(term), 300), [getDoctors]);

    // Fetch questions whenever searchTerm changes
    useEffect(() => {
        debouncedFetch(searchTerm);
    }, [searchTerm, debouncedFetch]);


    return (
        <div>
            {isLoading && <LoadingSpinner />}
            {!isLoading && <div>
                <h1 className="font-bold text-3xl px-6">{question?.question_text}</h1>
                <div className="min-h-screen px-6 flex flex-col mt-10">

                    <div className="mt-4">
                        <label htmlFor="video_url" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                            Video Url
                        </label>
                        <input
                            id="url"
                            name="url"
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value.replace('https://iframe.mediadelivery.net/play/', 'https://iframe.mediadelivery.net/embed/'))}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                        />
                    </div>

                    <div className="mt-4">
                        <label htmlFor="thumbnail-url" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                            Thumbnail Url
                        </label>
                        <input
                            id="thumbnail-url"
                            name="thumbnail-url"
                            type="text"
                            value={thumbnailUrl}
                            onChange={(e) => setThumbnailUrl(e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                        />
                    </div>

                    <div className="mt-4" onFocus={() => setSelectingDoctors(true)}>
                        <p className="mb-1 block text-sm font-medium leading-6 text-gray-900"> Doctor </p>
                        <DoctorSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Search for doctors" />
                        {selectingDoctors && <div className="mt-6">
                            <ul>
                                {doctors.map((doctor, index) => (
                                    <li key={index} className="border-t border-gray-700 py-4 cursor-pointer" onClick={() => {

                                        setDoctorId(doctor.id);
                                        setSearchTerm(doctor.name);
                                        setSelectingDoctors(false);
                                    }}>
                                        {doctor.name}
                                    </li>
                                ))}
                            </ul>
                        </div>}
                    </div>

                    <div className="mt-4">
                        <label htmlFor="topic" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                            Topic
                        </label>

                        <select
                            id="topic"
                            name="topic"
                            value={JSON.stringify(selectedTopic)}
                            onChange={(e) => {
                                setSelectedTopic(JSON.parse(e.target.value));
                            }}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                        >
                            <option key="default" value={""}></option>
                            {allTopics.map((topic, index) => (
                                <option key={index} value={JSON.stringify(topic)}>{topic.name}</option>
                            ))}
                        </select>
                    </div>

                    {allTopics && selectedTopic?.is_detailed && <div className="mt-4">
                        <label htmlFor="topic" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                            Detailed Topic
                        </label>

                        <select
                            id="topic"
                            name="topic"
                            value={JSON.stringify(selectedDetailedTopic)}
                            onChange={(e) => {
                                setSelectedDetailedTopic(JSON.parse(e.target.value));
                            }}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"

                        >
                            <option key="default" value=""></option>
                            {allDetailedTopics.map((topic, index) => (
                                <option key={index} value={JSON.stringify(topic)}>{topic.name}</option>
                            ))}
                        </select>
                    </div>}

                    {allSections && (!selectedTopic?.is_detailed || selectedDetailedTopic) && <div className="mt-4">
                        <label htmlFor="section" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                            Section
                        </label>

                        <select
                            id="section"
                            name="section"
                            value={selectedSection ? selectedSection.id : ''}
                            onChange={(e) => {
                                fetchSectionData(e.target.value);
                            }}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"

                        >
                            <option key="default" value=""></option>
                            {allSections.map((section, index) => (
                                <option key={index} value={section.id}>{section.name}</option>
                            ))}
                        </select>
                    </div>}

                    {selectedSection && <div className="mt-4">
                        <label htmlFor="video_order" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                            Video Order
                        </label>
                        <input
                            id="videoOrder"
                            name="videoOrder"
                            type="number"
                            value={videoOrder}
                            onChange={(e) => {
                                setVideoOrder(e.target.valueAsNumber);
                            }}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                        />
                    </div>}

                    <div className="flex justify-end mt-6 space-x-3">
                        <button
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            onClick={() => router.push('/admin/questions')}
                        >
                            Cancel
                        </button>

                        {!isCreation && <button
                            onClick={() => {
                                deleteVideo(videoId as string)
                                router.push('/admin/questions')
                            }}
                            className={`px-4 py-2 rounded-md text-white hover:bg-red-400 bg-red-500`}
                        >
                            Delete
                        </button>}

                        <button
                            disabled={!url || !thumbnailUrl || !doctorId}
                            onClick={upsertVideo}
                            className={!url || !thumbnailUrl || !doctorId ? 'px-4 py-2 rounded-md bg-gray-600 text-white' : `px-4 py-2 rounded-md text-white hover:bg-amber-400 bg-amber-500`}
                        >
                            {!isCreation ? 'Update' : 'Create'}
                        </button>
                    </div>
                </div>
            </div>}
        </div>
    )
}