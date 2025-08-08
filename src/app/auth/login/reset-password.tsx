import React, { useState } from 'react';
import { sendPasswordResetEmail } from '../actions';
import EmailField from "@/app/_components/forms/email-field";

interface SearchBarProps {
    setResetPassword: (term: boolean) => void;
}
const ResetPassword = ({ setResetPassword }: SearchBarProps) => {
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(event.target);

        const result = await sendPasswordResetEmail(formData);
        setMessage(result.message);
        setIsSubmitting(false);
    };

    return (
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={handleSubmit} method="POST">
                <EmailField setIsEmailValid={setIsEmailValid} />
                <div>
                    <button
                        type="submit"
                        disabled={!isEmailValid || isSubmitting}
                        className={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                                  isSubmitting ?
                                 'bg-gray-300 cursor-not-allowed' :
                                 'bg-primary-color hover:bg-primary-color-light focus-visible:outline-primary-color-dark'
                        }`}
                    >
                        Reset password
                    </button>
                </div>
                {message && <div className="mt-2 text-center text-sm text-gray-500">{message}</div>}
            </form>
            <div className="mt-10 text-center text-sm text-gray-500">
                <div
                    onClick={() => setResetPassword(false)}
                    className="font-semibold leading-6 text-primary-color-dark hover:text-primary-color cursor-pointer"
                >
                    Back to login
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;