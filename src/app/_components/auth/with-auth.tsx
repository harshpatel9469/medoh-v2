'use client';

import { useEffect, useState } from 'react';
import LoginModal from '@/app/_components/overlays/login-modal';
import SignUpModal from '@/app/_components/overlays/sign-up-modal';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/_contexts/auth-context';

export default function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuthComponent(props: P) {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);
    const pathname = usePathname();
    const { user, loading } = useAuth();

    // COMMENTED OUT: Authentication enforcement logic
    // useEffect(() => {
    //   // Only show login modal if user is not authenticated and not loading
    //   if (!loading && !user) {
    //     setIsLoginOpen(true);
    //   }
    // }, [user, loading]);

    const handleSwapToSignUp = () => {
      setIsLoginOpen(false);
      setIsSignUpOpen(true);
    };

    const handleSwapToLogin = () => {
      setIsSignUpOpen(false);
      setIsLoginOpen(true);
    };

    // COMMENTED OUT: Loading state while checking authentication
    // if (loading) {
    //   return (
    //     <div className="flex items-center justify-center min-h-screen">
    //       <div className="text-center">
    //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-color mx-auto"></div>
    //         <p className="mt-4 text-gray-600">Loading...</p>
    //       </div>
    //     </div>
    //   );
    // }

    return (
      <div className={!user ? 'relative' : ''}>
        {/* COMMENTED OUT: Show the wrapped component with blur effect if not authenticated */}
        {/* <div className={!user ? 'filter blur-sm pointer-events-none' : ''}> */}
        <div>
          <WrappedComponent {...props} />
        </div>

        {/* COMMENTED OUT: Show login/signup modals if not authenticated */}
        {/* {!user && (
          <>
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <LoginModal
              isOpen={isLoginOpen}
              onClose={() => setIsLoginOpen(false)}
              onSwapToSignUp={handleSwapToSignUp}
            />
            <SignUpModal
              isOpen={isSignUpOpen}
              onClose={() => setIsSignUpOpen(false)}
              onSwapToLogin={handleSwapToLogin}
              redirectUrl={pathname}
            />
          </>
        )} */}
      </div>
    );
  };
} 