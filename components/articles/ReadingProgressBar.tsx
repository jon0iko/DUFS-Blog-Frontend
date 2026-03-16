'use client'

import React from 'react';
import useReadProgress from '@/hooks/useReadProgress';
import { cn } from '@/lib/utils';

interface ReadingProgressBarProps {
  targetId?: string;
  className?: string;
}

export default function ReadingProgressBar({ targetId, className }: ReadingProgressBarProps) {
  const barRef = useReadProgress({ targetId });

  return (
    <div
      aria-hidden="true"
      className={cn(
        'fixed top-0 left-0 w-full h-[3px] z-50',
        className,
      )}
    >
      {/* scaleX transform is GPU-composited (no layout/paint) — perfectly smooth */}
      <div
        ref={barRef}
        className="h-full bg-black dark:bg-white"
        style={{
          transformOrigin: '0% 50%',
          transform: 'scaleX(0)',
          willChange: 'transform',
        }}
      />
    </div>
  );
}
