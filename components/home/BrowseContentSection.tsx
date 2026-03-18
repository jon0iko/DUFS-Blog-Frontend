"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Category, Article } from "@/types";
import { strapiAPI } from "@/lib/api";
import { getArticleData } from "@/lib/strapi-helpers";
import { getFontClass } from "@/lib/fonts";
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
  const [categories] = useState<Category[]>(initialCategories);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [languageFilter, setLanguageFilter] = useState<LanguageFilter>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);

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
  // Ref for detecting when section is revealed
  const headerRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);
  // Ref for filter dropdown
  const filterDropdownRef = useRef<HTMLDivElement>(null);

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
          storyState?: string;
          language?: "en" | "bn" | "both";
        } = {
          page: currentPage,
          pageSize: ARTICLES_PER_PAGE,
          sort:
            sortBy === "newest"
              ? "publishedAt:desc"
              : sortBy === "oldest"
                ? "publishedAt:asc"
                : "viewCount:desc",
          storyState: "published",
        };

        if (activeCategory && activeCategory !== "all") {
          filters.category = activeCategory;
        }

        if (languageFilter !== "all") {
          filters.language = languageFilter;
        }

        const response = await strapiAPI.getArticles(filters);
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
  }, [activeCategory, sortBy, languageFilter]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(e.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  // Handle page changes - memoized for performance
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
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
          <div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-4 text-foreground">
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
            <p className="text-muted-foreground text-base md:text-lg max-w-xl font-normal">
              Explore our collection of film analysis, reviews, and
              publications.
            </p>
          </div>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 text-sm font-normal uppercase tracking-widest hover:underline decoration-1 underline-offset-4 transition-all"
          >
            View all
            <ArrowUpRight className="w-4 h-4" />
          </Link>
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
                const categoryName = category.Name || "";
                const categorySlug = category.Slug || "";
                const fontClass = getFontClass(categoryName);

                // Hide categories beyond the limit unless expanded
                const isMobileHidden =
                  !isCategoriesExpanded && index >= MOBILE_CAT_LIMIT;
                const isDesktopHidden =
                  !isCategoriesExpanded && index >= DESKTOP_CAT_LIMIT;

                return (
                  <button
                    key={category.documentId}
                    onClick={() => setActiveCategory(categorySlug)}
                    className={cn(
                      "px-4 py-2 text-sm md:text-base font-semibold rounded-md border transition-all duration-200",
                      fontClass,
                      activeCategory === categorySlug
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-foreground border-border hover:border-foreground/50",
                      isMobileHidden && !isDesktopHidden
                        ? "hidden md:inline-flex"
                        : "",
                      isMobileHidden && isDesktopHidden ? "hidden" : "",
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
                  className="relative flex items-center gap-2 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-200 bg-background text-foreground border-border hover:border-foreground/50"
                  aria-label="Filter by language"
                  aria-expanded={isFilterOpen}
                >
                  {/* Filter SVG icon */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 50 50"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M29.1667 25V41.4167C29.25 42.0417 29.0417 42.7083 28.5625 43.1458C28.3698 43.339 28.1409 43.4922 27.8888 43.5967C27.6368 43.7013 27.3666 43.7551 27.0938 43.7551C26.8209 43.7551 26.5508 43.7013 26.2987 43.5967C26.0467 43.4922 25.8178 43.339 25.625 43.1458L21.4375 38.9583C21.2104 38.7361 21.0378 38.4644 20.933 38.1645C20.8282 37.8646 20.7941 37.5445 20.8334 37.2292V25H20.7709L8.77086 9.625C8.43255 9.19069 8.27989 8.64012 8.34625 8.0936C8.41262 7.54709 8.6926 7.04905 9.12503 6.70833C9.52086 6.41667 9.95836 6.25 10.4167 6.25H39.5834C40.0417 6.25 40.4792 6.41667 40.875 6.70833C41.3075 7.04905 41.5874 7.54709 41.6538 8.0936C41.7202 8.64012 41.5675 9.19069 41.2292 9.625L29.2292 25H29.1667Z"
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
                  <div className="absolute left-0 md:left-auto md:right-0 top-full mt-2 z-50 min-w-[160px] rounded-md border border-border bg-background shadow-lg overflow-hidden">
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
                <span className="text-base md:text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                  Sort:
                </span>
                <div className="relative min-w-[130px] md:min-w-[150px]">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full appearance-none bg-background border-2 border-foreground/10 focus:border-foreground/30 rounded-sm py-2 pl-3 pr-10 outline-none transition-all text-sm font-bold uppercase tracking-tight cursor-pointer"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {validArticles.map(({ raw, data }) => (
                  <ArticleCard key={raw.documentId} article={data!} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center gap-6">
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
