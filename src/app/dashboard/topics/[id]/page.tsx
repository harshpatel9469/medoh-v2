'use client'
import { fetchAllDetailedTopicsById } from "@/app/_api/detailed-topics";
import LoadingSpinner from "@/app/_components/loading-spinner";
import { DetailedTopic } from "@/app/_types/detailed-topic";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchTopicById } from "@/app/_api/topics";
import { Topic } from "@/app/_types";
import { Filter } from "@/app/_types/filters";
import { fetchAllFiltersByTopicId } from "@/app/_api/filters";

export default function Treatments({ params: { id } }: any) {
    const [allTopics, setAllTopics] = useState<DetailedTopic[]>([]);
    const [filteredTopics, setFilteredTopics] = useState<DetailedTopic[]>([]);
    const [topic, setTopic] = useState<Topic>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [filters, setFilters] = useState<Filter[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<Filter | null>(null);

    useEffect(() => {

        async function fetchData() {
            // Get topic info
            const detailedTopicData = await fetchTopicById(id);
            setTopic(detailedTopicData);

            // Get detailed allTopics
            const topicsData = await fetchAllDetailedTopicsById(id);
            const publicTopics = topicsData.filter(topic => topic.is_private === false); // ✅ Filter private
            setAllTopics(publicTopics);
            setFilteredTopics(publicTopics);


            // Get all the filters for a topic
            const filterData = await fetchAllFiltersByTopicId(id);
            setFilters(filterData);
        }
        
        fetchData();
        setIsLoading(false);
    }, []);

    const handleFilter = (filter: Filter | null) => {
        if (filter === null) {
            setFilteredTopics(allTopics);
            setSelectedFilter(null);
        }
        else {
            setFilteredTopics(allTopics.filter((topic, index) => topic.filter_id === filter.id))
            setSelectedFilter(filter);
        }
    }

    return (
        <div>
            {isLoading ? <LoadingSpinner /> :
                <div className="mx-4">
                    {topic && <h1 className="text-3xl font-bold mb-6">{topic.name}</h1>}
                    {topic && <p className="text-base mb-9">{topic.description}</p>}

                    {filters.length !== 0 && <div className="flex gap-4 mb-6 flex-nowrap overflow-x-auto text-nowrap p-4 md:p-2">

                        <p 
                            className={selectedFilter === null? "py-1 px-2 bg-card-background-primary-gradient rounded-full font-semibold text-white hover:cursor-pointer ring-2 ring-offset-2 ring-primary-color" : 
                                "py-1 px-2 bg-card-background-primary-gradient rounded-full font-semibold text-white hover:cursor-pointer hover:opacity-65"}
                            onClick={e => handleFilter(null)}
                        >
                            All
                        </p>

                        {filters.map((filter, index) => (
                            <p 
                                key={index} 
                                className={selectedFilter === filter? "py-1 px-2 bg-card-background-primary-gradient rounded-full font-semibold text-white hover:cursor-pointer ring-2 ring-offset-2 ring-primary-color" : 
                                    "py-1 px-2 bg-card-background-primary-gradient rounded-full font-semibold text-white hover:cursor-pointer hover:opacity-65"}
                                onClick={e => handleFilter(filter)}
                            >
                                {filter.name}
                            </p>
                        ))}
                    </div>}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {filteredTopics.map((topic, index) => (
                            <Link
                                key={topic.id}
                                href={`/dashboard/topics/info/${topic.id}`}
                                style={{backgroundImage: `url(${topic.image_url}), var(--card-background-primary-gradient)`}}
                                className="h-40 w-full flex flex-col items-center justify-end p-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-300 bg-cover bg-no-repeat"
                            >   
                                <span className="text-lg font-semibold text-white bg-card-background-primary-gradient py-1 px-2 rounded-full text-center">{topic.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            }
        </div>
    )
}