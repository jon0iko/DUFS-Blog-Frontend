
import HeroSection from '@/components/home/HeroSection';
import FeaturedArticles from '@/components/home/FeaturedArticles';
import EditorChoice from '@/components/home/EditorChoice';
import MorePostsButton from '@/components/home/MorePostsButton';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedArticles />
      <MorePostsButton />
      <EditorChoice />
    </div>
  );
}