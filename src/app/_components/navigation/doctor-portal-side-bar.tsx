'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  HomeIcon, 
  UserIcon, 
  DocumentTextIcon, 
  GlobeAltIcon, 
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/doctor-portal/home', icon: HomeIcon },
  { name: 'Profile', href: '/doctor-portal/profile', icon: UserIcon },
  { name: 'My Pages', href: '/doctor-portal/my-pages', icon: DocumentTextIcon },
  { name: 'Patient Pages', href: '/doctor-portal/patient-pages', icon: ClipboardDocumentListIcon },
  { name: 'Public Content', href: '/doctor-portal/public-content', icon: GlobeAltIcon },
  { name: 'SMS Distribution', href: '/doctor-portal/sms', icon: ChatBubbleLeftRightIcon },
];

export default function DoctorPortalSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="relative">
      {/* Floating Sidebar */}
      <div
        className={`fixed left-2 top-1/2 transform -translate-y-1/2 z-50 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 transition-all duration-300 ${
          isCollapsed ? 'w-10' : 'w-42'
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-7 h-7 bg-white/95 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center hover:bg-white/90 transition-colors"
        >
          <Bars3Icon className="h-3.5 w-3.5 text-gray-600" />
        </button>

        {/* Header */}
        <div className={`bg-gradient-to-r from-orange-500 to-orange-600 text-white ${isCollapsed ? 'h-12' : 'h-14'} ${isCollapsed ? 'rounded-t-3xl rounded-b-none' : 'rounded-t-3xl'} flex items-center justify-center px-3 shadow-lg`}>
          {!isCollapsed && (
            <span className="text-sm font-bold whitespace-nowrap">Doctor Portal</span>
          )}
        </div>

        {/* Navigation */}
        <nav className={`${isCollapsed ? 'p-1' : 'p-3'} space-y-1 rounded-b-3xl`}>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center ${isCollapsed ? 'px-1.5 py-2' : 'px-3 py-2.5'} text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <item.icon
                  className={`${isCollapsed ? 'h-4 w-4' : 'h-5 w-5'} ${
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-orange-500'
                  } transition-colors`}
                  aria-hidden="true"
                />
                {!isCollapsed && (
                  <span className="ml-2 whitespace-nowrap">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 