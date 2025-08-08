'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { fetchAllQuestions, fetchQuestionsSearch } from '@/app/_api/questions';
import { Question } from '@/app/_types'
import { useDebouncedCallback } from 'use-debounce';
import SearchBar from '@/app/_components/forms/search-bar';
import QuestionModal from './question-modal';
import { ArrowRightIcon, PencilIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function QuestionsView() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([])
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
    const [searchTerm, setSearchTerm] = useState<string>('')

    useEffect(() => {
        const fetchInitData = async () => {
            const commonQuestionsRes = await fetchAllQuestions();
            setQuestions(commonQuestionsRes);
        }

        fetchInitData();
    }, [])

    const handleSearch = useDebouncedCallback(async (term) => {
        const searchResults = await fetchQuestionsSearch(term);
        setQuestions(searchResults);
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
                    onClick={() => {
                        setSelectedQuestion(null);
                        setIsModalOpen(true);
                    }}
                    className="flex w-60 justify-center rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 my-5"
                >
                    Create Question
                </button>
                <SearchBar placeholder="Search Questions" handleSearch={handleSearch} clearSearchBar={clearSearchBar}/>
                <div className="mt-6">
                    <ul>
                        {questions.map((question, index) => (
                            <li key={index} className="border-t border-gray-700 py-4">
                                <div className='flex items-center gap-6 text-lg w-[100%]'>
                                    <button className="p-2 rounded-xl bg-amber-500" onClick={() => {
                                        setSelectedQuestion(questions[index]);
                                        setIsModalOpen(true)
                                    }}>
                                        <PencilIcon className='text-white w-5 h-5' />
                                    </button>
                                    <Link href={`/admin/questions/${question.id}`} className="flex justify-between items-center w-[100%] mr-4">
                                        {question.question_text}
                                        <ArrowRightIcon className='w-5 h-5'/>
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {isModalOpen && (
                <QuestionModal
                    confirmText={selectedQuestion ? 'Update' : 'Create'}
                    title={selectedQuestion ? 'Edit Question' : 'Create Question'}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedQuestion(null);
                    }}
                    onConfirm={() => {
                        setIsModalOpen(false);
                    }}
                    question={selectedQuestion}
                />
            )
            }
        </div>
    )
}