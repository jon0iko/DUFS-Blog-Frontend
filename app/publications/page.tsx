'use client';

import { useEffect, useState } from 'react';
import PublicationsSection from '../../components/home/PublicationsSection';
import ErrorScreen from '@/components/home/ErrorScreen';
import { strapiAPI } from '@/lib/api';
import type { Publication } from '@/types';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await strapiAPI.getPublications();
      const filtered = (response.data || []).filter((item: any) => !item.Hide);
      setPublications(filtered);
    } catch (err) {
      console.error('Failed to load publications page data:', error);
      const errorMsg = err instanceof Error ? err.message : 'Failed to load publications';
      setError(errorMsg);
      setPublications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background patterns */}
      <div
        className="pointer-events-none absolute -inset-1/4 select-none z-0 dark:hidden"
        style={{ backgroundImage: "url(/images/bgpaper.jpg)", backgroundRepeat: "repeat" }}
      />
      <div
        className="bg-pattern-dark pointer-events-none absolute -inset-1/4 hidden select-none z-0 dark:block"
        style={{
          backgroundImage: "url(/images/bgpaper_dark.jpg)",
          backgroundRepeat: "repeat",
          backgroundSize: "1667px 1200px",
        }}
      />
      
      <div className="relative z-10 pt-10">
        <div className="container">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
        {loading ? (
          <div className="py-12 text-center">Loading publications...</div>
        ) : error ? (
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
        ) : (
          <PublicationsSection publications={publications} />
        )}
      </div>
    </div>
  );
}
