'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { fetchDoctorById } from '../../_api/doctors';
import { useAuth } from '../../_contexts/auth-context';
import { 
  fetchTopicsWithPrivacyByDoctorId, 
  updateMultipleTopicPrivacy, 
  TopicWithPrivacy 
} from '../../admin/doctors/doctor-privacy-controls';
import Link from 'next/link';
import Image from 'next/image';
import TopicShareModal from '../../_components/overlays/topic-share-modal';
import DownloadVideosModal from '../../_components/overlays/download-videos-modal';
import { 
  DocumentTextIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  ShareIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

export default function MyPagesPage() {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [topics, setTopics] = useState<TopicWithPrivacy[]>([]);
  const [originalTopics, setOriginalTopics] = useState<TopicWithPrivacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    topicId: string;
    topicName: string;
  }>({
    isOpen: false,
    topicId: '',
    topicName: ''
  });
  const [downloadModal, setDownloadModal] = useState<{
    isOpen: boolean;
    topicId: string;
    topicTitle: string;
  }>({
    isOpen: false,
    topicId: '',
    topicTitle: ''
  });
  const { impersonatedDoctorId } = useAuth();

  useEffect(() => {
    async function loadDoctorId() {
      setLoading(true);
      setError(null);
      console.log('Loading doctor ID, impersonatedDoctorId:', impersonatedDoctorId);
      try {
        // If there's an impersonated doctor ID, use that directly
        if (impersonatedDoctorId) {
          console.log('Using impersonated doctor ID:', impersonatedDoctorId);
          const impersonatedDoctor = await fetchDoctorById(impersonatedDoctorId);
          console.log('Impersonated doctor data:', impersonatedDoctor);
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
        console.log('No impersonation, checking normal auth');
        const supabase = createClientComponentClient();
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Current user:', user);
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
        console.log('Doctor lookup result:', { doctor, doctorError });
        if (doctorError || !doctor) {
          setError('No doctor profile found for this user.');
          setLoading(false);
          return;
        }
        setDoctorId(doctor.id);
        setDoctor(doctor);
      } catch (e) {
        console.error('Error loading doctor info:', e);
        setError('Failed to load doctor info.');
        setLoading(false);
      }
      setLoading(false);
    }
    loadDoctorId();
  }, [impersonatedDoctorId]);

  useEffect(() => {
    if (!doctorId) return;
    async function loadTopics() {
      setLoading(true);
      setError(null);
      console.log('Loading topics for doctor ID:', doctorId);
      try {
        if (typeof doctorId !== 'string') {
          console.error('Doctor ID is not a string:', doctorId);
          return;
        }
        console.log('About to call fetchTopicsWithPrivacyByDoctorId...');
        const doctorTopics = await fetchTopicsWithPrivacyByDoctorId(doctorId);
        console.log('Loaded topics successfully:', doctorTopics);
        setTopics(doctorTopics);
        setOriginalTopics(doctorTopics);
      } catch (e) {
        console.error('Error loading topics:', e);
        console.error('Error details:', e instanceof Error ? e.message : 'Unknown error');
        console.error('Error stack:', e instanceof Error ? e.stack : 'No stack trace');
        setError(`Failed to load topics: ${e instanceof Error ? e.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }
    loadTopics();
  }, [doctorId]);

  const toggleTopicPrivacy = (topicId: string) => {
    console.log('=== UI TOGGLE DEBUG ===');
    console.log('Toggling privacy for topic:', topicId);
    
    const currentTopic = topics.find(t => t.id === topicId);
    console.log('Current topic state:', currentTopic);
    console.log('Current is_private value:', currentTopic?.is_private);
    
    setTopics(prevTopics => 
      prevTopics.map(topic => {
        if (topic.id === topicId) {
          const newPrivacyValue = !topic.is_private;
          console.log(`Topic ${topicId} privacy changing from ${topic.is_private} to ${newPrivacyValue}`);
          return { ...topic, is_private: newPrivacyValue };
        }
        return topic;
      })
    );
    setSuccessMessage(null); // Clear success message when changes are made
  };

  const saveChanges = async () => {
    if (!doctorId) return;
    
    setSaving(true);
    setError(null);
    
    try {
      // Find topics that have changed privacy status using ID-based comparison
      const changes = topics
        .filter((topic) => {
          const originalTopic = originalTopics.find(orig => orig.id === topic.id);
          return originalTopic && topic.is_private !== originalTopic.is_private;
        })
        .map(topic => ({
          topicId: topic.id,
          makePrivate: topic.is_private
        }));

      if (changes.length === 0) {
        setSuccessMessage('No changes to save.');
        setSaving(false);
        return;
      }

      console.log('Saving privacy changes:', changes);
      await updateMultipleTopicPrivacy(changes);
      
      // Refresh the data from database to ensure it's up to date
      const refreshedTopics = await fetchTopicsWithPrivacyByDoctorId(doctorId);
      setTopics(refreshedTopics);
      setOriginalTopics(refreshedTopics);
      
      setSuccessMessage(`Successfully updated privacy for ${changes.length} topic${changes.length > 1 ? 's' : ''}.`);
    } catch (e) {
      setError('Failed to save changes. Please try again.');
      console.error('Error saving privacy changes:', e);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = topics.some((topic) => {
    const originalTopic = originalTopics.find(orig => orig.id === topic.id);
    return originalTopic && topic.is_private !== originalTopic.is_private;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your pages...</p>
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

  if (!doctorId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-600">No doctor profile found.</div>
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl mb-6 shadow-lg">
              <DocumentTextIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Pages</h1>
            <p className="text-xl text-gray-600">Manage privacy settings for topics where you&apos;ve created content</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center space-x-3">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3">
            <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Save Changes Notification */}
        {hasChanges && (
          <div className="mb-6 bg-amber-600 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ExclamationCircleIcon className="h-6 w-6" />
                <p className="font-medium">You have unsaved privacy changes.</p>
              </div>
              <button
                onClick={saveChanges}
                disabled={saving}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  saving
                    ? 'bg-white/20 text-white/60 cursor-not-allowed'
                    : 'bg-white text-amber-600 hover:bg-amber-50 shadow-lg transform hover:scale-105'
                }`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {topics.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <div className="text-center">
              <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Pages Created Yet</h3>
              <p className="text-gray-600 mb-2">You haven&apos;t created content for any topics yet.</p>
              <p className="text-sm text-gray-500">Create videos for topic sections to see them here.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topics.map((topic) => {
              console.log(`Rendering topic ${topic.name} with is_private:`, topic.is_private, typeof topic.is_private);
              return (
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
                    
                    {/* Privacy Status Badge - moved to top left */}
                    <div className="absolute top-3 left-3">
                      <div className={`flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded-full shadow-lg ${
                        topic.is_private
                          ? 'bg-red-500 text-white' 
                          : 'bg-green-500 text-white'
                      }`}>
                        {topic.is_private ? (
                          <EyeSlashIcon className="h-3 w-3" />
                        ) : (
                          <EyeIcon className="h-3 w-3" />
                        )}
                        <span>{topic.is_private ? 'Private' : 'Public'}</span>
                      </div>
                    </div>

                    {/* Privacy Toggle - moved to top right over image */}
                    <div className="absolute top-3 right-3">
                      <label className="flex items-center cursor-pointer group bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={!!topic.is_private}
                            onChange={() => toggleTopicPrivacy(topic.id)}
                            className="sr-only"
                          />
                          <div className={`w-8 h-4 rounded-full shadow-inner transition-colors duration-200 ${
                            topic.is_private ? 'bg-red-500' : 'bg-green-500'
                          }`}>
                            <div className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full shadow transform transition-transform duration-200 ${
                              topic.is_private ? 'translate-x-4' : 'translate-x-0'
                            }`}></div>
                          </div>
                        </div>
                        <span className="ml-2 text-xs font-medium text-gray-700 group-hover:text-gray-900">
                          Private
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Topic Info */}
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2 text-lg line-clamp-2">
                      {topic.name}
                    </h3>
                    {topic.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {topic.description}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <button
                          onClick={() => setDownloadModal({
                            isOpen: true,
                            topicId: topic.id,
                            topicTitle: topic.name
                          })}
                          className="flex items-center space-x-1 text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors hover:bg-orange-50 px-2 py-1 rounded-lg"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                        <button
                          onClick={() => setShareModal({
                            isOpen: true,
                            topicId: topic.id,
                            topicName: topic.name
                          })}
                          className="flex items-center space-x-1 text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors hover:bg-orange-50 px-2 py-1 rounded-lg"
                        >
                          <ShareIcon className="h-4 w-4" />
                          <span>Share</span>
                        </button>
                        <Link 
                          href={`/dashboard/topics/info/${topic.id}`}
                          className="flex items-center space-x-1 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors hover:bg-amber-50 px-2 py-1 rounded-lg"
                        >
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          <span>View</span>
                        </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bulk Save Button at Bottom */}
        {topics.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={saveChanges}
              disabled={saving || !hasChanges}
              className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                saving || !hasChanges
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg transform hover:scale-105'
              }`}
            >
              {saving ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving Changes...</span>
                </div>
              ) : hasChanges ? (
                'Save All Changes'
              ) : (
                'No Changes to Save'
              )}
            </button>
          </div>
        )}

        {/* Share Modal */}
        <TopicShareModal
          isOpen={shareModal.isOpen}
          onClose={() => setShareModal({ isOpen: false, topicId: '', topicName: '' })}
          topicId={shareModal.topicId}
          topicName={shareModal.topicName}
          doctorName={doctor?.name || 'Doctor'}
          doctorId={doctorId || ''}
        />
        
        <DownloadVideosModal
          isOpen={downloadModal.isOpen}
          onClose={() => setDownloadModal({ isOpen: false, topicId: '', topicTitle: '' })}
          topicId={downloadModal.topicId}
          topicTitle={downloadModal.topicTitle}
          doctorId={doctorId || ''}
        />
      </div>
    </div>
  );
} 