'use client';

import { Doctor } from "@/app/_types/doctor";
import { useState, useEffect } from "react";
import SearchBar from "@/app/_components/forms/search-bar";
import { fetchAllDoctors, fetchDoctorsSearch } from "@/app/_api/doctors";
import DoctorModal from "./doctor-modal";
import { useDebouncedCallback } from "use-debounce";
import { supabase } from "@/utils/supabase/client";
import DoctorPrivatePageList from "@/app/_components/doctor-private-pages";

export default function DoctorsView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDoctorId, setOpenDoctorId] = useState<string | null>(null);

  // ✅ Initial fetch
  const refreshDoctors = async () => {
    const doctorsRes = await fetchAllDoctors();
    setDoctors(doctorsRes);
  };

  useEffect(() => {
    refreshDoctors();
  }, []);

  // ✅ Debounced search
  const handleSearch = useDebouncedCallback(async (term: string) => {
    const searchResults = await fetchDoctorsSearch(term);
    setDoctors(searchResults);
    setSearchTerm(term);
  }, 300);

  const clearSearchBar = () => {
    setSearchTerm("");
    refreshDoctors(); // Reset to full list
  };

  const togglePrivatePages = (doctorId: string) => {
    setOpenDoctorId(openDoctorId === doctorId ? null : doctorId);
  };

  return (
    <div>
      <h1 className="font-bold text-3xl px-6">Doctors</h1>
      <div className="min-h-screen p-6 flex flex-col mt-10">
        {/* Create Doctor Button */}
        <button
          type="button"
          onClick={() => {
            setSelectedDoctor(null);
            setIsModalOpen(true);
          }}
          className="flex w-60 justify-center rounded-md bg-amber-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 my-5"
        >
          Create Doctor
        </button>

        {/* Search Bar */}
        <SearchBar
          placeholder="Search Doctors"
          handleSearch={handleSearch}
          clearSearchBar={clearSearchBar}
        />

        {/* Doctors List */}
        <div className="mt-6">
          <ul>
            {doctors.map((doctor) => (
              <li key={doctor.id} className="border-t border-gray-200 py-6">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="cursor-pointer hover:text-amber-500 text-lg font-semibold"
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setIsModalOpen(true);
                    }}
                  >
                    {doctor.name}
                  </span>
                  <button
                    onClick={() => togglePrivatePages(doctor.id)}
                    className="rounded-md bg-green-500 px-3 py-1 text-sm font-semibold text-white hover:bg-green-400"
                  >
                    {openDoctorId === doctor.id ? "Hide Pages" : "View Pages"}
                  </button>
                </div>

                {openDoctorId === doctor.id && (
                  <DoctorPrivatePageList
                    doctorId={doctor.id}
                    doctorEmail={String(doctor.email)}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <DoctorModal
          confirmText={selectedDoctor ? "Update" : "Create"}
          title={selectedDoctor ? "Edit Doctor" : "Create Doctor"}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDoctor(null);
          }}
          doctor={selectedDoctor}
          isUpdate={!!selectedDoctor}
        />
      )}
    </div>
  );
}
