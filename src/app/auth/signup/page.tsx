'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/app/_contexts/auth-context';
import { User } from '@supabase/supabase-js';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName,
            last_name: lastName,
            zip_code: zipCode,
            doctor_name: doctorName,
          },
        },
      });

      if (error) throw error;

      if (data?.user) {
        setUser(data.user as User);
        router.push('/dashboard/home');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-gradient-to-b from-gray-100 to-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <a href="/" className="text-4xl font-semibold text-primary-color">
          medoh
        </a>
        <h2 className="mt-10 text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Create an Account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email address" id="email" type="email" value={email} setValue={setEmail} />
          <Input label="Password" id="password" type="password" value={password} setValue={setPassword} />
          <Input label="First Name" id="firstName" type="text" value={firstName} setValue={setFirstName} />
          <Input label="Last Name" id="lastName" type="text" value={lastName} setValue={setLastName} />
          <Input label="Zip Code" id="zipCode" type="text" value={zipCode} setValue={setZipCode} />
          <Input label="Doctor Name" id="doctorName" type="text" value={doctorName} setValue={setDoctorName} />

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-color hover:bg-primary-color-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div className="mt-10 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/auth/login" className="font-semibold leading-6 text-primary-color-dark hover:text-primary-color">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  id,
  type,
  value,
  setValue,
}: {
  label: string;
  id: string;
  type: string;
  value: string;
  setValue: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-color focus:ring-primary-color"
      />
    </div>
  );
}
