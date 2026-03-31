"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { strapiAPI } from "@/lib/api";
import { Article } from "@/types";
import { getArticleData } from "@/lib/strapi-helpers";
import { getFontClass } from "@/lib/fonts";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SearchResult {
  slug: string;
  title: string;
  image: string;
  authorName: string;
  category: string;
}

interface HeaderSearchInputProps {
  onClose?: () => void;
  autoFocus?: boolean;
  inputClassName?: string;
  isOverlay?: boolean;
  className?: string;
}

export default function HeaderSearchInput({
  onClose,
  autoFocus = false,
  inputClassName,
  isOverlay = false,
  className,
}: HeaderSearchInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Focus input on mount if autoFocus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    try {
      const response = await strapiAPI.searchArticles(searchQuery, {
        pageSize: 8,
      });

      const searchResults: SearchResult[] = response.data
        .map((article: Article) => {
          const data = getArticleData(article);
          if (!data) return null;
          return {
            slug: data.slug,
            title: data.title,
            image: data.image,
            authorName: data.author.name,
            category: data.category,
          };
        })
        .filter((item): item is SearchResult => item !== null);

      setResults(searchResults);
      setIsOpen(searchResults.length > 0 || searchQuery.trim().length >= 2);
      setSelectedIndex(-1);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 1000);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          window.location.href = `/read-article?slug=${results[selectedIndex].slug}`;
        }
        break;
      case "Escape":
        setIsOpen(false);
        setQuery("");
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        onClose?.();
        break;
    }
  };

  // Clear search
  const handleClear = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Handle result click
  const handleResultClick = () => {
    setIsOpen(false);
    setQuery("");
    onClose?.();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className={cn(
          "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 stroke-[2] pointer-events-none z-10",
          isOverlay ? "text-white/70" : "text-muted-foreground"
        )} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder="Search..."
          className={cn(
            "h-10 w-full pl-10 pr-10 font-medium transition-all outline-none focus:outline-none focus:ring-0 border border-foreground/50 focus:border-border/60 bg-transparent",
            isOpen ? "rounded-t-md rounded-b-none" : "rounded-md",
            inputClassName
          )}
        />
        {(query || isLoading) && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              "absolute right-3 top-1/2 flex items-center justify-center -translate-y-1/2 p-0.5 transition-colors z-10",
              isOverlay ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 stroke-[2] animate-spin" />
            ) : (
              <X className="h-5 w-5 stroke-[2]" />
            )}
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className={cn(
          "absolute top-full left-0 right-0 border border-t-0 rounded-b-lg shadow-lg z-50 max-h-[400px]",
          isOverlay ? "border-white/20 bg-white/10 backdrop-blur-md" : "border-border bg-background"
        )}>
          {results.length > 0 ? (
            <div className="overflow-y-auto max-h-[inherit] rounded-b-lg">
              {results.map((result, index) => {
                const titleFontClass = getFontClass(result.title);
                const isSelected = selectedIndex === index;
                return (
                  <Link
                    key={result.slug}
                    href={`/read-article?slug=${result.slug}`}
                    onClick={handleResultClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 border-b transition-colors last:border-b-0",
                      isOverlay
                        ? cn("border-white/10", isSelected ? "bg-white/15" : "hover:bg-white/10")
                        : cn("border-border/50", isSelected ? "bg-muted/60" : "hover:bg-muted/30")
                    )}
                  >
                    {/* Thumbnail */}
                    <div className={cn(
                      "relative w-12 h-12 flex-shrink-0 rounded-sm overflow-hidden",
                      isOverlay ? "bg-white/10" : "bg-muted"
                    )}>
                      <Image
                        src={result.image}
                        alt={result.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-semibold text-sm line-clamp-1",
                        isOverlay ? "text-white" : "text-foreground",
                        titleFontClass
                      )}>
                        {result.title}
                      </h4>
                      <p className={cn(
                        "text-xs line-clamp-1",
                        isOverlay ? "text-white/60" : "text-muted-foreground"
                      )}>
                        {result.authorName}
                      </p>
                    </div>
                  </Link>
                );
              })}
              
              {/* View all results link */}
              <Link
                href={`/browse?search=${encodeURIComponent(query)}`}
                onClick={handleResultClick}
                className={cn(
                  "block px-3 py-3 text-sm text-center font-medium border-t transition-colors",
                  isOverlay
                    ? "text-white/80 border-white/10 hover:bg-white/10"
                    : "text-primary border-border hover:bg-muted/40"
                )}
              >
                View all results for &quot;{query}&quot;
              </Link>
            </div>
          ) : (
            <div className={cn(
              "px-4 py-8 text-center rounded-b-lg",
              isOverlay ? "text-white/60" : "text-muted-foreground"
            )}>
              <p className="text-sm">No results found for &quot;{query}&quot;</p>
              <p className="text-xs mt-1 opacity-70">Try different keywords</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
