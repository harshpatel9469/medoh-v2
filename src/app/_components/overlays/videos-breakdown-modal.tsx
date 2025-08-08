'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PlayIcon, FolderIcon } from '@heroicons/react/24/outline';
import { fetchDoctorWithDetailedStats, DoctorWithStats } from '../../_api/doctor-stats';
import { fetchTopicsWithPrivacyByDoctorId, TopicWithPrivacy } from '../../admin/doctors/doctor-privacy-controls';
import LoadingSpinner from '../loading-spinner';
import Image from 'next/image';

interface VideosBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  totalVideos: number;
}

interface VideosByTopic {
  topic: TopicWithPrivacy;
  videos: any[];
  videoCount: number;
}

export default function VideosBreakdownModal({ isOpen, onClose, doctorId, totalVideos }: VideosBreakdownModalProps) {
  const [loading, setLoading] = useState(false);
  const [videosByTopic, setVideosByTopic] = useState<VideosByTopic[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && doctorId) {
      loadVideosBreakdown();
    }
  }, [isOpen, doctorId]);

  const loadVideosBreakdown = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get detailed stats with videos
      const doctorStats = await fetchDoctorWithDetailedStats(doctorId);
      if (!doctorStats) {
        setError('Unable to load video statistics');
        return;
      }

      // Get topics to group videos by
      const topics = await fetchTopicsWithPrivacyByDoctorId(doctorId);
      const publicTopics = topics.filter(topic => !topic.is_private);

      // Group videos by topic using REAL topic relationships from database
      const topicVideoMap = new Map<string, any[]>();
      
      // Initialize all topics with empty arrays
      publicTopics.forEach(topic => {
        topicVideoMap.set(topic.id, []);
      });

      // Group videos by their actual topic_id (from corrected fetchDoctorWithDetailedStats)
      doctorStats.videos.forEach((video) => {
        if (video.topic_id) {
          const existingVideos = topicVideoMap.get(video.topic_id) || [];
          topicVideoMap.set(video.topic_id, [...existingVideos, video]);
        }
      });

      // Convert to array format
      const breakdown: VideosByTopic[] = publicTopics.map(topic => ({
        topic,
        videos: topicVideoMap.get(topic.id) || [],
        videoCount: (topicVideoMap.get(topic.id) || []).length
      }));

      // Sort by video count descending
      breakdown.sort((a, b) => b.videoCount - a.videoCount);
      
      setVideosByTopic(breakdown);
    } catch (err) {
      console.error('Error loading videos breakdown:', err);
      setError('Failed to load videos breakdown');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-xl p-2">
                <PlayIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Videos Breakdown</h2>
                <p className="text-amber-100">Total: {totalVideos} videos across topics</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 font-medium">{error}</div>
            </div>
          ) : (
            <div className="space-y-6">
              {videosByTopic.map((topicData, index) => (
                <div key={topicData.topic.id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                        <FolderIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{topicData.topic.name}</h3>
                        <p className="text-sm text-gray-600">{topicData.videoCount} videos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-600">{topicData.videoCount}</div>
                      <div className="text-xs text-gray-500">videos</div>
                    </div>
                  </div>

                  {topicData.videos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {topicData.videos.slice(0, 4).map((video) => (
                        <div key={video.video_id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {video.video_thumbnail ? (
                              <Image
                                src={video.video_thumbnail}
                                alt={video.video_name}
                                width={64}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <PlayIcon className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{video.video_name}</h4>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span>{video.views} views</span>
                              <span>{video.likes} likes</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {topicData.videos.length > 4 && (
                        <div className="text-center text-sm text-gray-500 md:col-span-2">
                          +{topicData.videos.length - 4} more videos
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      No videos in this topic yet
                    </div>
                  )}
                </div>
              ))}

              {videosByTopic.length === 0 && (
                <div className="text-center py-12">
                  <FolderIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Topics Found</h3>
                  <p className="text-gray-600">Create some topics to organize your videos</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 