"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  excerpt: string;
  image: string;
  authorName: string;
  category: string;
}

interface SearchBarProps {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  onClose?: () => void;
  autoFocus?: boolean;
  isMobile?: boolean;
}

export default function SearchBar({
  className,
  inputClassName,
  placeholder = "Search...",
  onClose,
  autoFocus = false,
  isMobile = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

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
            excerpt: data.excerpt,
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

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
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
        onClose?.();
        break;
    }
  };

  // Clear search
  const handleClear = () => {
    // Cancel any pending search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
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
        <Search className="absolute left-3 top-1/2 h-5 w-5 stroke-2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "h-10 w-full pl-10 pr-10 bg-background border font-medium",
            isOpen ? "rounded-t-md rounded-b-none border-b-0" : "rounded-md",
            inputClassName
          )}
        />
        {(query || isLoading) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 mt-0.5 bg-white dark:bg-brand-black-100 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-lg shadow-xl overflow-hidden z-50",
            isMobile ? "max-h-[60vh]" : "max-h-[400px]"
          )}
        >
          {results.length > 0 ? (
            <div className="overflow-y-auto max-h-[inherit]">
              
              {results.map((result, index) => {
                const titleFontClass = getFontClass(result.title);
                return (
                  <Link
                    key={result.slug}
                    href={`/read-article?slug=${result.slug}`}
                    onClick={handleResultClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-brand-black-90 transition-colors",
                      selectedIndex === index && "bg-gray-50 dark:bg-brand-black-90"
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-brand-black-90">
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
                        "font-semibold text-sm line-clamp-1 text-foreground",
                        titleFontClass
                      )}>
                        {result.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
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
                className="block px-3 py-3 text-sm text-center text-primary hover:bg-gray-50 dark:hover:bg-brand-black-90 border-t border-gray-100 dark:border-gray-800 font-medium"
              >
                View all results for &quot;{query}&quot;
              </Link>
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <p className="text-sm">No results found for &quot;{query}&quot;</p>
              <p className="text-xs mt-1">Try different keywords</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
