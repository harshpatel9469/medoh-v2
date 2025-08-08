'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TopicShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  topicName: string;
  doctorName: string;
  doctorId: string;
}

export default function TopicShareModal({ 
  isOpen, 
  onClose, 
  topicId, 
  topicName, 
  doctorName, 
  doctorId 
}: TopicShareModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState(
    `Hey! This is ${doctorName}. I wanted to share some helpful information about ${topicName} with you. Check it out here: https://medohhealth.com/dashboard/topics/info/${topicId}`
  );
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Generate personalized message
  const generateMessage = (fName: string, lName: string) => {
    const recipientName = fName && lName ? ` ${fName}` : '';
    return `Hey${recipientName}! This is ${doctorName}. I wanted to share some helpful information about ${topicName} with you. Check it out here: https://medohhealth.com/dashboard/topics/info/${topicId}`;
  };

  // Update message when props or names change
  useEffect(() => {
    if (isOpen && topicId && topicName && doctorName) {
      setMessage(generateMessage(firstName, lastName));
    }
  }, [isOpen, topicId, topicName, doctorName, firstName, lastName]);

  if (!isOpen) return null;

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as +1 (XXX) XXX-XXXX
    if (digits.length >= 11 && digits.startsWith('1')) {
      const formatted = `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
      return formatted;
    } else if (digits.length >= 10) {
      const formatted = `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      return formatted;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const getCleanPhoneNumber = (formatted: string) => {
    return '+1' + formatted.replace(/\D/g, '').slice(-10);
  };

  const handleSend = async () => {
    if (!firstName || !lastName || !phoneNumber || !message) {
      setError('Please enter first name, last name, phone number, and message');
      return;
    }

    setSending(true);
    setError('');

    try {
      const cleanPhone = getCleanPhoneNumber(phoneNumber);
      
                    const response = await fetch('/api/send-sms', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  to: cleanPhone,
                  message: message,
                  recipientName: `${firstName} ${lastName}`,
                  doctorId: doctorId // Pass doctor ID for impersonation mode
                }),
              });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setFirstName('');
          setLastName('');
          setPhoneNumber('');
          setMessage(generateMessage('', ''));
        }, 2000);
      } else {
        setError(result.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message');
      console.error('SMS Error:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 max-w-lg p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold">Share Topic via SMS</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">Message Sent!</h3>
            <p className="text-gray-600">Your message has been sent successfully.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className={`px-6 py-2 rounded-md font-semibold ${
                  sending
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {sending ? 'Sending...' : 'Send SMS'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 