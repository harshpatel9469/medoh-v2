'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/app/_contexts/auth-context';
import { loginUser } from '@/app/_api/auth/logger';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
  
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('First name, Last name, Email, Password, and Confirm Password are required.');
      return;
    }
  
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
  
    setLoading(true);
    try {
      // 1. Extract private page ID from URL
      const pathname = window.location.pathname;
      const match = pathname.match(/private-page-patient\/([^/]+)/);
      const privatePageId = match?.[1];
  
      if (!privatePageId) throw new Error('Private page ID not found in URL.');
  
      // 2. Fetch allowed patient email
      const { data: privatePage, error: pageError } = await supabase
        .from('private_pages')
        .select('patient_email')
        .eq('id', privatePageId)
        .single();
  
      if (pageError || !privatePage?.patient_email) {
        throw new Error('Private page not found or email not configured.');
      }
  
      // 3. Validate email
      if (email.toLowerCase() !== privatePage.patient_email.toLowerCase()) {
        setError("The email you entered doesn't match the one associated with this private page.");
        setLoading(false);
        return;
      }
  
      // 4. Proceed with signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            zip_code: zipCode || null,
            doctor_name: doctorName || null,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
  
      if (error) throw error;
  
      // 5. Insert profile
      if (data?.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          zip_code: zipCode || null,
          doctor_name: doctorName || null,
        });
  
        if (profileError) throw profileError;
  
        // 6. Log in and redirect to profile
        await loginUser(email, password);
        const { data: sessionData } = await supabase.auth.signInWithPassword({ email, password });
  
        if (sessionData?.user) {
          setUser(sessionData.user);
          router.push(`../profiles`);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="max-w-md mx-auto p-6 border border-gray-200 rounded-md shadow-sm bg-white">
      <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-color"
          />
        </div>

        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-color"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-color"
          />
        </div>

        {/* Zip Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-color"
          />
        </div>

        {/* Doctor Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
          <input
            type="text"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-color"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-color"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password*</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-color"
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-md bg-primary-color text-white hover:bg-primary-color-light transition"
        >
          {loading ? 'Signing up...' : 'Sign up'}
        </button>

        {/* Already have account link */}
        <div className="text-center text-sm mt-3">
          Already have an account?{' '}
          <Link href="../auth/login" className="text-primary-color hover:underline">
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
}
