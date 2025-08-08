'use client';
import { useState } from 'react';
import ResetPassword from './reset-password';
import Login from './login';

export default function LoginPage() {
    const [resetPassword, setResetPassword] = useState(false);

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
                <a href="#" className="text-4xl font-semibold text-primary-color">
                    medoh
                </a>
                <h2 className="mt-10 text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    {resetPassword ? 'Reset your password' : 'Sign in to your account'}
                </h2>
            </div>

            {resetPassword ?
                <ResetPassword setResetPassword={setResetPassword} /> :
                <Login setResetPassword={setResetPassword} />
            }
        </div>
    );
}
