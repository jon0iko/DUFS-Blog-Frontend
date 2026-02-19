import HeroSection from '@/components/home/HeroSection';
import EditorChoice from '@/components/home/EditorChoice';
import BrowseContentSectionWrapper from '@/components/home/BrowseContentSectionWrapper';
import PublicationsSection from '@/components/home/PublicationsSection';
import ScrollReveal from '@/components/ui/ScrollReveal';
import CurveDivider from '@/components/home/CurveDivider';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <CurveDivider />

      <ScrollReveal>
        <BrowseContentSectionWrapper />
      </ScrollReveal>
      
      {/* <MorePostsButton /> */}

      <EditorChoice />

      <ScrollReveal>
        <PublicationsSection />
      </ScrollReveal>
      
    </div>
  );
}