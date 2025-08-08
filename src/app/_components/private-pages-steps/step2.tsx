'use client';

import { useEffect, useState } from 'react';
import { fetchDoctorVideosRPC, fetchPrivatePageSelectedVideos } from '@/app/_api/private-pages';

interface Step2VideoSelectorProps {
  doctorId: string;
  patientEmail: string;
  patientPhone: string;
  pageId?: string;
  onNext: (selectedVideoIds: string[]) => void;
}

type RPCVideoGroupRow = {
  video_id: string;
  video_name: string;
  topic_name: string;
  detailed_topic_name: string;
  detailed_topic_section_name: string;
};

export default function Step2VideoSelector({
  doctorId,
  patientEmail,
  patientPhone,
  pageId,
  onNext,
}: Step2VideoSelectorProps) {
  const [rawData, setRawData] = useState<RPCVideoGroupRow[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedDetailedTopics, setExpandedDetailedTopics] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!doctorId) return;

    fetchDoctorVideosRPC(doctorId).then(setRawData).catch(console.error);

    if (pageId) {
      fetchPrivatePageSelectedVideos(pageId)
        .then((videoIds) => setSelectedVideos(new Set(videoIds)))
        .catch(console.error);
    }
  }, [doctorId, pageId]);

  const groupedByTopic = rawData.reduce((acc, row) => {
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

  const toggleSet = (setter: React.Dispatch<React.SetStateAction<Set<string>>>) => (key: string) => {
    setter((prev) => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  const toggleTopic = toggleSet(setExpandedTopics);
  const toggleDetailedTopic = toggleSet(setExpandedDetailedTopics);
  const toggleSection = toggleSet(setExpandedSections);

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos((prev) => {
      const newSet = new Set(prev);
      newSet.has(videoId) ? newSet.delete(videoId) : newSet.add(videoId);
      return newSet;
    });
  };

  const toggleSectionVideos = (videos: { id: string }[], select: boolean) => {
    setSelectedVideos((prev) => {
      const newSet = new Set(prev);
      videos.forEach((video) => {
        if (select) newSet.add(video.id);
        else newSet.delete(video.id);
      });
      return newSet;
    });
  };

  return (
    <div>
      {Object.entries(groupedByTopic).map(([topicName, detailedTopics]) => {
        const topicVideos = Object.values(detailedTopics).flatMap((sections) =>
          Object.values(sections).flat()
        );
        const allTopicSelected = topicVideos.every((v) => selectedVideos.has(v.id));

        return (
          <div key={topicName} className="border mb-4 rounded shadow p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="accent-[#f78f1e]"
                  checked={allTopicSelected}
                  onChange={(e) => toggleSectionVideos(topicVideos, e.target.checked)}
                />
                <h2 className="text-lg font-bold text-[#f78f1e] cursor-pointer" onClick={() => toggleTopic(topicName)}>
                  {topicName}
                </h2>
              </div>
              <span className="text-sm text-orange-500 cursor-pointer" onClick={() => toggleTopic(topicName)}>
                {expandedTopics.has(topicName) ? '▲ Hide' : '▼ Show'}
              </span>
            </div>

            {expandedTopics.has(topicName) && (
              <div className="mt-3">
                {Object.entries(detailedTopics).map(([detailedTopicName, sections]) => {
                  const detailedKey = `${topicName}--${detailedTopicName}`;
                  const detailedVideos = Object.values(sections).flat();
                  const allDetailedSelected = detailedVideos.every((v) => selectedVideos.has(v.id));

                  return (
                    <div key={detailedKey} className="mb-3 ml-4">
                      <div className="flex justify-between items-center cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="accent-[#f78f1e]"
                            checked={allDetailedSelected}
                            onChange={(e) => toggleSectionVideos(detailedVideos, e.target.checked)}
                          />
                          <h3 className="text-md font-semibold text-gray-700" onClick={() => toggleDetailedTopic(detailedKey)}>
                            {detailedTopicName}
                          </h3>
                        </div>
                        <span className="text-sm text-orange-400" onClick={() => toggleDetailedTopic(detailedKey)}>
                          {expandedDetailedTopics.has(detailedKey) ? '▲ Hide' : '▼ Show'}
                        </span>
                      </div>

                      {expandedDetailedTopics.has(detailedKey) && (
                        <div className="mt-2 ml-4">
                          {Object.entries(sections).map(([sectionName, videos]) => {
                            const sectionKey = `${detailedKey}--${sectionName}`;
                            const allSectionSelected = videos.every((v) => selectedVideos.has(v.id));

                            return (
                              <div key={sectionKey} className="mb-3 ml-4">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    className="accent-[#f78f1e]"
                                    checked={allSectionSelected}
                                    onChange={(e) => toggleSectionVideos(videos, e.target.checked)}
                                  />
                                  <h4 className="text-md font-medium text-gray-600 cursor-pointer" onClick={() => toggleSection(sectionKey)}>
                                    {sectionName}
                                  </h4>
                                  <span
                                    className="text-sm text-orange-400 ml-auto cursor-pointer"
                                    onClick={() => toggleSection(sectionKey)}
                                  >
                                    {expandedSections.has(sectionKey) ? '▲ Hide' : '▼ Show'}
                                  </span>
                                </div>

                                {expandedSections.has(sectionKey) && (
                                  <ul className="mt-2 ml-6">
                                    {videos.map((video) => (
                                      <li key={video.id} className="flex items-center mb-1">
                                        <input
                                          type="checkbox"
                                          className="mr-2 accent-[#f78f1e]"
                                          checked={selectedVideos.has(video.id)}
                                          onChange={() => toggleVideoSelection(video.id)}
                                        />
                                        <span>{video.name}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <button
        className="mt-6 bg-[#f78f1e] text-white px-4 py-2 rounded hover:bg-[#e2790a] transition"
        onClick={() => onNext(Array.from(selectedVideos))}
      >
        Next
      </button>
    </div>
  );
}
