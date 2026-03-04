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

      {/* BrowseContentSection fetches its own data client-side */}
      <BrowseContentSectionWrapper />

      {/* Editor's Choice — stagger reveals added inside EditorChoice */}
      <EditorChoice />

      {/* Publications — full section reveal */}
      <ScrollReveal yOffset={50} duration={0.9}>
        <PublicationsSection />
      </ScrollReveal>

      {/* Text reel — GSAP marquee with scroll‑velocity */}
      <TextReel />

      <BackToTopButton />
    </div>
  );
}