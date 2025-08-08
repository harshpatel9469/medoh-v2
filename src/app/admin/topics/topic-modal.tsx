'use-client'
import Modal from "@/app/_components/overlays/modal";
import { Topic } from "@/app/_types";
import { useState } from "react";
import TopicModalContent from "./topic-modal-content";

interface TopicModalProps {
    topic?: Topic | null,
    title: string,
    confirmText: string,
    onClose: () => void;
    isUpdate: boolean;
}

export default function TopicModal({ topic, title, confirmText, onClose, isUpdate }: TopicModalProps) {

   return(
    <Modal 
        title = {title}
        description = ""
        onClose={onClose}
        confirmText={confirmText}
    >
    <TopicModalContent topic={topic} 
        onClose={onClose}
        isUpdate={isUpdate}
        confirmText={confirmText}/>
    </Modal>
   ) 
}