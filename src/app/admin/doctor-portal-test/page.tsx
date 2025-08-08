'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { fetchAllDoctors } from '../../_api/doctors';
import { useAuth } from '../../_contexts/auth-context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Doctor } from '../../_types/doctor';

export default function AdminDoctorPortalTestPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setImpersonatedDoctorId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function checkAdminAndLoadDoctors() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        console.log('Admin doctor portal test auth check:', { user });
        
        if (!user) {
          setError('Not logged in.');
          setLoading(false);
          return;
        }

        console.log('User email:', user.email);
        console.log('User metadata:', user.app_metadata);

        // Check if user is admin (same logic as admin layout)
        if (user.app_metadata?.userrole !== 'ADMIN' && user.email !== 'mpyne@medohhealth.com') {
          setError('Access denied. Admin privileges required.');
          setLoading(false);
          return;
        }

        setIsAdmin(true);
        
        // Load all doctors
        const allDoctors = await fetchAllDoctors();
        setDoctors(allDoctors);
        
      } catch (e) {
        console.error('Error checking admin status or loading doctors:', e);
        setError('Failed to load doctors.');
      }
      setLoading(false);
    }

    checkAdminAndLoadDoctors();
  }, []);

  const handleImpersonate = () => {
    if (!selectedDoctorId) {
      alert('Please select a doctor first.');
      return;
    }
    
    console.log('Impersonating doctor:', selectedDoctorId);
    setImpersonatedDoctorId(selectedDoctorId);
    
    // Navigate to doctor portal home
    router.push('/doctor-portal/home');
  };

  const handleDirectNavigate = (doctorId: string) => {
    console.log('Direct navigation to doctor portal:', doctorId);
    setImpersonatedDoctorId(doctorId);
    router.push('/doctor-portal/home');
  };

  const stopImpersonation = () => {
    setImpersonatedDoctorId(null);
    setSelectedDoctorId('');
    console.log('Stopped impersonation');
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">{error || 'You do not have permission to access this page.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Doctor Portal Testing</h1>
        <p className="text-gray-600 mb-8">
          Impersonate doctors to test their portal functionality. Select a doctor and navigate to their portal to see their specific content and statistics.
        </p>

        {/* Impersonation Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Impersonation Controls</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1">
              <label htmlFor="doctor-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Doctor to Impersonate
              </label>
              <select
                id="doctor-select"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
              >
                <option value="">-- Select a Doctor --</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleImpersonate}
                disabled={!selectedDoctorId}
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Access Portal
              </button>
              
              <button
                onClick={stopImpersonation}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-medium"
              >
                Stop Impersonation
              </button>
            </div>
          </div>
        </div>

        {/* Doctors List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Doctors</h2>
            <p className="text-sm text-gray-600 mt-1">Click on any doctor to quickly access their portal</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleDirectNavigate(doctor.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {doctor.picture_url && (
                      <img
                        src={doctor.picture_url}
                        alt={doctor.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{doctor.name}</h3>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                      {(doctor.city || doctor.state) && (
                        <p className="text-sm text-gray-500">
                          {[doctor.city, doctor.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-amber-600 mt-1">
                        Portal URL: /doctor-portal/{doctor.id}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDirectNavigate(doctor.id);
                      }}
                      className="px-3 py-1 bg-amber-500 text-white text-sm rounded hover:bg-amber-600"
                    >
                      Test Portal
                    </button>
                    <span className="text-xs text-gray-400">ID: {doctor.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {doctors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No doctors found. Create some doctors first.</p>
          </div>
        )}
      </div>
    </div>
  );
} 