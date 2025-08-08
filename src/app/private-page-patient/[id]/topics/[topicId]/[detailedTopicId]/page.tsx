'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchPrivateDetailedTopicSections, PrivateSection, fetchPrivateDetailedTopicInfo } from '@/app/_api/private-pages';
import LoadingSpinner from '@/app/_components/loading-spinner';
import VideoCard from '@/app/_components/cards/video-card';
import DetailedTopicCard from '@/app/_components/cards/detailed-topic-card';
import Link from 'next/link';

export default function PrivateDetailedTopic() {
  const { id: privatePageId, topicId, detailedTopicId } = useParams() as {
    id: string;
    topicId: string;
    detailedTopicId: string;
  };

  const [sections, setSections] = useState<PrivateSection[]>([]);
  const [loading, setLoading] = useState(true);

  const [topicInfo, setTopicInfo] = useState<{
    name: string;
    description: string | null;
    image_url: string | null;
    indication: string | null;
    purpose: string | null;
    filter_name: string | null;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const topicData = await fetchPrivateDetailedTopicInfo(detailedTopicId);
        setTopicInfo({
          name: topicData.name,
          description: topicData.description || null,
          image_url: topicData.image_url || null,
          indication: null,
          purpose: null,
          filter_name: null,
        });

        const sectionData = await fetchPrivateDetailedTopicSections(privatePageId, detailedTopicId);
        setSections(sectionData);
      } catch (err) {
        console.error('Error fetching private detailed topic sections or info:', err);
      } finally {
        setLoading(false);
      }
    }

    if (privatePageId && detailedTopicId) loadData();
  }, [privatePageId, detailedTopicId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-4">
      {topicInfo && (
        <DetailedTopicCard
          topicId={detailedTopicId}
          name={topicInfo.name}
          imageUrl={topicInfo.image_url}
          description={topicInfo.description}
          indication={topicInfo.indication}
          purpose={topicInfo.purpose}
          filterName={topicInfo.filter_name}
          backUrl={`/private-page-patient/${privatePageId}/topics`}
        />
      )}

      <div className="mt-8">
        {sections.length === 0 ? (
          <p>No videos available for this detailed topic.</p>
        ) : (
          sections.map((section) => (
            <div key={section.section_id} className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{section.section_name}</h2>
              <div className="flex flex-row flex-nowrap overflow-x-auto gap-4 items-stretch">
                {section.videos.map((video) => (
                  <div key={video.video_id} className="flex-shrink-0 min-h-[300px]">
                    <Link
                      href={`/private-page-patient/${privatePageId}/topics/${topicId}/${detailedTopicId}/video/${video.video_id}`}
                    >
                      <VideoCard
                        name={video.video_name}
                        questionId={video.video_id}
                        thumbnailUrl={video.thumbnail_url || '/images/default-thumbnail.png'}
                        progression={null}
                      />
                    </Link>
                  </div>
                ))}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
