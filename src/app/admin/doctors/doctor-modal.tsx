'use client'
import Modal from "@/app/_components/overlays/modal";
import { Doctor } from "@/app/_types";
import DoctorModalContent from "./doctor-modal-content";

interface DoctorModalProps {
    doctor?: Doctor | null,
    title: string,
    confirmText: string,
    onClose: () => void;
    isUpdate: boolean;
    onSuccess?: () => void;
}

export default function DoctorModal({ doctor, title, confirmText, onClose, isUpdate, onSuccess }: DoctorModalProps) {

   return(
    <Modal 
        title = {title}
        description = ""
        onClose={onClose}
        confirmText={confirmText}
    >
        <DoctorModalContent 
            onClose={onClose}
            confirmText={confirmText}
            isUpdate={isUpdate}
            doctor={doctor}
            onSuccess={onSuccess}
        />
    </Modal>
   ) 
}