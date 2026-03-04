"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Article } from "@/types";
import { getArticleData, getArticleImage, getAuthorAvatar, formatPublishDate } from "@/lib/strapi-helpers";
import { getFontClass } from "@/lib/fonts";
import { gsap } from "@/lib/gsap";

interface HeroCarouselProps {
  articles: Article[];
}

const SLIDE_DURATION = 6000; // 6 seconds per slide
const IMAGE_LOAD_TIMEOUT = 3000; // Fallback if image onLoad/onError never fires

export default function HeroCarousel({ articles }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [progressDuration, setProgressDuration] = useState(SLIDE_DURATION);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Refs for robust timer management (immune to stale closures)
  const autoplayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideStartTime = useRef(Date.now());
  const remainingTime = useRef(SLIDE_DURATION);
  const slideReady = useRef(false);

  // GSAP animation refs
  const kenBurnsRef = useRef<HTMLDivElement>(null);
  const contentTextRef = useRef<HTMLDivElement>(null);

  // Memoize article data for performance
  const processedArticles = useMemo(() => {
    return articles.map(article => ({
      ...getArticleData(article),
      imageSrc: getArticleImage(article)
    })).filter(a => a !== null);
  }, [articles]);

  const articleCount = processedArticles.length;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % articleCount);
  }, [articleCount]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + articleCount) % articleCount);
  }, [articleCount]);

  // Stable ref for handleNext — avoids stale closures in setTimeout/event listeners
  const handleNextRef = useRef(handleNext);
  useEffect(() => { handleNextRef.current = handleNext; }, [handleNext]);

  // Schedule next slide transition after `duration` ms
  const startAutoplay = useCallback((duration: number = SLIDE_DURATION) => {
    if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
    if (articleCount <= 1) return;

    slideStartTime.current = Date.now();
    remainingTime.current = duration;

    autoplayTimer.current = setTimeout(() => {
      handleNextRef.current();
    }, duration);
  }, [articleCount]);

  // Called when the current slide is ready (image loaded, errored, or safety timeout)
  const onSlideReady = useCallback((duration: number = SLIDE_DURATION) => {
    if (slideReady.current) return; // Debounce — only fire once per slide
    slideReady.current = true;

    setIsImageLoading(false);
    setHasLoadedInitial(true);

    if (safetyTimer.current) {
      clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }

    setProgressDuration(duration);
    setProgressKey((k) => k + 1);
    startAutoplay(duration);
  }, [startAutoplay]);

  // Stable ref for onSlideReady
  const onSlideReadyRef = useRef(onSlideReady);
  useEffect(() => { onSlideReadyRef.current = onSlideReady; }, [onSlideReady]);

  // GSAP Ken Burns – starts fresh on every slide change
  useEffect(() => {
    const kenBurnsEl = kenBurnsRef.current;
    if (!kenBurnsEl) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    // Kill any stale tween on this element before starting a fresh one
    gsap.killTweensOf(kenBurnsEl);
    gsap.fromTo(
      kenBurnsEl,
      { scale: 1 },
      {
        scale: 1.08,
        duration: SLIDE_DURATION / 1000 + 0.5,
        ease: "power1.out",
        overwrite: true,
      }
    );
  }, [currentIndex]);

  // GSAP text entrance — staggered children fade-up on every slide change
  useEffect(() => {
    const textEl = contentTextRef.current;
    if (!textEl) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(textEl.children, { opacity: 1, y: 0 });
      return;
    }

    const tl = gsap.timeline({ delay: 0.45 });
    tl.fromTo(
      textEl.children,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: "power3.out",
        overwrite: true,
      }
    );

    return () => { tl.kill(); };
  }, [currentIndex]);

  // When slide index changes — reset state and arm safety fallback
  useEffect(() => {
    slideReady.current = false;
    setIsImageLoading(true);

    if (autoplayTimer.current) {
      clearTimeout(autoplayTimer.current);
      autoplayTimer.current = null;
    }

    // Safety: if onLoad/onError never fire (cache quirk, browser optimization, etc.)
    safetyTimer.current = setTimeout(() => {
      onSlideReadyRef.current();
    }, IMAGE_LOAD_TIMEOUT);

    return () => {
      if (safetyTimer.current) {
        clearTimeout(safetyTimer.current);
        safetyTimer.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // Pause autoplay when tab is hidden, resume/advance when visible
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        // Tab hidden — snapshot remaining time and clear timer
        if (autoplayTimer.current) {
          const elapsed = Date.now() - slideStartTime.current;
          remainingTime.current = Math.max(0, remainingTime.current - elapsed);
          clearTimeout(autoplayTimer.current);
          autoplayTimer.current = null;
        }
      } else {
        // Tab visible — resume only if slide image is ready
        if (!slideReady.current || articleCount <= 1) return;

        if (remainingTime.current < 1000) {
          // Slide should have transitioned while hidden — advance now for fresh animations
          handleNextRef.current();
        } else {
          // Resume with remaining time, restart progress bar to match
          setProgressDuration(remainingTime.current);
          setProgressKey((k) => k + 1);

          if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
          slideStartTime.current = Date.now();
          autoplayTimer.current = setTimeout(() => {
            handleNextRef.current();
          }, remainingTime.current);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [articleCount]);

  // Pause autoplay when user interacts with navigation dots
  useEffect(() => {
    if (isUserInteracting) {
      // Clear autoplay timer but keep zoom animation running
      if (autoplayTimer.current) {
        clearTimeout(autoplayTimer.current);
        autoplayTimer.current = null;
      }
    } else {
      // User stopped interacting - restart autoplay with full duration if slide is ready
      if (slideReady.current && articleCount > 1) {
        setProgressDuration(SLIDE_DURATION);
        setProgressKey((k) => k + 1);
        startAutoplay(SLIDE_DURATION);
      }
    }
  }, [isUserInteracting, articleCount, startAutoplay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, []);


  if (processedArticles.length === 0) return null;

  const currentArticle = processedArticles[currentIndex];
  console.log('Current Article:', currentArticle);
  
  // Font classes
  const titleFontClass = currentArticle?.title ? getFontClass(currentArticle.title) : 'font-roboto';
  const excerptFontClass = currentArticle?.excerpt ? getFontClass(currentArticle.excerpt) : 'font-roboto';
  const authorFontClass = currentArticle?.author?.name ? getFontClass(currentArticle.author.name) : 'font-roboto';


  return (
    <>
    <section 
      className="relative h-[90svh] md:h-[90vh] w-full overflow-hidden bg-black cursor-pointer"
      // onMouseEnter={() => setIsPlaying(false)}
      // onMouseLeave={() => setIsPlaying(true)}
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
                  {/* GSAP-driven Ken Burns — ref-based, kills & restarts cleanly on every slide */}
                  <div
                    ref={kenBurnsRef}
                    className="relative w-full h-full"
                    style={{ transformOrigin: "center center", willChange: "transform" }}
                  >
                  
                    <Image
                      src={currentArticle.imageSrc}
                      alt={currentArticle.title || "Hero Image"}
                      fill
                      priority
                      onLoad={() => onSlideReadyRef.current()}
                      onError={() => onSlideReadyRef.current()}
                      className="object-cover"
                      sizes="100vw"
                    />
                    {/* Cinematic Gradient Overlay - Fades from bottom and top for cinematic effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-transparent" />
                  </div>
               </div>
            )}

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-20 pointer-events-none z-20">
               <div className="container px-6 md:px-6">
                  <div className="max-w-5xl">
                    {/* GSAP stagger-reveal text — children animated by useEffect above */}
                    <div ref={contentTextRef}>
                       {/* Author & Date Info */}
                       <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                         {currentArticle?.author && (
                           <>
                             <div className="w-7 h-7 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-white/80 flex-shrink-0">
                               <Image
                                 src={getAuthorAvatar(currentArticle.author.avatar)}
                                 alt={currentArticle.author.name || 'Staff'}
                                 width={40}
                                 height={40}
                                 className="w-full h-full object-cover"
                               />
                             </div>
                             <span className={`${authorFontClass} text-white/90 text-xs md:text-base font-bold drop-shadow-md`}>
                               {currentArticle.author.name || 'Staff'}
                             </span>
                           </>
                         )}
                         {currentArticle?.publishedAt && (
                           <>
                             <span className="text-white/60 text-xs md:text-base">•</span>
                             <span className="text-white/80 text-xs md:text-sm drop-shadow-md font-bold">
                               {formatPublishDate(currentArticle.publishedAt)}
                             </span>
                           </>
                         )}
                         
                       </div>

                       <h1 className={`${titleFontClass} text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-6 group-hover:underline decoration-white underline-offset-8 transition-all leading-tight shadow-black drop-shadow-lg`}>
                         {currentArticle?.title}
                       </h1>
                      <p className={`${excerptFontClass} text-xs font-light md:text-lg text-white/90 line-clamp-2 md:line-clamp-3 max-w-2xl drop-shadow-md`}>
                         {currentArticle?.excerpt}
                      </p>
                    </div>
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

      {/* Navigation Dots */}
      <div 
        className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-3 z-30 pointer-events-none"
        onMouseEnter={() => setIsUserInteracting(true)}
        onMouseLeave={() => setIsUserInteracting(false)}
        onTouchStart={() => setIsUserInteracting(true)}
        onTouchEnd={() => setIsUserInteracting(false)}
      >
        {processedArticles.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`pointer-events-auto transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'w-8 md:w-12 h-2 md:h-2.5 bg-white'
                : 'w-2 md:w-2.5 h-2 md:h-2.5 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>

    {/* Progress Line - Outside the Carousel Section */}
    <div className="w-full h-1 bg-[#E0D5D0]">
       {!isImageLoading && !isUserInteracting && (
          <div 
             key={progressKey}
             className="h-full bg-black dark:bg-black animate-progress origin-left"
             style={{ animationDuration: `${progressDuration}ms` }}
          />
       )}
    </div>
    </>
  );
}
