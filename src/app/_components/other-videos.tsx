'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'
import {
    PlayIcon
} from '@heroicons/react/24/solid'
import Link from 'next/link';
import ExpandedVideoCards from './cards/expanded-video-cards';

interface OtherVideosProps {
    results: any[],
    topicName: string,
    sectionName: string,
    nextSectionName: string,
    currVideoIdx: number,
    videoTotal: number,
    isDetailed: boolean,
    topicId: string,
    sectionId: string,
    nextSectionId: string
}

const OtherVideos = ({ results, topicName, sectionName, nextSectionName, currVideoIdx, videoTotal, isDetailed, topicId, sectionId, nextSectionId }: OtherVideosProps) => {
    const router = useRouter();

    const currProgress = (currVideoIdx + 1) / videoTotal * 100;

    return (
        <div className="max-w-sm space-y-4 relative">
            {topicId && <div className='flex flex-col items-center gap-2'>
                <Link href={isDetailed ? `/dashboard/topics/info/${topicId}` : `/dashboard/home/${topicId}`} className="text-2xl font-semibold hover:underline hover:text-primary-color">{topicName}</Link>
                <div className='flex gap-x-2'>
                    <h3 className='text-xl font-semibold'>Section:</h3>
                    <Link href={isDetailed ? `/dashboard/topics/details/${sectionId}` : `/dashboard/sections/${sectionId}`} className='text-xl hover:underline hover:text-primary-color'>{sectionName}</Link>
                </div>

                <div className='w-full h-2 bg-gray-400 rounded-full'>
                    <div style={{ width: `${currProgress}%` }} className='bg-card-background-primary-gradient h-2 rounded-full' />
                </div>
                <p>{currVideoIdx + 1}/{videoTotal}</p>

                {nextSectionName && <div className='flex gap-x-2'>
                    <h3 className='text-xl font-semibold'>Next Section:</h3>
                    <Link href={isDetailed ? `/dashboard/topics/details/${nextSectionId}` : `/dashboard/sections/${nextSectionId}`} className='text-xl hover:underline hover:text-primary-color'>{nextSectionName}</Link>
                </div>}
            </div>}

            <div className='flex flex-col gap-3'>
                {results.length === 0 &&
                    <div className='flex flex-col items-center'>
                        <p className='text-xl'>You&apos;ve reached the end of the topic. Go back to the Home page to go to next desired topic.</p>
                        <Link href='/dashboard/home' className='mt-[48px] flex w-1/2 justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-color-dark bg-primary-color hover:bg-primary-color-light'>Go to Home</Link>
                    </div>
                }

                {results && results.map((result, index) => (
                    <ExpandedVideoCards 
                        key={index}
                        name={result.name}
                        questionId={result.question_id}
                        thumbnailUrl={result.thumbnail_url}
                        videoId={result.id}
                        progression={result.progression}
                    />
                ))}
            </div>
        </div>
    );
}

export default OtherVideos;