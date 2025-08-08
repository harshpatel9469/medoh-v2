'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { fetchAllDoctors } from '../../_api/doctors';
import { useAuth } from '../../_contexts/auth-context';
import { useRouter } from 'next/navigation';
import type { Doctor } from '../../_types/doctor';

export default function AdminImpersonatePage() {
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
        
        console.log('Admin impersonate auth check:', { user });
        
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
        setError('Failed to load data.');
        console.error('Error:', e);
      } finally {
        setLoading(false);
      }
    }
    
    checkAdminAndLoadDoctors();
  }, []);

  const handleImpersonate = () => {
    if (selectedDoctorId) {
      // Set the impersonation in context and redirect to home
      setImpersonatedDoctorId(selectedDoctorId);
      router.push('/doctor-portal/home');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!isAdmin) return <div className="p-8">Access denied.</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin: Impersonate Doctor</h1>
        <p className="text-gray-600 mb-4">
          Select a doctor to view their portal dashboard as if you were logged in as them.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-amber-800 mb-2">How it works</h3>
          <p className="text-amber-700 text-sm">
            Once you select a doctor, you&apos;ll be redirected to the regular doctor portal home page and will see everything as if you were logged in as that doctor. The impersonation persists until you restart the app or click &quot;Stop Impersonation&quot;.
          </p>
        </div>
        
        <div className="space-y-4">
          <label htmlFor="doctor-select" className="block text-sm font-medium text-gray-700">
            Select Doctor:
          </label>
          <select
            id="doctor-select"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">Choose a doctor...</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} - {doctor.specialty} ({doctor.city}, {doctor.state})
              </option>
            ))}
          </select>
          
          <button
            onClick={handleImpersonate}
            disabled={!selectedDoctorId}
            className={`w-full py-3 px-4 rounded-lg font-semibold ${
              selectedDoctorId
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Impersonate Selected Doctor
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Available Doctors</h2>
          <p className="text-sm text-gray-600 mb-4">Click on any doctor card below to instantly impersonate them:</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {doctors.map((doctor) => (
              <div 
                key={doctor.id} 
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => {
                  setImpersonatedDoctorId(doctor.id);
                  router.push('/doctor-portal/home');
                }}
              >
                <div className="flex items-center gap-4">
                  {doctor.picture_url && (
                    <img 
                      src={doctor.picture_url} 
                      alt={doctor.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{doctor.name}</div>
                    <div className="text-sm text-gray-600">
                      {doctor.specialty} • {doctor.city}, {doctor.state}
                    </div>
                    <div className="text-xs text-gray-500">ID: {doctor.id}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 