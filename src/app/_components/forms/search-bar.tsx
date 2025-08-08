import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline'
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'

interface SearchBarProps {
    handleSearch: (term: string) => void;
    placeholder: string;
    border?: boolean;
    clearSearchBar: () => void;
    onInputChange?: (term: string) => void;
    activeCondition?: string; // Add this prop
}

export default function SearchBar({ handleSearch, placeholder, border, clearSearchBar, onInputChange, activeCondition }: SearchBarProps) {
    const searchRef = React.useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState('');

    // Reset input when condition changes
    useEffect(() => {
        setInputValue('');
        if (searchRef.current) {
            searchRef.current.value = '';
        }
    }, [activeCondition]); // Reset when activeCondition changes

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        
        // Always pass the current input value to the search function
        handleSearch(value);
        
        if (onInputChange) {
            onInputChange(value);
        }
    };

    const handleClear = () => {
        setInputValue('');
        if (searchRef.current) {
            searchRef.current.value = '';
        }
        clearSearchBar();
    };

    return (
        <div className="w-full max-w-full">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                </div>
                <input
                    ref={searchRef}
                    id="search-bar-input"
                    type="text"
                    value={inputValue}
                    className="w-full rounded-full py-3 sm:py-2 pl-12 pr-12 sm:pr-10 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent text-base sm:text-sm shadow-sm"
                    placeholder={placeholder}
                    onChange={handleInputChange}
                />
                <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    aria-label="Clear search"
                >
                    <XMarkIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" aria-hidden="true"/>
                </button>
            </div>
        </div>
    );
};