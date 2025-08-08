'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';
import NotAuthorized from './not-authorized';
import SideBar from "./side-bar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<null | boolean>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (
        user?.app_metadata?.userrole === 'ADMIN' ||
        user?.email === 'mpyne@medohhealth.com'
      ) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
  }, []);

  if (isAdmin === null) return null; // or a loading spinner
  if (!isAdmin) return <NotAuthorized />;

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideBar />
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}