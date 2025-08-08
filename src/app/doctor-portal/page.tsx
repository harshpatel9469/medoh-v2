'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DoctorPortalRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/doctor-portal/home');
  }, [router]);
  return null;
} 