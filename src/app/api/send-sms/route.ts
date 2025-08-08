import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { createClient } from '@/utils/supabase/server';

const client = twilio(
  'AC7ea5973b9d31c422b5a701d021bb39bb',
  '736b359f3c6b12c8192e6e824883ce22'
);

export async function POST(request: NextRequest) {
  try {
    const { to, message, recipientName, doctorId: impersonatedDoctorId } = await request.json();

    console.log('Sending SMS to:', to);
    console.log('Recipient Name:', recipientName);
    console.log('Message:', message);
    console.log('Impersonated Doctor ID:', impersonatedDoctorId);

    const supabase = createClient();
    let doctorId: string | number;

    // If doctorId is provided (impersonation mode), use it directly
    if (impersonatedDoctorId) {
      doctorId = impersonatedDoctorId; // Keep as string UUID
      console.log('Using impersonated doctor ID:', doctorId);
    } else {
      // Normal authentication flow
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        return NextResponse.json({ 
          success: false, 
          error: 'User not authenticated' 
        }, { status: 401 });
      }

      // Get the doctor's database ID from their user_id
      const { data: doctor, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (doctorError || !doctor) {
        console.error('Doctor lookup error:', doctorError);
        return NextResponse.json({ 
          success: false, 
          error: 'Doctor profile not found' 
        }, { status: 404 });
      }

      doctorId = doctor.id;
      console.log('Authenticated doctor ID:', doctorId);
    }

    let twilioResult = null;
    let twilioError = null;

    // Try to send SMS via Twilio, but don't let it stop database logging
    try {
      const result = await client.messages.create({
        body: message,
        from: '+18776852109', // Use your verified Twilio phone number
        to: to
      });
      twilioResult = result.sid;
      console.log('Twilio result:', result.sid);
    } catch (error: any) {
      twilioError = error.message;
      console.error('Twilio SMS failed (will still log to database):', error.message);
    }

    // Always try to store message in database regardless of Twilio success/failure
    const { error: dbError } = await supabase
      .from('messages')
      .insert({
        doctor_id: doctorId, // Already an integer
        recipient: to,
        recipient_name: recipientName,
        message: message,
        sent_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Error storing message in database:', dbError);
    } else {
      console.log('Message stored successfully in database');
    }

    // Return success if at least the database logging worked
    if (twilioResult) {
      return NextResponse.json({ 
        success: true, 
        messageId: twilioResult,
        twilioStatus: 'sent'
      });
    } else if (!dbError) {
      return NextResponse.json({ 
        success: true, 
        messageId: null,
        twilioStatus: 'failed',
        twilioError: twilioError,
        message: 'Message logged to database, but SMS not sent due to Twilio configuration'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Both Twilio and database failed',
        twilioError: twilioError,
        databaseError: dbError.message
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 