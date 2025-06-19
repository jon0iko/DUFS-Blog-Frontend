'use client'

import React from 'react';
import useReadProgress from '@/hooks/useReadProgress';
import { cn } from '@/lib/utils';

interface ReadingProgressBarProps {
  targetId?: string;
  className?: string;
}

export default function ReadingProgressBar({ targetId, className }: ReadingProgressBarProps) {
  const completion = useReadProgress({ targetId });
    return (
    <div className={cn(
      "fixed top-0 left-0 w-full h-1 z-50 bg-gray-200 dark:bg-gray-800",
      className
    )}>
      <div 
        className="h-full bg-black dark:bg-white transition-all duration-150 ease-out"
        style={{ width: `${completion}%` }}
      />
    </div>
  );
}
