'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { fetchDoctorById } from '../../../_api/doctors';
import { useAuth } from '../../../_contexts/auth-context';
import { useRouter } from 'next/navigation';
import type { Doctor } from '../../../_types/doctor';

export default function AdminImpersonateIdPage({ params }: { params: { id: string } }) {
  const doctorId = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const { setImpersonatedDoctorId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function setupImpersonation() {
      setLoading(true);
      try {
        const supabase = createClientComponentClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setError('Not logged in.');
          setLoading(false);
          return;
        }

        // Check if user is admi
        if (user.email !== 'mpyne@medohhealth.com' && user.app_metadata?.userrole !== 'ADMIN') {
          setError('Access denied. Admin privileges required.');
          setLoading(false);
          return;
        }

        // Fetch the doctor to verify they exist
        const doctorData = await fetchDoctorById(doctorId);
        if (!doctorData) {
          setError('Doctor not found.');
          setLoading(false);
          return;
        }

        setDoctor(doctorData);
        
        // Set up impersonation
        setImpersonatedDoctorId(doctorId);
        
        // Redirect to doctor portal home after brief delay to show confirmation
        setTimeout(() => {
          router.push('/doctor-portal/home');
        }, 2000);
        
      } catch (e) {
        setError('Failed to setup impersonation.');
        console.error('Error:', e);
      } finally {
        setLoading(false);
      }
    }
    setupImpersonation();
  }, [doctorId, setImpersonatedDoctorId, router]);

  if (loading) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900">Setting up impersonation...</h1>
          <p className="text-gray-600 mt-2">Please wait while we configure your admin session.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-red-600 mb-2">Impersonation Failed</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <a href="/admin/doctors">
              <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg px-6 py-2">
                Back to Doctor Selection
              </button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-green-600 mb-2">Impersonation Active</h1>
          <p className="text-gray-600 mb-4">
            You are now impersonating <strong>{doctor?.name}</strong>
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4">
              {doctor?.picture_url && (
                <img 
                  src={doctor.picture_url} 
                  alt={doctor.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div className="text-left">
                <div className="font-medium text-gray-900">{doctor?.name}</div>
                <div className="text-sm text-gray-600">{doctor?.specialty}</div>
                <div className="text-sm text-gray-600">{doctor?.city}, {doctor?.state}</div>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Redirecting to doctor portal... This impersonation will persist until you restart the application.
          </p>
          <div className="space-y-2">
            <a href="/doctor-portal/home">
              <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg px-6 py-2">
                Go to Doctor Portal Now
              </button>
            </a>
            <button 
              onClick={() => {
                setImpersonatedDoctorId(null);
                router.push('/admin/doctors');
              }}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg px-6 py-2"
            >
              Stop Impersonation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 