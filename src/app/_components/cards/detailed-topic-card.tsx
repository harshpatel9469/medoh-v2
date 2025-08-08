'use client';

import { ArrowUpOnSquareIcon, ClipboardDocumentCheckIcon, HomeIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState } from 'react';

type DetailedTopicCardProps = {
  topicId: string;
  name: string;
  imageUrl?: string | null;
  description?: string | null;
  indication?: string | null;
  purpose?: string | null;
  filterName?: string | null;
  backUrl: string; // URL for the back button
};

export default function DetailedTopicCard({
  topicId,
  name,
  imageUrl,
  description,
  indication,
  purpose,
  filterName,
  backUrl,
}: DetailedTopicCardProps) {
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);

  return (
    <div className="bg-card-background-primary-gradient w-full flex text-white rounded-xl shadow-sm items-center justify-between">
      {/* Left Content */}
      <div className="flex flex-col m-4 gap-2 w-full md:w-2/3 items-center md:items-start justify-center">
        {/* Back Link */}
        <Link className="flex gap-1 items-center font-bold mb-6 self-start" href={backUrl}>
          <p>&lt;</p>
          <p>Back</p>
        </Link>

        {/* Title and Share */}
        <div className="flex gap-2 items-center">
          <h1 className="text-3xl font-bold">{name}</h1>
          <button onClick={() => setShareModalOpen(true)}>
            <ArrowUpOnSquareIcon className="w-7" />
          </button>
        </div>

        {/* Indication */}
        {indication && (
          <div className="flex gap-2 self-start items-start">
            <div className="flex gap-1 items-center">
              <InformationCircleIcon className="w-5" />
              <p>Indication:</p>
            </div>
            <p>{indication}</p>
          </div>
        )}

        {/* Purpose */}
        {purpose && (
          <div className="flex gap-2 self-start items-start">
            <div className="flex gap-1 items-center">
              <ClipboardDocumentCheckIcon className="w-5" />
              <p>Purpose:</p>
            </div>
            <p>{purpose}</p>
          </div>
        )}

        {/* Filter Name */}
        {filterName && (
          <div className="flex gap-1 self-start">
            <HomeIcon className="w-5" />
            <p>{filterName}</p>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="bg-white/20 backdrop-filter backdrop-blur-md px-2 py-3 rounded-lg text-sm mt-4">
            {description}
          </p>
        )}
      </div>

      {/* Image */}
      <img
        src={imageUrl || ''}
        alt={`${name} Picture`}
        className="w-72 h-72 rounded-lg object-cover mr-4 hidden md:block"
      />
    </div>
  );
}
