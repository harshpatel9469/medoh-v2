'use client'
import { useCallback, useEffect, useState } from 'react'
import { debounce } from 'lodash';
import { Topic } from '@/app/_types'
import { fetchTopicsSearch, fetchAllTopics, toggleDetailedTopicPrivacy } from '@/app/_api/topics';
import SearchBar from '@/app/_components/forms/search-bar';
import { ArrowRightIcon, PencilIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useDebouncedCallback } from 'use-debounce';
import { fetchAllDetailedTopicsById } from '@/app/_api/detailed-topics';
import { DetailedTopic } from '@/app/_types/detailed-topic';
import DetailedTopicModal from './detailed-topic-modal';
import { useQRCode } from 'next-qrcode';

export default function TopicsView({ params: { id } }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [topics, setTopics] = useState<DetailedTopic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<DetailedTopic | null>(null);
    const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
    const [selectedTopicForShare, setSelectedTopicForShare] = useState<DetailedTopic | null>(null);
    const { Image } = useQRCode();

    useEffect(() => {
        const fetchInitData = async () => {
            const topicRes = await fetchAllDetailedTopicsById(id);
            setTopics(topicRes);
        }

        fetchInitData();
    }, [isModalOpen]);

    const copyToClipboard = (topic: DetailedTopic) => {
        // Use current host instead of hardcoded production URL
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.medohhealth.com';
        const url = `${baseUrl}/dashboard/topics/info/${topic.id}`;
        const message = `Hello, this is the URL and QR code to your ${topic.name} page:\n${url}`;
        navigator.clipboard.writeText(message);
    };

    return (
        <div>
            <div className="min-h-screen p-6 flex flex-col mt-10">

                <div className='flex gap-5'>
                    <button
                        type="submit"
                        onClick={() => setIsModalOpen(true)}
                        className="flex w-60 justify-center rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 my-5"
                    >
                        Create Topics
                    </button>

                    <Link
                        href={`/admin/filters/${id}`}
                        className="flex w-60 justify-center rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 my-5"
                    >
                        Create Filter
                    </Link>
                </div>

                <div className="mt-6">
                    <ul>
                        {topics.map((topic, index) => (
                            <li key={index} className="border-t border-gray-700 py-4" >
                                <div className='flex items-center gap-6 text-lg w-[100%]'>
                                    <button className="p-2 rounded-xl bg-amber-500" onClick={() => {
                                        setSelectedTopic(topics[index]);
                                        setIsModalOpen(true);
                                    }}>
                                        <PencilIcon className='text-white w-5 h-5' />
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <label className="text-sm">Private</label>
                                        <input
                                            type="checkbox"
                                            checked={!!topic.is_private}
                                            onChange={async () => {
                                                await toggleDetailedTopicPrivacy(topic.id, !topic.is_private);
                                                setTopics((prev) =>
                                                    prev.map((t) =>
                                                        t.id === topic.id ? { ...t, is_private: !t.is_private } : t
                                                    )
                                                );
                                            }}
                                        />
                                    </div>

                                    <button 
                                        className="p-2 rounded-xl bg-amber-500"
                                        onClick={() => {
                                            setSelectedTopicForShare(topic);
                                            setShareModalOpen(true);
                                        }}
                                    >
                                        <ArrowUpOnSquareIcon className='text-white w-5 h-5' />
                                    </button>

                                    <Link href={`/admin/detailed-topic-section/${topic.id}`} className='flex justify-between items-center w-[100%] mr-4'>
                                        {topic.name}
                                        <ArrowRightIcon className='w-5 h-5 ' />
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {isModalOpen && <DetailedTopicModal
                confirmText={selectedTopic ? 'Update' : 'Create'}
                title={selectedTopic ? 'Edit Question' : 'Create Question'}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedTopic(null);
                }}
                detailedTopic={selectedTopic}
                isUpdate={selectedTopic ? true : false}
                topicId={id}
            />}

            {shareModalOpen && selectedTopicForShare && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/3 p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="text-xl font-bold">Share</h2>
                            <button onClick={() => {
                                setShareModalOpen(false);
                                setSelectedTopicForShare(null);
                            }} className="text-gray-500 hover:text-gray-700 text-2xl">
                                &times;
                            </button>
                        </div>
                        <div className="mt-4 w-full">
                            <div className="flex flex-col items-center">
                                <div className='flex w-full gap-2'>
                                    <input 
                                        disabled={true} 
                                        value={`${typeof window !== 'undefined' ? window.location.origin : 'https://www.medohhealth.com'}/dashboard/topics/info/${selectedTopicForShare.id}`} 
                                        className='rounded-lg w-full'
                                    />
                                    <button 
                                        className='border border-amber-500 bg-amber-500 font-semibold text-white px-3 rounded-lg'
                                        onClick={() => copyToClipboard(selectedTopicForShare)}
                                    >
                                        Copy
                                    </button>
                                </div>
                                <Image
                                    text={`${typeof window !== 'undefined' ? window.location.origin : 'https://www.medohhealth.com'}/dashboard/topics/info/${selectedTopicForShare.id}`}
                                    options={{
                                        type: 'image/jpeg',
                                        quality: 0.3,
                                        errorCorrectionLevel: 'M',
                                        margin: 3,
                                        scale: 4,
                                        width: 200,
                                        color: {
                                            dark: '#FA852F',
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
