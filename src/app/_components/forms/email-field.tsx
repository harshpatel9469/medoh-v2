import React, { useState, ChangeEvent, FocusEvent } from 'react';
import InputField from './input-field';

interface EmailFieldProps {
    value?: string;
    setIsEmailValid: (isValid: boolean) => void;
}
export default function EmailField({ setIsEmailValid }: EmailFieldProps) {
    const [emailError, setEmailError] = useState('');
    const [isTouched, setIsTouched] = useState(false);

    const validateEmail = (email: string) => {
        const pattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!pattern.test(email)) {
            setEmailError('Please enter a valid email address.');
            setIsEmailValid(false);
        } else {
            setEmailError('');
            setIsEmailValid(true);
        }
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        const { value } = e.target;
        validateEmail(value);
    };

    return (
        <InputField
            id="email"
            name="email"
            type="email"
            label="Email address"
            onBlur={handleBlur}
            required
            error={emailError}
        />
    );
};

