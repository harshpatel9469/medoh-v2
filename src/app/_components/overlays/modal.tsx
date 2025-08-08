import React from 'react';

interface ModalProps {
    title: string;
    description: string;
    onClose: () => void;
    confirmText: string;
    children?: React.ReactNode;
}

export default function Modal({ title, description, onClose,  confirmText, children }: ModalProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/3 p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
                        &times;
                    </button>
                </div>
                <div className="mt-4">
                    <p className="text-gray-600">{description}</p>
                    <div className="mt-4">
                        {children}
                    </div>
                </div>
                
            </div>
        </div>
    );
};
