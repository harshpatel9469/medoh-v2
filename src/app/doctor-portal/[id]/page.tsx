'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { fetchDoctorById } from '../../_api/doctors';
import { fetchVideosByDoctorId } from '../../_api/videos';
import type { Doctor } from '../../_types/doctor';
import type { Video } from '../../_types/video';

// Placeholder for SMS and private pages data
const fetchRecentSMS = async (doctorId: string): Promise<{ message: string; date: string }[]> => [
  { message: 'Video resources for ACL reconstruction', date: 'Apr 17, 2024' },
  { message: 'Preparing for tennis elbow treatment', date: 'Apr 3, 2024' },
  { message: 'Learn more about shoulder conditions', date: 'Mar 20, 2024' },
];
const fetchPrivatePagesCount = async (doctorId: string): Promise<number> => 2;

export default function DoctorPortalDashboard({ params }: { params: { id: string } }) {
  const doctorId = params.id;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [smsMessages, setSmsMessages] = useState<{ message: string; date: string }[]>([]);
  const [privatePagesCount, setPrivatePagesCount] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      // Check if current user is admin
      const supabase = createClientComponentClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user && (user.email === 'mpyne@medohhealth.com' || user.app_metadata?.userrole === 'ADMIN')) {
        setIsAdmin(true);
      }

      const d = await fetchDoctorById(doctorId);
      setDoctor(d);
      const v = await fetchVideosByDoctorId(doctorId);
      setVideos(v);
      const sms = await fetchRecentSMS(doctorId);
      setSmsMessages(sms);
      const pages = await fetchPrivatePagesCount(doctorId);
      setPrivatePagesCount(pages);
    }
    loadData();
  }, [doctorId]);

  if (!doctor) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Admin Section - Show if user is admin */}
      {isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
                              <h2 className="text-lg font-semibold text-amber-900">Admin Mode - Viewing as {doctor.name}</h2>
                <p className="text-amber-700 text-sm">You are impersonating this doctor&apos;s portal view.</p>
            </div>
            <a href="/admin/doctors">
                              <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg px-4 py-2 text-sm shadow">
                Switch Doctor
              </button>
            </a>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="flex flex-col md:flex-row items-center bg-white rounded-xl shadow-sm p-6 mb-8 gap-6 md:gap-0">
        <img 
          src={doctor.picture_url || '/doctor1.gif'} 
          alt={doctor.name} 
          className="w-20 h-20 rounded-full object-cover mr-0 md:mr-6"
        />
        <div className="flex-1 text-center md:text-left">
          <div className="text-2xl font-bold text-gray-900">{doctor.name}</div>
          <div className="text-gray-500 text-lg">{doctor.specialty}</div>
          <div className="text-gray-500 text-base">{doctor.city}{doctor.city && doctor.state ? ', ' : ''}{doctor.state}</div>
        </div>
        <a href={`/doctor-portal/${doctorId}/profile`} className="mt-4 md:mt-0 md:ml-auto">
          <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg px-6 py-2 text-base shadow">Edit Profile</button>
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
          <div className="text-gray-500 text-base mb-1">Private Pages</div>
          <div className="text-3xl font-bold text-gray-900">{privatePagesCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
          <div className="text-gray-500 text-base mb-1">Videos</div>
          <div className="text-3xl font-bold text-gray-900">{videos.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
          <div className="text-gray-500 text-base mb-3">SMS Distribution</div>
          <a href={`/doctor-portal/${doctorId}/sms`} className="w-full flex justify-center">
            <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg px-6 py-2 text-base shadow">Send SMS</button>
          </a>
        </div>
      </div>

      {/* Two-Column Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Your Videos */}
        <div>
          <div className="text-lg font-semibold text-gray-900 mb-4">Your Videos</div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            {videos.length === 0 && <div className="text-gray-500">No videos yet.</div>}
            <ul className="space-y-2">
              {videos.slice(0, 10).map((video) => (
                <li key={video.id}>
                  <a href={`/dashboard/videos/${video.id}`} className="text-gray-900 hover:text-amber-600 font-medium block py-2 border-b last:border-b-0">
                    {video.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Recent SMS Messages */}
        <div>
          <div className="text-lg font-semibold text-gray-900 mb-4">Recent SMS Messages</div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            {smsMessages.length === 0 && <div className="text-gray-500">No SMS messages yet.</div>}
            <ul>
              {smsMessages.map((sms, idx) => (
                <li key={idx} className="py-2 border-b last:border-b-0">
                  <div className="font-medium text-gray-800">{sms.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{sms.date}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 