'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchPrivateDetailedTopics, PrivateDetailedTopic } from '@/app/_api/private-pages';
import LoadingSpinner from '@/app/_components/loading-spinner';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function PrivateDetailedTopicsPage() {
  const { id: privatePageId, topicId } = useParams() as { id: string; topicId: string };
  const [detailedTopics, setDetailedTopics] = useState<PrivateDetailedTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchPrivateDetailedTopics(privatePageId, topicId);
        setDetailedTopics(data);
      } catch (err) {
        console.error('Error fetching detailed topics:', err);
      } finally {
        setLoading(false);
      }
    }
    if (privatePageId && topicId) loadData();
  }, [privatePageId, topicId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-4">
      <div className="flex gap-2 items-center mb-6">
        <Link href={`/private-page-patient/${privatePageId}/topics`}>
          <ArrowLeftIcon className="w-7 h-7" aria-hidden="true" />
        </Link>
        <h1 className="text-3xl font-bold">Detailed Topics</h1>
      </div>

      {detailedTopics.length === 0 ? (
        <p>No detailed topics available for this topic.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {detailedTopics.map((dt) => (
            <Link
              key={dt.detailed_topic_id}
              href={`/private-page-patient/${privatePageId}/topics/${topicId}/${dt.detailed_topic_id}`}
              className="relative h-40 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-300 overflow-hidden"
            >
              {/* Background Image */}
              {dt.image_url && (
                <img
                  src={dt.image_url}
                  alt={dt.detailed_topic_name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              
              {/* Topic Name */}
              <div className="relative z-10 flex items-end h-full p-4 text-white">
                <span className="text-lg font-semibold line-clamp-2">{dt.detailed_topic_name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
