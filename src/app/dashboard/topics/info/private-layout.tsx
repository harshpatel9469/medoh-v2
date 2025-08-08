import PrivateSideBar from '@/app/_components/navigation/private-side-bar';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <div className="w-64 flex-none">
        <PrivateSideBar />
      </div>
      <div className="flex-grow">{children}</div>
    </div>
  );
} 