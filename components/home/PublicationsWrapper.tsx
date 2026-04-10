'use client';

import { useEffect, useState } from 'react';
import { strapiAPI } from '@/lib/api';
import PublicationsSection from './PublicationsSection';
import ErrorScreen from './ErrorScreen';
import type { Publication } from '@/types';

interface PublicationsWrapperProps {
  onErrorChange?: (hasError: boolean) => void;
}

export default function PublicationsWrapper({
  onErrorChange,
}: PublicationsWrapperProps) {
  const [homePublications, setHomePublications] = useState<Publication[]>([]);
  const [hasMorePublications, setHasMorePublications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublications = async () => {
    try {
      setIsLoading(true);
      const allPublications = await strapiAPI.getPublications();
      const visible = (allPublications.data || []).filter((item: any) => !item.Hide);
      const publications = visible.filter((item: any) => item.ShowInHome);
      
      setHomePublications(publications);
      setHasMorePublications(visible.length > publications.length);
      setError(null);
      onErrorChange?.(false);
    } catch (err) {
      console.error('Failed to load publications:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to load publications';
      setError(errorMsg);
      onErrorChange?.(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, [onErrorChange]);

  if (isLoading) {
    return <div className="py-12 text-center">Loading publications...</div>;
  }

  if (error) {
    return (
      <ErrorScreen
        title="Unable to Load Publications"
        message="We encountered a connection problem while loading publications. Please check your internet connection and try again."
        onRetry={() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }}
        showRetry={true}
      />
    );
  }

  return (
    <PublicationsSection 
      publications={homePublications} 
      showViewAll={hasMorePublications} 
    />
  );
}
