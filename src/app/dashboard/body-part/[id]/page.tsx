'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchAllTopics } from '@/app/_api/topics';
import { Topic } from '@/app/_types';
import Link from 'next/link';
import TopicCard from '@/app/_components/cards/topic-card';

export default function BodyPartPage({ params }: { params: { id: string } }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [bodyPartName, setBodyPartName] = useState<string>('');

  useEffect(() => {
    fetchAllTopics().then(allTopics => {
      const filtered = allTopics.filter(t => (t.body_part_id || 'other') === params.id);
      setTopics(filtered);
      if (filtered.length > 0) setBodyPartName(filtered[0].body_parts?.name || 'Other');
      else setBodyPartName('Other');
    });
  }, [params.id]);

  return (
    <div className="mx-4">
      <h1 className="text-3xl font-bold mb-6">{bodyPartName} Topics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {topics.map(topic => (
          <TopicCard
            key={topic.id}
            topic={topic}
            link={topic.is_detailed ? `/dashboard/topics/${topic.id}` : `/dashboard/home/${topic.id}`}
          />
        ))}
      </div>
    </div>
  );
} 