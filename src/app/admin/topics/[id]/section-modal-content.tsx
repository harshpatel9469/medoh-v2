'use client'
import { useState } from 'react'
import { Section } from '@/app/_types';
import { createSection, updateSection, deleteSectionById } from '@/app/_api/sections';

interface SectionModalContentProps {
    section?: Section | null,
    confirmText: string,
    topicId: string,
    onClose: () => void;
    isUpdate: boolean;
}


export default function SectionModalContent({ section, onClose, isUpdate, confirmText, topicId }: SectionModalContentProps) {
    const [sectionText, setSectionText] = useState<string>(section?.name || '')

    const onConfirm = () => {
        if (isUpdate) {
            if (section){
                updateSection(sectionText, section?.id)
            }
        }
        else {
            createSection(sectionText, topicId);
        }
        onClose();
    }

    const onDelete = () => {
        if (isUpdate) {
            if (section?.id){
                deleteSectionById(section.id)
            }
            onClose();
        }
    }
    

    return (

        <div className="mt-4">
            <div>

                <div className="mt-4">
                    <label htmlFor="section_text" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                        Section Text
                    </label>
                    <input
                        id="sectionText"
                        name="sectionText"
                        type="text"
                        value={sectionText || ''}
                        onChange={(e) => setSectionText(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                    />
                </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </button>

                {isUpdate && <button
                    onClick={onDelete}
                    className={`px-4 py-2 rounded-md text-white hover:bg-red-400 bg-red-500`}
                >
                    Delete
                </button>}

                <button
                    disabled={!sectionText}
                    onClick={onConfirm}
                    className={!sectionText? 'px-4 py-2 rounded-md bg-gray-600 text-white' :`px-4 py-2 rounded-md text-white hover:bg-amber-400 bg-amber-500`}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    )
}