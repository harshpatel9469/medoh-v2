import Link from 'next/link';

export default function DoctorCard({ doctor }: { doctor: any }) {
  return (
    <Link
      href={`/dashboard/doctors/${doctor.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex-1 min-w-0 rounded-2xl bg-white shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden border border-gray-100 hover:border-orange-200 transform hover:-translate-y-1 hover:bg-orange-50 flex flex-col justify-between"
      style={{ minHeight: '280px', height: 'auto' }}
    >
      <div className="flex flex-col items-center p-4 h-full justify-between">
        <div className="w-full flex justify-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden mb-3 sm:mb-4">
            {doctor.picture_url ? (
              <img
                src={doctor.picture_url}
                alt={`Dr. ${doctor.name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl sm:text-3xl text-orange-400 font-bold">
                {doctor.name?.split(' ').map((n: string) => n[0]).join('')}
              </span>
            )}
          </div>
        </div>
        <div className="w-full text-center">
          <div className="text-xs text-gray-500 mb-1 truncate">{doctor.specialty}</div>
          <div className="text-sm sm:text-base font-bold text-gray-900 truncate">Dr. {doctor.name}</div>
          <div className="mt-2 sm:mt-3">
            <button
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 w-full sm:w-auto"
              onClick={(e) => {
                e.preventDefault();
                window.open(`/dashboard/doctors/${doctor.id}`, '_blank', 'noopener,noreferrer');
              }}
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
} 