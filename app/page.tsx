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
  return (
    <div>
      <HeroSection />
      <CurveDivider />

      <BrowseContentSectionWrapper />

      <EditorChoice />

      <ScrollReveal yOffset={50} duration={0.9}>
        <PublicationsWrapper />
      </ScrollReveal>

      <TextReelProvider>
        <CTAPoster  />
        <TextReel />
      </TextReelProvider>

      <BackToTopButton />
    </div>
  );
}