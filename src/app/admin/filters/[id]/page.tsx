'use client'
import { fetchAllFiltersByTopicId } from "@/app/_api/filters";
import { Filter } from "@/app/_types/filters";
import { PencilIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import FilterModal from "./filters-model";

export default function FiltersView({ params: { id } }: any) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [filters, setFilters] = useState<Filter[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<Filter | null>(null);

    useEffect(() => {
        const fetchInitData = async () => {
            const filterData = await fetchAllFiltersByTopicId(id);
            setFilters(filterData);
        };

        fetchInitData();
    }, [isModalOpen]);

    return (
        <div>
            <h1 className="font-bold text-3xl px-6">Filters</h1>
            <div className="min-h-screen p-6 flex flex-col mt-10">
                <button
                    type="submit"
                    onClick={() => {
                        setIsModalOpen(true);
                    }}
                    className="flex w-60 justify-center rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 my-5"
                >
                    Create Filter
                </button>

                <div className="mt-6">
                    <ul>
                        {filters && filters.map((filter, index) => (
                            <li key={index} className="border-t border-gray-700 py-4" >
                                <div className='flex items-center gap-6 text-lg w-[100%]'>
                                    <button className="p-2 rounded-xl bg-amber-500" onClick={() => {
                                        setIsModalOpen(true);
                                        setSelectedFilter(filter);
                                    }}>
                                        <PencilIcon className='text-white w-5 h-5' />
                                    </button>
                                    <p className='flex justify-between items-center w-[100%] mr-4'>
                                        {filter.name}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {isModalOpen && <FilterModal 
                filter={selectedFilter}
                topicId={id}
                title={selectedFilter? "Update Filter" : "Create Filter"}
                confirmText={selectedFilter? "Update" : "Create"}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedFilter(null);
                }}
                onConfirm={() => {
                    setIsModalOpen(false);
                    setSelectedFilter(null);
                }}
            />}
        </div>
    );
}