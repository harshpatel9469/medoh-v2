'use client';
import { useState } from 'react';
import { resetPassword } from '../actions'
import PasswordField from "@/app/_components/forms/password-field";
import EmailField from "@/app/_components/forms/email-field";


export default function ResetPassword() {
    const [isFormValid, setIsFormValid] = useState(false);
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(event.target);
        await resetPassword(formData);
        setIsSubmitting(false);
    };

    const noMatch = (!!password1 && !!password2) && password1 !== password2;
    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
                <a href="#" className="text-4xl font-semibold text-primary-color">
                    medoh
                </a>
                <h2 className="mt-10 text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Reset your password
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit} method="POST">
                    <PasswordField setIsPasswordValid={setIsFormValid} setValue={setPassword1} />
                    <PasswordField setIsPasswordValid={setIsFormValid} setValue={setPassword2}/>
                    <div>
                        <button
                            type="submit"
                            disabled={(!isFormValid && noMatch) || isSubmitting}
                            className={'mt-[48px] flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-color-dark bg-primary-color hover:bg-primary-color-light'}
                        >
                            Reset password
                        </button>
                    </div>
                    {noMatch && <div className="mt-2 text-center text-sm text-red-500">Passwords do not match.</div>}
                </form>

                <p className="mt-10 text-center text-sm text-gray-500">
                    Not a member?{' '}
                    <a href="/auth/signup" className="font-semibold leading-6 text-primary-color-dark hover:text-primary-color">
                        Sign up now
                    </a>
                </p>
            </div>
        </div>
    );
}
