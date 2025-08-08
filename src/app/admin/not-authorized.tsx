import React from 'react';

export default function NotAuthorized() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-red-600">Not Authorized</h1>
                <p className="mt-4 text-gray-600">You do not have permission to view this page.</p>
            </div>
        </div>
    );
}