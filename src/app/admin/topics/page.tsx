'use client'
import { useCallback, useEffect, useState } from 'react'
import { debounce } from 'lodash';
import { Topic } from '@/app/_types'
import { fetchTopicsSearch, fetchAllTopics } from '@/app/_api/topics';
import SearchBar from '@/app/_components/forms/search-bar';
import TopicModal from './topic-modal';
import { ArrowRightIcon, PencilIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useDebouncedCallback } from 'use-debounce';

export default function TopicsView() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [topics, setTopics] = useState<Topic[]>([])
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
    const [searchTerm, setSearchTerm] = useState<string>('')

    useEffect(() => {
        const fetchInitData = async () => {
            const doctorsRes = await fetchAllTopics();
            setTopics(doctorsRes);
        }

        fetchInitData();
    }, [isModalOpen])

    const handleSearch = useDebouncedCallback(async (term) => {
        const searchResults = await fetchTopicsSearch(term);
        setTopics(searchResults);
        setSearchTerm(term);
    }, 300);

    const clearSearchBar = () => {
        setSearchTerm('');
    }

    return (
        <div>
            <div className="min-h-screen p-6 flex flex-col mt-10">
                <button
                    type="submit"
                    onClick={() => setIsModalOpen(true)}
                    className="flex w-60 justify-center rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 my-5"
                >
                    Create Topics
                </button>
                <SearchBar placeholder="Search topics" handleSearch={handleSearch} clearSearchBar={clearSearchBar} />
                <div className="mt-6">
                    <ul>
                        {topics.map((topic, index) => (
                            <li key={index} className="border-t border-gray-700 py-4" >
                                    <div className='flex items-center gap-6 text-lg w-[100%]'>
                                        <button className="p-2 rounded-xl bg-amber-500" onClick={() => {
                                            setSelectedTopic(topics[index]);
                                            setIsModalOpen(true)
                                        }}>
                                            <PencilIcon className='text-white w-5 h-5' />
                                        </button>
                                        <Link href={!topic.is_detailed? `/admin/topics/${topic.id}` : `/admin/detailed-topic/${topic.id}`}  className='flex justify-between items-center w-[100%] mr-4'>
                                            {topic.name}
                                            <ArrowRightIcon className='w-5 h-5 '/>
                                        </Link>
                                    </div>


                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {isModalOpen && (
                <TopicModal
                    confirmText={selectedTopic ? 'Update' : 'Create'}
                    title={selectedTopic ? 'Edit Question' : 'Create Question'}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedTopic(null);
                    }}
                    topic={selectedTopic}
                    isUpdate={selectedTopic ? true : false}
                />
            )}
        </div>
    )
}