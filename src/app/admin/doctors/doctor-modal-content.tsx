'use client'
import { useState } from 'react'
import { Doctor } from '@/app/_types';
import { updateDoctor, createDoctor, deleteDoctorById } from '@/app/_api/doctors';

interface DoctorModalContentProps {
    doctor?: Doctor | null,
    confirmText: string,
    onClose: () => void;
    isUpdate: boolean;
    onSuccess?: () => void;
}


export default function DoctorModalContent({ doctor, onClose, isUpdate, confirmText, onSuccess }: DoctorModalContentProps) {
    const [doctorName, setDoctorName] = useState<string>(doctor?.name || '')
    const [bio, setBio] = useState<string>(doctor?.bio || '')
    const [pictureUrl, setPictureUrl] = useState<string>(doctor?.picture_url || '')
    const [specialty, setSpecialty] = useState<string>(doctor?.specialty || '')
    const [city, setCity] = useState<string>(doctor?.city || '')
    const [state, setState] = useState<string>(doctor?.state || '')

    const onConfirm = async () => {
        try {
            if (isUpdate) {
                if (doctor){
                    await updateDoctor(doctorName, bio, pictureUrl, doctor.id, specialty, city, state)
                }
            }
            else {
                await createDoctor(doctorName, bio, pictureUrl, specialty, city, state);
            }
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error saving doctor:', error);
            // You might want to show an error message to the user here
        }
    }

    const onDelete = async () => {
        if (isUpdate) {
            try {
                if (doctor?.id){
                    await deleteDoctorById(doctor.id)
                    onSuccess?.();
                }
                onClose();
            } catch (error) {
                console.error('Error deleting doctor:', error);
                // You might want to show an error message to the user here
            }
        }
    }
    

    return (

        <div className="mt-4">
            <div>
                <div className="mt-4">
                    <label htmlFor="doctor_name" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                        Doctor Name
                    </label>
                    <input
                        id="doctorName"
                        name="doctorName"
                        type="text"
                        value={doctorName || ''}
                        onChange={(e) => setDoctorName(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                    />
                </div>

                <div className="mt-4">
                    <label htmlFor="bio" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                        Bio
                    </label>
                    <textarea
                        id="bio"
                        name="bio"
                        value={bio || ''}
                        onChange={(e) => setBio(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                    />
                </div>

                <div className="mt-4">
                    <label htmlFor="picture_url" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                        Picture Url
                    </label>
                    <input
                        id="pictureUrl"
                        name="pictureUrl"
                        type="text"
                        value={pictureUrl || ''}
                        onChange={(e) => setPictureUrl(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                    />
                </div>

                <div className="mt-4">
                    <label htmlFor="specialty" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                        Specialty
                    </label>
                    <input
                        id="specialty"
                        name="specialty"
                        type="text"
                        value={specialty || ''}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                    />
                </div>

                <div className="mt-4">
                    <label htmlFor="city" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                        City
                    </label>
                    <input
                        id="city"
                        name="city"
                        type="text"
                        value={city || ''}
                        onChange={(e) => setCity(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                    />
                </div>

                <div className="mt-4">
                    <label htmlFor="state" className="mb-1 block text-sm font-medium leading-6 text-gray-900">
                        State
                    </label>
                    <input
                        id="state"
                        name="state"
                        type="text"
                        value={state || ''}
                        onChange={(e) => setState(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-amber-600 sm:text-sm sm:leading-6"
                    />
                </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </button>

                {isUpdate && <button
                    onClick={onDelete}
                    className={`px-4 py-2 rounded-md text-white hover:bg-red-400 bg-red-500`}
                >
                    Delete
                </button>}

                <button
                    disabled={!doctorName}
                    onClick={onConfirm}
                    className={!doctorName? 'px-4 py-2 rounded-md bg-gray-600 text-white' :`px-4 py-2 rounded-md text-white hover:bg-amber-400 bg-amber-500`}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    )
}