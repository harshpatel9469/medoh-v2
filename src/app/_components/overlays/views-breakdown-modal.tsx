'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, EyeIcon, PlayIcon, FireIcon } from '@heroicons/react/24/outline';
import { fetchDoctorWithDetailedStats, DoctorVideoInfo } from '../../_api/doctor-stats';
import LoadingSpinner from '../loading-spinner';
import Image from 'next/image';

interface ViewsBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  totalViews: number;
}

export default function ViewsBreakdownModal({ isOpen, onClose, doctorId, totalViews }: ViewsBreakdownModalProps) {
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<DoctorVideoInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && doctorId) {
      loadViewsBreakdown();
    }
  }, [isOpen, doctorId]);

  const loadViewsBreakdown = async () => {
    setLoading(true);
    setError(null);
    try {
      const doctorStats = await fetchDoctorWithDetailedStats(doctorId);
      if (!doctorStats) {
        setError('Unable to load views statistics');
        return;
      }

      // Sort videos by views (descending)
      const sortedVideos = doctorStats.videos.sort((a, b) => b.views - a.views);
      setVideos(sortedVideos);
    } catch (err) {
      console.error('Error loading views breakdown:', err);
      setError('Failed to load views breakdown');
    } finally {
      setLoading(false);
    }
  };

  const getPopularityLevel = (views: number, maxViews: number) => {
    const percentage = maxViews > 0 ? (views / maxViews) * 100 : 0;
    if (percentage >= 80) return { level: 'Hot', color: 'red', icon: FireIcon };
    if (percentage >= 60) return { level: 'Popular', color: 'orange', icon: EyeIcon };
    if (percentage >= 40) return { level: 'Growing', color: 'yellow', icon: EyeIcon };
    if (percentage >= 20) return { level: 'Steady', color: 'blue', icon: EyeIcon };
    return { level: 'New', color: 'gray', icon: EyeIcon };
  };

  const maxViews = videos.length > 0 ? Math.max(...videos.map(v => v.views)) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-xl p-2">
                <EyeIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Views Breakdown</h2>
                <p className="text-purple-100">Total: {totalViews} views across all videos</p>
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
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">{videos.filter(v => v.views > 0).length}</div>
                  <div className="text-sm text-purple-700">Videos with Views</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-900">
                    {videos.length > 0 ? Math.round(totalViews / videos.length * 10) / 10 : 0}
                  </div>
                  <div className="text-sm text-amber-700">Avg Views per Video</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-900">{maxViews}</div>
                  <div className="text-sm text-red-700">Most Viewed Video</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-900">
                    {videos.length > 0 ? Math.round((videos.filter(v => v.views > 0).length / videos.length) * 100) : 0}%
                  </div>
                  <div className="text-sm text-green-700">Videos Watched</div>
                </div>
              </div>

              {/* Videos Ranking */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Videos Ranked by Views</h3>
                
                {videos.length === 0 ? (
                  <div className="text-center py-12">
                    <EyeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos Found</h3>
                    <p className="text-gray-600">Create some videos to see view statistics</p>
                  </div>
                ) : (
                  videos.map((video, index) => {
                    const popularity = getPopularityLevel(video.views, maxViews);
                    const PopularityIcon = popularity.icon;
                    
                    return (
                      <div
                        key={video.video_id}
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Rank */}
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                              #{index + 1}
                            </div>

                            {/* Video Thumbnail */}
                            <div className="w-20 h-15 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                              {video.video_thumbnail ? (
                                <Image
                                  src={video.video_thumbnail}
                                  alt={video.video_name}
                                  width={80}
                                  height={60}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <PlayIcon className="h-8 w-8 text-gray-400" />
                              )}
                            </div>

                            {/* Video Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="text-lg font-semibold text-gray-900 truncate">
                                  {video.video_name}
                                </h4>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${popularity.color}-100 text-${popularity.color}-800`}>
                                  <PopularityIcon className="h-3 w-3 mr-1" />
                                  {popularity.level}
                                </span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Created: {new Date(video.created_at).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{video.likes} likes</span>
                                <span>•</span>
                                <span>{video.unique_viewers} unique viewers</span>
                              </div>
                            </div>
                          </div>

                          {/* Views Display */}
                          <div className="text-right">
                            <div className="flex items-center space-x-2 text-purple-600 mb-1">
                              <EyeIcon className="h-5 w-5" />
                              <span className="text-2xl font-bold">{video.views}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {totalViews > 0 ? `${Math.round((video.views / totalViews) * 100)}% of total views` : '0%'}
                            </div>
                          </div>
                        </div>

                        

                                                 {/* View metrics */}
                        <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="text-sm font-medium text-gray-900">
                              {video.unique_viewers > 0 ? Math.round((video.views / video.unique_viewers) * 10) / 10 : 0}
                            </div>
                            <div className="text-xs text-gray-600">Views per Viewer</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="text-sm font-medium text-gray-900">
                              {video.views > 0 ? Math.round((video.likes / video.views) * 100) : 0}%
                            </div>
                            <div className="text-xs text-gray-600">Like Rate</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="text-sm font-medium text-gray-900">
                              {video.views > 0 ? Math.round((video.unique_viewers / video.views) * 100) : 0}%
                            </div>
                            <div className="text-xs text-gray-600">Unique Rate</div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 