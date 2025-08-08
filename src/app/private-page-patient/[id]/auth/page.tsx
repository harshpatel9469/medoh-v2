'use client';

import { useState } from 'react';
import { sendOtp, verifyOtp } from '@/actions/otp'; // direct server action
import { useRouter, useParams } from 'next/navigation';
import { isContactAllowedForPrivatePage } from '@/app/_api/private-pages';

export default function AuthPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  console.log("hey2");
  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setError('Please enter your phone number.');
      return;
    }
    const allowed = await isContactAllowedForPrivatePage(id, phoneNumber);
    if (!allowed) {
        setError('This phone number is not associated with this private page.');
        return;
    }

    try {
      setLoading(true);
      await sendOtp(phoneNumber); // call server action
      setOtpSent(true);
    } catch (err: any) {
      setError('Failed to send OTP: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }

    try {
      setLoading(true);
      const isValid = await verifyOtp(phoneNumber, otp);
      if (isValid) {
        router.push(`/private-page-patient/${id}/topics`);
      } else {
        setError('Invalid OTP');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded-md shadow bg-white mt-10">
      <h2 className="text-2xl font-bold text-center mb-4">Verify Your Phone</h2>

      {!otpSent ? (
        <div className="space-y-4">
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
            className="w-full border px-3 py-2 rounded-md"
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full py-2 rounded-md bg-primary-color text-white hover:bg-primary-color-light transition"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full border px-3 py-2 rounded-md"
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full py-2 bg-green-600 text-white rounded-md"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </div>
      )}
    </div>
  );
}
