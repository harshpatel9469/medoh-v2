export interface Topic {
    id: string,
    name: string,
    created_at: Date,
    updated_at: Date,
    condition_id?: string,
    image?: string,
    description?: string,
    topic_order: number,
    is_detailed: boolean,
    body_part_id?: string,
    body_parts?: { name: string } | null, // for joined queries
    is_private?: boolean // Add privacy field
}