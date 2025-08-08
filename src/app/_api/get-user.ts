import { supabase } from '@/utils/supabase/client'

export const getUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    return user.id;
}