'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, HandThumbUpIcon, PlayIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { fetchDoctorWithDetailedStats, DoctorVideoInfo } from '../../_api/doctor-stats';
import LoadingSpinner from '../loading-spinner';
import Image from 'next/image';

interface LikesBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  totalLikes: number;
}

export default function LikesBreakdownModal({ isOpen, onClose, doctorId, totalLikes }: LikesBreakdownModalProps) {
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<DoctorVideoInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && doctorId) {
      loadLikesBreakdown();
    }
  }, [isOpen, doctorId]);

  const loadLikesBreakdown = async () => {
    setLoading(true);
    setError(null);
    try {
      const doctorStats = await fetchDoctorWithDetailedStats(doctorId);
      if (!doctorStats) {
        setError('Unable to load likes statistics');
        return;
      }

      // Sort videos by likes (descending)
      const sortedVideos = doctorStats.videos.sort((a, b) => b.likes - a.likes);
      setVideos(sortedVideos);
    } catch (err) {
      console.error('Error loading likes breakdown:', err);
      setError('Failed to load likes breakdown');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <TrophyIcon className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <TrophyIcon className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <TrophyIcon className="h-5 w-5 text-orange-500" />;
    return <span className="text-sm font-medium text-gray-500">#{index + 1}</span>;
  };

  const getRankBadgeColor = (index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    if (index === 1) return 'bg-gradient-to-r from-gray-300 to-gray-400';
    if (index === 2) return 'bg-gradient-to-r from-orange-400 to-orange-500';
    return 'bg-gradient-to-r from-gray-100 to-gray-200';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-xl p-2">
                <HandThumbUpIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Likes Breakdown</h2>
                <p className="text-green-100">Total: {totalLikes} likes across all videos</p>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-900">{videos.filter(v => v.likes > 0).length}</div>
                  <div className="text-sm text-green-700">Videos with Likes</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-900">
                    {videos.length > 0 ? Math.round(totalLikes / videos.length * 10) / 10 : 0}
                  </div>
                  <div className="text-sm text-yellow-700">Avg Likes per Video</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-900">
                    {videos.length > 0 ? Math.max(...videos.map(v => v.likes)) : 0}
                  </div>
                  <div className="text-sm text-amber-700">Most Liked Video</div>
                </div>
              </div>

              {/* Videos Ranking */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Videos Ranked by Likes</h3>
                
                {videos.length === 0 ? (
                  <div className="text-center py-12">
                    <HandThumbUpIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos Found</h3>
                    <p className="text-gray-600">Create some videos to see likes statistics</p>
                  </div>
                ) : (
                  videos.map((video, index) => (
                    <div
                      key={video.video_id}
                      className={`border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow ${
                        index < 3 ? 'ring-2 ring-opacity-50' : ''
                      } ${
                        index === 0 ? 'ring-yellow-300 bg-yellow-50' :
                        index === 1 ? 'ring-gray-300 bg-gray-50' :
                        index === 2 ? 'ring-orange-300 bg-orange-50' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Rank Badge */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getRankBadgeColor(index)}`}>
                            {getRankIcon(index)}
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
                            <h4 className="text-lg font-semibold text-gray-900 truncate mb-1">
                              {video.video_name}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Created: {new Date(video.created_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{video.views} views</span>
                              <span>•</span>
                              <span>{video.unique_viewers} unique viewers</span>
                            </div>
                          </div>
                        </div>

                        {/* Likes Display */}
                        <div className="text-right">
                          <div className="flex items-center space-x-2 text-green-600 mb-1">
                            <HandThumbUpIcon className="h-5 w-5" />
                            <span className="text-2xl font-bold">{video.likes}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {video.views > 0 ? `${Math.round((video.likes / video.views) * 100)}% like rate` : 'No views yet'}
                          </div>
                        </div>
                      </div>


                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 