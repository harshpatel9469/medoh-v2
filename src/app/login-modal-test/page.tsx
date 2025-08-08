// src/app/login-modal-test/page.tsx
'use client';

import { useState } from 'react';
import LoginModal from '@/app/_components/overlays/login-modal';
import SignUpModal from '@/app/_components/overlays/sign-up-modal';

export default function LoginModalTestPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const handleSwapToSignUp = () => {
    setIsLoginOpen(false);
    setIsSignUpOpen(true);
  };

  const handleSwapToLogin = () => {
    setIsSignUpOpen(false);
    setIsLoginOpen(true);
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Login Modal Test Page</h1>
      <button
        className="px-4 py-2 bg-primary-color text-white rounded hover:bg-primary-color-light mr-4"
        onClick={() => setIsLoginOpen(true)}
      >
        Open Login Modal
      </button>
      <button
        className="px-4 py-2 bg-secondary-color text-white rounded hover:bg-secondary-color-light"
        onClick={() => setIsSignUpOpen(true)}
      >
        Open Sign Up Modal
      </button>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onSwapToSignUp={handleSwapToSignUp}
      />
      <SignUpModal 
        isOpen={isSignUpOpen} 
        onClose={() => setIsSignUpOpen(false)}
        onSwapToLogin={handleSwapToLogin}
      />
    </div>
  );
}
