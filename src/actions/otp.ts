'use server';

import twilio from 'twilio';
import { createClient } from '@/utils/supabase/server';
import { headers, cookies } from 'next/headers';

const supabase = createClient();

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export async function sendOtp(identifier: string) {
  console.log('DEBUG: sendOtp called with identifier:', identifier);
  console.log('DEBUG: Twilio SID exists:', !!process.env.TWILIO_ACCOUNT_SID);
  console.log('DEBUG: Twilio Token exists:', !!process.env.TWILIO_AUTH_TOKEN);
  console.log('DEBUG: Twilio Phone exists:', !!process.env.TWILIO_PHONE_NUMBER);
  
  if (!identifier) {
    throw new Error('identifier is required');
  }
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP in Supabase (only identifier and otp - no username column exists)
  const { error } = await supabase
    .from('otp_codes')
    .insert({ 
      identifier, 
      otp
    });

  if (error) {
    console.error('OTP insert error:', error);
    throw new Error(`Failed to save OTP: ${error.message}`);
  }

  // Send OTP via SMS or Email
  if (identifier.includes('@')) {
    // send email (optional)
  } else {
    console.log(`OTP for ${identifier}: ${otp}`);
    
    // Force send SMS via Twilio (bypassing env check)
    try {
      await client.messages.create({
        body: `Your verification code is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: identifier,
      });
      console.log(`✅ SMS sent successfully to ${identifier}`);
    } catch (smsError) {
      console.error('❌ SMS sending failed:', smsError);
      console.log('📱 Use OTP from console instead');
    }
  }
  return true;
}


export async function sendPrivatePageLink(phoneNumber: string, pageId: string, patientName: string, doctorId: string) {
  console.log('DEBUG: sendPrivatePageLink called with:', { phoneNumber, pageId, patientName, doctorId });
  
  if (!phoneNumber || !pageId || !doctorId) {
    throw new Error('Phone number, page ID, and doctor ID are required');
  }
  
  // Format phone number with +1 prefix if not already present
  const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`;
  
  // Get the current request headers to construct the proper base URL
  const headersList = headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const baseUrl = `${protocol}://${host}`;
  
  // Construct the private page link
  const pageLink = `${baseUrl}/private-page-patient/${pageId}/auth`;
  
  // Create SMS message
  const message = `Hi ${patientName}! Your personalized medical information page is ready. Access it here: ${pageLink}`;
  
  console.log(`SMS message for ${formattedPhoneNumber}: ${message}`);
  
  try {
    // Send SMS via Twilio
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: formattedPhoneNumber,
    });
    console.log(`✅ Private page link sent successfully to ${formattedPhoneNumber}`);
    
    // Store message in database
    const { error: dbError } = await supabase
      .from('messages')
      .insert({
        doctor_id: doctorId,
        recipient: formattedPhoneNumber,
        message: message,
        recipient_name: patientName,
        sent_at: new Date().toISOString()
      });
    
    if (dbError) {
      console.error('❌ Failed to store message in database:', dbError);
      // Don't throw error here as SMS was sent successfully
    } else {
      console.log(`✅ Message stored in database for ${patientName}`);
    }
    
    return true;
  } catch (smsError) {
    console.error('❌ SMS sending failed:', smsError);
    throw new Error(`Failed to send SMS to ${formattedPhoneNumber}: ${smsError instanceof Error ? smsError.message : 'Unknown error'}`);
  }
}

export async function verifyOtp(identifier: string, code: string) {
    // Get latest OTP for this identifier
    const { data, error } = await supabase
      .from('otp_codes')
      .select('otp, created_at')
      .eq('identifier', identifier)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
  
    if (error || !data) return false;
  
    const validOtp = data.otp;
  
    if (validOtp && validOtp === code) {
      // Set a cookie to indicate OTP verification
      cookies().set('otp-verified', 'true', {
        path: '/',
        httpOnly: false,
        maxAge: 5 * 60,
      });
      return true;
    }
    return false;
  }
  