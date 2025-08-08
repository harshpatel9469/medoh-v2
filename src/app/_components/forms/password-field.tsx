import React, { useState, ChangeEvent, FocusEvent } from 'react';
import InputField from './input-field';

interface PasswordFieldProps {
    setIsPasswordValid: (isValid: boolean) => void;
    setResetPassword?: (isValid: boolean) => void;
    setValue?: (value: string) => void;
}
export default function PasswordField ({ setIsPasswordValid, setResetPassword, setValue }: PasswordFieldProps) {
    const [passwordError, setPasswordError] = useState('');

    const validatePassword = (password: string) => {
        const pattern = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/;
        if (!pattern.test(password)) {
            setPasswordError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
            setIsPasswordValid(false);
        } else {
            setPasswordError('');
            setIsPasswordValid(true);
        }
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        const {value} = e.target;
        validatePassword(value);
        if (setValue) {
            setValue(value);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                    Password
                </label>
                {setResetPassword &&
                <div className="text-sm" onClick={() => setResetPassword(true)}>
                    <a href="#" className="font-semibold text-primary-color hover:text-primary-color-light">
                        Forgot password?
                    </a>
                </div>
                }
            </div>
            <InputField
                id="password"
                name="password"
                type="password"
                onBlur={handleBlur}
                required
                error={passwordError}
                autoComplete="current-password"
            />
        </div>
    );
};
