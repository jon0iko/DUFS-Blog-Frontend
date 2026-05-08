'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import HeroSection from '@/components/home/HeroSection';
import ScrollReveal from '@/components/ui/ScrollReveal';
import CurveDivider from '@/components/home/CurveDivider';
import LoadingScreen from '@/components/common/LoadingScreen';
import { TextReelProvider } from '@/contexts/TextReelContext';

// Dynamically import below-the-fold components to reduce initial bundle size
const BrowseContentSectionWrapper = dynamic(() => import('@/components/home/BrowseContentSectionWrapper'));
const EditorChoice = dynamic(() => import('@/components/home/EditorChoice'));
const PublicationsWrapper = dynamic(() => import('@/components/home/PublicationsWrapper'));
const TextReel = dynamic(() => import('@/components/home/TextReel'));
const CTAPoster = dynamic(() => import('@/components/home/CTAPoster'));
const BackToTopButton = dynamic(() => import('@/components/home/BackToTopButton'));

export default function Home() {
  const [browseError, setBrowseError] = useState(false);
  const [editorError, setEditorError] = useState(false);
  const [publicationsError, setPublicationsError] = useState(false);
  const [isHeroReady, setIsHeroReady] = useState(false);

  // Check if ALL three sections have errors
  const allSectionsHaveErrors = browseError && editorError && publicationsError;

  return (
    <>
      {/* Show loading overlay until hero section loads */}
      <LoadingScreen isLoading={!isHeroReady} />
      
      <div>
        <HeroSection onReadyStateChange={setIsHeroReady} />
        <CurveDivider />

        {/* Defer rendering heavy components until Hero is fully loaded to prevent layout shifts */}
        {isHeroReady && (
          <>
            <BrowseContentSectionWrapper onErrorChange={setBrowseError} />

            <EditorChoice onErrorChange={setEditorError} />

            <ScrollReveal yOffset={50} duration={0.9}>
              <PublicationsWrapper onErrorChange={setPublicationsError} />
            </ScrollReveal>

            <TextReelProvider>
              {!allSectionsHaveErrors && <CTAPoster />}
              <TextReel />
            </TextReelProvider>

            <BackToTopButton />
          </>
        )}
      </div>
    </>
  );
}