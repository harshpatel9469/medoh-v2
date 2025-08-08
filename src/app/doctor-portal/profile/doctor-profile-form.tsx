'use client'
import React, { useEffect, useState } from 'react';
import { fetchDoctorById, updateDoctor } from '../../_api/doctors';
import { CheckCircleIcon, ExclamationCircleIcon, UserIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function DoctorProfileForm({ 
  doctorId, 
  onProfileUpdate 
}: { 
  doctorId: string;
  onProfileUpdate?: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [pictureUrl, setPictureUrl] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    async function loadDoctor() {
      setLoading(true);
      try {
        const doctor = await fetchDoctorById(doctorId);
        setName(doctor.name || '');
        setSpecialty(doctor.specialty || '');
        setBio(doctor.bio || '');
        setPictureUrl(doctor.picture_url || '');
        setCity(doctor.city || '');
        setState(doctor.state || '');
        setImageError(false);
      } catch (e) {
        setMessage({ type: 'error', text: 'Error loading doctor profile' });
      } finally {
        setLoading(false);
      }
    }
    if (doctorId) loadDoctor();
  }, [doctorId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    
    try {
      await updateDoctor(name, bio, pictureUrl, doctorId, specialty, city, state);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // Refresh the parent component's doctor data
      if (onProfileUpdate) {
        await onProfileUpdate();
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Error updating profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Success/Error Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
          ) : (
            <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
          )}
          <span className={`font-medium ${
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message.text}
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Name & Specialty Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label htmlFor="specialty" className="block text-sm font-semibold text-gray-700 mb-2">
              Specialty *
            </label>
            <input
              id="specialty"
              name="specialty"
              type="text"
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500"
              placeholder="e.g., Orthopedic Surgeon"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500 resize-none"
            placeholder="Tell patients about your background, experience, and approach to care..."
          />
        </div>



        {/* City & State Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500"
              placeholder="Enter your city"
            />
          </div>
          
          <div>
            <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
              State
            </label>
            <input
              id="state"
              name="state"
              type="text"
              value={state}
              onChange={e => setState(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-500"
              placeholder="e.g., CA"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6">
          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg disabled:shadow-none"
          >
            {saving ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving Profile...</span>
              </div>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 