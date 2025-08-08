'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { fetchDoctorById } from '../../_api/doctors';
import { useAuth } from '../../_contexts/auth-context';
import { fetchTopicsWithPrivacyByDoctorId, TopicWithPrivacy } from '../../admin/doctors/doctor-privacy-controls';
import { fetchPublicDoctorStats, DoctorStats, fetchDoctorWithDetailedStats } from '../../_api/doctor-stats';
import TopicCard from '../../_components/cards/topic-card';
import { 
  EyeIcon, 
  HandThumbUpIcon, 
  PlayIcon, 
  UserIcon, 
  GlobeAltIcon,
  ExclamationCircleIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import VideosBreakdownModal from '../../_components/overlays/videos-breakdown-modal';
import LikesBreakdownModal from '../../_components/overlays/likes-breakdown-modal';
import ViewsBreakdownModal from '../../_components/overlays/views-breakdown-modal';
import UniqueViewersBreakdownModal from '../../_components/overlays/unique-viewers-breakdown-modal';

export default function PublicContentPage() {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [topics, setTopics] = useState<TopicWithPrivacy[]>([]);
  const [doctorStats, setDoctorStats] = useState<DoctorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videosModalOpen, setVideosModalOpen] = useState(false);
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const [viewsModalOpen, setViewsModalOpen] = useState(false);
  const [uniqueViewersModalOpen, setUniqueViewersModalOpen] = useState(false);
  const { impersonatedDoctorId } = useAuth();

  useEffect(() => {
    async function loadDoctorId() {
      setLoading(true);
      setError(null);
      try {
        // If there's an impersonated doctor ID, use that directly
        if (impersonatedDoctorId) {
          const impersonatedDoctor = await fetchDoctorById(impersonatedDoctorId);
          if (impersonatedDoctor) {
            setDoctorId(impersonatedDoctor.id);
            setDoctor(impersonatedDoctor);
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
        const { data: doctor, error: doctorError } = await supabase
          .from('doctors')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (doctorError || !doctor) {
          setError('No doctor profile found for this user.');
          setLoading(false);
          return;
        }
        setDoctorId(doctor.id);
        setDoctor(doctor);
      } catch (e) {
        setError('Failed to load doctor info.');
        setLoading(false);
      }
      setLoading(false);
    }
    loadDoctorId();
  }, [impersonatedDoctorId]);

  useEffect(() => {
    if (!doctorId) return;
    async function loadPublicTopicsAndStats() {
      setLoading(true);
      setError(null);
      try {
        if (typeof doctorId !== 'string') return;
        
        console.log('Loading topics for doctor:', doctorId);
        
        // Get topics created by this doctor that are public (not private)
        const doctorTopics = await fetchTopicsWithPrivacyByDoctorId(doctorId);
        console.log('Fetched doctor topics:', doctorTopics);
        
        // Filter to only show public topics (where is_private is false or null)
        const publicTopics = doctorTopics.filter(topic => !topic.is_private);
        console.log('Public topics:', publicTopics);
        
        setTopics(publicTopics);
        
        // Get doctor stats - using the same accurate function as the modals
        try {
          console.log('Fetching detailed stats for doctor:', doctorId);
          const detailedStats = await fetchDoctorWithDetailedStats(doctorId);
          console.log('Detailed doctor stats:', detailedStats);
          
          if (detailedStats) {
            // Convert detailed stats to the format expected by the cards
            const doctorStatsForCards = {
              doctor_id: detailedStats.doctor_id,
              doctor_name: detailedStats.doctor_name,
              total_videos: detailedStats.total_videos,
              total_likes: detailedStats.total_likes,
              total_views: detailedStats.total_views,
              total_unique_viewers: detailedStats.total_unique_viewers
            };
            setDoctorStats(doctorStatsForCards);
          } else {
            setDoctorStats(null);
          }
        } catch (statsError) {
          console.error('Error loading doctor stats (non-critical):', statsError);
          // Set default stats so page still works
          if (doctorId) {
            setDoctorStats({
              doctor_id: doctorId,
              doctor_name: doctor?.name || 'Unknown Doctor',
              total_videos: 0,
              total_likes: 0,
              total_views: 0,
              total_unique_viewers: 0
            });
          }
        }
        
      } catch (e) {
        setError('Failed to load public content.');
        console.error('Error loading public content:', e);
      } finally {
        setLoading(false);
      }
    }
    loadPublicTopicsAndStats();
  }, [doctorId, doctor?.name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading public content...</p>
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
        {/* Header Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl mb-6 shadow-lg">
              <GlobeAltIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Public Content</h1>
            <p className="text-xl text-gray-600">Your public content performance and visibility</p>
          </div>
        </div>

        {/* Doctor Stats Section */}
        {doctorStats && (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {doctor?.name || 'Your'} Public Content Statistics
              </h2>
              <p className="text-gray-600">Performance metrics for your public content</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <button 
                onClick={() => setVideosModalOpen(true)}
                className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105"
              >
                                  <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500 rounded-xl mb-4 shadow-lg">
                  <PlayIcon className="h-6 w-6 text-white" />
                </div>
                                  <div className="text-3xl font-bold text-amber-900 mb-1">{doctorStats.total_videos}</div>
                  <div className="text-sm font-medium text-amber-700">Videos</div>
                  <div className="text-xs text-amber-600 mt-1">Click for breakdown</div>
              </button>
              
              <button 
                onClick={() => setLikesModalOpen(true)}
                className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500 rounded-xl mb-4 shadow-lg">
                  <HandThumbUpIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-orange-900 mb-1">{doctorStats.total_likes}</div>
                <div className="text-sm font-medium text-orange-700">Likes</div>
                <div className="text-xs text-orange-600 mt-1">Click for breakdown</div>
              </button>
              
              <button 
                onClick={() => setViewsModalOpen(true)}
                className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500 rounded-xl mb-4 shadow-lg">
                  <EyeIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-amber-900 mb-1">{doctorStats.total_views}</div>
                <div className="text-sm font-medium text-amber-700">Views</div>
                <div className="text-xs text-amber-600 mt-1">Click for breakdown</div>
              </button>
              
              <button 
                onClick={() => setUniqueViewersModalOpen(true)}
                className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500 rounded-xl mb-4 shadow-lg">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-orange-900 mb-1">{doctorStats.total_unique_viewers}</div>
                <div className="text-sm font-medium text-orange-700">Unique Viewers</div>
                <div className="text-xs text-orange-600 mt-1">Click for analytics</div>
              </button>
            </div>
          </div>
        )}

        {/* Topics Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Public Topics</h3>
              <p className="text-gray-600">Content visible to all patients and visitors</p>
            </div>
            {topics.length > 0 && (
              <Link 
                href="/doctor-portal/my-pages"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Manage Privacy
              </Link>
            )}
          </div>
          
          {topics.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h4 className="text-xl font-semibold text-gray-900 mb-2">No Public Topics Yet</h4>
              <p className="text-gray-600 mb-4">You haven&apos;t made any topics public yet.</p>
              <Link 
                href="/doctor-portal/my-pages"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <DocumentTextIcon className="h-5 w-5" />
                <span>Manage Pages</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topics.map((topic) => (
                <div key={topic.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
                  {/* Topic Image */}
                  <div className="aspect-video bg-gray-200 relative">
                    {((topic as any).image_url || topic.image) ? (
                      <Image 
                        src={(topic as any).image_url || topic.image} 
                        alt={topic.name}
                        fill
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <DocumentTextIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Public Status Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full shadow-lg bg-green-500 text-white">
                        <GlobeAltIcon className="h-3 w-3" />
                        <span>Public</span>
                      </div>
                    </div>
                  </div>

                  {/* Topic Info */}
                  <div className="p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{topic.name}</h4>
                    
                    {topic.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{topic.description}</p>
                    )}
                    
                    <Link 
                      href={`/dashboard/topics/info/${topic.id}`}
                      className="inline-flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>View Topic</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Statistics Breakdown Modals */}
      {doctorId && (
        <>
          <VideosBreakdownModal
            isOpen={videosModalOpen}
            onClose={() => setVideosModalOpen(false)}
            doctorId={doctorId}
            totalVideos={doctorStats?.total_videos || 0}
          />
          
          <LikesBreakdownModal
            isOpen={likesModalOpen}
            onClose={() => setLikesModalOpen(false)}
            doctorId={doctorId}
            totalLikes={doctorStats?.total_likes || 0}
          />
          
          <ViewsBreakdownModal
            isOpen={viewsModalOpen}
            onClose={() => setViewsModalOpen(false)}
            doctorId={doctorId}
            totalViews={doctorStats?.total_views || 0}
          />
          
          <UniqueViewersBreakdownModal
            isOpen={uniqueViewersModalOpen}
            onClose={() => setUniqueViewersModalOpen(false)}
            doctorId={doctorId}
            totalUniqueViewers={doctorStats?.total_unique_viewers || 0}
          />
        </>
      )}
    </div>
  );
} 