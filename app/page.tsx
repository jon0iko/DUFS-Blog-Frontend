'use client';

import { useState } from 'react';
import HeroSection from '@/components/home/HeroSection';
import EditorChoice from '@/components/home/EditorChoice';
import BrowseContentSectionWrapper from '@/components/home/BrowseContentSectionWrapper';
import PublicationsWrapper from '@/components/home/PublicationsWrapper';
import ScrollReveal from '@/components/ui/ScrollReveal';
import CurveDivider from '@/components/home/CurveDivider';
import TextReel from '@/components/home/TextReel';
import BackToTopButton from '@/components/home/BackToTopButton';
import { TextReelProvider } from '@/contexts/TextReelContext';
import CTAPoster from '@/components/home/CTAPoster';

export default function Home() {
  const [browseError, setBrowseError] = useState(false);
  const [editorError, setEditorError] = useState(false);
  const [publicationsError, setPublicationsError] = useState(false);

  // Check if ALL three sections have errors
  const allSectionsHaveErrors = browseError && editorError && publicationsError;

  return (
    <div>
      <HeroSection />
      <CurveDivider />

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
    </div>
  );
}