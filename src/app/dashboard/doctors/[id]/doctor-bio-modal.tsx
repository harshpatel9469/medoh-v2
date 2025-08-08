import { Doctor } from "@/app/_types";

interface DoctorBioModalProps {
    doctor: Doctor,
    onClose: () => void;
}

export default function DoctorBioModal({ doctor , onClose }: DoctorBioModalProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/3 p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="text-xl font-bold">{doctor.name}&apos;{doctor.name.slice(-1) === 's'? '' : 's'} Bio</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
                        &times;
                    </button>
                </div>
                <div className="mt-4">
                    <div className="mt-4 whitespace-pre-line">
                        {doctor.bio}
                    </div>
                </div>
                
            </div>
        </div>
    );
};
