'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon, PlayIcon, ChartBarIcon, UsersIcon } from '@heroicons/react/24/outline';
import { fetchDoctorWithDetailedStats, DoctorVideoInfo } from '../../_api/doctor-stats';
import LoadingSpinner from '../loading-spinner';
import Image from 'next/image';

interface UniqueViewersBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  totalUniqueViewers: number;
}

export default function UniqueViewersBreakdownModal({ 
  isOpen, 
  onClose, 
  doctorId, 
  totalUniqueViewers 
}: UniqueViewersBreakdownModalProps) {
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<DoctorVideoInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && doctorId) {
      loadUniqueViewersBreakdown();
    }
  }, [isOpen, doctorId]);

  const loadUniqueViewersBreakdown = async () => {
    setLoading(true);
    setError(null);
    try {
      const doctorStats = await fetchDoctorWithDetailedStats(doctorId);
      if (!doctorStats) {
        setError('Unable to load viewer statistics');
        return;
      }

      // Sort videos by unique viewers (descending)
      const sortedVideos = doctorStats.videos.sort((a, b) => b.unique_viewers - a.unique_viewers);
      setVideos(sortedVideos);
    } catch (err) {
      console.error('Error loading unique viewers breakdown:', err);
      setError('Failed to load viewer breakdown');
    } finally {
      setLoading(false);
    }
  };

  // Calculate viewer metrics
  const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
  const averageViewsPerViewer = totalUniqueViewers > 0 ? totalViews / totalUniqueViewers : 0;
  const averageUniqueViewersPerVideo = videos.length > 0 ? totalUniqueViewers / videos.length : 0;



  // Helper function to display realistic metrics
  const getDisplayMetrics = (video: DoctorVideoInfo) => {
    const viewsPerViewer = video.unique_viewers > 0 ? video.views / video.unique_viewers : 0;
    const uniqueRate = video.views > 0 ? (video.unique_viewers / video.views) * 100 : 0;
    const likeRate = video.views > 0 ? (video.likes / video.views) * 100 : 0;
    const shareOfTotal = totalUniqueViewers > 0 ? (video.unique_viewers / totalUniqueViewers) * 100 : 0;

    return {
      viewsPerViewer: Math.min(viewsPerViewer, 999), // Cap at 999 for display
      uniqueRate: Math.min(uniqueRate, 100), // Cap at 100%
      likeRate: Math.min(likeRate, 100), // Cap at 100%
      shareOfTotal: Math.min(shareOfTotal, 100), // Cap at 100%
      hasDataIssues: viewsPerViewer > 10 || uniqueRate > 100 || likeRate > 100
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-xl p-2">
                <UsersIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Unique Viewers Analytics</h2>
                <p className="text-orange-100">Total: {totalUniqueViewers} unique viewers</p>
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
              {/* Key Viewer Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-orange-900">{totalUniqueViewers}</div>
                  <div className="text-sm text-orange-700">Total Unique Viewers</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-900">
                    {Math.round(averageViewsPerViewer * 10) / 10}
                  </div>
                  <div className="text-sm text-amber-700">Avg Views per Viewer</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">
                    {Math.round(averageUniqueViewersPerVideo * 10) / 10}
                  </div>
                  <div className="text-sm text-purple-700">Avg Viewers per Video</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-900">
                    {videos.filter(v => v.unique_viewers > 0).length}
                  </div>
                  <div className="text-sm text-green-700">Videos with Viewers</div>
                </div>
              </div>

              {/* Viewer Insights */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
                                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    Viewer Insights
                  </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Viewer Behavior</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• Average {Math.round(averageViewsPerViewer * 10) / 10} views per person</p>
                      <p>• Each viewer watches your content {Math.round(averageViewsPerViewer * 10) / 10} times on average</p>
                      <p>• {videos.filter(v => v.views > 0).length} videos have been watched</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Content Performance</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• {videos.filter(v => v.unique_viewers > 0).length} out of {videos.length} videos have viewers</p>
                      <p>• Top video: {videos.length > 0 ? Math.max(...videos.map(v => v.unique_viewers)) : 0} unique viewers</p>
                      <p>• Total reach: {totalUniqueViewers} different people have watched your videos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Videos by Unique Viewers */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Videos Ranked by Unique Viewers</h3>
                
                {videos.length === 0 ? (
                  <div className="text-center py-12">
                    <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos Found</h3>
                    <p className="text-gray-600">Create some videos to see viewer analytics</p>
                  </div>
                                 ) : (
                   videos.map((video, index) => {
                     const metrics = getDisplayMetrics(video);
                     
                     return (
                      <div
                        key={video.video_id}
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4">
                            {/* Rank */}
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold">
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
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Created: {new Date(video.created_at).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{video.views} total views</span>
                                <span>•</span>
                                <span>{video.likes} likes</span>
                              </div>
                            </div>
                          </div>

                          {/* Unique Viewers Display */}
                          <div className="text-right">
                            <div className="flex items-center space-x-2 text-orange-600 mb-1">
                              <UserIcon className="h-5 w-5" />
                              <span className="text-2xl font-bold">{video.unique_viewers}</span>
                            </div>
                            <div className="text-xs text-gray-500">unique viewers</div>
                          </div>
                        </div>

                                                 {/* Viewer Metrics Grid */}
                         <div className="grid grid-cols-4 gap-3 mt-3">
                           <div className="bg-gray-50 rounded-lg p-3 text-center">
                             <div className="text-lg font-bold text-gray-900">
                               {Math.round(metrics.viewsPerViewer * 10) / 10}
                             </div>
                             <div className="text-xs text-gray-600">Views per Viewer</div>
                           </div>
                           <div className="bg-gray-50 rounded-lg p-3 text-center">
                             <div className="text-lg font-bold text-gray-900">
                               {Math.round(metrics.uniqueRate)}%
                             </div>
                             <div className="text-xs text-gray-600">Unique Rate</div>
                           </div>
                           <div className="bg-gray-50 rounded-lg p-3 text-center">
                             <div className="text-lg font-bold text-gray-900">
                               {Math.round(metrics.likeRate)}%
                             </div>
                             <div className="text-xs text-gray-600">Like Rate</div>
                           </div>
                           <div className="bg-gray-50 rounded-lg p-3 text-center">
                             <div className="text-lg font-bold text-gray-900">
                               {Math.round(metrics.shareOfTotal)}%
                             </div>
                             <div className="text-xs text-gray-600">Share of Total</div>
                           </div>
                         </div>
                         
                         {/* Data Quality Warning */}
                         {metrics.hasDataIssues && (
                           <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                             <div className="text-xs text-yellow-800">
                               ⚠️ Some metrics may be inaccurate due to data inconsistencies
                             </div>
                           </div>
                         )}


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