'use client';

import { useState } from 'react';
import { Message } from '../../_api/messages';
import { 
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  ClockIcon,
  UsersIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface SMSBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'total' | 'week' | 'recipients';
  messages: Message[];
  title: string;
}

export default function SMSBreakdownModal({
  isOpen,
  onClose,
  type,
  messages,
  title
}: SMSBreakdownModalProps) {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    }
    return phone;
  };

  const getFilteredMessages = () => {
    switch (type) {
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return messages.filter(msg => new Date(msg.sent_at) > weekAgo);
      case 'recipients':
      case 'total':
      default:
        return messages;
    }
  };

  const getUniqueRecipients = () => {
    const filtered = getFilteredMessages();
    const recipients = new Map();
    
    filtered.forEach(msg => {
      const phone = msg.recipient;
      if (!recipients.has(phone)) {
        recipients.set(phone, {
          phone,
          name: msg.recipient_name,
          messageCount: 1,
          firstMessage: msg.sent_at,
          lastMessage: msg.sent_at
        });
      } else {
        const existing = recipients.get(phone);
        existing.messageCount++;
        // Update name if we find a message with a name and current doesn't have one
        if (!existing.name && msg.recipient_name) {
          existing.name = msg.recipient_name;
        }
        if (new Date(msg.sent_at) < new Date(existing.firstMessage)) {
          existing.firstMessage = msg.sent_at;
        }
        if (new Date(msg.sent_at) > new Date(existing.lastMessage)) {
          existing.lastMessage = msg.sent_at;
        }
      }
    });
    
    return Array.from(recipients.values()).sort((a, b) => b.messageCount - a.messageCount);
  };

  const getDailyBreakdown = () => {
    const filtered = getFilteredMessages();
    const dailyData = new Map();
    
    filtered.forEach(msg => {
      const date = new Date(msg.sent_at).toLocaleDateString();
      if (!dailyData.has(date)) {
        dailyData.set(date, 0);
      }
      dailyData.set(date, dailyData.get(date) + 1);
    });
    
    return Array.from(dailyData.entries()).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  };

  const filteredMessages = getFilteredMessages();
  const uniqueRecipients = getUniqueRecipients();
  const dailyBreakdown = getDailyBreakdown();

  const renderTotalBreakdown = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-900">{messages.length}</div>
              <div className="text-sm text-amber-700">Total Messages</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-900">{uniqueRecipients.length}</div>
          <div className="text-sm text-green-700">Unique Recipients</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-900">
            {messages.length > 0 ? Math.round((messages.length / uniqueRecipients.length) * 10) / 10 : 0}
          </div>
          <div className="text-sm text-purple-700">Avg per Recipient</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-900">{dailyBreakdown.length}</div>
          <div className="text-sm text-orange-700">Active Days</div>
        </div>
      </div>

      {/* Daily Activity */}
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <ChartBarIcon className="h-4 w-4 mr-2" />
          Daily Activity
        </h4>
        <div className="space-y-2">
          {dailyBreakdown.slice(0, 7).map(([date, count]) => (
            <div key={date} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{date}</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-amber-500 h-2 rounded-full" 
                    style={{ width: `${(count / Math.max(...dailyBreakdown.map(d => d[1]))) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-6">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Messages */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h4 className="font-medium text-gray-900">Recent Messages</h4>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {messages.slice(0, 10).map((message) => (
            <div key={message.id} className="p-4 border-b last:border-b-0 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {message.recipient_name ? `${message.recipient_name} (${formatPhoneNumber(message.recipient)})` : formatPhoneNumber(message.recipient)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{formatDate(message.sent_at)}</div>
                </div>
                <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400" />
              </div>
              <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                {message.message}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderWeekBreakdown = () => (
    <div className="space-y-6">
      {/* Week Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-900">{filteredMessages.length}</div>
          <div className="text-sm text-green-700">Messages This Week</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-900">
            {new Set(filteredMessages.map(m => m.recipient)).size}
          </div>
          <div className="text-sm text-amber-700">Recipients This Week</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-900">
            {filteredMessages.length > 0 ? Math.round((filteredMessages.length / 7) * 10) / 10 : 0}
          </div>
          <div className="text-sm text-purple-700">Daily Average</div>
        </div>
      </div>

      {/* Daily Breakdown for This Week */}
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <CalendarDaysIcon className="h-4 w-4 mr-2" />
          This Week&apos;s Activity
        </h4>
        <div className="space-y-2">
          {dailyBreakdown.map(([date, count]) => (
            <div key={date} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{date}</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${count > 0 ? (count / Math.max(...dailyBreakdown.map(d => d[1]))) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-6">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* This Week&apos;s Messages */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h4 className="font-medium text-gray-900">This Week&apos;s Messages</h4>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {filteredMessages.map((message) => (
            <div key={message.id} className="p-4 border-b last:border-b-0 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {message.recipient_name ? `${message.recipient_name} (${formatPhoneNumber(message.recipient)})` : formatPhoneNumber(message.recipient)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{formatDate(message.sent_at)}</div>
                </div>
                <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400" />
              </div>
              <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                {message.message}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRecipientsBreakdown = () => (
    <div className="space-y-6">
      {/* Recipients Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-900">{uniqueRecipients.length}</div>
          <div className="text-sm text-purple-700">Total Recipients</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-900">
            {uniqueRecipients.length > 0 ? Math.max(...uniqueRecipients.map(r => r.messageCount)) : 0}
          </div>
          <div className="text-sm text-amber-700">Most Messages</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-900">
            {uniqueRecipients.length > 0 ? Math.round((messages.length / uniqueRecipients.length) * 10) / 10 : 0}
          </div>
          <div className="text-sm text-green-700">Avg per Recipient</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-900">
            {uniqueRecipients.filter(r => r.messageCount === 1).length}
          </div>
          <div className="text-sm text-orange-700">One-time Recipients</div>
        </div>
      </div>

      {/* Recipients List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h4 className="font-medium text-gray-900 flex items-center">
            <UsersIcon className="h-4 w-4 mr-2" />
            Recipients Ranked by Message Count
          </h4>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {uniqueRecipients.map((recipient, index) => (
            <div key={recipient.phone} className="p-4 border-b last:border-b-0 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                    <span className="text-sm font-medium text-purple-900">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {recipient.name ? `${recipient.name} (${formatPhoneNumber(recipient.phone)})` : formatPhoneNumber(recipient.phone)}
                    </div>
                    <div className="text-xs text-gray-500">
                      First: {formatDate(recipient.firstMessage)} • Last: {formatDate(recipient.lastMessage)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {recipient.messageCount} {recipient.messageCount === 1 ? 'message' : 'messages'}
                  </span>
                  <PhoneIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'week':
        return renderWeekBreakdown();
      case 'recipients':
        return renderRecipientsBreakdown();
      case 'total':
      default:
        return renderTotalBreakdown();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center space-x-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 rounded-xl">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-orange-100 text-sm">Detailed SMS analytics and insights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-all duration-200"
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
} 