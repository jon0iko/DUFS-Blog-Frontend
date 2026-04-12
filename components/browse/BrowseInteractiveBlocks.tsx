"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Category } from "@/types";
import { cn } from "@/lib/utils";
import ArticlesList from "./ArticlesList";
import CategoryDropdown from "./CategoryDropdown";

interface BrowseInteractiveBlocksProps {
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (slug: string) => void;
  language: string;
  sortBy: string;
  onFilterChange: (type: string, value: string) => void;
  searchQuery?: string;
  onClearSearch: () => void;
  onSearchSubmit: (query: string) => void;
  onResetAll?: () => void;
}

export default function BrowseInteractiveBlocks({
  categories,
  activeCategory,
  setActiveCategory,
  language,
  sortBy,
  onFilterChange,
  searchQuery,
  onClearSearch,
  onSearchSubmit,
  onResetAll,
}: BrowseInteractiveBlocksProps) {
  const [isSearchMode, setIsSearchMode] = useState(!!searchQuery);
  const [searchDraft, setSearchDraft] = useState(searchQuery || "");

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "All Categories" },
      ...categories.map((category) => ({
        value: category.Slug || "",
        label: language === 'en' 
          ? (category.nameEn || category.Name)
          : language === 'bn'
          ? (category.nameBn || category.Name)
          : `${category.nameBn || category.Name} (${category.nameEn || category.Name})`,
      })),
    ],
    [categories, language]
  );

  useEffect(() => {
    setSearchDraft(searchQuery || "");
    if (searchQuery) {
      setIsSearchMode(true);
    }
  }, [searchQuery]);

  const handleSearchSubmit = () => {
    onSearchSubmit(searchDraft.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const searchLabel = searchQuery?.trim();
  

  return (
    <div className="relative min-h-screen font-montserrat overflow-hidden">
      {/* Background patterns */}
      <div
        className="pointer-events-none absolute -inset-52 select-none dark:hidden"
        style={{ backgroundImage: "url(/images/bgpaper.jpg)", backgroundRepeat: "repeat" }}
      />
      <div
        className="bg-pattern-dark pointer-events-none absolute -inset-52 hidden select-none dark:block"
        style={{
          backgroundImage: "url(/images/bgpaper_dark.jpg)",
          backgroundRepeat: "repeat",
          backgroundSize: "1667px 1200px",
        }}
      />

      {/* Action Bar with SVG Background */}
      <div className="relative z-30 w-full overflow-visible">
        {/* The SVG Background - Fixed to stay centered and hold content in its body */}
        <div className="absolute inset-0">
          <Image
            src="/images/BrowseCurve_Mobile.svg"
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="brightness-100 object-cover object-bottom lg:hidden"
          />
          <Image
            src="/images/BrowseCurve.svg"
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="hidden brightness-100 object-cover object-bottom lg:block"
          />
        </div>

        {/* Content Container - Adjusted padding for better vertical centering on the curve */}
        <div className="container relative z-20 mx-auto px-4 pb-14 pt-10 lg:px-6 lg:pb-16 lg:pt-12">
          <div className="flex flex-col gap-6 big:flex-row big:items-center big:justify-center big:gap-8">
            
            {/* 1. Category Dropdown */}
            <CategoryDropdown
              options={categoryOptions}
              value={activeCategory || "all"}
              onChange={setActiveCategory}
            />

            {/* 2. Dynamic Middle Section (Filters or Search) */}
            <div className="flex w-full flex-grow items-center justify-center lg:w-auto">
              <AnimatePresence mode="wait">
                {!isSearchMode ? (
                  <motion.div
                    key="filters"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-center big:gap-6"
                  >
                    {/* Language Filter */}
                    <div className="flex items-center gap-3">
                      <span className="whitespace-nowrap text-[1rem] big:text-[1.1rem] font-black text-[#211A17]">
                        Language:
                      </span>
                      <div className="relative flex-grow sm:w-32 sm:flex-grow-0">
                        <select
                          value={language || "all"}
                          onChange={(e) => onFilterChange("language", e.target.value)}
                          className="h-10 w-full appearance-none rounded-[4px] border border-[#BDB2AB] bg-[#C9C0BC] px-3 pr-8 text-[0.95rem] font-black text-[#29211D] outline-none transition-all  dark:border-[#3A3431] dark:bg-[#302A27] dark:text-[#F3E7DD] cursor-pointer"
                        >
                          <option value="all">All</option>
                          <option value="en">English</option>
                          <option value="bn">Bangla</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#29211D] dark:text-[#AFA39B]" />
                      </div>
                    </div>

                    {/* Sort Filter */}
                    <div className="flex items-center gap-3">
                      <span className="whitespace-nowrap text-[1rem] big:text-[1.1rem] font-black text-[#211A17]">
                        Sort By:
                      </span>
                      <div className="relative flex-grow sm:w-44 sm:flex-grow-0">
                        <select
                          value={sortBy || "recent"}
                          onChange={(e) => onFilterChange("sort", e.target.value)}
                          className="h-10 w-full appearance-none rounded-[4px] border border-[#BDB2AB] bg-[#C9C0BC] px-3 pr-8 text-[0.95rem] font-black text-[#29211D] outline-none transition-all  dark:border-[#3A3431] dark:bg-[#302A27] dark:text-[#F3E7DD] cursor-pointer"
                        >
                          <option value="recent">Publish Date</option>
                          <option value="oldest">Oldest First</option>
                          <option value="popular">Most Read</option>
                          <option value="liked">Most Liked</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#29211D] dark:text-[#AFA39B]" />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="search"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="relative w-full max-w-xl"
                  >
                    <input
                      type="text"
                      value={searchDraft}
                      onChange={(e) => setSearchDraft(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="article/author/content..."
                      className="h-12 w-full rounded-[4px] border border-[#BDB2AB] bg-[#C9C0BC] pl-10 pr-28 text-[1.1rem] placeholder:text-base font-black text-[#29211D] outline-none transition-all placeholder:text-[#29211D]/50 focus:border-[#84786F] dark:border-[#3A3431] dark:bg-[#302A27] dark:text-[#F3E7DD] dark:placeholder:text-[#F3E7DD]/50"
                    /> 
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#29211D] dark:text-[#AFA39B]" />
                    
                    <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
                      {searchDraft && (
                        <button
                          onClick={() => {
                            setSearchDraft("");
                            onClearSearch();
                          }}
                          className="p-1.5 text-[#29211D] transition-all hover:scale-125 dark:text-[#AFA39B]"
                          aria-label="Clear search"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={handleSearchSubmit}
                        className="rounded-[3px] bg-[#29211D] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-[#C9C0BC] transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 dark:bg-[#F3E7DD] dark:text-[#302A27]"
                      >
                        Search
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Toggle Buttons (Filter & Search) */}
            <div className="flex w-full rounded-[8px] border border-[#A79A92] bg-[#CFC6C1] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(41,33,29,0.2)] dark:border-[#3A3431] dark:bg-[#2A2522] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_6px_rgba(0,0,0,0.45)] big:w-auto">
              <button
                onClick={() => setIsSearchMode(false)}
                className={cn(
                  "h-10 flex-1 rounded-[6px] border px-4 text-[0.9rem] big:px-8 big:text-[1.1rem] font-black uppercase tracking-wider transition-all duration-150",
                  !isSearchMode 
                    ? "border-[#5E5752] bg-[#6A635E] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_3px_rgba(41,33,29,0.35)]"
                    : "border-transparent bg-transparent text-[#29211D] hover:border-[#A79A92] hover:bg-[#C2B8B1]  dark:text-[#E8DDD4] dark:hover:border-[#4C433E] dark:hover:bg-[#3A3431]"
                )}
              >
                <span className="flex items-center justify-center gap-2">
                   <SlidersHorizontal className="h-4 w-4 big:hidden" />
                   Filter
                </span>
              </button>
              <button
                onClick={() => setIsSearchMode(true)}
                className={cn(
                  "h-10 flex-1 rounded-[6px] border px-4 text-[0.9rem] big:px-8 big:text-[1.1rem] font-black uppercase tracking-wider transition-all duration-150",
                  isSearchMode 
                    ? "border-[#5E5752] bg-[#6A635E] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_3px_rgba(41,33,29,0.35)]"
                    : "border-transparent bg-transparent text-[#29211D] hover:border-[#A79A92] hover:bg-[#C2B8B1]  dark:text-[#E8DDD4] dark:hover:border-[#4C433E] dark:hover:bg-[#3A3431]"
                )}
              >
                <span className="flex items-center justify-center gap-2">
                   <Search className="h-4 w-4 big:hidden" />
                   Search
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Articles List Content Section */}
      <div className="container relative z-20 mx-auto px-4 pb-20 pt-16 md:px-8">
        {(activeCategory !== "all" || searchLabel) && (
          <div className="mb-8 flex flex-col gap-4 border-b border-black/10 pb-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[0.75rem] md:text-sm font-bold uppercase tracking-widest text-[#6A635E]">Now Showing:</span>
              <div className="flex flex-wrap gap-2">
                {activeCategory !== "all" && (
                  <span className="rounded-full bg-[#E0D5D0] px-3 md:px-4 py-1 text-[0.65rem] md:text-xs font-bold uppercase dark:bg-[#302A27]">
                    {categoryOptions.find(o => o.value === activeCategory)?.label}
                  </span>
                )}
                {searchLabel && (
                  <span className="rounded-full bg-[#E0D5D0] px-3 md:px-4 py-1 text-[0.65rem] md:text-xs font-bold dark:bg-[#302A27]">
                    &quot;{searchLabel}&quot;
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={() => {
                if (onResetAll) {
                  onResetAll();
                } else {
                  setActiveCategory("all");
                  onClearSearch();
                }
                setSearchDraft("");
              }}
              className="text-[0.65rem] md:text-xs font-bold uppercase tracking-widest text-[#6A635E] hover:text-black dark:hover:text-white self-start sm:self-auto"
            >
              Reset All
            </button>
          </div>
        )}

        <ArticlesList
          category={activeCategory || "all"}
          language={language}
          sortBy={sortBy}
          searchQuery={searchLabel || undefined}
        />
      </div>
    </div>
  );
}
