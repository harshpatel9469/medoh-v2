import React, { ChangeEvent, FocusEvent, useState }  from 'react';

interface InputFieldProps {
    id: string;
    name: string;
    type?: string;
    label?: string;
    value?: string | number;
    disabled?: boolean;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
    required?: boolean;
    error?: string;
    autoComplete?: string;
    setIsFieldValid?: (isValid: boolean) => void;
}
export default function InputField({
    id,
    name,
    type = 'text',
    label,
    value,
    onChange,
    onBlur,
    required,
    error,
    setIsFieldValid,
    disabled,
    ...props
}: InputFieldProps) {
    const [showError, setShowError] = useState(false);

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        if (!!onBlur) {
            onBlur(e);
        } else if (required && e.target.value === '') {
            setShowError(true);
            if (setIsFieldValid) setIsFieldValid(false);
        } else {
            setShowError(false);
            if (setIsFieldValid) setIsFieldValid(true);
        }
    };

    return (
        <div>
            {label &&
            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                {label}
            </label>
            }
            <div className="relative">
                <input
                    id={id}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onBlur={handleBlur}
                    required={required}
                    disabled={disabled}
                    className="block w-full rounded-lg border-0 py-3 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-color-dark text-base sm:text-sm leading-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    {...props}
                />
                {(error || showError) && (
                    <p className="absolute text-sm text-red-600 mt-1">
                        {error || 'This field is required.'}
                    </p>
                )}
            </div>
        </div>
    );
};
