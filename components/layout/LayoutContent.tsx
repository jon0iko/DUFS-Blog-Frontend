'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingBanner from '@/components/layout/FloatingBanner';
import LoadingScreen from '@/components/common/LoadingScreen';

interface LayoutContentProps {
  children: ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const isEditorPage = pathname === '/editor' || pathname === '/editor/';
  const isAuthPage = pathname.startsWith('/auth/');

  // Initial loading state for smooth page load experience
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const startTime = Date.now();
    const minLoadDuration = 500;

    const handleLoad = () => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadDuration - elapsed);

      setTimeout(() => {
        setIsInitialLoading(false);
      }, remainingTime);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  return (
    <>
      <LoadingScreen isLoading={isInitialLoading} minDuration={500} fadeDuration={300} />
      <div className="flex min-h-screen flex-col">
        {!isEditorPage && !isAuthPage && <Header />}
        <main className="flex-1">{children}</main>
        {!isEditorPage && !isAuthPage && <FloatingBanner />}
        {!isEditorPage && !isAuthPage && <Footer/> }
      </div>
    </>
  );
}
