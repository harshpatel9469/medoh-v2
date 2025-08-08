import DoctorPortalSidebar from '../_components/navigation/doctor-portal-side-bar';

export default function DoctorPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-white">
      <DoctorPortalSidebar />
      <main className="w-full">{children}</main>
    </div>
  );
} 