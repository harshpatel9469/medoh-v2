import { supabase } from '@/utils/supabase/client';

export interface Message {
  id: string;
  doctor_id: string;
  sent_at: string;
  recipient: string;
  recipient_name?: string;
  message: string;
}

export const fetchMessagesByDoctorId = async (doctorId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('sent_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  
  return data || [];
};

export const fetchAllMessages = async (): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('sent_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching all messages:', error);
    return [];
  }
  
  return data || [];
}; 