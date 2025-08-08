"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import Link from 'next/link';

export default function VideoAccessMessage() {
  const [user, setUser] = useState<any>(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  if (user === undefined) {
    return null; // or a loading spinner
  }

  if (!user) {
    return (
      <div className="w-full lg:w-2/3 p-4 flex flex-col items-center bg-white border-2 border-white shadow-md rounded-xl">
        <p className='text-2xl'>Please Login or Create Account to view video</p>
        <Link href='/auth/login' className='mt-[48px] flex w-1/2 justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-color-dark bg-primary-color hover:bg-primary-color-light'>Login</Link>
        <Link href='/auth/signup' className='mt-6 flex w-1/2 justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-color-dark bg-primary-color hover:bg-primary-color-light'>Sign Up</Link>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-2/3 p-4 flex flex-col items-center bg-white border-2 border-white shadow-md rounded-xl">
      <p className='text-2xl'>No video is available for this question yet.</p>
    </div>
  );
} 