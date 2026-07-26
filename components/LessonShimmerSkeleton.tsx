'use client';

import React from 'react';

export default function LessonShimmerSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Header Bar Skeleton */}
      <div className="flex flex-col gap-3 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-800/80 rounded-md" />
          <div className="h-7 w-64 bg-slate-800/90 rounded-md" />
          <div className="h-4 w-48 bg-slate-800/60 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-slate-800/80 rounded-lg" />
          <div className="h-9 w-24 bg-slate-800/80 rounded-lg" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-44 bg-slate-900 border border-slate-800 rounded-lg" />
        <div className="h-10 w-36 bg-slate-900/60 border border-slate-800/50 rounded-lg" />
      </div>

      {/* Content Canvas Shimmer */}
      <div className="relative min-h-[440px] w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl">
        {/* Animated Shimmer Wave Effect */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent animate-[shimmer_1.5s_infinite]" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-48 bg-slate-800/80 rounded-md" />
            <div className="h-6 w-20 bg-indigo-900/40 rounded-md" />
          </div>

          <div className="h-[280px] w-full rounded-lg bg-slate-950/80 p-4 border border-slate-800/60 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
              <div className="h-3 w-3 rounded-full bg-red-500/40" />
              <div className="h-3 w-3 rounded-full bg-amber-500/40" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/40" />
              <div className="h-4 w-32 bg-slate-800/60 rounded ml-4" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-4 w-3/4 bg-slate-800/60 rounded" />
              <div className="h-4 w-1/2 bg-slate-800/60 rounded" />
              <div className="h-4 w-5/6 bg-slate-800/60 rounded" />
              <div className="h-4 w-2/3 bg-slate-800/60 rounded" />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="h-5 w-32 bg-slate-800/60 rounded" />
            <div className="h-10 w-40 bg-indigo-600/30 rounded-lg border border-indigo-500/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
