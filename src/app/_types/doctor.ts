export interface Doctor{
    email: string | number | boolean
    id: string,
    name: string,
    bio?: string
    picture_url?: string,
    created_at: string,
    updated_at: string,
    specialty: string,
    city: string,
    state: string,
    featured: boolean
}