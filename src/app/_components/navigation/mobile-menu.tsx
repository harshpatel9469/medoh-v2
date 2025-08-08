'use client'
import { useEffect, useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/utils/supabase/server'

const navigation = [
    { name: 'Contact Us', href: '#contact-us' },
]

export interface MobileMenuProps{
    user: any
};

export default function MobileMenu({user} : MobileMenuProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);    

    return (
        <>
            <div className="flex lg:hidden">
                <button
                    type="button"
                    className="-m-2.5 inline-flex items-center justify-center rounded-md p-3 text-gray-700 hover:text-primary-color hover:bg-gray-50 transition-colors"
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <span className="sr-only">Open main menu</span>
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                </button>
            </div>
            <Dialog className="lg:hidden" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
                <div className="fixed inset-0 z-50 bg-black/20" />
                <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                    <div className="flex items-center justify-between mb-8">
                        <a href="#" className="text-2xl sm:text-3xl font-semibold text-primary-color">
                            medoh
                        </a>
                        <button
                            type="button"
                            className="-m-2.5 rounded-md p-3 text-gray-700 hover:text-primary-color hover:bg-gray-50 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="sr-only">Close menu</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="mt-6 flow-root">
                        <div className="-my-6 divide-y divide-gray-200">
                            <div className="space-y-3 py-6">
                                {navigation.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className="-mx-3 block rounded-lg px-4 py-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 hover:text-primary-color transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </a>
                                ))}

                                <a 
                                    href='/dashboard/home'
                                    className="-mx-3 block rounded-lg px-4 py-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 hover:text-primary-color transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Get Started
                                </a>
                            </div>
                            <div className="py-6">
                                {user ? (
                                    <div className="space-y-3">
                                        <a
                                    href="/dashboard/home"
                                            className="-mx-3 block rounded-lg px-4 py-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 hover:text-primary-color transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                >
                                    Home
                                        </a>
                                        <a
                                            href="/dashboard/account"
                                            className="-mx-3 block rounded-lg px-4 py-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 hover:text-primary-color transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Account
                                        </a>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <a
                                    href="/auth/login"
                                            className="-mx-3 block rounded-lg px-4 py-3 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 hover:text-primary-color transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                >
                                    Log In
                                        </a>
                                        <a
                                            href="/auth/signup"
                                            className="-mx-3 block rounded-lg px-4 py-3 text-base font-semibold leading-7 bg-primary-color text-white hover:bg-primary-color-light transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Sign Up
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogPanel>
            </Dialog>
        </>
    )
}
