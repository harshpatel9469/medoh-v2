'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import InputField from "@/app/_components/forms/input-field";
import LoadingSpinner from "@/app/_components/loading-spinner";
import { useRouter } from 'next/navigation';
import EmailField from '@/app/_components/forms/email-field';
import PasswordField from '@/app/_components/forms/password-field';

export default function AccountForm({ user: initialUser }: { user: User | null }) {
    const [user, setUser] = useState<User | null>(initialUser);
    const [loading, setLoading] = useState(true)
    const [firstName, setFirstName] = useState<string | null>(null)
    const [lastName, setLastName] = useState<string | null>(null)
    const [zipCode, setZipCode] = useState<string | null>(null)
    const [doctorName, setDoctorName] = useState<string | null>(null);
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    // Client-side fallback: fetch user if not present
    useEffect(() => {
        if (!user) {
            supabase.auth.getUser().then(({ data }) => {
                setUser(data.user);
                if (!data.user) {
                    setLoading(false);
                }
            });
        } else {
            // Check if user is a guest by checking profile details
            const checkGuestStatus = async () => {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('first_name, last_name, zip_code')
                    .eq('id', user.id)
                    .single();

                const isGuest = !profile || !profile.first_name || !profile.last_name || !profile.zip_code;
                if (isGuest) {
                    router.push('/auth/login');
                }
            };
            checkGuestStatus();
        }
    }, [user, router]);

    const getProfile = useCallback(async () => {
        try {
            setLoading(true)

            if (!user) return;

            const { data, error, status } = await supabase
                .from('profiles')
                .select(`first_name, last_name, zip_code, doctor_name`)
                .eq('id', user.id)
                .single()

            if (error && status !== 406) {
                throw error
            }

            if (data) {
                setFirstName(data.first_name)
                setLastName(data.last_name)
                setZipCode(data.zip_code)
                setDoctorName(data.doctor_name)
            }
        } catch (error) {
            alert('Error loading user data!')
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (user) {
            getProfile()
        }
    }, [user, getProfile])

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

            router.push('/dashboard/home');
            router.refresh();
        } catch (error) {
            setMessage('An unexpected error occurred during login');
        } finally {
            setIsSubmitting(false);
        }
    };

    async function updateProfile({
                                     firstName,
                                     lastName,
                                     zipCode,
                                     doctorName,
                                 }: {
        firstName: string | null
        lastName: string | null
        zipCode: string | null
        doctorName: string | null
    }) {
        try {
            setLoading(true)

            if (!user) return;

            const { error } = await supabase.from('profiles').upsert({
                id: user.id as string,
                first_name: firstName,
                last_name: lastName,
                zip_code: zipCode,
                doctor_name: doctorName,
                updated_at: new Date().toISOString(),
            })
            if (error) throw error
            alert('Profile updated!')
        } catch (error) {
            alert('Error updating the data!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            {loading ? (
                <LoadingSpinner />
            ) : !user ? (
                <>
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
                        <a href="#" className="text-4xl font-semibold text-primary-color">
                            medoh
                        </a>
                        <h2 className="mt-10 text-2xl font-bold leading-9 tracking-tight text-gray-900">
                            Sign in to your account
                        </h2>
                    </div>

                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <EmailField setIsEmailValid={setIsEmailValid} />
                            <PasswordField setIsPasswordValid={setIsPasswordValid} />
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
                            <a href="/auth/signup" className="font-semibold leading-6 text-primary-color-dark hover:text-primary-color">
                                Sign up now
                            </a>
                        </div>
                    </div>
                </>
            ) : (
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" action="#" method="PUT">
                        <InputField
                            id="email"
                            name="email"
                            label="Email"
                            type="text"
                            value={user?.email}
                            disabled
                        />
                        <InputField
                            id="firstName"
                            name="firstName"
                            label="First Name"
                            type="text"
                            required
                            value={firstName || ''}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                        <InputField
                            id="lastName"
                            name="lastName"
                            label="Last Name"
                            type="text"
                            required
                            value={lastName || ''}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                        <InputField
                            id="zipCode"
                            name="zipCode"
                            label="Zip Code"
                            type="text"
                            required
                            value={zipCode || ''}
                            onChange={(e) => setZipCode(e.target.value)}
                        />
                        <InputField
                            id="doctorName"
                            name="doctorName"
                            label="Doctor Name"
                            type="text"
                            required
                            value={doctorName || ''}
                            onChange={(e) => setDoctorName(e.target.value)}
                        />

                        <div>
                            <button
                                onClick={() => updateProfile({firstName, lastName, zipCode, doctorName})}
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-primary-color px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-color-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-color-dark"
                            >
                                Update Profile
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}