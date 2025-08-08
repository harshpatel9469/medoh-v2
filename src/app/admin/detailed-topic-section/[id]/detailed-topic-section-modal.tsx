'use-client'
import Modal from "@/app/_components/overlays/modal";
import SectionModalContent from "./detailed-topic-section-modal-content";
import { DetailedTopicSection } from "@/app/_types/detailed-topic-section";

interface SectionModalProps {
    section?: DetailedTopicSection | null,
    title: string,
    confirmText: string,
    topicId: string,
    onClose: () => void;
    isUpdate: boolean;
}

export default function SectionModal({ section, title, confirmText, onClose, isUpdate, topicId }: SectionModalProps) {

   return(
    <Modal 
        title = {title}
        description = ""
        onClose={onClose}
        confirmText={confirmText}
    >
    <SectionModalContent 
        section={section}
        confirmText={confirmText}
        isUpdate={isUpdate}
        onClose={onClose}
        topicId={topicId}
    />
    </Modal>
   ) 
}