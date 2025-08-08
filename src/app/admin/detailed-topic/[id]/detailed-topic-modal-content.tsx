'use client'
import { useEffect, useState } from 'react'
import { DetailedTopic } from '@/app/_types/detailed-topic';
import { updateDetailedTopic, createDetailedTopic, deleteDetailedTopicById } from '@/app/_api/detailed-topics';
import { fetchAllFiltersByTopicId } from '@/app/_api/filters';
import { Filter } from '@/app/_types/filters';
import ShareModal from '@/app/_components/overlays/share-modal';

interface DetailedTopicModalContentProps {
    detailedTopic?: DetailedTopic | null,
    topicId: string,
    confirmText: string,
    onClose: () => void;
    isUpdate: boolean;
}

export default function DetailedTopicModalContent({
    detailedTopic,
    onClose,
    isUpdate,
    confirmText,
    topicId,
}: DetailedTopicModalContentProps) {
    const [name, setName] = useState<string>(detailedTopic?.name || '');
    const [indication, setIndication] = useState<string>(detailedTopic?.indication || '');
    const [purpose, setPurpose] = useState<string>(detailedTopic?.purpose || '');
    const [filterId, setFilterId] = useState<string>(detailedTopic?.filter_id || '');
    const [description, setDescription] = useState<string>(detailedTopic?.description || '');
    const [imageUrl, setImageUrl] = useState<string>(detailedTopic?.image_url || '');
    const [topicOrder, setTopicOrder] = useState<number>(detailedTopic?.topic_order || 0);
    const [filters, setFilters] = useState<Filter[]>([]);
    const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

    useEffect(() => {
        const fetchFilters = async () => {
            const filtersData = await fetchAllFiltersByTopicId(topicId);
            setFilters(filtersData);
        };

        fetchFilters();
    }, []);

    const onConfirm = () => {
        if (isUpdate && detailedTopic?.id) {
            updateDetailedTopic(name, description, imageUrl, detailedTopic.id, topicOrder, indication, purpose, filterId);
        } else {
            createDetailedTopic(name, description, imageUrl, topicOrder, indication, purpose, filterId, topicId);
        }
        onClose();
    };

    const onDelete = () => {
        if (isUpdate && detailedTopic?.id) {
            deleteDetailedTopicById(detailedTopic.id);
        }
        onClose();
    };

    return (
        <div className="mt-4">
            <div className="mt-4">
                <label htmlFor="name" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                    Topic Name
                </label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    value={name || ''}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                />
            </div>

            <div className="mt-4">
                <label htmlFor="indication" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                    Indication
                </label>
                <input
                    id="indication"
                    name="indication"
                    type="text"
                    value={indication || ''}
                    onChange={(e) => setIndication(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                />
            </div>

            <div className="mt-4">
                <label htmlFor="purpose" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                    Purpose
                </label>
                <input
                    id="purpose"
                    name="purpose"
                    type="text"
                    value={purpose || ''}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                />
            </div>

            <div className="mt-4">
                <label htmlFor="filter" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                    Filter
                </label>
                <select
                    id="filter"
                    name="filter"
                    value={filterId}
                    onChange={(e) => setFilterId(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                >
                    <option key="default" value=""></option>
                    {filters.map((filter, index) => (
                        <option key={index} value={filter.id}>{filter.name}</option>
                    ))}
                </select>
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
                <label htmlFor="image-url" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                    Image Url
                </label>
                <input
                    id="image-url"
                    name="image-url"
                    type="text"
                    value={imageUrl || ''}
                    onChange={(e) => setImageUrl(e.target.value)}
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
                    value={topicOrder}
                    onChange={(e) => setTopicOrder(e.target.valueAsNumber)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                />
            </div>

            <div className="flex justify-end mt-6 space-x-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </button>

                {isUpdate && (
                    <>
                        <button
                            onClick={onDelete}
                            className="px-4 py-2 rounded-md text-white hover:bg-red-400 bg-red-500"
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="px-4 py-2 border border-amber-500 rounded-md text-amber-600 hover:bg-amber-50"
                        >
                            Share
                        </button>
                    </>
                )}

                <button
                    disabled={!name}
                    onClick={onConfirm}
                    className={!name
                        ? 'px-4 py-2 rounded-md bg-gray-600 text-white'
                        : 'px-4 py-2 rounded-md text-white hover:bg-amber-400 bg-amber-500'}
                >
                    {confirmText}
                </button>
            </div>

            {isShareModalOpen && detailedTopic?.id && (
                <ShareModal
                    path={`/dashboard/topics/info/${detailedTopic.id}`}
                    onClose={() => setIsShareModalOpen(false)}
                />
            )}
        </div>
    );
}
