'use server'

import { createClient } from '@/utils/supabase/server';
import { supabase } from '@/utils/supabase/client';

// Auto-sign in guest users
export async function ensureGuestUser() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // If no user, sign in anonymously
        if (!user) {
            const { data, error } = await supabase.auth.signInAnonymously();
            if (error) {
                console.error('Guest sign-in error:', error);
                return null;
            }
            return data.user;
        }
        
        return user;
    } catch (error) {
        console.error('Guest auth error:', error);
        return null;
    }
}

// Save guest health conditions
export async function saveGuestHealthConditions(healthConcerns: string[]) {
    try {
        const user = await ensureGuestUser();
        if (!user) {
            return false;
        }

        const supabaseServer = createClient();
        
        // Upsert guest profile with health conditions
        const { error } = await supabaseServer
            .from('profiles')
            .upsert({
                id: user.id,
                health_concerns: healthConcerns,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error('Save guest health conditions error:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Save guest health conditions error:', error);
        return false;
    }
}

// Get guest health conditions
export async function getGuestHealthConditions() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return [];
        }

        const supabaseServer = createClient();
        
        const { data, error } = await supabaseServer
            .from('profiles')
            .select('health_concerns')
            .eq('id', user.id)
            .single();

        if (error || !data) {
            return [];
        }
        
        return data.health_concerns || [];
    } catch (error) {
        console.error('Get guest health conditions error:', error);
        return [];
    }
}

// Check if current user is a guest (has incomplete profile)
export async function isGuestUser() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return true; // No user = guest
        }

        const supabaseServer = createClient();
        
        const { data: profile } = await supabaseServer
            .from('profiles')
            .select('first_name, last_name, zip_code')
            .eq('id', user.id)
            .single();

        // If user has first_name, last_name, and zip_code, they're authenticated
        // If missing any of these, they're a guest
        const isGuest = !profile || !profile.first_name || !profile.last_name || !profile.zip_code;
        
        return isGuest;
    } catch (error) {
        console.error('Error checking guest status:', error);
        return true; // Assume guest on error
    }
} 