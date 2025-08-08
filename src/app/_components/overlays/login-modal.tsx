'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import Login from '@/app/auth/login/login';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwapToSignUp: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwapToSignUp }: Props) {
  const [resetPassword, setResetPassword] = useState(false);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
          <Dialog.Title className="text-xl font-semibold text-center text-primary-color mb-4">
            medoh
          </Dialog.Title>
          <h2 className="text-lg font-bold mb-6 text-center text-gray-900">
            {resetPassword ? 'Reset your password' : 'Sign in to your account'}
          </h2>
          {resetPassword ? (
            <p className="text-center">Reset password form goes here</p> // You can insert <ResetPassword /> here too
          ) : (
            <Login 
              setResetPassword={setResetPassword} 
              onSwapToSignUp={onSwapToSignUp}
              onClose={onClose}
            />
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
