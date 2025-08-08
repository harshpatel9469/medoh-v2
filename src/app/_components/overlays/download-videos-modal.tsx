'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  ArrowDownTrayIcon,
  CheckIcon,
  DocumentIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface Video {
  id: string;
  name: string;
  url: string;
}

interface Section {
  id: string;
  name: string;
  section_order: number;
  videos: Video[];
}

interface DownloadVideosModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  topicTitle: string;
  doctorId: string;
}

export default function DownloadVideosModal({ 
  isOpen, 
  onClose, 
  topicId, 
  topicTitle,
  doctorId 
}: DownloadVideosModalProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<{ [key: string]: 'pending' | 'downloading' | 'completed' | 'error' }>({});
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && topicId) {
      loadTopicVideos();
    }
  }, [isOpen, topicId]);

  const loadTopicVideos = async () => {
    setLoading(true);
    try {
      // Fetch videos for this topic that belong to the current doctor
      const response = await fetch(`/api/topic-videos?topicId=${topicId}&doctorId=${doctorId}`);
      if (response.ok) {
        const data = await response.json();
        setSections(data.sections || []);
      }
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVideoSelection = (videoId: string) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
    } else {
      newSelected.add(videoId);
    }
    setSelectedVideos(newSelected);
  };

  const toggleSectionCollapse = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  const selectAll = () => {
    const allVideoIds = sections.flatMap(section => section.videos.map(video => video.id));
    setSelectedVideos(new Set(allVideoIds));
  };

  const deselectAll = () => {
    setSelectedVideos(new Set());
  };

  const expandAllSections = () => {
    setCollapsedSections(new Set());
  };

  const collapseAllSections = () => {
    const allSectionIds = sections.map(section => section.id);
    setCollapsedSections(new Set(allSectionIds));
  };

  const downloadVideo = async (video: Video) => {
    setDownloadStatus(prev => ({ ...prev, [video.id]: 'downloading' }));
    
    try {
      const filename = `${video.name}.mp4`;
      
      // Use the proxy endpoint that streams the video through our server
      const downloadUrl = `/api/download-video?videoId=${video.id}&filename=${encodeURIComponent(filename)}`;
      console.log('Downloading via proxy:', downloadUrl);
      
      // Create a temporary download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadStatus(prev => ({ ...prev, [video.id]: 'completed' }));
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadStatus(prev => ({ ...prev, [video.id]: 'error' }));
    }
  };

  const downloadSelected = async () => {
    setDownloading(true);
    const allVideos = sections.flatMap(section => section.videos);
    const selectedVideoList = allVideos.filter(video => selectedVideos.has(video.id));
    
    // Initialize status for all selected videos
    const initialStatus: { [key: string]: 'pending' | 'downloading' | 'completed' | 'error' } = {};
    selectedVideoList.forEach(video => {
      initialStatus[video.id] = 'pending';
    });
    setDownloadStatus(initialStatus);

    // Download videos one by one to avoid overwhelming the server
    for (const video of selectedVideoList) {
      await downloadVideo(video);
      // Add a small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setDownloading(false);
  };

  const getStatusIcon = (videoId: string) => {
    const status = downloadStatus[videoId];
    switch (status) {
      case 'downloading':
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckIcon className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XMarkIcon className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowDownTrayIcon className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Download Videos</h2>
                <p className="text-orange-100 text-sm">{topicTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-orange-200 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-600">Loading videos...</span>
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center py-8">
              <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No videos found for this topic.</p>
            </div>
          ) : (
            <>
              {/* Selection Controls */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600">
                  {selectedVideos.size} of {sections.reduce((acc, section) => acc + section.videos.length, 0)} videos selected
                </p>
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={selectAll}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={deselectAll}
                    className="text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Deselect All
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={expandAllSections}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Expand All
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={collapseAllSections}
                    className="text-gray-600 hover:text-gray-700 font-medium"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              {/* Sections and Videos List */}
              <div className="max-h-96 overflow-y-auto space-y-4 mb-6">
                {sections.map((section) => {
                  const isCollapsed = collapsedSections.has(section.id);
                  const sectionVideoCount = section.videos.length;
                  const selectedInSection = section.videos.filter(v => selectedVideos.has(v.id)).length;
                  
                  return (
                    <div key={section.id} className="border border-gray-200 rounded-lg">
                      {/* Section Header - Clickable to collapse/expand */}
                      <div 
                        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors rounded-t-lg"
                        onClick={() => toggleSectionCollapse(section.id)}
                      >
                        <div className="flex items-center gap-3">
                          {isCollapsed ? (
                            <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                          )}
                          <h3 className="font-semibold text-gray-800 uppercase tracking-wide">
                            {section.name}
                          </h3>
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedInSection}/{sectionVideoCount} selected
                        </div>
                      </div>
                      
                      {/* Section Content - Videos */}
                      {!isCollapsed && (
                        <div className="p-4 space-y-2 bg-white rounded-b-lg">
                          {section.videos.map((video) => (
                            <div
                              key={video.id}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedVideos.has(video.id)
                                  ? 'border-orange-500 bg-orange-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                console.log('Video clicked:', video.id, video.name);
                                toggleVideoSelection(video.id);
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  selectedVideos.has(video.id)
                                    ? 'bg-orange-500 border-orange-500'
                                    : 'border-gray-300'
                                }`}>
                                  {selectedVideos.has(video.id) && (
                                    <CheckIcon className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{video.name}</p>
                                </div>
                                {getStatusIcon(video.id)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Download Button */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={downloadSelected}
                  disabled={selectedVideos.size === 0 || downloading}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    selectedVideos.size === 0 || downloading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                  }`}
                >
                  {downloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Download Selected ({selectedVideos.size})
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 