'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/_contexts/auth-context';
import { loginUser } from '@/app/_api/auth/logger'; // Import the server function
import { supabase } from '@/utils/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
  
    try {
      // 1. Extract private page ID from the pathname
      const pathname = window.location.pathname;
      const match = pathname.match(/private-page-patient\/([^/]+)/);
      const privatePageId = match?.[1];
  
      if (!privatePageId) throw new Error('Private page ID not found in URL.');
  
      // 2. Fetch expected patient email
      const { data: privatePage, error: pageError } = await supabase
        .from('private_pages')
        .select('patient_email')
        .eq('id', privatePageId)
        .single();
  
      if (pageError || !privatePage?.patient_email) {
        throw new Error('Private page not found or patient email not configured.');
      }
  
      // 3. Validate email
      if (email.toLowerCase() !== privatePage.patient_email.toLowerCase()) {
        setError("This email doesn't match the one associated with this private page.");
        setLoading(false);
        return;
      }
  
      // 4. Client-side login
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
  
      // 5. Store session in localStorage
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData.session));
      }
  
      // 6. Server-side login for auth cookies
      const user = await loginUser(email, password);
  
      // 7. Update context
      setUser(user);
  
      // 8. Redirect to profile page
      router.push(`../profiles`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-color focus:ring-primary-color"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-color focus:ring-primary-color"
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-color hover:bg-primary-color-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-color"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="text-center mt-4 text-sm">
        Don’t have an account?{' '}
        <Link href="../auth/signup" className="text-primary-color hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
