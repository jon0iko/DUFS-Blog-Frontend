"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Article } from "@/types";
import { getArticleData, getArticleImage } from "@/lib/strapi-helpers";
import { getFontClass } from "@/lib/fonts";

interface HeroCarouselProps {
  articles: Article[];
}

export default function HeroCarousel({ articles }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Auto-rotate carousel
  useEffect(() => {
    if (!autoplay || articles.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [autoplay, articles.length]);

  // Resume autoplay after 10 seconds of inactivity
  useEffect(() => {
    if (autoplay || articles.length <= 1) return;

    const timer = setTimeout(() => {
      setAutoplay(true);
    }, 5000); // Resume after 10 seconds

    return () => clearTimeout(timer);
  }, [autoplay, articles.length]);

  // Reset transitioning state
  useEffect(() => {
    if (!isTransitioning) return;
    const timer = setTimeout(() => setIsTransitioning(false), 500);
    return () => clearTimeout(timer);
  }, [isTransitioning]);

  const goToPrevious = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
    setAutoplay(false);
  };

  const goToNext = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % articles.length);
    setAutoplay(false);
  };

  const goToSlide = (index: number) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
    setAutoplay(false);
  };

  const currentArticle = articles[currentIndex];
  const articleData = getArticleData(currentArticle);

  if (!articleData) {
    return null;
  }

  const imageSrc = getArticleImage(currentArticle);
  const titleFontClass = getFontClass(articleData.title);
  const excerptFontClass = getFontClass(articleData.excerpt);

  return (
    <section 
      className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] w-full overflow-hidden group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Black and white background image with overlay */}
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={articleData.title}
          fill
          priority
          className={`object-cover grayscale transition-all duration-700 ease-out ${
            isTransitioning ? "scale-105" : "scale-100 opacity-100"
          }`}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Content overlay */}
      <Link href={`/read-article?slug=${articleData.slug}`}>
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container pl-6 pb-12">
            <div className="max-w-5xl">
              <h1
                className={`${titleFontClass} text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 transition-all duration-700 ease-out ${
                  isTransitioning ? "translate-y-2" : "opacity-100 translate-y-0"
                } ${
                  isHovering ? "underline decoration-white decoration-2 underline-offset-4" : ""
                }`}
              >
                {articleData.title}
              </h1>
              <p
                className={`${excerptFontClass} text-lg md:text-xl text-white/80 transition-all duration-700 ease-out delay-100 ${
                  isTransitioning ? "translate-y-2" : "opacity-100 translate-y-0"
                }`}
              >
                {articleData.excerpt}
              </p>
            </div>
          </div>
        </div>
      </Link>

      {/* Previous Button */}
      {articles.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out rounded-full p-3 backdrop-blur-sm border border-white/40 hover:scale-110 active:scale-95"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-7 w-7 stroke-[2.5] transition-transform duration-300 ease-out group-hover:-translate-x-1" />
        </Button>
      )}

      {/* Next Button */}
      {articles.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out rounded-full p-3 backdrop-blur-sm border border-white/40 hover:scale-110 active:scale-95"
          aria-label="Next slide"
        >
          <ChevronRight className="h-7 w-7 stroke-[2.5] transition-transform duration-300 ease-out group-hover:translate-x-1" />
        </Button>
      )}

      {/* Dot indicators */}
      {articles.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {articles.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all duration-500 ease-out ${
                index === currentIndex
                  ? "bg-white w-8 h-2 shadow-lg scale-100"
                  : "bg-white/50 hover:bg-white/80 w-2 h-2 hover:scale-125 active:scale-90"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
