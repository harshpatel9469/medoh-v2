import Link from 'next/link';
import { UserIcon, HomeIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function PrivateSideBar({ homeHref = '/dashboard', accountHref = '/dashboard/account' }: { homeHref?: string, accountHref?: string }) {
    return (
        <div className="w-64 bg-white h-full p-4 border-r flex flex-col">
            <Link href={homeHref} className="text-4xl font-semibold text-amber-500 mb-8 hover:text-amber-600 transition-colors cursor-pointer">
                medoh
            </Link>
            <nav className="flex-1">
                <ul>
                    <li className="mb-2">
                        <Link href={homeHref} className="flex items-center flex-1 px-2 py-2 rounded hover:bg-gray-100 font-semibold hover:text-amber-600 transition-colors">
                            <HomeIcon className="w-5 h-5 mr-2" /> Home
                        </Link>
                    </li>
                    <li className="mb-2">
                        <Link href={accountHref} className="flex items-center flex-1 px-2 py-2 rounded hover:bg-gray-100 font-semibold hover:text-amber-600 transition-colors">
                            <UserIcon className="w-5 h-5 mr-2" /> Account
                        </Link>
                    </li>
                    <li className="mb-2">
                        <span className="flex items-center flex-1 px-2 py-2 rounded text-gray-400 cursor-not-allowed">
                            <EnvelopeIcon className="w-5 h-5 mr-2" /> Contact (coming soon!)
                        </span>
                    </li>
                </ul>
            </nav>
        </div>
    );
} 