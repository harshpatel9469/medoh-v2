'use client';

import { useEffect, useState } from 'react';
import { 
  PlusIcon, 
  UserIcon, 
  PhoneIcon, 
  EyeIcon, 
  XMarkIcon, 
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  DocumentIcon,
  PlayIcon,
  PaperAirplaneIcon,
  FolderIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  TagIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { 
  createCompletePrivatePage, 
  fetchPrivatePagesByDoctorId, 
  fetchDoctorVideosRPC,
  RPCVideoGroupRow,
  fetchPrivatePageDocuments,
  fetchPrivatePageSelectedVideos,
  PrivateDocument,
  deletePrivatePage
} from '@/app/_api/private-pages';
import { sendOtp, sendPrivatePageLink } from '@/actions/otp';
import { useAuth } from '@/app/_contexts/auth-context';
import { fetchDoctorById } from '@/app/_api/doctors';

type PrivatePage = {
  id: string;
  name: string;
  patient_phone: string;
  created_at: string;
};

type FileUpload = {
  file: File;
  type: string;
  customType?: string;
};

type PageContents = {
  videos: string[];
  documents: PrivateDocument[];
};

export default function PatientPages() {
  const [doctorId, setDoctorId] = useState<string>('');
  const [doctor, setDoctor] = useState<any>(null);
  const [privatePages, setPrivatePages] = useState<PrivatePage[]>([]);
  const [videoData, setVideoData] = useState<RPCVideoGroupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { impersonatedDoctorId } = useAuth();
  
  // Form state
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  
  // UI state
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedDetailedTopics, setExpandedDetailedTopics] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New state for page contents and organization
  const [viewingContents, setViewingContents] = useState<string | null>(null);
  const [pageContents, setPageContents] = useState<Record<string, PageContents>>({});
  const [sendingLink, setSendingLink] = useState<string | null>(null);
  const [deletingPage, setDeletingPage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<PrivatePage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'phone'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'thisWeek'>('all');

  useEffect(() => {
    loadDoctorData();
  }, [impersonatedDoctorId]);

  const loadDoctorData = async () => {
    try {
      if (impersonatedDoctorId) {
        const impersonatedDoctor = await fetchDoctorById(impersonatedDoctorId);
        if (impersonatedDoctor) {
          setDoctorId(impersonatedDoctor.id);
          setDoctor(impersonatedDoctor);
          await Promise.all([
            loadPrivatePages(impersonatedDoctor.id),
            loadVideoData(impersonatedDoctor.id)
          ]);
        } else {
          setError('Impersonated doctor not found.');
        }
      } else {
        setError('No doctor access available.');
      }
    } catch (err) {
      console.error('Error loading doctor data:', err);
      setError('Failed to load doctor data');
    } finally {
      setLoading(false);
    }
  };

  const loadPrivatePages = async (doctorId: string) => {
    try {
      const pages = await fetchPrivatePagesByDoctorId(doctorId);
      setPrivatePages(pages);
    } catch (err) {
      console.error('Error loading private pages:', err);
      setError('Failed to load private pages');
    }
  };

  const loadVideoData = async (doctorId: string) => {
    try {
      const data = await fetchDoctorVideosRPC(doctorId);
      setVideoData(data);
    } catch (err) {
      console.error('Error loading video data:', err);
      setError('Failed to load video data');
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    setPatientName('');
    setPatientPhone('');
    setFiles([]);
    setSelectedVideos(new Set());
    setError(null);
    setSuccessMessage(null);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setPatientName('');
    setPatientPhone('');
    setFiles([]);
    setSelectedVideos(new Set());
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles: FileUpload[] = selectedFiles.map(file => ({
      file,
      type: 'Medical Records'
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const updateFile = (index: number, field: 'type' | 'customType', value: string) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, [field]: value } : file
    ));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => {
      const newSet = new Set(prev);
      newSet.has(videoId) ? newSet.delete(videoId) : newSet.add(videoId);
      return newSet;
    });
  };

  const toggleSet = (setter: React.Dispatch<React.SetStateAction<Set<string>>>) => (key: string) => {
    setter(prev => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  const toggleTopic = toggleSet(setExpandedTopics);
  const toggleDetailedTopic = toggleSet(setExpandedDetailedTopics);
  const toggleSection = toggleSet(setExpandedSections);

  const toggleSectionVideos = (videos: { id: string; name: string }[], select: boolean) => {
    setSelectedVideos(prev => {
      const newSet = new Set(prev);
      videos.forEach(video => {
        if (select) {
          newSet.add(video.id);
        } else {
          newSet.delete(video.id);
        }
      });
      return newSet;
    });
  };

  const isSectionFullySelected = (videos: { id: string; name: string }[]) => {
    return videos.length > 0 && videos.every(video => selectedVideos.has(video.id));
  };

  const isSectionPartiallySelected = (videos: { id: string; name: string }[]) => {
    return videos.some(video => selectedVideos.has(video.id)) && !isSectionFullySelected(videos);
  };

  const toggleDetailedTopicVideos = (sections: Record<string, { id: string; name: string }[]>, select: boolean) => {
    const allVideos = Object.values(sections).flat();
    toggleSectionVideos(allVideos, select);
  };

  const isDetailedTopicFullySelected = (sections: Record<string, { id: string; name: string }[]>) => {
    const allVideos = Object.values(sections).flat();
    return allVideos.length > 0 && allVideos.every(video => selectedVideos.has(video.id));
  };

  const isDetailedTopicPartiallySelected = (sections: Record<string, { id: string; name: string }[]>) => {
    const allVideos = Object.values(sections).flat();
    return allVideos.some(video => selectedVideos.has(video.id)) && !isDetailedTopicFullySelected(sections);
  };

  const toggleTopicVideos = (detailedTopics: Record<string, Record<string, { id: string; name: string }[]>>, select: boolean) => {
    const allVideos = Object.values(detailedTopics).flatMap(sections => Object.values(sections).flat());
    toggleSectionVideos(allVideos, select);
  };

  const isTopicFullySelected = (detailedTopics: Record<string, Record<string, { id: string; name: string }[]>>) => {
    const allVideos = Object.values(detailedTopics).flatMap(sections => Object.values(sections).flat());
    return allVideos.length > 0 && allVideos.every(video => selectedVideos.has(video.id));
  };

  const isTopicPartiallySelected = (detailedTopics: Record<string, Record<string, { id: string; name: string }[]>>) => {
    const allVideos = Object.values(detailedTopics).flatMap(sections => Object.values(sections).flat());
    return allVideos.some(video => selectedVideos.has(video.id)) && !isTopicFullySelected(detailedTopics);
  };

  const groupedVideoData = videoData.reduce((acc, row) => {
    if (!acc[row.topic_name]) acc[row.topic_name] = {};
    if (!acc[row.topic_name][row.detailed_topic_name]) acc[row.topic_name][row.detailed_topic_name] = {};
    if (!acc[row.topic_name][row.detailed_topic_name][row.detailed_topic_section_name])
      acc[row.topic_name][row.detailed_topic_name][row.detailed_topic_section_name] = [];

    acc[row.topic_name][row.detailed_topic_name][row.detailed_topic_section_name].push({
      id: row.video_id,
      name: row.video_name,
    });
    return acc;
  }, {} as Record<string, Record<string, Record<string, { id: string; name: string }[]>>>);

  const handleCreate = async () => {
    if (!doctorId || !patientName.trim() || !patientPhone.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setCreating(true);

    try {
      const fileData = files.map(f => ({ 
        file: f.file, 
        type: f.type === 'Other' ? (f.customType || f.type) : f.type 
      }));
      const videoIds = Array.from(selectedVideos);

      const url = await createCompletePrivatePage(
        doctorId,
        patientName.trim(),
        patientPhone.trim(),
        fileData,
        videoIds
      );

      closeCreateModal();
      await loadPrivatePages(doctorId);
      setSuccessMessage(`Private page created successfully for ${patientName.trim()}! 🎉`);
    } catch (err) {
      setError(`Failed to create private page: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setCreating(false);
    }
  };

  // New functions for Send Page and View Contents
  const handleSendPage = async (page: PrivatePage) => {
    setSendingLink(page.id);
    try {
      await sendPrivatePageLink(page.patient_phone, page.id, page.name, doctorId);
      setSuccessMessage(`Page link sent successfully to ${page.patient_phone}! 📱`);
    } catch (err) {
      setError(`Failed to send page link: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSendingLink(null);
    }
  };

  const handleViewContents = async (pageId: string) => {
    if (pageContents[pageId]) {
      setViewingContents(viewingContents === pageId ? null : pageId);
      return;
    }

    try {
      const [documents, videoIds] = await Promise.all([
        fetchPrivatePageDocuments(pageId),
        fetchPrivatePageSelectedVideos(pageId)
      ]);

      setPageContents(prev => ({
        ...prev,
        [pageId]: { documents, videos: videoIds }
      }));
      setViewingContents(pageId);
    } catch (err) {
      setError(`Failed to load page contents: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeletePage = (page: PrivatePage) => {
    setShowDeleteModal(page);
  };

  const confirmDeletePage = async () => {
    if (!showDeleteModal) return;

    setDeletingPage(showDeleteModal.id);
    try {
      await deletePrivatePage(showDeleteModal.id);
      
      // Remove from local state
      setPrivatePages(prev => prev.filter(p => p.id !== showDeleteModal.id));
      
      // Remove from page contents if it was loaded
      setPageContents(prev => {
        const newContents = { ...prev };
        delete newContents[showDeleteModal.id];
        return newContents;
      });

      // Close view contents if this page was being viewed
      if (viewingContents === showDeleteModal.id) {
        setViewingContents(null);
      }

      setSuccessMessage(`Page for ${showDeleteModal.name} deleted successfully! 🗑️`);
      setShowDeleteModal(null);
    } catch (err) {
      setError(`Failed to delete page: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDeletingPage(null);
    }
  };

  // Organize videos by topics and sub-topics for display
  const organizeVideosByTopics = (videoIds: string[]) => {
    const organized: Record<string, { 
      detailedTopics: Record<string, {
        sections: Record<string, any[]>,
        count: number
      }>,
      totalCount: number 
    }> = {};
    
    videoIds.forEach(videoId => {
      const video = videoData.find(v => v.video_id === videoId);
      if (video) {
        // Initialize topic if it doesn't exist
        if (!organized[video.topic_name]) {
          organized[video.topic_name] = { detailedTopics: {}, totalCount: 0 };
        }
        
        // Initialize detailed topic if it doesn't exist
        if (!organized[video.topic_name].detailedTopics[video.detailed_topic_name]) {
          organized[video.topic_name].detailedTopics[video.detailed_topic_name] = { 
            sections: {}, 
            count: 0 
          };
        }
        
        // Initialize section if it doesn't exist
        if (!organized[video.topic_name].detailedTopics[video.detailed_topic_name].sections[video.detailed_topic_section_name]) {
          organized[video.topic_name].detailedTopics[video.detailed_topic_name].sections[video.detailed_topic_section_name] = [];
        }
        
        // Add video to the appropriate section
        organized[video.topic_name].detailedTopics[video.detailed_topic_name].sections[video.detailed_topic_section_name].push(video);
        organized[video.topic_name].detailedTopics[video.detailed_topic_name].count++;
        organized[video.topic_name].totalCount++;
      }
    });
    
    return organized;
  };

  // Handle document click to view/download
  const handleDocumentClick = (doc: PrivateDocument) => {
    if (doc.file_url) {
      window.open(doc.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Filter and sort pages
  const filteredAndSortedPages = privatePages
    .filter(page => {
      if (searchTerm) {
        return page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               page.patient_phone.includes(searchTerm);
      }
      return true;
    })
    .filter(page => {
      if (filterBy === 'recent') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(page.created_at) >= weekAgo;
      }
      if (filterBy === 'thisWeek') {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        return new Date(page.created_at) >= startOfWeek;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'phone':
          return a.patient_phone.localeCompare(b.patient_phone);
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Patient Pages</h1>
                  <p className="text-gray-600">Create and manage private pages for your patients</p>
                </div>
              </div>
              <button
                onClick={openCreateModal}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Create New Patient Page</span>
              </button>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircleIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-green-900">{successMessage}</p>
                  {!successMessage.includes('deleted') && (
                    <p className="text-sm text-green-700 mt-1">The patient page is now ready to share!</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-3xl shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <XMarkIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Private Pages List */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-2xl font-bold text-gray-900">Patient Pages ({filteredAndSortedPages.length})</h2>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'phone')}
                  className="px-4 py-2 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white min-w-[140px]"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="phone">Sort by Phone</option>
                </select>
                
                {/* Filter */}
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as 'all' | 'recent' | 'thisWeek')}
                  className="px-4 py-2 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white min-w-[120px]"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                >
                  <option value="all">All Pages</option>
                  <option value="recent">Last 7 Days</option>
                  <option value="thisWeek">This Week</option>
                </select>
              </div>
            </div>
            
            {filteredAndSortedPages.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardDocumentListIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {privatePages.length === 0 ? 'No patient pages created yet.' : 'No pages match your search criteria.'}
                </p>
                <p className="text-gray-400">
                  {privatePages.length === 0 ? 'Click "Create New Patient Page" to get started.' : 'Try adjusting your search or filters.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedPages.map((page) => (
                  <div key={page.id} className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {page.name || 'Patient'}
                          </h3>
                          <p className="text-gray-600 flex items-center space-x-2">
                            <PhoneIcon className="h-4 w-4" />
                            <span>{page.patient_phone}</span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Created: {new Date(page.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleViewContents(page.id)}
                          className="bg-white text-blue-600 px-4 py-2 rounded-xl font-medium hover:bg-blue-50 transition-colors flex items-center space-x-2 shadow-md"
                        >
                          <EyeIcon className="h-4 w-4" />
                          <span>View Contents</span>
                        </button>
                        <button
                          onClick={() => handleSendPage(page)}
                          disabled={sendingLink === page.id}
                          className="bg-white text-orange-600 px-4 py-2 rounded-xl font-medium hover:bg-orange-50 transition-colors flex items-center space-x-2 shadow-md disabled:opacity-50"
                        >
                          <PaperAirplaneIcon className="h-4 w-4" />
                          <span>{sendingLink === page.id ? 'Sending...' : 'Send Page'}</span>
                        </button>
                        <button
                          onClick={() => handleDeletePage(page)}
                          disabled={deletingPage === page.id}
                          className="bg-white text-red-600 px-4 py-2 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center space-x-2 shadow-md disabled:opacity-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span>{deletingPage === page.id ? 'Deleting...' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Page Contents */}
                    {viewingContents === page.id && pageContents[page.id] && (
                      <div className="mt-6 pt-6 border-t border-orange-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Videos organized by Topics */}
                          <div className="bg-white rounded-xl p-4">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                              <PlayIcon className="h-5 w-5 text-orange-600" />
                              <span>Videos ({pageContents[page.id].videos.length})</span>
                            </h4>
                            {pageContents[page.id].videos.length === 0 ? (
                              <p className="text-gray-500 text-sm">No videos selected</p>
                            ) : (
                              <div className="space-y-4 max-h-60 overflow-y-auto">
                                {Object.entries(organizeVideosByTopics(pageContents[page.id].videos)).map(([topicName, topicData]) => (
                                  <div key={topicName} className="border-l-2 border-orange-200 pl-3">
                                    <h5 className="font-medium text-gray-800 text-sm mb-3 flex items-center space-x-2">
                                      <FolderIcon className="h-4 w-4 text-orange-500" />
                                      <span>{topicName} ({topicData.totalCount})</span>
                                    </h5>
                                    
                                    {/* Detailed Topics */}
                                    <div className="space-y-3 ml-2">
                                      {Object.entries(topicData.detailedTopics).map(([detailedTopicName, detailedTopicData]) => (
                                        <div key={detailedTopicName} className="border-l border-gray-200 pl-3">
                                          <h6 className="font-medium text-gray-700 text-xs mb-2 flex items-center space-x-2">
                                            <TagIcon className="h-3 w-3 text-gray-500" />
                                            <span>{detailedTopicName} ({detailedTopicData.count})</span>
                                          </h6>
                                          
                                          {/* Sections */}
                                          <div className="space-y-2 ml-2">
                                            {Object.entries(detailedTopicData.sections).map(([sectionName, videos]) => (
                                              <div key={sectionName}>
                                                <p className="text-xs font-medium text-gray-600 mb-1">{sectionName}</p>
                                                <div className="space-y-1 ml-2">
                                                  {videos.map((video: any) => (
                                                    <div key={video.video_id} className="text-xs text-gray-600 flex items-center space-x-2">
                                                      <div className="w-1 h-1 bg-orange-400 rounded-full flex-shrink-0"></div>
                                                      <span className="truncate">{video.video_name}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Documents - Clickable */}
                          <div className="bg-white rounded-xl p-4">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                              <DocumentIcon className="h-5 w-5 text-orange-600" />
                              <span>Documents ({pageContents[page.id].documents.length})</span>
                            </h4>
                            {pageContents[page.id].documents.length === 0 ? (
                              <p className="text-gray-500 text-sm">No documents uploaded</p>
                            ) : (
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {pageContents[page.id].documents.map((doc) => (
                                  <div 
                                    key={doc.id} 
                                    onClick={() => handleDocumentClick(doc)}
                                    className="text-sm text-gray-700 flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                                  >
                                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 group-hover:bg-blue-500"></div>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate font-medium text-blue-600 group-hover:text-blue-700">{doc.file_name}</p>
                                      <p className="text-xs text-gray-500">{doc.document_type}</p>
                                    </div>
                                    <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-600">
                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Modal - keeping the existing modal code */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
              {/* Modal Header - Fixed */}
              <div className="p-8 pb-6 flex-shrink-0 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <PlusIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Create New Patient Page</h2>
                      <p className="text-gray-600">Set up a personalized page for your patient</p>
                    </div>
                  </div>
                  <button
                    onClick={closeCreateModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content - Scrollable */}
              <div className="flex-1 overflow-y-auto scrollbar-hide px-8 py-6">
                {/* Patient Details */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <UserIcon className="h-5 w-5 text-orange-600" />
                    <span>Patient Details</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name *</label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Enter patient's full name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Video Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <PlayIcon className="h-5 w-5 text-orange-600" />
                    <span>Select Videos ({selectedVideos.size} selected)</span>
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                    {Object.keys(groupedVideoData).length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No videos available</p>
                    ) : (
                      Object.entries(groupedVideoData).map(([topicName, detailedTopics]) => {
                        const typedDetailedTopics = detailedTopics as Record<string, Record<string, { id: string; name: string }[]>>;
                        return (
                        <div key={topicName} className="mb-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <button
                              onClick={() => toggleTopic(topicName)}
                              className="flex items-center space-x-2 text-left"
                            >
                              {expandedTopics.has(topicName) ? (
                                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                            <input
                              type="checkbox"
                              checked={isTopicFullySelected(typedDetailedTopics)}
                              ref={(el) => {
                                if (el) el.indeterminate = isTopicPartiallySelected(typedDetailedTopics);
                              }}
                              onChange={(e) => toggleTopicVideos(typedDetailedTopics, e.target.checked)}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <span className="font-medium text-gray-900">{topicName}</span>
                          </div>

                          {expandedTopics.has(topicName) && (
                            <div className="ml-6 space-y-3">
                              {Object.entries(typedDetailedTopics).map(([detailedTopicName, sections]) => {
                                const typedSections = sections as Record<string, { id: string; name: string }[]>;
                                return (
                                <div key={detailedTopicName}>
                                  <div className="flex items-center space-x-3 mb-2">
                                    <button
                                      onClick={() => toggleDetailedTopic(detailedTopicName)}
                                      className="flex items-center space-x-2"
                                    >
                                      {expandedDetailedTopics.has(detailedTopicName) ? (
                                        <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                                      ) : (
                                        <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                                      )}
                                    </button>
                                                                         <input
                                       type="checkbox"
                                       checked={isDetailedTopicFullySelected(typedSections)}
                                       ref={(el) => {
                                         if (el) el.indeterminate = isDetailedTopicPartiallySelected(typedSections);
                                       }}
                                       onChange={(e) => toggleDetailedTopicVideos(typedSections, e.target.checked)}
                                       className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                     />
                                    <span className="font-medium text-gray-700">{detailedTopicName}</span>
                                  </div>

                                  {expandedDetailedTopics.has(detailedTopicName) && (
                                    <div className="ml-6 space-y-2">
                                      {Object.entries(typedSections).map(([sectionName, videos]) => (
                                        <div key={sectionName}>
                                          <div className="flex items-center space-x-3 mb-2">
                                            <button
                                              onClick={() => toggleSection(sectionName)}
                                              className="flex items-center space-x-2"
                                            >
                                              {expandedSections.has(sectionName) ? (
                                                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                                              ) : (
                                                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                                              )}
                                            </button>
                                            <input
                                              type="checkbox"
                                              checked={isSectionFullySelected(videos)}
                                              ref={(el) => {
                                                if (el) el.indeterminate = isSectionPartiallySelected(videos);
                                              }}
                                              onChange={(e) => toggleSectionVideos(videos, e.target.checked)}
                                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                            />
                                            <span className="text-gray-600">{sectionName}</span>
                                          </div>

                                          {expandedSections.has(sectionName) && (
                                            <div className="ml-6 space-y-1">
                                              {videos.map((video) => (
                                                <div key={video.id} className="flex items-center space-x-3">
                                                  <input
                                                    type="checkbox"
                                                    checked={selectedVideos.has(video.id)}
                                                    onChange={() => toggleVideoSelection(video.id)}
                                                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                  />
                                                  <span className="text-sm text-gray-600">{video.name}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Document Upload */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <DocumentIcon className="h-5 w-5 text-orange-600" />
                    <span>Upload Documents</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        key={files.length}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                      />
                    </div>
                    {files.map((file, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <p className="font-medium text-gray-900">{file.file.name}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <select
                              value={file.type}
                              onChange={(e) => updateFile(index, 'type', e.target.value)}
                              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                              <option value="Medical Records">Medical Records</option>
                              <option value="Lab Results">Lab Results</option>
                              <option value="X-Ray">X-Ray</option>
                              <option value="MRI">MRI</option>
                              <option value="CT Scan">CT Scan</option>
                              <option value="Prescription">Prescription</option>
                              <option value="Other">Other</option>
                            </select>
                            {file.type === 'Other' && (
                              <input
                                type="text"
                                placeholder="Specify type..."
                                value={file.customType || ''}
                                onChange={(e) => updateFile(index, 'customType', e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              />
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer - Fixed */}
              <div className="flex-shrink-0 flex items-center justify-end space-x-4 p-8 pt-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
                <button
                  onClick={closeCreateModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating || !patientName.trim() || !patientPhone.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      <span>Create Patient Page</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrashIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Delete Patient Page</h3>
                    <p className="text-gray-600">This action cannot be undone</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-700">
                    Are you sure you want to delete the page for{' '}
                    <span className="font-semibold text-gray-900">{showDeleteModal.name}</span>?
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    This will permanently remove all videos, documents, and data associated with this page.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeletePage}
                    disabled={deletingPage === showDeleteModal.id}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deletingPage === showDeleteModal.id ? 'Deleting...' : 'Delete Page'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 