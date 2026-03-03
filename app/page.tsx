import HeroSection from '@/components/home/HeroSection';
import EditorChoice from '@/components/home/EditorChoice';
import BrowseContentSectionWrapper from '@/components/home/BrowseContentSectionWrapper';
import PublicationsSection from '@/components/home/PublicationsSection';
import ScrollReveal from '@/components/ui/ScrollReveal';
import CurveDivider from '@/components/home/CurveDivider';
import TextReel from '@/components/home/TextReel';
import BackToTopButton from '@/components/home/BackToTopButton';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <CurveDivider />

      <BrowseContentSectionWrapper />

      {/* <MorePostsButton /> */}

      <EditorChoice />

      <ScrollReveal>
        <PublicationsSection />
      </ScrollReveal>

      <TextReel />

      <BackToTopButton />
    </div>
  );
}