'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { fetchMessagesByDoctorId, Message } from '../../_api/messages';
import { fetchDoctorById } from '../../_api/doctors';
import { fetchTopicsWithPrivacyByDoctorId, TopicWithPrivacy } from '../../admin/doctors/doctor-privacy-controls';
import { fetchVideosByDoctorId } from '../../_api/videos';
import { Video } from '../../_types';
import { useAuth } from '../../_contexts/auth-context';
import { 
  ChatBubbleLeftRightIcon, 
  CheckCircleIcon, 
  UsersIcon,
  PhoneIcon,
  ClockIcon,
  ExclamationCircleIcon,
  Cog6ToothIcon,
  PlusIcon,
  ShareIcon,
  DocumentTextIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';
import SMSBreakdownModal from '../../_components/overlays/sms-breakdown-modal';

export default function SMSPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [topics, setTopics] = useState<TopicWithPrivacy[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showSendSection, setShowSendSection] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [topicSections, setTopicSections] = useState<any[]>([]);
  const [allVideosMap, setAllVideosMap] = useState<Map<string, {id: string, name: string, topicName: string}>>(new Map());
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState('');
  
  // Modal states
  const [totalMessagesModalOpen, setTotalMessagesModalOpen] = useState(false);
  const [thisWeekModalOpen, setThisWeekModalOpen] = useState(false);
  const [uniqueRecipientsModalOpen, setUniqueRecipientsModalOpen] = useState(false);
  
  const { impersonatedDoctorId, isImpersonating } = useAuth();

  useEffect(() => {
    async function loadDoctorAndData() {
      setLoading(true);
      setError(null);
      try {
        // If there's an impersonated doctor ID, use that directly (admin acting as doctor)
        if (impersonatedDoctorId) {
          console.log('SMS page using impersonated doctor ID:', impersonatedDoctorId);
          const impersonatedDoctor = await fetchDoctorById(impersonatedDoctorId);
          if (impersonatedDoctor) {
            setDoctorId(impersonatedDoctor.id);
            setDoctor(impersonatedDoctor);
            setIsAdmin(true);
            
            // Load all data
            const [doctorMessages, doctorTopics, doctorVideos] = await Promise.all([
              fetchMessagesByDoctorId(impersonatedDoctor.id),
              fetchTopicsWithPrivacyByDoctorId(impersonatedDoctor.id),
              fetchVideosByDoctorId(impersonatedDoctor.id)
            ]);
            
            setMessages(doctorMessages);
            setTopics(doctorTopics);
            setVideos(doctorVideos);
            setLoading(false);
            return;
          } else {
            setError('Impersonated doctor not found.');
            setLoading(false);
            return;
          }
        }

        // Normal authentication flow
        const supabase = createClientComponentClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Not logged in.');
          setLoading(false);
          return;
        }

        // Check if user is admin
        const userIsAdmin = user.email === 'mpyne@medohhealth.com' || user.app_metadata?.userrole === 'ADMIN';
        if (userIsAdmin) {
          setIsAdmin(true);
        }

        // Normal doctor lookup by user_id
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (doctorError || !doctorData) {
          if (userIsAdmin) {
            // Admin with no doctor profile - show empty state
            setError(null);
            setMessages([]);
            setTopics([]);
            setVideos([]);
            setLoading(false);
            return;
          }
          setError('No doctor profile found for this user.');
          setLoading(false);
          return;
        }

        setDoctorId(doctorData.id);
        setDoctor(doctorData);
        
        // Load all data for this doctor
        const [doctorMessages, doctorTopics, doctorVideos] = await Promise.all([
          fetchMessagesByDoctorId(doctorData.id),
          fetchTopicsWithPrivacyByDoctorId(doctorData.id),
          fetchVideosByDoctorId(doctorData.id)
        ]);
        
        setMessages(doctorMessages);
        setTopics(doctorTopics);
        setVideos(doctorVideos);
        
      } catch (e) {
        setError('Failed to load data.');
        console.error('Error loading data:', e);
      } finally {
        setLoading(false);
      }
    }

    loadDoctorAndData();
  }, [impersonatedDoctorId]);

  // Load topic sections when a topic is expanded
  const loadTopicSections = async (topicId: string) => {
    try {
      // Pass the current doctor ID to filter videos to only this doctor's content
      // If doctorId is not available yet, the API will fall back to authenticated user's doctor ID
      const url = doctorId 
        ? `/api/topic-videos?topicId=${topicId}&doctorId=${doctorId}`
        : `/api/topic-videos?topicId=${topicId}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded topic sections with videos for doctor:', doctorId || 'authenticated user', data.sections);
        setTopicSections(data.sections || []);
      }
    } catch (error) {
      console.error('Failed to load topic sections:', error);
      setTopicSections([]);
    }
  };

  const handleTopicClick = async (topic: TopicWithPrivacy) => {
    if (expandedTopic === topic.id) {
      // Collapse if already expanded
      setExpandedTopic(null);
      setTopicSections([]);
    } else {
      // Expand and load sections
      setExpandedTopic(topic.id);
      await loadTopicSections(topic.id);
    }
  };

  const toggleTopicSelection = (topicId: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId);
    } else {
      newSelected.add(topicId);
    }
    setSelectedTopics(newSelected);
  };

  const toggleVideoSelection = (videoId: string, videoName: string, topicName: string) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
      // Remove from videos map
      const newMap = new Map(allVideosMap);
      newMap.delete(videoId);
      setAllVideosMap(newMap);
    } else {
      newSelected.add(videoId);
      // Add to videos map
      const newMap = new Map(allVideosMap);
      newMap.set(videoId, { id: videoId, name: videoName, topicName });
      setAllVideosMap(newMap);
    }
    setSelectedVideos(newSelected);
  };

  const selectAllContent = () => {
    // Select all topics
    const allTopicIds = new Set(topics.map(topic => topic.id));
    setSelectedTopics(allTopicIds);
    
    // Select all videos from currently expanded topic
    if (expandedTopic && topicSections.length > 0) {
      const newVideoSelection = new Set(selectedVideos);
      const newVideosMap = new Map(allVideosMap);
      const topicName = topics.find(t => t.id === expandedTopic)?.name || '';
      
      topicSections.forEach(section => {
        section.videos.forEach((video: any) => {
          newVideoSelection.add(video.id);
          newVideosMap.set(video.id, { id: video.id, name: video.name, topicName });
        });
      });
      
      setSelectedVideos(newVideoSelection);
      setAllVideosMap(newVideosMap);
    }
  };

  const deselectAllContent = () => {
    setSelectedTopics(new Set());
    setSelectedVideos(new Set());
    setAllVideosMap(new Map());
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setCustomMessage('');
  };

  // Update custom message when selections change
  useEffect(() => {
    if ((selectedTopics.size > 0 || selectedVideos.size > 0) && doctor) {
      const messageParts: string[] = [];
      
      // Add intro with personalized greeting
      const recipientName = firstName && lastName ? ` ${firstName}` : '';
      messageParts.push(`Hey${recipientName}! This is ${doctor.name}. I wanted to share some helpful information with you:`);
      
      // Add selected topics
      selectedTopics.forEach(topicId => {
        const topic = topics.find(t => t.id === topicId);
        if (topic) {
          messageParts.push(`\n\n📚 ${topic.name}: https://medohhealth.com/dashboard/topics/info/${topicId}`);
        }
      });
      
      // Add selected videos
      selectedVideos.forEach(videoId => {
        const videoInfo = allVideosMap.get(videoId);
        if (videoInfo) {
          console.log('Adding video to message:', videoId, videoInfo.name);
          messageParts.push(`\n\n🎥 ${videoInfo.name} (from ${videoInfo.topicName}): https://medohhealth.com/dashboard/question/${videoId}`);
        }
      });
      
      setCustomMessage(messageParts.join(''));
    } else {
      setCustomMessage('');
    }
  }, [selectedTopics, selectedVideos, allVideosMap, doctor, topics, firstName, lastName]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPhoneNumber = (phone: string) => {
    // Format +16692929845 to +1 (669) 292-9845
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    }
    return phone;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as +1 (XXX) XXX-XXXX
    if (digits.length >= 11 && digits.startsWith('1')) {
      const formatted = `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
      setPhoneNumber(formatted);
    } else if (digits.length >= 10) {
      const formatted = `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
      setPhoneNumber(formatted);
    } else {
      setPhoneNumber(value);
    }
  };

  const getCleanPhoneNumber = (formatted: string) => {
    return '+1' + formatted.replace(/\D/g, '').slice(-10);
  };

  const handleSendMessage = async () => {
    if (!firstName || !lastName || !phoneNumber || !customMessage || !doctorId) {
      setSendError('Please enter first name, last name, phone number, and message');
      return;
    }

    if (selectedTopics.size === 0 && selectedVideos.size === 0) {
      setSendError('Please select at least one topic or video to share');
      return;
    }

    setSending(true);
    setSendError('');

    try {
      const cleanPhone = getCleanPhoneNumber(phoneNumber);
      
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: cleanPhone,
          message: customMessage,
          recipientName: `${firstName} ${lastName}`,
          doctorId: doctorId
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSendSuccess(true);
        // Refresh messages list
        const updatedMessages = await fetchMessagesByDoctorId(doctorId);
        setMessages(updatedMessages);
        
        // Reset form
        setFirstName('');
        setLastName('');
        setPhoneNumber('');
        setCustomMessage('');
        setSelectedTopics(new Set());
        setSelectedVideos(new Set());
        setAllVideosMap(new Map());
        setExpandedTopic(null);
        setTopicSections([]);
        setShowSendSection(false);
        
        setTimeout(() => {
          setSendSuccess(false);
        }, 3000);
      } else {
        setSendError(result.error || 'Failed to send message');
      }
    } catch (err) {
      setSendError('Failed to send message');
      console.error('SMS Error:', err);
    } finally {
      setSending(false);
    }
  };

  const thisWeekCount = messages.filter(msg => {
    const msgDate = new Date(msg.sent_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return msgDate > weekAgo;
  }).length;

  const uniqueRecipientsCount = new Set(messages.map(msg => msg.recipient)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <div className="text-red-600 font-medium">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Admin Banner */}
        {isImpersonating && (
          <div className="bg-amber-600 text-white rounded-2xl p-4 mb-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <Cog6ToothIcon className="h-6 w-6" />
              <div>
                <h2 className="font-semibold">Admin Mode</h2>
                <p className="text-amber-100 text-sm">Viewing SMS messages as impersonated doctor</p>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl mb-6 shadow-lg">
              <ChatBubbleLeftRightIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">SMS Distribution</h1>
            <p className="text-xl text-gray-600">Manage SMS campaigns and patient communications</p>
          </div>
        </div>

        {/* Stats Grid - Now Clickable */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button 
            onClick={() => setTotalMessagesModalOpen(true)}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105 text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500 rounded-xl shadow-lg">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-amber-900">{messages.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Messages</h3>
            <p className="text-gray-600">All SMS messages sent</p>
            <p className="text-xs text-amber-600 mt-2">Click for breakdown</p>
          </button>

          <button 
            onClick={() => setThisWeekModalOpen(true)}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105 text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500 rounded-xl shadow-lg">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-orange-900">{thisWeekCount}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">This Week</h3>
            <p className="text-gray-600">Messages sent this week</p>
            <p className="text-xs text-orange-600 mt-2">Click for breakdown</p>
          </button>

          <button 
            onClick={() => setUniqueRecipientsModalOpen(true)}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105 text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500 rounded-xl shadow-lg">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-amber-900">{uniqueRecipientsCount}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Unique Recipients</h3>
            <p className="text-gray-600">Different phone numbers</p>
            <p className="text-xs text-amber-600 mt-2">Click for breakdown</p>
          </button>
        </div>

        {/* Send New Message Section */}
        <div className="bg-white rounded-3xl shadow-xl mb-8 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Send New Message</h2>
                <p className="text-gray-600 mt-1">Share topics and videos with patients via SMS</p>
              </div>
              <button
                onClick={() => setShowSendSection(!showSendSection)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                {showSendSection ? 'Cancel' : 'Send Message'}
              </button>
            </div>
          </div>

          {showSendSection && (
            <div className="p-8 space-y-6">
              {/* Success Message */}
              {sendSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-800 font-medium">Message sent successfully!</span>
                  </div>
                </div>
              )}

              {/* Content Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Content to Share
                </label>
                
                {/* Selection Controls */}
                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border">
                  <div className="text-sm text-gray-600">
                    {selectedTopics.size + selectedVideos.size} items selected 
                    ({selectedTopics.size} topics, {selectedVideos.size} videos)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllContent}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium px-3 py-1 rounded border border-orange-200 hover:bg-orange-50"
                    >
                      Select All
                    </button>
                    <button
                      onClick={deselectAllContent}
                      className="text-sm text-gray-600 hover:text-gray-700 font-medium px-3 py-1 rounded border border-gray-200 hover:bg-gray-50"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Topics ({topics.length}) - Click to expand and see videos
                  </h4>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {topics.map((topic) => (
                      <div key={topic.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Topic Header */}
                        <div className="flex items-center">
                          <button
                            onClick={() => handleTopicClick(topic)}
                            className="flex-1 text-left p-3 hover:bg-gray-50 transition-all duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">{topic.name}</div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {topic.is_private ? '🔒 Private' : '🌐 Public'} Topic
                                  {expandedTopic === topic.id && topicSections.length > 0 && 
                                    ` • ${topicSections.reduce((acc, section) => acc + section.videos.length, 0)} videos`
                                  }
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-400">
                                  {expandedTopic === topic.id ? '▼' : '▶'}
                                </span>
                              </div>
                            </div>
                          </button>
                          
                          {/* Topic Selection Checkbox */}
                          <div className="px-4 py-3 border-l border-gray-200">
                            <button
                              onClick={() => toggleTopicSelection(topic.id)}
                              className="flex items-center space-x-2"
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                selectedTopics.has(topic.id)
                                  ? 'bg-orange-500 border-orange-500'
                                  : 'border-gray-300 hover:border-orange-400'
                              }`}>
                                {selectedTopics.has(topic.id) && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <span className="text-sm font-medium text-gray-700">
                                {selectedTopics.has(topic.id) ? 'Selected' : 'Select Topic'}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Expanded Sections and Videos */}
                        {expandedTopic === topic.id && (
                          <div className="border-t border-gray-200 bg-gray-50">
                            {topicSections.length === 0 ? (
                              <div className="p-4 text-center text-gray-500">
                                <VideoCameraIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p>No videos found for this topic</p>
                              </div>
                            ) : (
                              <div className="p-4 space-y-4">
                                {topicSections.map((section) => (
                                  <div key={section.id}>
                                    <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 border-b border-gray-300 pb-1">
                                      {section.name}
                                    </h5>
                                    <div className="space-y-2 ml-2">
                                      {section.videos.map((video: any) => (
                                        <button
                                          key={video.id}
                                          onClick={() => toggleVideoSelection(video.id, video.name, topic.name)}
                                          className={`w-full text-left p-2 rounded-md border transition-all duration-200 ${
                                            selectedVideos.has(video.id)
                                              ? 'border-orange-500 bg-orange-100'
                                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                          }`}
                                        >
                                          <div className="flex items-center space-x-2">
                                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                              selectedVideos.has(video.id)
                                                ? 'bg-orange-500 border-orange-500'
                                                : 'border-gray-300'
                                            }`}>
                                              {selectedVideos.has(video.id) && (
                                                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                              )}
                                            </div>
                                            <VideoCameraIcon className="h-4 w-4 text-gray-400" />
                                            <div className="flex-1">
                                              <div className="text-sm font-medium text-gray-900">{video.name}</div>
                                            </div>
                                            {selectedVideos.has(video.id) && (
                                              <span className="text-xs text-orange-600 font-medium">✓</span>
                                            )}
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {topics.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <DocumentTextIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>No topics available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recipient Name */}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Phone Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Phone Number *
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Message Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Preview
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Your message will appear here when you select content..."
                />
              </div>

              {/* Error Message */}
              {sendError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-800">{sendError}</span>
                  </div>
                </div>
              )}

              {/* Send Button */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowSendSection(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || (selectedTopics.size === 0 && selectedVideos.size === 0) || !phoneNumber || !customMessage}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    sending || (selectedTopics.size === 0 && selectedVideos.size === 0) || !phoneNumber || !customMessage
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg transform hover:scale-105'
                  }`}
                >
                  {sending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <ShareIcon className="h-5 w-5 mr-2" />
                      Send SMS
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Messages Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Recent Messages</h2>
            <p className="text-gray-600 mt-1">Your SMS message history and delivery status</p>
          </div>
          
          {messages.length === 0 ? (
            <div className="p-12 text-center">
              <ChatBubbleLeftRightIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Messages Yet</h3>
              <p className="text-gray-600 mb-2">You haven&apos;t sent any SMS messages yet.</p>
              <p className="text-sm text-gray-500">Use the &ldquo;Send New Message&rdquo; section above to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {messages.map((message) => (
                <div key={message.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="inline-flex items-center justify-center w-10 h-10 bg-amber-100 rounded-xl">
                        <PhoneIcon className="h-5 w-5 text-amber-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-gray-900">
                            To: {message.recipient_name ? `${message.recipient_name} (${formatPhoneNumber(message.recipient)})` : formatPhoneNumber(message.recipient)}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Delivered
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {formatDate(message.sent_at)}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-l-4 border-amber-500">
                        <p className="text-gray-800 leading-relaxed">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Breakdown Modals */}
        <SMSBreakdownModal
          isOpen={totalMessagesModalOpen}
          onClose={() => setTotalMessagesModalOpen(false)}
          type="total"
          messages={messages}
          title="Total Messages Breakdown"
        />
        
        <SMSBreakdownModal
          isOpen={thisWeekModalOpen}
          onClose={() => setThisWeekModalOpen(false)}
          type="week"
          messages={messages}
          title="This Week's Messages"
        />
        
        <SMSBreakdownModal
          isOpen={uniqueRecipientsModalOpen}
          onClose={() => setUniqueRecipientsModalOpen(false)}
          type="recipients"
          messages={messages}
          title="Unique Recipients Breakdown"
        />
      </div>
    </div>
  );
} 