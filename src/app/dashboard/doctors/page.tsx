'use client';
import { debounce } from "lodash";
import SearchBar from "@/app/_components/forms/search-bar";
import { useState, useCallback, useEffect } from "react";
import { Doctor } from "@/app/_types";
import { fetchAllDoctors, fetchDoctorsSearch } from "@/app/_api/doctors";
import LoadingSpinner from "@/app/_components/loading-spinner";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useDebouncedCallback } from "use-debounce";

export default function AllDoctors() {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isLoading, setLoading] = useState<boolean>(true);
    const [doctors, setDoctors] = useState<Doctor[] | null>(null);
    const [doctorCount, setDoctorCount] = useState<number>(10);

    const router = useRouter();

    useEffect(() => {
        const fetchInitData = async () => {
            const doctorsRes = await fetchAllDoctors();
            setDoctors(doctorsRes);
        }

        fetchInitData();
        setLoading(false);
    }, [])

    const handleSearch = useDebouncedCallback(async (term) => {
        setLoading(true);
        const searchResults = await fetchDoctorsSearch(term);
        setDoctors(searchResults);
        setSearchTerm(term);
        setLoading(false);
    }, 300);

    const clearSearchBar = () => {
        setSearchTerm('');
    }

    useEffect(() => {
        setDoctorCount(10);
    }, [searchTerm])

    return (
        <div className="mx-4 sm:mx-6 lg:mx-8">
            <div className="mb-6">
                <SearchBar placeholder="Search for a doctor" handleSearch={handleSearch} clearSearchBar={clearSearchBar} />
            </div>
            {doctors === null || isLoading ?
                <LoadingSpinner /> :
                <div className="mt-6 flex flex-col">
                    {doctors?.length === 0 ?
                        <div className="flex flex-col items-center w-full py-8">
                            <h3 className="text-xl font-semibold mb-2">No Doctors Found</h3>
                            <p className="text-gray-600">Try a different name</p>
                        </div> :
                        (
                            <ul className="space-y-4">
                                {doctors?.map((doctor, index) => (
                                    <li 
                                        key={index} 
                                        onClick={() => router.push(`/dashboard/doctors/${doctor.id}`)} 
                                        className="border border-gray-200 rounded-lg p-4 sm:p-6 cursor-pointer hover:shadow-md transition-shadow bg-white"
                                    >
                                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                            <img
                                                src={doctor.picture_url}
                                                alt="Doctor Picture"
                                                className="w-full sm:w-24 h-48 sm:h-32 min-w-full sm:min-w-24 rounded-lg object-cover mx-auto sm:mx-0" />

                                            <div className="flex flex-col gap-3 sm:gap-4 w-full">
                                                <div className="flex items-center justify-between w-full">
                                                    <p className="text-lg sm:text-xl font-semibold">{doctor.name}</p>
                                                    <ArrowRightIcon className="h-6 sm:h-8 text-gray-400" />
                                                </div>
                                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                                    {doctor.bio?.slice(0, 150)}
                                                    {doctor.bio && doctor.bio.length > 150 && "...read more"}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )
                    }
                    {doctors && doctorCount <= doctors.length && (
                        <div className="flex justify-center mt-8">
                            <button 
                                className="border-2 border-gray-300 hover:border-primary-color rounded-xl px-6 py-3 hover:bg-gray-50 transition-colors font-medium" 
                                onClick={() => setDoctorCount(doctorCount + 10)}
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>
            }
        </div>
    )
}