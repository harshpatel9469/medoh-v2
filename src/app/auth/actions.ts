'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData, redirectTo?: string) {
    try {
        const supabase = createClient()

        // type-casting here for convenience
        // in practice, you should validate your inputs
        const inputs = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
        }

        const { error } = await supabase.auth.signInWithPassword(inputs)

        if (error) {
            console.error('Login error:', error);
            return error.message;
        }

        revalidatePath('/', 'layout')
        const redirectPath = redirectTo || '/dashboard/home';
        console.log('Redirecting to:', redirectPath);
        redirect(redirectPath)
    } catch (error) {
        console.error('Unexpected error during login:', error);
        return 'An unexpected error occurred during login';
    }
}

export async function signup(formData: FormData): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();
  
    const userData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };
  
    const { data, error } = await supabase.auth.signUp(userData);
  
    if (error) {
      return { success: false, error: error.message };
    }
  
    if (data.user) {
      const res = await supabase.from('profiles').upsert({
        id: data.user.id,
        first_name: formData.get('firstName') as string,
        last_name: formData.get('lastName') as string,
        zip_code: formData.get('zipCode') as string,
        doctor_name: formData.get('doctorName') as string,
        updated_at: new Date().toISOString(),
      });
  
      if (res.error) {
        return { success: false, error: res.error.message };
      }
    }
  
    revalidatePath('/', 'layout');
    return { success: true };
  }
  
export async function sendPasswordResetEmail(formData: FormData) : Promise<{ success: boolean, message: string }> {
    const supabase = createClient()
    const email = formData.get('email') as string;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://medohhealth.vercel.app/auth/reset-password',
    })

    if (error) {
        return { success: false, message: 'Failed to send reset email.' };
    }
    return { success: true, message: 'Password reset email sent successfully.' };
}

export async function resetPassword(formData: FormData) {
    const supabase = createClient()

    const newPassword = formData.get('password') as string;

    const { data, error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
        redirect('/error');
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard/home');
}

