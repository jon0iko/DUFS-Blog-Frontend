'use client';

import { useEffect, useState } from 'react';
import { strapiAPI } from '@/lib/api';
import TextReelClient from './TextReelClient';

function TextReelSkeleton() {
  return (
    <section className="w-full bg-[#E0D5D0] py-4 sm:py-5 md:py-6 overflow-hidden animate-pulse">
      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded" />
    </section>
  );
}

export default function TextReel() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const fetched = await strapiAPI.getTextReelContent();
        setText(fetched?.trim() ?? '');
      } catch (error) {
        console.error('Failed to fetch Text Reel content:', error);
        setText('');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return <TextReelSkeleton />;
  }

  if (!text) {
    return null;
  }

  return (
    <section aria-label="Tagline reel" className="w-full bg-[#E0D5D0] py-4 sm:py-5 md:py-6 overflow-hidden">
      <TextReelClient text={text} baseDuration={220} reps={5} />
      <p className="sr-only">{text}</p>
    </section>
  );
}
