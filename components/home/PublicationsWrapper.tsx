'use client';

import { useEffect, useState } from 'react';
import { strapiAPI } from '@/lib/api';
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
        const allPublications = await strapiAPI.getPublications();
        const visible = (allPublications.data || []).filter((item: any) => !item.Hide);
        const publications = visible.filter((item: any) => item.ShowInHome);
        
        setHomePublications(publications);
        setHasMorePublications(visible.length > publications.length);
        setError(null);
      } catch (err) {
        console.error('Failed to load publications:', err);
        setError(err instanceof Error ? err.message : 'Failed to load publications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublications();
  }, []);

  if (isLoading) {
    return <div className="py-12 text-center">Loading publications...</div>;
  }

  if (error) {
    return <div className="py-12 text-center text-red-600">Error loading publications</div>;
  }

  return (
    <PublicationsSection 
      publications={homePublications} 
      showViewAll={hasMorePublications} 
    />
  );
}
