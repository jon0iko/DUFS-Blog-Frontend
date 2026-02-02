"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Article } from "@/types";
import { getArticleData, getArticleImage } from "@/lib/strapi-helpers";
import { getFontClass } from "@/lib/fonts";

interface HeroCarouselProps {
  articles: Article[];
}

const SLIDE_DURATION = 6000; // 6 seconds per slide

export default function HeroCarousel({ articles }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Memoize article data for performance
  const processedArticles = useMemo(() => {
    return articles.map(article => ({
      ...getArticleData(article),
      imageSrc: getArticleImage(article)
    })).filter(a => a !== null);
  }, [articles]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % processedArticles.length);
  }, [processedArticles.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + processedArticles.length) % processedArticles.length);
  }, [processedArticles.length]);

  /* Loading State */
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  // Reset loading state when index changes
  useEffect(() => {
    setIsImageLoading(true);
  }, [currentIndex]);

  // Autoplay Logic - Paused when image is loading
  useEffect(() => {
    if (!isPlaying || isImageLoading || processedArticles.length <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [isPlaying, isImageLoading, processedArticles.length, handleNext]);


  if (processedArticles.length === 0) return null;

  const currentArticle = processedArticles[currentIndex];
  
  // Font classes
  const titleFontClass = currentArticle?.title ? getFontClass(currentArticle.title) : 'font-roboto';
  const excerptFontClass = currentArticle?.excerpt ? getFontClass(currentArticle.excerpt) : 'font-roboto';

  return (
    <>
    <section 
      className="relative h-[60vh] lg:h-[80vh] w-full overflow-hidden bg-black cursor-pointer"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Loading Overlay - Only for initial load */}
      {!hasLoadedInitial && (
        <div className="absolute inset-0 z-40 bg-black flex items-center justify-center">
           <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Main Content Group - Isolated from Navigation */}
      <div className="group absolute inset-0 w-full h-full">
        <Link 
          href={`/read-article?slug=${currentArticle?.slug}`}
          className="absolute inset-0 z-10"
          aria-label={`Read ${currentArticle?.title}`}
        />

        <AnimatePresence>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image with Ken Burns Effect */}
            {currentArticle?.imageSrc && (
               <div className="relative w-full h-full overflow-hidden">
                  <motion.div
                    className="relative w-full h-full"
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.1 }}
                    transition={{ duration: SLIDE_DURATION / 1000 + 0.5, ease: "linear" }}
                  >
                    <Image
                      src={currentArticle.imageSrc}
                      alt={currentArticle.title || "Hero Image"}
                      fill
                      priority
                      onLoad={() => {
                        setIsImageLoading(false);
                        setHasLoadedInitial(true);
                      }}
                      className="object-cover grayscale"
                      sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-black/50" />
                  </motion.div>
               </div>
            )}

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-20 pointer-events-none z-20">
               <div className="container px-14 md:px-6">
                  <div className="max-w-4xl">
                    {/* Text Animation */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                       <h1 className={`${titleFontClass} text-2xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-6 group-hover:underline decoration-white underline-offset-8 transition-all leading-tight shadow-black drop-shadow-lg`}>
                         {currentArticle?.title}
                       </h1>
                      <p className={`${excerptFontClass} text-xs md:text-lg text-white/90 line-clamp-2 md:line-clamp-3 max-w-2xl drop-shadow-md`}>
                         {currentArticle?.excerpt}
                      </p>
                    </motion.div>
                  </div>
               </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation - Custom SVG Arrows - Sibling to Group */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 md:px-8 pointer-events-none z-30">
        <button 
          onClick={handlePrev}
          className="pointer-events-auto opacity-70 hover:opacity-100 transition-opacity hover:scale-110 duration-200"
          aria-label="Previous Slide"
        >
           <Image 
             src="/images/ep_arrow-left-bold.svg"
             alt="Previous"
             width={48}
             height={48}
             className="w-8 h-8 md:w-16 md:h-16 invert"
           />
        </button>
        <button 
          onClick={handleNext}
          className="pointer-events-auto opacity-70 hover:opacity-100 transition-opacity hover:scale-110 duration-200"
          aria-label="Next Slide"
        >
           <Image 
             src="/images/ep_arrow-right-bold.svg"
             alt="Next"
             width={48}
             height={48}
             className="w-8 h-8 md:w-16 md:h-16 invert"
           />
        </button>
      </div>
    </section>

    {/* Progress Line - Outside the Carousel Section */}
    <div className="w-full h-1 bg-white/20">
       {isPlaying && !isImageLoading && (
          <div 
             key={currentIndex}
             className="h-full bg-foreground animate-progress origin-left"
             style={{ animationDuration: `${SLIDE_DURATION}ms` }}
          />
       )}
    </div>
    </>
  );
}
