'use client'
import { useState, useEffect } from 'react'
import { Topic } from '@/app/_types';
import { createTopic, deleteTopicById, updateTopic } from '@/app/_api/topics';
import { supabase } from '@/utils/supabase/client';

interface TopicModalContentProps {
    topic?: Topic | null,
    confirmText: string,
    onClose: () => void;
    isUpdate: boolean;
}

export default function TopicModalContent({ topic, onClose, isUpdate, confirmText }: TopicModalContentProps) {
    const [topicText, setTopicText] = useState<string>(topic?.name || '')
    const [description, setDescription] = useState<string>(topic?.description || '')
    const [image, setImage] = useState<string>(topic?.image || '')
    const [order, setOrder] = useState<number>(topic?.topic_order || 0)
    const [isDetailed, setIsDetailed] = useState<boolean>(topic?.is_detailed || false);
    const [bodyParts, setBodyParts] = useState<{ id: string, name: string }[]>([]);
    const [bodyPartId, setBodyPartId] = useState<string>(topic?.body_part_id || '');

    useEffect(() => {
        // Fetch body parts for dropdown
        const fetchBodyParts = async () => {
            const { data, error } = await supabase.from('body_parts').select('id, name').order('name');
            if (!error && data) setBodyParts(data);
        };
        fetchBodyParts();
    }, []);

    const onConfirm = async () => {
        if (isUpdate && topic?.id) {
            await updateTopic(topicText, description, image, topic.id, order, isDetailed, bodyPartId);
        } else {
            await createTopic(topicText, description, image, order, isDetailed, bodyPartId);
        }
        onClose();
    };

    const onDelete = () => {
        if (isUpdate && topic?.id) {
            deleteTopicById(topic.id)
        }
        onClose();
    }

    return (
        <div className="mt-4">
            <div>
                <div className="mt-4">
                    <label htmlFor="topic_text" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                        Topic Text
                    </label>
                    <input
                        id="topicText"
                        name="topicText"
                        type="text"
                        value={topicText || ''}
                        onChange={(e) => setTopicText(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                    />
                </div>

                <div className="mt-4">
                    <label htmlFor="description" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                        Description
                    </label>
                    <input
                        id="description"
                        name="description"
                        type="text"
                        value={description || ''}
                        onChange={(e) => setDescription(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                    />
                </div>

                <div className="mt-4">
                    <label htmlFor="image_url" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                        Image Url
                    </label>
                    <input
                        id="imageUrl"
                        name="imageUrl"
                        type="text"
                        value={image || ''}
                        onChange={(e) => setImage(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                    />
                </div>

                <div className="mt-4">
                    <label htmlFor="topic_order" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                        Order
                    </label>
                    <input
                        id="topic_order"
                        name="topicOrder"
                        type="number"
                        value={order}
                        onChange={(e) => setOrder(e.target.valueAsNumber)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                    />
                </div>

                <div className="mt-4">
                    <label htmlFor="body_part" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                        Body Part
                    </label>
                    <select
                        value={bodyPartId}
                        onChange={(e) => setBodyPartId(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                    >
                        <option value="">(None)</option>
                        {bodyParts.map(bp => (
                            <option key={bp.id} value={bp.id}>{bp.name}</option>
                        ))}
                    </select>
                </div>

                <div className='mt-4 flex items-center gap-2'>
                    <input
                        id="detailed_topic"
                        name="detailedTopic"
                        type="checkbox"
                        checked={isDetailed}
                        onChange={(e) => setIsDetailed(!isDetailed)}
                        className="rounded-md text-primary-color shadow-sm focus:ring-primary-color"
                    />
                    <label htmlFor="detailed_topic" className="">
                        Detailed Topic?
                    </label>
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
                    disabled={!topicText}
                    onClick={onConfirm}
                    className={!topicText? 'px-4 py-2 rounded-md bg-gray-600 text-white' :`px-4 py-2 rounded-md text-white hover:bg-amber-400 bg-amber-500`}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    )
}