import React, { useState } from 'react';
import EmailField from '@/app/_components/forms/email-field';
import PasswordField from '@/app/_components/forms/password-field';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';

interface LoginProps {
  setResetPassword: (term: boolean) => void;
  onSwapToSignUp?: () => void;
  onClose?: () => void;
}

const Login = ({ setResetPassword, onSwapToSignUp, onClose }: LoginProps) => {
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pathname = usePathname() || '/';
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        return;
      }

      if (onClose) {
        onClose();
        window.location.reload();
      } else {
        router.push('/dashboard/home');
        router.refresh();
      }
    } catch (error) {
      setMessage('An unexpected error occurred during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <EmailField setIsEmailValid={setIsEmailValid} />
        <PasswordField setIsPasswordValid={setIsPasswordValid} setResetPassword={setResetPassword} />
        <div>
          <button
            type="submit"
            disabled={(!isEmailValid || !isPasswordValid) || isSubmitting}
            className="mt-[48px] flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm bg-primary-color hover:bg-primary-color-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-color-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
        {message && <div className="mt-2 text-center text-sm text-red-500">{message}</div>}
      </form>

      <div className="mt-10 text-center text-sm text-gray-500">
        Not a member?{' '}
        {onSwapToSignUp ? (
          <button
            type="button"
            onClick={onSwapToSignUp}
            className="font-semibold leading-6 text-primary-color-dark hover:text-primary-color"
          >
            Sign up now
          </button>
        ) : (

          <a
            href="/auth/auth/signup"
            className="font-semibold leading-6 text-primary-color-dark hover:text-primary-color"
          >

            Sign up now
          </a>
        )}
      </div>
    </div>
  );
};

export default Login;
