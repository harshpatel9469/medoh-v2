'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Home', path: 'topics' },
  { name: 'Documents', path: 'documents' },
  { name: 'Messages', path: 'messages' },
  { name: 'AI Chat', path: 'ai-chat' },
  { name: 'Profile', path: 'profiles' },
];

export default function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const { id } = params;
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="bg-gradient-to-r from-[#1a0e00] to-[#cc5a00] shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-2">
          {/* Logo */}
          <Link
            href="/"
            className="text-white text-lg sm:text-xl font-bold tracking-tight whitespace-nowrap"
          >
            medoh
          </Link>

          {/* Nav Items (Scrollable on mobile, Centered on desktop) */}
          <div className="flex-1 sm:flex sm:justify-center overflow-x-auto sm:overflow-visible">
            <div className="flex gap-2 sm:gap-4 whitespace-nowrap px-2">
              {navItems.map(({ name, path }) => {
                const href = `/private-page-patient/${id}/${path}`;
                const isActive = pathname === href;

                return (
                  <Link
                    key={name}
                    href={href}
                    className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-black text-white shadow-sm'
                        : 'text-white/70 hover:bg-black/30 hover:text-white'
                    }`}
                  >
                    {name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Placeholder for alignment */}
          <div className="w-10 sm:w-16" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 bg-gray-50 p-4 sm:p-6">{children}</main>
    </div>
  );
}
