// File: src/components/home/HeroSection.tsx

import Link from 'next/link';
import { heroArticle } from '@/data/dummy-data';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] w-full overflow-hidden">
      {/* Black and white background image with overlay */}
      <div className="absolute inset-0">
        <Image
          src={heroArticle.imageSrc}
          alt={heroArticle.title}
          fill
          priority
          className="object-cover grayscale"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
        <div className="max-w-5xl">
          <Link href={`/articles/${heroArticle.slug}`}>
            <h1 className="font-kalpurush text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {heroArticle.title}
            </h1>
            <p className="text-lg md:text-xl text-white/80">
              {heroArticle.excerpt}
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}