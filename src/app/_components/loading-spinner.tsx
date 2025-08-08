import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full'>
      {[...Array(9)].map((_, i) => (
        <div key={i} className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-4 shadow-md text-white flex flex-col justify-between min-h-[160px] relative animate-pulse">
          {/* Question text skeleton - matches the bold white text at top */}
          <div className="text-xl font-bold mb-2">
            <div className="h-6 bg-white/20 rounded mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
          </div>
          
          {/* Type label skeleton - matches "QUESTION" text */}
          <div className="text-xs uppercase mb-2">
            <div className="h-3 bg-white/20 rounded w-1/4"></div>
          </div>
          
          {/* Bottom section - matches View link and navigation arrows */}
          <div className="flex items-center justify-between mt-auto">
            {/* View link skeleton */}
            <div className="text-amber-200 underline text-sm">
              <div className="h-4 bg-amber-200/20 rounded w-8"></div>
            </div>
            
            {/* Navigation arrows and count skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-white/20 rounded"></div>
              <div className="h-3 bg-white/20 rounded w-16"></div>
              <div className="h-4 w-4 bg-white/20 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>

      {/* Questions skeleton */}
      <div className="mb-10">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-4 shadow-md min-h-[160px]">
              <div className="h-6 bg-white/20 rounded mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-1/4 mt-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Topics skeleton */}
      <div className="mb-10">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Doctors skeleton */}
      <div className="mb-10">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="flex flex-row w-full gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4 flex-1">
              <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}