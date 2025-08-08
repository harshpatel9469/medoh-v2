'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { fetchVideosByDoctorId } from '../../_api/videos';
import { fetchTopicsWithPrivacyByDoctorId } from '../../admin/doctors/doctor-privacy-controls';
import { fetchDoctorById } from '../../_api/doctors';
import { fetchMessagesByDoctorId, Message } from '../../_api/messages';
import { fetchDoctorWithDetailedStats } from '../../_api/doctor-stats';
import { useAuth } from '../../_contexts/auth-context';
import Image from 'next/image';
import Link from 'next/link';
import { PlayIcon, DocumentTextIcon, ChatBubbleLeftRightIcon, UserIcon, Cog6ToothIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

export default function DoctorPortalHome() {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [smsMessages, setSmsMessages] = useState<Message[]>([]);
  const [correctVideoCount, setCorrectVideoCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { impersonatedDoctorId, isImpersonating, setImpersonatedDoctorId } = useAuth();

  useEffect(() => {
    async function loadDoctorId() {
      setLoading(true);
      setError(null);
      try {
        // If there's an impersonated doctor ID, use that directly (admin acting as doctor)
        if (impersonatedDoctorId) {
          console.log('Using impersonated doctor ID:', impersonatedDoctorId);
          const impersonatedDoctor = await fetchDoctorById(impersonatedDoctorId);
          if (impersonatedDoctor) {
            setDoctor(impersonatedDoctor);
            setDoctorId(impersonatedDoctor.id);
            setIsAdmin(true); // Still show admin controls
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
        console.log('Supabase user:', user);
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
        const { data: doctor, error: doctorError } = await supabase
          .from('doctors')
          .select('*')
          .eq('user_id', user.id)
          .single();
        console.log('Doctor from DB:', doctor, 'Error:', doctorError);
        if (doctorError || !doctor) {
          // If it's an admin and no doctor profile, show admin interface
          if (userIsAdmin) {
            setError(null);
            setLoading(false);
            return;
          }
          setError('No doctor profile found for this user.');
          setLoading(false);
          return;
        }
        setDoctor(doctor);
        setDoctorId(doctor.id);
      } catch (e) {
        setError('Failed to load doctor info.');
        setLoading(false);
        console.error('Error loading doctor info:', e);
      }
    }
    loadDoctorId();
  }, [impersonatedDoctorId]); // Re-run when impersonation changes

  useEffect(() => {
    if (!doctorId) return;
    async function loadData() {
      setLoading(true);
      try {
        if (typeof doctorId !== 'string') return;
        
        // Fetch corrected video count using same logic as Public Content
        console.log('Home page: Getting corrected video count for doctor:', doctorId);
        const doctorStats = await fetchDoctorWithDetailedStats(doctorId);
        setCorrectVideoCount(doctorStats?.total_videos || 0);
        console.log('Home page: Corrected video count:', doctorStats?.total_videos);
        
        // Still fetch videos for recent videos display
        const v = await fetchVideosByDoctorId(doctorId);
        setVideos(v);
        
        const doctorTopics = await fetchTopicsWithPrivacyByDoctorId(doctorId);
        setPages(doctorTopics);
        const sms = await fetchMessagesByDoctorId(doctorId);
        setSmsMessages(sms);
      } catch (e) {
        setError('Failed to load doctor data.');
        console.error('Error loading doctor data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [doctorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-red-600 text-center">{error}</div>
        </div>
      </div>
    );
  }
  
  // If admin with no doctor profile, show admin interface
  if (isAdmin && !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <UserIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
              <p className="text-gray-600">
                Welcome! You can impersonate any doctor to view their portal.
              </p>
            </div>
            <div className="space-y-4">
              <Link href="/admin/doctors" className="block">
                <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl px-8 py-4 text-lg shadow-lg transition-all duration-200 transform hover:scale-105">
                  Impersonate Doctor
                </button>
              </Link>
              {isImpersonating && (
                <button 
                  onClick={() => setImpersonatedDoctorId(null)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl px-8 py-4 text-lg shadow-lg transition-all duration-200"
                >
                  Stop Current Impersonation
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-gray-600 text-center">No doctor profile found.</div>
        </div>
      </div>
    );
  }

  const todaySmsCount = smsMessages.filter(msg => {
    const msgDate = new Date(msg.sent_at);
    const today = new Date();
    return msgDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Admin Banner */}
        {isAdmin && (
          <div className="bg-amber-600 text-white rounded-2xl p-4 mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Cog6ToothIcon className="h-6 w-6" />
                <div>
                  <h2 className="font-semibold">
                    {isImpersonating ? `Admin Mode - Impersonating ${doctor.name}` : 'Admin Mode'}
                  </h2>
                  <p className="text-amber-100 text-sm">
                    {isImpersonating 
                      ? 'You are viewing this portal as the impersonated doctor.'
                      : 'You are viewing this portal as an administrator.'
                    }
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link href="/admin/doctors">
                  <button className="bg-white text-amber-600 font-medium rounded-lg px-4 py-2 text-sm hover:bg-amber-50 transition-colors">
                    {isImpersonating ? 'Switch Doctor' : 'Impersonate Doctor'}
                  </button>
                </Link>
                {isImpersonating && (
                  <button 
                    onClick={() => setImpersonatedDoctorId(null)}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
            <div className="relative">
              <Image 
                src={doctor.picture_url || '/doctor1.gif'} 
                alt={doctor.name} 
                width={120} 
                height={120} 
                className="w-30 h-30 rounded-3xl object-cover shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-orange-500 rounded-full p-2">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{doctor.name}</h1>
              <p className="text-xl text-gray-600 mb-6">{doctor.specialty}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/doctor-portal/profile">
                  <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl px-6 py-3 transition-all duration-200 transform hover:scale-105 shadow-lg">
                    Edit Profile
                  </button>
                </Link>
                <Link href="/doctor-portal/my-pages">
                  <button className="bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-semibold rounded-xl px-6 py-3 transition-all duration-200">
                    Manage Pages
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/doctor-portal/my-pages" className="block">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <DocumentTextIcon className="h-8 w-8 text-orange-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{pages.length}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Pages Created</h3>
              <p className="text-gray-600">Specialized content for patients</p>
            </div>
          </Link>

          <Link href="/doctor-portal/public-content" className="block">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <PlayIcon className="h-8 w-8 text-amber-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{correctVideoCount}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Videos Created</h3>
              <p className="text-gray-600">Educational video content</p>
            </div>
          </Link>

          <Link href="/doctor-portal/sms" className="block">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-orange-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{todaySmsCount}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">SMS Today</h3>
              <p className="text-gray-600">Messages sent today</p>
            </div>
          </Link>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Videos */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Videos</h2>
              {videos.length > 0 && (
                <Link href="/doctor-portal/my-pages" className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center space-x-1">
                  <span>View all</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div className="space-y-3">
              {videos.length === 0 ? (
                <div className="text-center py-8">
                  <PlayIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No videos created yet</p>
                  <p className="text-sm text-gray-400">Start by creating content for your patients</p>
                </div>
              ) : (
                videos.slice(0, 5).map(video => (
                  <Link
                    key={video.id}
                    href={`/dashboard/question/${video.question_id || video.id}`}
                    className="block p-4 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg group-hover:bg-orange-100 transition-colors">
                        <PlayIcon className="h-5 w-5 text-gray-600 group-hover:text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 group-hover:text-orange-900 transition-colors">
                          {video.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent SMS */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Messages</h2>
              {smsMessages.length > 0 && (
                <Link href="/doctor-portal/sms" className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center space-x-1">
                  <span>View all</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div className="space-y-3">
              {smsMessages.length === 0 ? (
                <div className="text-center py-8">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No messages sent yet</p>
                  <p className="text-sm text-gray-400">Share your content via SMS with patients</p>
                </div>
              ) : (
                smsMessages.slice(0, 4).map((sms) => {
                  const formatPhoneNumber = (phone: string) => {
                    // Remove all non-digits
                    const cleaned = phone.replace(/\D/g, '');
                    if (cleaned.length >= 11 && cleaned.startsWith('1')) {
                      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
                    }
                    return phone;
                  };
                  
                  return (
                    <div key={sms.id} className="p-4 bg-gray-50 rounded-xl">
                      <p className="font-medium text-gray-900 text-sm truncate mb-2">
                        {sms.message.length > 60 ? `${sms.message.substring(0, 60)}...` : sms.message}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {sms.recipient_name ? `${sms.recipient_name} (${formatPhoneNumber(sms.recipient)})` : formatPhoneNumber(sms.recipient)}
                        </span>
                        <span>{new Date(sms.sent_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 