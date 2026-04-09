'use client';

import { useEffect, useState } from 'react';
import PublicationsSection from '../../components/home/PublicationsSection';
import { strapiAPI } from '@/lib/api';
import type { Publication } from '@/types';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        const response = await strapiAPI.getPublications();
        const filtered = (response.data || []).filter((item: any) => !item.Hide);
        setPublications(filtered);
      } catch (error) {
        console.error('Failed to load publications page data:', error);
        setPublications([]);
      } finally {
        setLoading(false);
      }
    };

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
        ) : (
          <PublicationsSection publications={publications} />
        )}
      </div>
    </div>
  );
}
