'use-client'
import Modal from "@/app/_components/overlays/modal";
import { DetailedTopic } from "@/app/_types/detailed-topic";
import DetailedTopicModalContent from "./detailed-topic-modal-content";


interface DetailedTopicModalProps {
    detailedTopic?: DetailedTopic | null,
    topicId: string,
    title: string,
    confirmText: string,
    onClose: () => void;
    isUpdate: boolean;
}

export default function DetailedTopicModal({ detailedTopic, title, confirmText, onClose, isUpdate, topicId }: DetailedTopicModalProps) {

   return(
    <Modal 
        title = {title}
        description = ""
        onClose={onClose}
        confirmText={confirmText}
    >
        <DetailedTopicModalContent 
            detailedTopic={detailedTopic}
            confirmText={confirmText}
            isUpdate={isUpdate}
            onClose={onClose}
            topicId={topicId}
        />
    </Modal>
   ) 
}