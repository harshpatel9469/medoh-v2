export interface Video {
    id: string;
    name: string;
    url: string;
    thumbnail_url: string;
    description?: string;
    duration?: number;
    doctor_id?: string;
    question_id?: string;
    created_at: Date;
    updated_at?: string;
} 