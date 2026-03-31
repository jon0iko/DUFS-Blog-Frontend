"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Category, Article } from "@/types";
import { strapiAPI } from "@/lib/api";
import { getArticleData, getArticleDataEnglishcategory } from "@/lib/strapi-helpers";
import { cn } from "@/lib/utils";
import ArticleCard from "./ArticleCard";

const ARTICLES_PER_PAGE = 8;

type SortOption = "newest" | "oldest" | "most-read";
type LanguageFilter = "all" | "en" | "bn";

const LANGUAGE_OPTIONS: {
  value: LanguageFilter;
  label: string;
  labelBn?: string;
}[] = [
  { value: "all", label: "All Languages" },
  { value: "en", label: "English" },
  { value: "bn", label: "Bangla", labelBn: "বাংলা" },
];

interface BrowseContentSectionProps {
  initialCategories: Category[];
}

export default function BrowseContentSection({
  initialCategories,
}: BrowseContentSectionProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>("all");
  const [categoryLanguage, setCategoryLanguage] = useState<"bn" | "en">("bn");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const [dropdownAlign, setDropdownAlign] = useState<"left" | "right">("left"); // Default to left for safety

  const MOBILE_CAT_LIMIT = 4;
  const DESKTOP_CAT_LIMIT = 6;
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotalArticles] = useState(0);
  const [spinTrigger, setSpinTrigger] = useState(0);

  // Ref for scrolling to articles grid
  const articlesGridRef = useRef<HTMLDivElement>(null);
  // Ref for scrolling to pagination
  const paginationRef = useRef<HTMLDivElement>(null);
  // Ref to track if we should scroll after page change loads
  const shouldScrollRef = useRef<boolean>(false);
  // Ref for detecting when section is revealed
  const headerRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);
  // Ref for filter dropdown
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const dropdownPanelRef = useRef<HTMLDivElement>(null);

  // Sort categories by latest article publication date
  useEffect(() => {
    const sortCategoriesByLatestArticle = async () => {
      try {
        // Fetch all published articles without pagination (minimal data for performance)
        const response = await strapiAPI.getArticlesMinimal({
          pageSize: 1000,
          sort: 'BlogDate:desc',
        });
        const allArticles = response.data || [];
        console.log('Fetched all articles for category sorting:', allArticles);

        // Create a map of category documentId to latest published date
        const categoryLatestDates = new Map<string, Date>();

        allArticles.forEach((article) => {
          if (article.category) {
            // Use BlogDate if available, otherwise use publishedAt
            const dateString = article.BlogDate || article.publishedAt;
            if (dateString) {
              // Use documentId as primary key since it's always populated in Strapi v5
              const categoryId = article.category.documentId || article.category.Slug || '';
              const publishedDate = new Date(dateString);

              console.log(
                `Article: ${article.title}, Category: ${article.category.nameBn || article.category.Name}, ID: ${categoryId}, Date: ${dateString}`
              );

              const currentLatest = categoryLatestDates.get(categoryId);
              if (!currentLatest || publishedDate > currentLatest) {
                categoryLatestDates.set(categoryId, publishedDate);
              }
            }
          }
        });

        console.log('Category Latest Dates Map:', categoryLatestDates);

        // Sort categories by latest published date (descending)
        // Extract original indices to use as tiebreaker
        const categoriesWithIndices = categories.map((cat, idx) => ({ cat, originalIdx: idx }));
        
        const sortedWithIndices = categoriesWithIndices.sort((a, b) => {
          const categoryIdA = a.cat.documentId || a.cat.Slug || '';
          const categoryIdB = b.cat.documentId || b.cat.Slug || '';

          const dateA = categoryLatestDates.get(categoryIdA) || new Date(0);
          const dateB = categoryLatestDates.get(categoryIdB) || new Date(0);

          const dateComparison = dateB.getTime() - dateA.getTime();
          
          // If dates are the same, keep original order (stable sort)
          if (dateComparison === 0) {
            return a.originalIdx - b.originalIdx;
          }

          console.log(
            `Comparing ${a.cat.nameBn || a.cat.Name} (${dateA.toISOString()}) vs ${b.cat.nameBn || b.cat.Name} (${dateB.toISOString()}) = ${dateComparison}`
          );

          return dateComparison;
        });

        const sortedCategories = sortedWithIndices.map(item => item.cat);

        console.log(
          'Sorted categories:',
          sortedCategories.map((c) => c.nameBn || c.Name)
        );

        setCategories(sortedCategories);
      } catch (error) {
        console.error("Failed to sort categories by latest article:", error);
      }
    };

    sortCategoriesByLatestArticle();
  }, []);

  // Fetch articles based on active filters
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);

        const filters: {
          page?: number;
          pageSize?: number;
          category?: string;
          sort?: string;
          language?: "en" | "bn" | "both";
        } = {
          page: currentPage,
          pageSize: ARTICLES_PER_PAGE,
          sort:
            sortBy === "newest"
              ? "BlogDate:desc"
              : sortBy === "oldest"
                ? "BlogDate:asc"
                : "viewCount:desc",
        };

        if (activeCategory && activeCategory !== "all") {
          filters.category = activeCategory;
        }

        if (languageFilter !== "all") {
          filters.language = languageFilter;
        }

        const response = await strapiAPI.getArticlesMinimal(filters);
        const fetchedArticles = response.data || [];

        // Get pagination info from meta
        const pagination = response.meta?.pagination;
        if (pagination) {
          setTotalPages(pagination.pageCount || 1);
          setTotalArticles(pagination.total || 0);
        }

        setArticles(fetchedArticles);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [activeCategory, sortBy, currentPage, languageFilter]);

  // Detect when section is revealed and trigger spin animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTriggeredRef.current) {
            // Delay the spin animation to start after ScrollReveal completes
            setTimeout(() => {
              setSpinTrigger((prev) => prev + 1);
              hasTriggeredRef.current = true;
            }, 800);
          } else if (!entry.isIntersecting) {
            // Reset when section leaves viewport so it can trigger again
            hasTriggeredRef.current = false;
          }
        });
      },
      {
        threshold: 0.2, // Trigger when 20% of the element is visible
      },
    );

    const currentHeader = headerRef.current;
    if (currentHeader) {
      observer.observe(currentHeader);
    }

    return () => {
      if (currentHeader) {
        observer.unobserve(currentHeader);
      }
    };
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    shouldScrollRef.current = false; // Don't scroll on filter resets
  }, [activeCategory, sortBy, languageFilter]);

  // Scroll to pagination when page changes and articles are loaded
  useEffect(() => {
    if (!isLoading && shouldScrollRef.current && paginationRef.current) {
      // Reset the flag first
      shouldScrollRef.current = false;
      
      // Use requestAnimationFrame twice to ensure layout is complete
      // First frame: paint articles
      // Second frame: calculate pagination position
      let frame1: number, frame2: number | undefined;
      frame1 = requestAnimationFrame(() => {
        frame2 = requestAnimationFrame(() => {
          paginationRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        });
      });
      
      // Cleanup any pending animation frames
      return () => {
        cancelAnimationFrame(frame1);
        if (frame2) cancelAnimationFrame(frame2);
      };
    }
  }, [isLoading]);

  // Close filter dropdown when clicking outside & handle dynamic positioning
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(e.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    // Detect positioning to avoid cutoff
    const detectPosition = () => {
      if (filterDropdownRef.current && dropdownPanelRef.current) {
        const buttonRect = filterDropdownRef.current.getBoundingClientRect();
        const panelRect = dropdownPanelRef.current.getBoundingClientRect();
        const viewport = window.innerWidth;
        const padding = 20;

        // Check if opening to the LEFT would fit in viewport
        const leftAlignedRight = buttonRect.left + panelRect.width;
        const wouldFitLeft = leftAlignedRight + padding <= viewport;

        // Check if opening to the RIGHT would fit in viewport
        const rightAlignedLeft = buttonRect.right - panelRect.width;
        const wouldFitRight = rightAlignedLeft - padding >= 0;

        // Decide alignment based on available space
        if (wouldFitLeft && !wouldFitRight) {
          setDropdownAlign("left");
        } else if (wouldFitRight && !wouldFitLeft) {
          setDropdownAlign("right");
        } else if (wouldFitLeft) {
          // Both fit - prefer left (current default)
          setDropdownAlign("left");
        } else {
          // Neither fit perfectly - left is safer (doesn't clip left edge usually)
          setDropdownAlign("left");
        }
      }
    };

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Use requestAnimationFrame twice to ensure layout is complete
      requestAnimationFrame(() => {
        requestAnimationFrame(detectPosition);
      });
      // Also detect on window resize
      window.addEventListener("resize", detectPosition);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", detectPosition);
    };
  }, [isFilterOpen]);

  // Handle page changes - memoized for performance
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        shouldScrollRef.current = true; // Flag that we should scroll after this page loads
        setCurrentPage(page);
      }
    },
    [totalPages],
  );

  // Generate page numbers to display - memoized for performance
  const getPageNumbers = useCallback((): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 3;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  // Filter out invalid articles - memoized for performance
  const validArticles = articles
    .map((article) => ({ raw: article, data: getArticleData(article) }))
    .filter((item) => item.data !== null);
  
  const validArticlesEn = articles
    .map((article) => ({ raw: article, data: getArticleDataEnglishcategory(article) }))
    .filter((item) => item.data !== null);
  

  return (
    <section className="relative -mt-12 md:-mt-16  py-12 md:py-16 bg-background overflow-hidden">
      {/* Film Emoji Background Elements */}
      {/* <FilmEmojiBackground /> */}

      {/* Grainy Texture Overlay */}
      {/* <div
        className="absolute inset-0 pointer-events-none opacity-[0.2] mix-blend-overlay z-10"
        style={{
          backgroundImage: "url(/images/GrainTexture.webp)",
          backgroundRepeat: "repeat",
          backgroundSize: "1024px 1024px",
        }}
      /> */}

      <div className="container relative z-10">
        {/* Header Section */}
        <div
          ref={headerRef}
          className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4"
        >
          <div className="flex flex-col md:flex-row md:items-end gap-4 flex-1">
            <div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 text-foreground select-none">
                In F
                <svg
                  key={spinTrigger}
                  className={cn(
                    "inline-block w-[0.85em] h-[0.6em] -mx-[0.1em]",
                    spinTrigger > 0 && "animate-spin-reveal",
                  )}
                  viewBox="0 0 131 131"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M65.5 0C101.675 0 131 29.3253 131 65.5C131 101.675 101.675 131 65.5 131C29.3253 131 0 101.675 0 65.5C0 29.3253 29.3253 0 65.5 0ZM65 83C58.3726 83 53 88.3726 53 95C53 101.627 58.3726 107 65 107C71.6274 107 77 101.627 77 95C77 88.3726 71.6274 83 65 83ZM37 53C30.3726 53 25 58.3726 25 65C25 71.6274 30.3726 77 37 77C43.6274 77 49 71.6274 49 65C49 58.3726 43.6274 53 37 53ZM94 53C87.3726 53 82 58.3726 82 65C82 71.6274 87.3726 77 94 77C100.627 77 106 71.6274 106 65C106 58.3726 100.627 53 94 53ZM65 24C58.3726 24 53 29.3726 53 36C53 42.6274 58.3726 48 65 48C71.6274 48 77 42.6274 77 36C77 29.3726 71.6274 24 65 24Z"
                    fill="currentColor"
                  />
                </svg>
                cus
              </h2>
              <p className="text-foreground/70 text-base md:text-lg max-w-xl font-normal">
                Explore our collection of film analysis, reviews, and
                publications.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-4">
            {/* Category Language Switcher */}
            <div className="flex items-center gap-2 h-fit">
              <div className="inline-flex rounded-md border border-foreground bg-background shadow-sm overflow-hidden">
                <button
                  onClick={() => setCategoryLanguage("bn")}
                  className={cn(
                    "px-3 md:px-4 py-2 text-xs md:text-sm font-semibold transition-all duration-200",
                    categoryLanguage === "bn"
                      ? "bg-foreground text-background"
                      : "text-foreground hover:bg-accent/5",
                  )}
                  title="Show categories in Bengali"
                  aria-pressed={categoryLanguage === "bn"}
                >
                  BN
                </button>
                <div className="w-px bg-border" />
                <button
                  onClick={() => setCategoryLanguage("en")}
                  className={cn(
                    "px-3 md:px-4 py-2 text-xs md:text-sm font-semibold transition-all duration-200",
                    categoryLanguage === "en"
                      ? "bg-foreground text-background"
                      : "text-foreground hover:bg-accent/5",
                  )}
                  title="Show categories in English"
                  aria-pressed={categoryLanguage === "en"}
                >
                  EN
                </button>
              </div>
            </div>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 text-sm font-normal uppercase tracking-widest hover:underline decoration-1 underline-offset-4 transition-all" 
            >
              View all
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Category Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory("all")}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200",
                  activeCategory === "all"
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-foreground border-border hover:border-foreground/50",
                )}
              >
                All
              </button>
              {categories.map((category, index) => {
                const categoryName =
                  categoryLanguage === "bn"
                    ? category.nameBn || ""
                    : category.nameEn || "";
                const categorySlug = category.Slug || "";

                // Hide categories beyond the limit unless expanded
                const isMobileHidden =
                  !isCategoriesExpanded && index >= MOBILE_CAT_LIMIT;
                const isDesktopHidden =
                  !isCategoriesExpanded && index >= DESKTOP_CAT_LIMIT;

                return (
                  <button
                    key={category.documentId}
                    onClick={() => setActiveCategory(categorySlug)}
                    style={{
                      fontFamily:
                        categoryLanguage === "bn"
                          ? "var(--font-kalpurush)"
                          : "var(--font-montserrat)",
                    }}
                    className={cn(
                      "px-4 py-2 font-semibold rounded-md border transition-all duration-200",
                      activeCategory === categorySlug
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-foreground border-border hover:border-foreground/50",
                      isMobileHidden && !isDesktopHidden
                        ? "hidden md:inline-flex"
                        : "",
                      isMobileHidden && isDesktopHidden ? "hidden" : "",
                      categoryLanguage === "bn" ? 'text-base md:text-lg' : 'text-sm md:text-base'
                    )}
                  >
                    {categoryName}
                  </button>
                );
              })}

              {/* Expand "..." button — shown when not expanded and there are more categories */}
              {!isCategoriesExpanded && (
                <>
                  {/* Mobile: show if more than MOBILE_CAT_LIMIT categories */}
                  {categories.length > MOBILE_CAT_LIMIT && (
                    <button
                      onClick={() => setIsCategoriesExpanded(true)}
                      className="md:hidden px-4 py-2 text-sm font-semibold rounded-full border border-border hover:border-foreground/50 bg-background text-foreground transition-all duration-200 tracking-widest"
                      aria-label="Show more categories"
                    >
                      •••
                    </button>
                  )}
                  {/* Desktop: show if more than DESKTOP_CAT_LIMIT categories */}
                  {categories.length > DESKTOP_CAT_LIMIT && (
                    <button
                      onClick={() => setIsCategoriesExpanded(true)}
                      className="hidden md:inline-flex px-4 py-2 text-sm font-semibold rounded-full border border-border hover:border-foreground/50 bg-background text-foreground transition-all duration-200 tracking-widest"
                      aria-label="Show more categories"
                    >
                      •••
                    </button>
                  )}
                </>
              )}

              {/* Collapse "x" button — shown when expanded */}
              {isCategoriesExpanded && (
                <button
                  onClick={() => setIsCategoriesExpanded(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-full border border-border hover:border-foreground/50 bg-background text-foreground transition-all duration-200"
                  aria-label="Collapse categories"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort + Language Filter */}
            <div className="flex items-center gap-2">
              {/* Language Filter Button */}
              <div ref={filterDropdownRef} className="relative">
                <button
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                  className="relative flex items-center p-1 gap-2 text-sm md:text-base font-semibold rounded-full transition-all duration-200 bg-background dark:text-white  hover:border-foreground/100 hover:bg-foreground hover:text-white dark:hover:text-black border border-foreground/50"
                  aria-label="Filter by language"
                  aria-expanded={isFilterOpen}
                >
                  {/* Filter SVG icon */}
                  <svg
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-labelledby="languageIconTitle"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    color="currentColor"
                  >
                    {" "}
                    <title id="languageIconTitle">Language</title>{" "}
                    <circle cx="12" cy="12" r="10" />{" "}
                    <path
                      strokeLinecap="round"
                      d="M12,22 C14.6666667,19.5757576 16,16.2424242 16,12 C16,7.75757576 14.6666667,4.42424242 12,2 C9.33333333,4.42424242 8,7.75757576 8,12 C8,16.2424242 9.33333333,19.5757576 12,22 Z"
                    />
                    <path
                      strokeLinecap="round"
                      d="M2.5 9L21.5 9M2.5 15L21.5 15"
                      fill="currentColor"
                    />
                  </svg>

                  {/* Active indicator dot */}
                  {languageFilter !== "all" && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-background border-2 border-foreground" />
                  )}
                </button>

                {/* Dropdown panel */}
                {isFilterOpen && (
                  <div
                    ref={dropdownPanelRef}
                    className={cn(
                      "absolute top-full mt-2 z-50 min-w-[160px] rounded-md border border-border bg-background shadow-lg overflow-hidden",
                      dropdownAlign === "left" ? "left-0" : "right-0",
                    )}
                  >
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Language
                      </p>
                    </div>
                    <div className="py-1">
                      {LANGUAGE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setLanguageFilter(opt.value);
                            setIsFilterOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-left transition-colors",
                            languageFilter === opt.value
                              ? "bg-foreground text-background"
                              : "hover:bg-accent text-foreground",
                          )}
                        >
                          <span
                            className={cn(
                              "w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors",
                              languageFilter === opt.value
                                ? "border-accent bg-accent"
                                : "border-muted-foreground",
                            )}
                          />
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-border" />

              {/* Sort Filter */}
              <div className="flex items-center gap-3">
                <span className="text-sm md:text-base font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Sort:
                </span>
                <div className="relative min-w-[130px] md:min-w-[150px]">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full appearance-none bg-background border-2 border-foreground/10 focus:border-foreground/30 rounded-sm py-2 pl-3 pr-10 outline-none transition-all text-sm md:text-base  font-bold uppercase tracking-tight cursor-pointer"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="most-read">Most Read</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div ref={articlesGridRef} className="min-h-[400px]">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
              <p className="text-muted-foreground mt-4">Loading articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 inline-block">
                <h3 className="text-lg font-semibold mb-2">
                  No Articles Found
                </h3>
                <p className="text-muted-foreground">
                  No articles match your current filters.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Try selecting a different category or sort option.
                </p>
              </div>
            </div>
          ) : validArticles.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 inline-block">
                <h3 className="text-lg font-semibold mb-2 text-red-900 dark:text-red-200">
                  Invalid Article Data
                </h3>
                <p className="text-muted-foreground">
                  Articles exist but contain incomplete or corrupted data.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Articles count info */}
              {/* <div className="mb-6 text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ARTICLES_PER_PAGE + 1} - {Math.min(currentPage * ARTICLES_PER_PAGE, totalArticles)} of {totalArticles} articles
              </div> */}

              { categoryLanguage === "bn" ?
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {validArticles.map(({ raw, data }) => (
                  <ArticleCard key={`${raw.documentId}-${categoryLanguage}`} article={data!} />
                ))}
              </div>
              :
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {validArticlesEn.map(({ raw, data }) => (
                  <ArticleCard key={`${raw.documentId}-${categoryLanguage}`} article={data!} />
                ))}
              </div>
              }
            </>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div ref={paginationRef} className="mt-12 flex flex-col items-center gap-6">
            {/* Pagination Controls */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Previous Button */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={cn(
                  "p-1.5 md:p-2 rounded-md border transition-all duration-200",
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed border-border"
                    : "hover:bg-accent border-border hover:border-foreground/50",
                )}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-0.5 md:gap-1">
                {getPageNumbers().map((page, index) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-1.5 md:px-3 py-1 md:py-2 text-sm md:text-base text-muted-foreground"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page as number)}
                      className={cn(
                        "min-w-[32px] h-[32px] md:min-w-[40px] md:h-[40px] rounded-md text-sm md:text-base font-semibold transition-all duration-200",
                        currentPage === page
                          ? "bg-foreground text-background"
                          : "hover:bg-accent border border-border hover:border-foreground/50",
                      )}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={cn(
                  "p-1.5 md:p-2 rounded-md border transition-all duration-200",
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed border-border"
                    : "hover:bg-accent border-border hover:border-foreground/50",
                )}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </div>

            {/* Page info */}
            {/* <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div> */}
          </div>
        )}
      </div>
    </section>
  );
}
