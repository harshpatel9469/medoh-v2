'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import { type User } from '@supabase/supabase-js';
import InputField from "@/app/_components/forms/input-field";
import { useRouter, useParams } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const params = useParams();
  const id = params?.id as string;

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setUser(data.user);
      }
      setLoading(false); // Ensure loading is updated
    };
    fetchUser();
  }, []);

  // Fetch profile data
  const getProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const { data, error, status } = await supabase
      .from('profiles')
      .select('first_name, last_name, zip_code, doctor_name')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setZipCode(data.zip_code || '');
      setDoctorName(data.doctor_name || '');
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) getProfile();
  }, [user, getProfile]);

  // Update profile
  const updateProfile = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      zip_code: zipCode || null,
      doctor_name: doctorName || null,
      updated_at: new Date().toISOString(),
    });

    setLoading(false);
    if (error) {
      alert('Error updating profile!');
    } else {
      alert('Profile updated!');
    }
  };

  // If still loading, show spinner
  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  // If no user, redirect or show message
  if (!user) {
    return (
      <div className="text-center p-6">
        <p className="mb-4 text-gray-700 text-lg">
          You need to create an account to view your profile.
        </p>
        <a
          href={`/private-page-patient/${id}/auth/signup`}
          className="inline-block bg-primary-color hover:bg-primary-color-light text-white font-semibold py-2 px-4 rounded"
        >
          Sign Up
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="text-xl font-semibold mb-4 text-center">Profile</h2>
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); updateProfile(); }}>
          <InputField
            id="email"
            name="email"
            label="Email"
            type="text"
            value={user.email}
            disabled
          />
          <InputField
            id="firstName"
            name="firstName"
            label="First Name"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <InputField
            id="lastName"
            name="lastName"
            label="Last Name"
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <InputField
            id="zipCode"
            name="zipCode"
            label="Zip Code"
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
          />
          <InputField
            id="doctorName"
            name="doctorName"
            label="Doctor Name"
            type="text"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
          />

          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-primary-color px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-color-light"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
