'use client'
import {
    HomeIcon,
    UsersIcon,
    FolderIcon,
    PlayIcon,
    ArrowLeftEndOnRectangleIcon,
    FolderOpenIcon,
    CogIcon,
} from '@heroicons/react/24/outline'
import NavLink from '@/app/_components/navigation/nav-link'

const navigation = [
    { name: 'Questions', href: '/admin/questions', icon: HomeIcon, current: false },
    { name: 'Topics', href: '/admin/topics', icon: FolderIcon, current: false },
    { name: 'Doctors', href: '/admin/doctors', icon: UsersIcon, current: false },
    { name: 'Doctor Portal Test', href: '/admin/doctor-portal-test', icon: CogIcon, current: false },
    { name: 'DetailedTopics', href: '/admin/treatments', icon: FolderOpenIcon, current: false },
    { name: 'Body Parts', href: '/admin/body-parts', icon: FolderOpenIcon, current: false },
]

export default function SideBar() {
    return (
            <div>
                <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
                        <div className="flex h-16 shrink-0 items-center">
                            <a href="#" className="text-4xl font-semibold text-amber-500">
                                medoh
                            </a>
                        </div>
                        <nav className="flex flex-1 flex-col">
                            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                <li>
                                    <ul role="list" className="-mx-2 space-y-1">
                                        {navigation.map((item) => (
                                            <li key={item.name}>
                                                <NavLink href={item.href} name={item.name} Icon={item.icon}/>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
    )
}