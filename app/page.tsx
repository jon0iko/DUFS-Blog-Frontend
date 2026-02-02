import HeroSection from '@/components/home/HeroSection';
import FeaturedArticles from '@/components/home/FeaturedArticles';
import EditorChoice from '@/components/home/EditorChoice';
import MorePostsButton from '@/components/home/MorePostsButton';
import CategoriesSection from '@/components/home/CategoriesSection';
import ScrollReveal from '@/components/ui/ScrollReveal';

export default function Home() {
  return (
    <div>
      <HeroSection />

      <CategoriesSection />

      <ScrollReveal>
        <FeaturedArticles />
      </ScrollReveal>
      
      <MorePostsButton />

      <ScrollReveal>
        <EditorChoice />
      </ScrollReveal>
    </div>
  );
}