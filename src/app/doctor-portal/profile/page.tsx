'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { fetchDoctorById } from '../../_api/doctors';
import { useAuth } from '../../_contexts/auth-context';
import DoctorProfileForm from './doctor-profile-form';
import { UserIcon, Cog6ToothIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import ProfilePictureUpload from '../../_components/profile-picture-upload';

export default function DoctorProfilePage() {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { impersonatedDoctorId, isImpersonating, setImpersonatedDoctorId } = useAuth();

  const refreshDoctorData = async () => {
    if (!doctorId) return;
    try {
      const updatedDoctor = await fetchDoctorById(doctorId);
      setDoctor(updatedDoctor);
      setProfileImageError(false);
    } catch (e) {
      console.error('Error refreshing doctor data:', e);
    }
  };

  const handleUploadSuccess = async (newImageUrl: string) => {
    setUploadMessage({ type: 'success', text: 'Profile picture updated successfully!' });
    // Clear any old image errors first
    setProfileImageError(false);
    // Update the doctor state immediately for instant UI feedback
    setDoctor((prev: any) => ({ ...prev, picture_url: newImageUrl }));
    
    // Force a refresh of doctor data from database to ensure sync
    await refreshDoctorData();
    
    // Clear success message after 3 seconds
    setTimeout(() => setUploadMessage(null), 3000);
  };

  const handleUploadError = (error: string) => {
    setUploadMessage({ type: 'error', text: error });
    
    // Clear error message after 5 seconds
    setTimeout(() => setUploadMessage(null), 5000);
  };

  useEffect(() => {
    async function loadDoctorId() {
      setLoading(true);
      setError(null);
      try {
        // If there's an impersonated doctor ID, use that directly (admin acting as doctor)
        if (impersonatedDoctorId) {
          console.log('Profile page using impersonated doctor ID:', impersonatedDoctorId);
          const impersonatedDoctor = await fetchDoctorById(impersonatedDoctorId);
          if (impersonatedDoctor) {
            setDoctorId(impersonatedDoctor.id);
            setDoctor(impersonatedDoctor);
            setProfileImageError(false);
            setIsAdmin(true); // Still show admin controls
            setLoading(false);
            return;
          } else {
            setError('Impersonated doctor not found.');
            setLoading(false);
            return;
          }
        }

        // Normal authentication flow
        const supabase = createClientComponentClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Not logged in.');
          setLoading(false);
          return;
        }

        // Check if user is admin
        const userIsAdmin = user.email === 'mpyne@medohhealth.com' || user.app_metadata?.userrole === 'ADMIN';
        if (userIsAdmin) {
          setIsAdmin(true);
        }

        const { data: doctor, error: doctorError } = await supabase
          .from('doctors')
          .select('id, name, picture_url, specialty')
          .eq('user_id', user.id)
          .single();
        if (doctorError || !doctor) {
          // If it's an admin and no doctor profile, show admin interface
          if (userIsAdmin) {
            setError('No doctor profile found. Please impersonate a doctor first.');
            setLoading(false);
            return;
          }
          setError('No doctor profile found for this user.');
          setLoading(false);
          return;
        }
        setDoctorId(doctor.id);
        setDoctor(doctor);
        setProfileImageError(false);
      } catch (e) {
        setError('Failed to load doctor info.');
        setLoading(false);
      }
      setLoading(false);
    }
    loadDoctorId();
  }, [impersonatedDoctorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <UserIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <div className="text-red-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!doctorId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-600">No doctor profile found.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Admin Banner */}
        {isAdmin && isImpersonating && (
          <div className="bg-amber-600 text-white rounded-2xl p-4 mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Cog6ToothIcon className="h-6 w-6" />
                <div>
                  <h2 className="font-semibold">
                    Admin Mode - Editing Impersonated Doctor Profile
                  </h2>
                  <p className="text-amber-100 text-sm">
                    You are editing the profile as the impersonated doctor. Changes will persist.
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <a href="/admin/doctors">
                  <button className="bg-white text-amber-600 font-medium rounded-lg px-4 py-2 text-sm hover:bg-amber-50 transition-colors">
                    Switch Doctor
                  </button>
                </a>
                <button 
                  onClick={() => setImpersonatedDoctorId(null)}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
                >
                  Stop
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="text-center">
            {/* Profile Picture Upload */}
            <div className="mb-6">
              <ProfilePictureUpload
                currentImageUrl={doctor?.picture_url}
                doctorId={doctorId || ''}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                size="large"
              />
            </div>
            
            {/* Doctor Information */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900">
                {doctor?.name || 'Profile Settings'}
              </h1>
              {doctor?.specialty && (
                <p className="text-xl text-orange-600 font-medium">
                  {doctor.specialty}
                </p>
              )}
              <p className="text-lg text-gray-600">
                Manage your doctor profile information
              </p>
            </div>
          </div>
        </div>

        {/* Upload Status Message */}
        {uploadMessage && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
            uploadMessage.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {uploadMessage.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            ) : (
              <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
            )}
            <span className={`font-medium ${
              uploadMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {uploadMessage.text}
            </span>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <DoctorProfileForm doctorId={doctorId} onProfileUpdate={refreshDoctorData} />
        </div>
      </div>
    </div>
  );
} 