'use client'
import { fetchDetailedTopicSections, fetchVideosByDetailedTopicSectionId, updateDetailedTopicSectionOrder } from "@/app/_api/detailed-topic-sections";
import { fetchAllVideosByDetailedSectionIdAdminPanel, updateDetailedTopicVideoOrder } from "@/app/_api/detailed-topic-sections-videos";
import { deleteSectionVideoByVideoId } from "@/app/_api/section-videos";
import { deleteVideo } from "@/app/_api/videos";
import { DetailedTopicSection } from "@/app/_types/detailed-topic-section";
import { ArrowDownIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SectionModal from "./detailed-topic-section-modal";

export default function DetailedTopicSections({params: {id}}: any) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [sections, setSections] = useState<DetailedTopicSection[]>([]);
    const [selectedSection, setSelectedSection] = useState<DetailedTopicSection | null>(null);
    const [sectionData, setSectionData] = useState<any[] | null>(null);
    const [orderUpdated, setOrderUpdated] = useState(false);
    const [sectionOrderUpdated, setSectionOrderUpdated] = useState(false);
    const [updateComplete, setUpdateComplete] = useState(false);
    const router = useRouter();

    
    const handleSectionOrderUpdate = async () => {
        sections.map(async (data, index) => {
            await updateDetailedTopicSectionOrder(data.id, data.section_order);
        })
        setUpdateComplete(true);
    }
    
    useEffect(() => {
        const fetchSectionsData = async () => {
            const sectionData = await fetchDetailedTopicSections(id);
            setSections(sectionData);
        }

        setUpdateComplete(false);
        setSectionOrderUpdated(false);
        fetchSectionsData();
    }, [isModalOpen, updateComplete])

    const handleOrderUpdate = async () => {
        sectionData?.map(async (data, index) => {
            if (selectedSection)
                await updateDetailedTopicVideoOrder(data.videos.id, selectedSection.id, data.video_order)
        })
        setSelectedSection(null);
    }

    return (
        <div>
            <h1 className="font-bold text-3xl px-6">Sections</h1>
            <div className="min-h-screen p-6 flex flex-col mt-10">
                <button
                    type="submit"
                    onClick={() => {
                        setSelectedSection(null);
                        setIsModalOpen(true);
                    }}
                    className="flex w-60 justify-center rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 my-5"
                >
                    Create Section
                </button>
                <ul>
                    {sections.map((section, index) => (
                        <li key={index} className="border-t border-gray-700 py-4" >
                            <div className='flex items-center gap-6 text-lg w-[100%]'>
                                <input 
                                    className="w-20"
                                    type="number"
                                    value={section.section_order}
                                    onChange={e => {
                                        setSections(sections.map(item =>
                                            item.id === section.id
                                                ? { ...item, section_order: e.target.valueAsNumber }
                                                : item))
                                        setSectionOrderUpdated(true);
                                    }}/>

                                <button className="p-2 rounded-xl bg-amber-500" onClick={() => {
                                    setSelectedSection(section);
                                    setIsModalOpen(true);
                                }}>
                                    <PencilIcon className='text-white w-5 h-5' />
                                </button>
                                <button className='flex justify-between items-center w-[100%] mr-4' onClick={async () => {
                                    const sectionVideos = await fetchAllVideosByDetailedSectionIdAdminPanel(section.id)
                                    setSectionData(sectionVideos);
                                    setSelectedSection(sections[index])
                                    setOrderUpdated(false);
                                }}>
                                    {section.name}
                                    {selectedSection !== section && <ArrowDownIcon className='w-5 h-5 ' />}
                                </button>
                            </div>

                            {selectedSection === section && <ul className="mx-[10%] mt-4">
                                {sectionData?.map((data, index) => (
                                    <li key={index} className="p-2 flex gap-6 items-center border-t border-gray-700 w-full">
                                        <button className="p-2 rounded-xl bg-red-500 hover:bg-red-400" >
                                            <TrashIcon className='text-white w-5 h-5' onClick={async () => {
                                                await deleteVideo(data.videos.id);
                                                setSelectedSection(null);
                                            }} />
                                        </button>
                                        <p className="w-full">{data.videos.name}</p>
                                        <input
                                            className="w-20"
                                            type="number"
                                            value={data.video_order}
                                            onChange={e => {
                                                setSectionData(sectionData.map(item =>
                                                    item.videos.id === data.videos.id
                                                        ? { ...item, video_order: e.target.valueAsNumber }
                                                        : item))
                                                setOrderUpdated(true);
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul>}
                            {selectedSection === section && orderUpdated && <div className="flex justify-center mt-6">
                                <button className="p-2 rounded-xl bg-amber-500 text-center text-white text-bold" onClick={handleOrderUpdate}>Update Video Order</button>
                            </div>}
                        </li>
                    ))}
                </ul>

                {sectionOrderUpdated && <button
                    type="submit"
                    onClick={handleSectionOrderUpdate}
                    className="mt-6 flex w-60 justify-center self-center rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                >
                    Update Section Order
                </button>}
            </div>
            {isModalOpen && <SectionModal
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedSection(null);
                }}
                confirmText={selectedSection ? 'Update' : 'Create'}
                title={selectedSection ? "Update Section" : "Create Section"}
                isUpdate={selectedSection ? true : false}
                topicId={id}
                section={selectedSection}
            />}
        </div>
    )
}