"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Article } from "@/types";
import {
  getArticleData,
  getArticleImage,
  formatPublishDate,
} from "@/lib/strapi-helpers";
import { getFontClass, getFontClassAlteHaasGrotesk } from "@/lib/fonts";
import { gsap } from "@/lib/gsap";

interface HeroCarouselProps {
  articles: Article[];
}

// Utility to split text into words and graphemes (safe for Bengali)
// Removed splitIntoWordsAndChars as it is no longer used

const SLIDE_DURATION = 6000; // 6 seconds per slide
const IMAGE_LOAD_TIMEOUT = 3000; // Fallback if image onLoad/onError never fires

export default function HeroCarousel({ articles }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [progressDuration, setProgressDuration] = useState(SLIDE_DURATION);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Swipe detection state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Refs for robust timer management (immune to stale closures)
  const autoplayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slideStartTime = useRef(Date.now());
  const remainingTime = useRef(SLIDE_DURATION);
  const slideReady = useRef(false);

  // GSAP animation refs
  const kenBurnsRef = useRef<HTMLDivElement>(null);
  const contentTextRef = useRef<HTMLDivElement>(null);
  const titletextref = useRef<HTMLHeadingElement>(null);

  // Memoize article data for performance
  const processedArticles = useMemo(() => {
    return articles
      .map((article) => ({
        ...getArticleData(article),
        imageSrc: getArticleImage(article),
      }))
      .filter((a) => a !== null);
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
  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  // Schedule next slide transition after `duration` ms
  const startAutoplay = useCallback(
    (duration: number = SLIDE_DURATION) => {
      if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
      if (articleCount <= 1) return;

      slideStartTime.current = Date.now();
      remainingTime.current = duration;

      autoplayTimer.current = setTimeout(() => {
        handleNextRef.current();
      }, duration);
    },
    [articleCount],
  );

  // Called when the current slide is ready (image loaded, errored, or safety timeout)
  const onSlideReady = useCallback(
    (duration: number = SLIDE_DURATION) => {
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
    },
    [startAutoplay],
  );

  // Stable ref for onSlideReady
  const onSlideReadyRef = useRef(onSlideReady);
  useEffect(() => {
    onSlideReadyRef.current = onSlideReady;
  }, [onSlideReady]);

  // GSAP Ken Burns – starts fresh on every slide change
  useEffect(() => {
    const kenBurnsEl = kenBurnsRef.current;
    if (!kenBurnsEl) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    // Kill any stale tween on this element before starting a fresh one
    gsap.killTweensOf(kenBurnsEl);

    if (isMobile) {
      // Mobile
      // gsap.fromTo(
      //   kenBurnsEl,
      //   { scale: 1 },
      //   {
      //     scale: 1,
      //     duration: SLIDE_DURATION / 1000 + 0.5, // Slightly longer than slide duration for smoothness
      //     ease: "power1.out",
      //     overwrite: true,
      //     force3D: true,
      //   }
      // );
    } else {
      // Desktop: zoom in
      gsap.fromTo(
        kenBurnsEl,
        { scale: 1 },
        {
          scale: 1.1,
          duration: SLIDE_DURATION / 1000 + 10,
          ease: "power1.out",
          overwrite: true,
          force3D: true,
        },
      );
    }
  }, [currentIndex]);

  // GSAP defocused-to-focused text animation
  useEffect(() => {
    if (!titletextref.current) return;

    const groupEl = contentTextRef.current;

    // Reset any previous state immediately to avoid layout thrashing visible to user
    gsap.set(groupEl, { clearProps: "all" });

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    // Animation configuration
    if (!isMobile) {
      gsap.fromTo(
        groupEl,
        {
          // Optimized starting state
          filter: "blur(20px)",
          scale: 1.05, // Reduced scale for smoother effect
          opacity: 0,
          y: 0,
          willChange: "transform, opacity, filter", // Hint to browser
        },
        {
          // Ending State
          filter: "blur(0px)",
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 3, // Smooth cinematic duration
          ease: "expo.out", // Softer ease for elegance
          onComplete: () => {
            // Cleanup hints to free memory
            gsap.set(groupEl, { clearProps: "willChange" });
          },
        },
      );
    }

    return () => {
      gsap.killTweensOf(groupEl);
    };
  }, [currentIndex, processedArticles]);

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
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
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

  // Swipe detection functions
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, []);

  if (processedArticles.length === 0) return null;

  const currentArticle = processedArticles[currentIndex];
  console.log("Current Article:", currentArticle);

  // Font classes
  const titleFontClass = currentArticle?.title
    ? getFontClassAlteHaasGrotesk(currentArticle.title)
    : "font-altehaasgrotesk";
  const excerptFontClass = currentArticle?.excerpt
    ? getFontClass(currentArticle.excerpt)
    : "font-roboto";
  const authorFontClass = currentArticle?.author?.name
    ? getFontClass(currentArticle.author.name)
    : "font-roboto";

  return (
    <>
      <section
        className="relative h-[81svh] md:h-[90vh] w-full overflow-hidden bg-black cursor-pointer"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
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
                <div className="relative w-full h-full overflow-hidden bg-black">
                  {/* GSAP-driven Ken Burns — ref-based, kills & restarts cleanly on every slide */}
                  <div
                    ref={kenBurnsRef}
                    className="relative w-full h-full"
                    style={{
                      transformOrigin: "center center",
                      willChange: "transform",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    {/* Mobile: object-contain shows full image; desktop: object-cover fills frame */}
                    <Image
                      src={currentArticle.imageSrc}
                      alt={currentArticle.title || "Hero Image"}
                      fill
                      priority
                      onLoad={() => onSlideReadyRef.current()}
                      onError={() => onSlideReadyRef.current()}
                      className=" object-cover"
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
                                src={
                                  currentArticle.author.avatar ||
                                  "/images/avatarPlaceholder.png"
                                }
                                alt={currentArticle.author.name || "Staff"}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span
                              className={`${authorFontClass} text-white/90 text-xs md:text-base font-bold drop-shadow-md`}
                            >
                              {currentArticle.author.name || "Staff"}
                            </span>
                          </>
                        )}
                        {currentArticle?.publishedAt && (
                          <>
                            <span className="text-white/60 text-xs md:text-base">
                              •
                            </span>
                            <span className="text-white/80 text-xs md:text-sm drop-shadow-md font-bold">
                              {formatPublishDate(currentArticle.publishedAt)}
                            </span>
                          </>
                        )}
                      </div>

                      <h1
                        id="titleText"
                        ref={titletextref}
                        className={`${titleFontClass} text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-6 decoration-white underline-offset-8 transition-all leading-tight shadow-black drop-shadow-lg`}
                      >
                        {currentArticle?.title}
                      </h1>
                      {/* {currentArticle?.excerpt && (
                        <p
                          className={`${excerptFontClass} text-xs font-light md:text-lg text-white/90 line-clamp-2 md:line-clamp-3 max-w-2xl drop-shadow-md`}
                        >
                          {currentArticle.excerpt}
                        </p>
                      )} */}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation - Custom SVG Arrows - Sibling to Group */}
        <div className="hidden md:flex absolute inset-x-0 md:top-1/2 -translate-y-1/2 justify-between px-2 md:px-8 pointer-events-none z-30">
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

        {/* Navigation Dots with Small Arrows */}
        <div
          className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-3 z-30 pointer-events-none"
          onMouseEnter={() => setIsUserInteracting(true)}
          onMouseLeave={() => setIsUserInteracting(false)}
          onTouchStart={() => setIsUserInteracting(true)}
          onTouchEnd={() => setIsUserInteracting(false)}
        >
          {/* Small Left Arrow */}
          <button
            onClick={handlePrev}
            className="md:hidden pointer-events-auto opacity-70 hover:opacity-100 transition-opacity mr-1"
            aria-label="Previous Slide"
          >
            <Image
              src="/images/ep_arrow-left-bold.svg"
              alt="Previous"
              width={12}
              height={12}
              className="w-3 h-3 md:w-4 md:h-4 invert"
            />
          </button>

          {/* Navigation Dots */}
          {processedArticles.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`pointer-events-auto transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "w-8 md:w-12 h-2 md:h-2.5 bg-white"
                  : "w-2 md:w-2.5 h-2 md:h-2.5 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}

          {/* Small Right Arrow */}
          <button
            onClick={handleNext}
            className="md:hidden pointer-events-auto opacity-70 hover:opacity-100 transition-opacity ml-1"
            aria-label="Next Slide"
          >
            <Image
              src="/images/ep_arrow-right-bold.svg"
              alt="Next"
              width={12}
              height={12}
              className="w-3 h-3 md:w-4 md:h-4 invert"
            />
          </button>
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
