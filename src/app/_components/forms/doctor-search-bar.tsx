import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'
interface SearchBarProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    placeholder: string;
    border?: boolean;
}

export default function DoctorSearchBar({ searchTerm, setSearchTerm, placeholder, border }: SearchBarProps) {
    return (
        <div className="w-full max-w-full pw-10">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                </div>
                <input
                    type="text"
                    className="w-full rounded-full py-2 pl-10 px-4 placeholder-gray-500 border-none focus:outline-none focus:ring-2 focus:ring-primary-color"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div onClick={() => setSearchTerm('')}
                     className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer">
                    <XMarkIcon className="h-5 w-5 text-black" aria-hidden="true"/>
                </div>
            </div>
        </div>
    );
};