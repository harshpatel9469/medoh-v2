import { supabase } from '@/utils/supabase/client'
import { Doctor } from '@/app/_types';

export const fetchDoctorsSearch = async (term: string, limit: number = 20): Promise<Doctor[]> => {
    const { data, error } = await supabase
        .from('doctors')
        .select()
        .ilike('name', `%${term}%`)
        .limit(limit);

    if (error) {
        throw new Error(`Error fetching questions: ${error.message}`);
    }

    return data || [];
};


export const fetchAllDoctors = async (): Promise<Doctor[]> => {
    const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        throw new Error(`Error fetching doctors: ${error.message}`);
    }

    return data || [];
};

export const fetchDoctorById = async (doctorId: string): Promise<Doctor> => {
    const { data, error } = await supabase
        .from('doctors')
        .select()
        .eq('id', doctorId)
        .single();

    if (error) {
        throw new Error(`Error fetching doctors: ${error.message}`);
    }

    return data || null;
};

export const createDoctor = async (doctorName: string, bio: string, pictureUrl: string, specialty: string, city: string, state: string): Promise<void> => {
    const { data, error } = await supabase
        .from('doctors')
        .insert({
            name: doctorName,
            bio: bio,
            picture_url: pictureUrl,
            specialty: specialty,
            city: city,
            state: state,
            featured: false
        })
        .select();

    if (error) {
        throw new Error(`Error inserting doctor: ${error.message}`);
    }
};

export const updateDoctor = async (doctorName: string, bio: string, pictureUrl: string, doctorId: string, specialty: string, city: string, state: string): Promise<void> => {
    const { error } = await supabase
        .from('doctors')
        .update({
            name: doctorName,
            bio: bio,
            picture_url: pictureUrl,
            specialty: specialty,
            city: city,
            state: state,
            featured: false
        })
        .eq('id', doctorId)

    if (error) {
        throw new Error(`Error updating doctor: ${error.message}`);
    }
};

export const deleteDoctorById = async (doctorId: string): Promise<void> => {
    const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', doctorId)

    if (error) {
        throw new Error(`Error deleting doctor: ${error.message}`);
    }
};

// New: Fetch doctors relevant to specific health concerns
export const fetchDoctorsByHealthConcerns = async (healthConcerns: string[]): Promise<Doctor[]> => {
    // For now, just return all doctors as placeholders
    return fetchAllDoctors();
};

export const fetchDoctorsByIds = async (doctorIds: string[]): Promise<Doctor[]> => {
    if (!doctorIds || doctorIds.length === 0) return [];
    const { data, error } = await supabase
        .from('doctors')
        .select()
        .in('id', doctorIds);
    if (error) {
        throw new Error(`Error fetching doctors by ids: ${error.message}`);
    }
    return data || [];
};