import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
interface SearchBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredQuestions: string[];
}

export default function SearchBar({ searchTerm, setSearchTerm, filteredQuestions }: SearchBarProps) {
    return (
        <div className="min-h-screen p-6 flex justify-center">
            <div className="w-full max-w-full pw-10">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        className="w-full rounded-full py-2 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        placeholder="Search Q&A"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        Cancel
                    </button>
                </div>
                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-4">COMMONLY ASKED</h2>
                    <ul>
                        {filteredQuestions.map((question, index) => (
                            <li key={index} className="border-t border-gray-700 py-4">
                                <a href="#" className="flex justify-between items-center text-lg">
                                    {question}
                                </a>
                                <span className="text-amber-500 text-sm">8 Answers</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};