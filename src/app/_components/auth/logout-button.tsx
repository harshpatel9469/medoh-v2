'use client';

import { supabase } from '@/utils/supabase/client';
import { useAuth } from '@/app/_contexts/auth-context';

export default function LogoutButton() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (!user) {
    return null;
  }

  return (
    <button
      onClick={handleLogout}
      className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
    >
      Logout (Test)
    </button>
  );
} 