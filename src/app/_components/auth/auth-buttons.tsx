'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoginModal from '@/app/_components/overlays/login-modal';
import SignUpModal from '@/app/_components/overlays/sign-up-modal';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/_contexts/auth-context';

interface AuthButtonsProps {
  redirectUrl?: string;
}

export default function AuthButtons({ redirectUrl }: AuthButtonsProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Only show login modal if user is not authenticated and not loading
    if (!loading && !user) {
      setIsLoginOpen(true);
    }
  }, [user, loading]);

  const handleSwapToSignUp = () => {
    setIsLoginOpen(false);
    setIsSignUpOpen(true);
  };

  const handleSwapToLogin = () => {
    setIsSignUpOpen(false);
    setIsLoginOpen(true);
  };

  const handleLoginClick = () => {
    setIsLoginOpen(true);
  };

  const handleSignUpClick = () => {
    setIsSignUpOpen(true);
  };

  // Don't render anything if user is authenticated or still loading
  if (loading || user) {
    return null;
  }

  return (
    <>
      <div className="w-full lg:w-2/3 p-4 flex flex-col items-center bg-white border-2 border-white shadow-md rounded-xl">
        <p className='text-2xl'>Please Login or Create Account to view video</p>
        <button 
          onClick={handleLoginClick}
          className='mt-[48px] flex w-1/2 justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-color-dark bg-primary-color hover:bg-primary-color-light'
        >
          Login
        </button>
        <button 
          onClick={handleSignUpClick}
          className='mt-6 flex w-1/2 justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-color-dark bg-primary-color hover:bg-primary-color-light'
        >
          Sign Up
        </button>
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwapToSignUp={handleSwapToSignUp}
      />
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSwapToLogin={handleSwapToLogin}
        redirectUrl={redirectUrl || pathname}
      />
    </>
  );
} 