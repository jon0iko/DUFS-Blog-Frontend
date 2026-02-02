"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Category } from "@/types";
import { cn } from "@/lib/utils";
import { X, ArrowRight } from "lucide-react";
import ArticlesList from "./ArticlesList";
import FilterOptions from "./FilterOptions";
import { getStrapiMediaUrl } from "@/lib/strapi-helpers";
import Image from "next/image";
import { useEffect } from "react";

interface BrowseInteractiveBlocksProps {
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (slug: string) => void;
  language: string;
  sortBy: string;
  onFilterChange: (type: string, value: string) => void;
  searchQuery?: string;
  onClearSearch: () => void;
}

export default function BrowseInteractiveBlocks({
  categories,
  activeCategory,
  setActiveCategory,
  language,
  sortBy,
  onFilterChange,
  searchQuery,
  onClearSearch
}: BrowseInteractiveBlocksProps) {

  // Handle back button on mobile closing the expanded view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveCategory('all');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveCategory]);

  // SEARCH RESULTS VIEW
  if (searchQuery) {
     return (
       <div className="container py-8 px-4 md:px-6 min-h-screen">
         <div className="flex items-center justify-between mb-8 border-b pb-4">
            <div>
               <h2 className="text-3xl font-bold mb-2">SEARCH RESULTS</h2>
               <p className="text-muted-foreground">Results for "{searchQuery}"</p>
            </div>
            <button onClick={onClearSearch} className="flex items-center gap-2 text-sm font-medium hover:underline p-2 rounded-md hover:bg-accent transition-colors">
               <X className="w-4 h-4"/> Clear
            </button>
         </div>
         <ArticlesList 
            category="all" 
            language={language} 
            sortBy={sortBy} 
            searchQuery={searchQuery} 
         />
       </div>
     )
  }

  const activeCategoryData = categories.find(c => c.Slug === activeCategory);
  const isExpanded = !!activeCategoryData && activeCategory !== 'all';

  return (
    <div className="min-h-screen w-full relative">
      <AnimatePresence mode="popLayout" initial={false}>
        
        {/* LIST VIEW */}
        {!isExpanded && (
           <motion.div 
             className="container py-8 px-4 md:px-12 flex flex-col gap-4"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             transition={{ duration: 0.4, ease: "easeInOut" }}
           >
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-8 tracking-tighter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                BROWSE
              </motion.h1>
              
              {categories.map((category) => (
                <motion.div
                   key={category.documentId}
                   layoutId={`category-block-${category.Slug}`}
                   onClick={() => setActiveCategory(category.Slug || '')}
                   className="group relative h-24 md:h-32 w-full bg-primary text-primary-foreground overflow-hidden cursor-pointer flex items-center px-6 md:px-12 border border-border/20 rounded-md hover:border-border/50 shadow-sm"
                   whileHover={{ scale: 1.01 }}
                   transition={{ duration: 0.3 }}
                >
                   {/* Background Image (Subtle Texture) */}
                   {category.Illustration?.url && (
                      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
                         <Image 
                           src={getStrapiMediaUrl(category.Illustration)} 
                           alt="" 
                           fill 
                           className="object-cover grayscale"
                         />
                         <div className="absolute inset-0 bg-black/60" /> 
                      </div>
                   )}
                   
                   <motion.h2 
                     className="text-2xl md:text-4xl font-bold relative z-10 tracking-wide uppercase group-hover:tracking-widest transition-all duration-300"
                     layoutId={`category-title-${category.Slug}`}
                   >
                      {category.Name}
                   </motion.h2>

                   <div className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      <ArrowRight className="w-6 h-6 md:w-8 md:h-8" />
                   </div>
                </motion.div>
              ))}
           </motion.div>
        )}

        {/* EXPANDED VIEW */}
        {isExpanded && activeCategoryData && (
           <motion.div
              key="expanded-view"
              className="relative w-full min-h-screen bg-background"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
           >
              {/* Header / Expanded Block */}
              <motion.div 
                 layoutId={`category-block-${activeCategoryData.Slug}`}
                 className="relative h-[40vh] md:h-[50vh] w-full bg-primary text-primary-foreground flex flex-col justify-end p-6 md:p-16 overflow-hidden"
              >
                  {/* Close Button */}
                  <button 
                    onClick={() => setActiveCategory('all')}
                    className="absolute top-6 right-6 md:top-8 md:right-8 z-50 p-2 bg-black/20 hover:bg-black/40 text-white backdrop-blur-md rounded-full transition-colors"
                  >
                     <X className="w-6 h-6 md:w-8 md:h-8" />
                  </button>

                  {/* Background Image - Full Opacity in Header */}
                  {activeCategoryData.Illustration?.url && (
                    <motion.div 
                      className="absolute inset-0 opacity-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      transition={{ duration: 0.5 }}
                    >
                       <Image 
                         src={getStrapiMediaUrl(activeCategoryData.Illustration)} 
                         alt="" 
                         fill 
                         className="object-cover"
                         priority
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    </motion.div>
                  )}

                  <div className="relative z-10">
                    <motion.h2 
                       layoutId={`category-title-${activeCategoryData.Slug}`}
                       className="text-4xl md:text-7xl font-bold tracking-wide uppercase mb-4"
                    >
                        {activeCategoryData.Name}
                    </motion.h2>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col gap-2"
                    >
                       <p className="text-lg md:text-xl text-white/80 max-w-2xl font-light">
                         Explore our curated collection of articles, reviews, and analysis.
                       </p>
                    </motion.div>
                  </div>
              </motion.div>

              {/* Content Body */}
              <motion.div 
                 className="container py-8 md:py-16 px-4 md:px-8"
                 initial={{ opacity: 0, y: 50 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.4, duration: 0.5 }}
              >
                 <div className="flex flex-col md:flex-row justify-end items-start md:items-center mb-10 gap-6 border-b pb-6">
                    <FilterOptions 
                        language={language}
                        sortBy={sortBy}
                        onFilterChange={onFilterChange}
                    />
                 </div>

                 <ArticlesList 
                    category={activeCategoryData.Slug}
                    language={language}
                    sortBy={sortBy}
                 />
              </motion.div>
           </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
