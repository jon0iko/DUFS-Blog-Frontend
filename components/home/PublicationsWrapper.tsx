'use client';

import { useEffect, useState } from 'react';
import { serverStrapiAPI } from '@/lib/server-api';
import PublicationsSection from './PublicationsSection';
import type { Publication } from '@/types';

export default function PublicationsWrapper() {
  const [homePublications, setHomePublications] = useState<Publication[]>([]);
  const [hasMorePublications, setHasMorePublications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setIsLoading(true);
        const allPublications = await serverStrapiAPI.getPublications();
        const visible = allPublications.data.filter((item) => !item.Hide);
        const publications = visible.filter((item) => item.ShowInHome).slice(0, 2);
        
        setHomePublications(publications);
        setHasMorePublications(visible.length > publications.length);
        setError(null);
      } catch (err) {
        console.error('Failed to load publications for homepage:', err);
        setError(err instanceof Error ? err.message : 'Failed to load publications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublications();
  }, []);

  if (isLoading) {
    return <div>Loading publications...</div>;
  }

  if (error) {
    return <div>Error loading publications: {error}</div>;
  }

  return (
    <PublicationsSection 
      publications={homePublications} 
      showViewAll={hasMorePublications} 
    />
  );
}
