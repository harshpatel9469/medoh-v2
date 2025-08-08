'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getDoctorIdByEmail,
  getDoctorEmailById,
  doesPrivatePageExist,
  fetchPrivatePageById,
} from '@/app/_api/private-pages';

interface Step1FormProps {
  redirectBasePath: string; // e.g., "/admin/private_pages/new-private-page" or "/doctor/private-pages"
}

export default function Step1Form({ redirectBasePath }: Step1FormProps) {
  const [doctorId, setDoctorId] = useState('');
  const [doctorEmail, setDoctorEmail] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const pageId = searchParams.get('pageID');
    const doctorIdFromUrl = searchParams.get('doctorID');

    if (doctorIdFromUrl) {
      setDoctorId(doctorIdFromUrl);
      getDoctorEmailById(doctorIdFromUrl).then((email) => {
        if (email) setDoctorEmail(email);
      });
    }

    if (pageId) {
      setIsEditMode(true);
      setLoading(true);
      fetchPrivatePageById(pageId)
        .then((page) => {
          if (page) {
            setPatientEmail(page.patient_email || '');
            setPatientPhone(page.patient_phone || '');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [searchParams]);

  const handleNext = async () => {
    if (!patientEmail || !patientPhone) {
      alert('Please fill in all fields.');
      return;
    }

    let finalDoctorId = doctorId;

    if (!finalDoctorId) {
      if (!doctorEmail) {
        alert('Please enter the doctor email.');
        return;
      }
      const foundId = await getDoctorIdByEmail(doctorEmail.trim());
      if (!foundId) {
        alert('Doctor with this email not found.');
        return;
      }
      finalDoctorId = foundId;
      setDoctorId(foundId);
    }

    if (isEditMode) {
      const pageId = searchParams.get('pageID');
      router.push(
        `${redirectBasePath}/step2?pageID=${pageId}&doctor=${finalDoctorId}&patientEmail=${patientEmail}&patientPhone=${patientPhone}`
      );
      return;
    }

    const pageExists = await doesPrivatePageExist(finalDoctorId, patientEmail, patientPhone);
    if (pageExists) {
      alert('A private page between this doctor and patient already exists. Please edit that page.');
      return;
    }

    router.push(
      `${redirectBasePath}/step2?doctor=${finalDoctorId}&patientEmail=${patientEmail}&patientPhone=${patientPhone}`
    );
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading page details...</div>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-4 text-[#f78f1e]">
        {isEditMode ? 'Edit Private Page' : 'Step 1: Select Doctor & Patient'}
      </h1>

      {/* Doctor Email */}
      <label className="block mb-2 font-medium">Doctor Email</label>
      <input
        type="email"
        value={doctorEmail}
        onChange={(e) => setDoctorEmail(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#f78f1e] focus:border-[#f78f1e]"
        placeholder="Enter doctor email"
        required={!doctorId}
      />

      {/* Patient Email */}
      <label className="block mb-2 font-medium">Patient Email</label>
      <input
        type="email"
        value={patientEmail}
        onChange={(e) => setPatientEmail(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#f78f1e] focus:border-[#f78f1e]"
        placeholder="Enter patient email"
        required
      />

      {/* Patient Phone */}
      <label className="block mb-2 font-medium">Patient Phone Number</label>
      <input
        type="tel"
        value={patientPhone}
        onChange={(e) => setPatientPhone(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-[#f78f1e] focus:border-[#f78f1e]"
        placeholder="Enter patient phone number"
        required
      />

      <button
        className="bg-[#f78f1e] text-white px-4 py-2 rounded hover:bg-[#e2790a] transition"
        onClick={handleNext}
      >
        {isEditMode ? 'Save & Continue' : 'Next'}
      </button>
    </div>
  );
}
