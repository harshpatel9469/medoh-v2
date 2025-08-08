import React from 'react';
import Link from 'next/link';

interface SectionCardProps {
    section: {
        id: string;
        name: string;
        section_order: number;
        [key: string]: any;
    };
    link: string;
}

export default function SectionCard({ section, link }: SectionCardProps) {
    return (
        <Link href={link} className="block">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {section.name}
                        </h3>
                    </div>
                    <div className="ml-4">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
} 