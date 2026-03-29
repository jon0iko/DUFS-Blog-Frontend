'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { gsap } from '@/lib/gsap'
import { PenTool, Upload, Eye, Heart, MessageSquare, Paperclip, Trash2, Search, X, ChevronDown } from 'lucide-react'
import LoadingScreen from '@/components/common/LoadingScreen'
import { getUserArticles, getUserArticleStats, strapiAPI } from '@/lib/api'
import { getStrapiMediaUrl } from '@/lib/strapi-media'
import { UserArticle } from '@/components/dashboard/UserArticlesList'
import { formatDate } from '@/lib/utils'
import { getFontClass } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

const SubmitPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  
  const [articles, setArticles] = useState<UserArticle[]>([]);
  const [stats, setStats] = useState({
    totalArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('publishedAt:desc');
  const ITEMS_PER_PAGE = 8;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<UserArticle | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const typedTextRef = useRef<HTMLSpanElement | null>(null)
  const caretRef = useRef<HTMLSpanElement | null>(null)

  const headingText = "Writers' Room"

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin?redirect=/submit');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch user articles and stats
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const [articlesData, userStats] = await Promise.all([
          getUserArticles(user.id, currentPage, ITEMS_PER_PAGE, debouncedSearch, sortBy),
          getUserArticleStats(user.id),
        ]);
        
        const articleCommentCounts = await Promise.all(
          articlesData.articles.map(article => 
            strapiAPI.getCommentCountForArticle(article.documentId).catch(() => 0)
          )
        );
        
        const transformedArticles: UserArticle[] = articlesData.articles.map((article, index) => ({
          id: article.id,
          documentId: article.documentId,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt || '',
          featuredImage: article.featuredImage ? getStrapiMediaUrl(article.featuredImage.url) : undefined,
          category: article.category?.Name || article.category?.nameEn,
          viewCount: article.viewCount || 0,
          likes: article.likes || 0,
          commentCount: articleCommentCounts[index] || 0,
          publishedAt: article.publishedAt || article.createdAt,
          storyState: 'published',
          language: article.language || 'en',
        }));
        
        setArticles(transformedArticles);
        setStats({
          ...userStats,
          totalComments: articleCommentCounts.reduce((sum, count) => sum + count, 0)
        });
        setTotalPages(articlesData.pageCount);
        setTotalArticles(articlesData.total);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.id) {
      fetchData();
    }
  }, [user?.id, isAuthenticated, currentPage, debouncedSearch, sortBy]);

  const handleDeleteArticle = async () => {
    if (!articleToDelete || !deleteReason.trim()) return;
    
    setIsDeleting(true);
    try {
      await strapiAPI.createUserRequestReport({
        section: 'ArticleDeletion',
        description: `Article: ${articleToDelete.title} (Slug: ${articleToDelete.slug}) | Reason: ${deleteReason}`,
      });
      toast.success('Your deletion request has been submitted to the editors.');
      setIsDeleteModalOpen(false);
      setDeleteReason('');
      setArticleToDelete(null);
    } catch (error) {
      console.error('Error submitting deletion request:', error);
      toast.error('Failed to submit deletion request.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (article: UserArticle) => {
    setArticleToDelete(article);
    setDeleteReason('');
    setIsDeleteModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // GSAP Typing Animation Fix - Added authLoading and isAuthenticated to dependencies
  useEffect(() => {
    // Wait until loading is finished and user is authenticated so the DOM elements are rendered
    if (authLoading || !isAuthenticated) return;

    // Small delay to ensure the component has actually painted the main JSX
    const timer = setTimeout(() => {
      const typedText = typedTextRef.current
      const caret = caretRef.current
      if (!typedText || !caret) return

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (prefersReducedMotion) {
        typedText.textContent = headingText
        gsap.set(caret, { autoAlpha: 1 })
        return
      }

      const ctx = gsap.context(() => {
        // Calculate typing duration - this is how long the character typing takes
        const typingDuration = headingText.length * 0.15;
        
        // Calculate repeat count for caret to match typing duration
        // repeat + 1 gives us total cycles, multiply by duration to get total time
        const repeatNeeded = Math.ceil(typingDuration / 0.5) - 1;
        
        // Blink caret during typing
        gsap.to(caret, {
          autoAlpha: 0,
          duration: 0.5,
          repeat: repeatNeeded,
          yoyo: true,
          ease: 'steps(1)',
          delay: 0.5,
        })

        // Fade out caret after typing finishes
        gsap.delayedCall(0.5 + typingDuration + 0.3, () => {
          if (caret) caret.style.display = 'none'
        })

        const tl = gsap.timeline({ delay: 0.5 })
        typedText.textContent = ""
        
        headingText.split('').forEach((char) => {
          tl.to({}, {
            duration: 0.15,
            onStart: () => {
              typedText.textContent += char
            }
          })
        })
      })

      return () => ctx.revert()
    }, 300);

    return () => clearTimeout(timer);
  }, [authLoading, isAuthenticated, headingText])

  const STATS_ITEMS = [
    { label: 'Total Articles', value: stats.totalArticles.toString(), icon: PenTool, rotation: '-1deg' },
    { label: 'Total Views', value: stats.totalViews.toString(), icon: Eye, rotation: '1deg' },
    { label: 'Total Likes', value: stats.totalLikes.toString(), icon: Heart, rotation: '-0.5deg' },
    { label: 'Total Comments', value: stats.totalComments.toString(), icon: MessageSquare, rotation: '0.5deg' },
  ]

  if (authLoading) return <LoadingScreen isLoading={true} />;
  if (!isAuthenticated) return null;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden font-montserrat">
      {/* Background Images */}
      <div className="absolute inset-0 dark:hidden select-none pointer-events-none" style={{ backgroundImage: 'url(/images/bgpaper.jpg)', backgroundRepeat: 'repeat' }} />
      <div className="bg-pattern-dark absolute inset-0 hidden dark:block select-none pointer-events-none" style={{ backgroundImage: 'url(/images/bgpaper_dark.jpg)', backgroundRepeat: 'repeat', backgroundSize: '1667px 1200px' }} />

      <div className="container relative z-20 px-7 pt-8 md:pt-10">
        {/* Coffee stain */}
        <div className="pointer-events-none absolute z-10 -right-20 -top-20 rotate-[15deg] md:right-8 md:top-0 md:-translate-y-[52%] md:rotate-0">
          <Image src="/images/Coffee-Stain.png" alt="stain" width={280} height={280} className="h-auto w-[180px] md:w-[280px] object-contain opacity-80" priority unoptimized />
        </div>

        {/* Hero Title - Alte Haas Grotesk */}
        <h1 className="font-zillaslab font-bold text-4xl leading-none tracking-[0.02em] text-foreground md:text-6xl" aria-label="Writers' Room">
          <span ref={typedTextRef} aria-hidden className="whitespace-pre" />
          <span ref={caretRef} aria-hidden className="inline-block select-none font-sans font-thin ml-0.5">|</span>
        </h1>

        <div className="mt-2 h-[2px] w-full bg-[url('/images/dashes.svg')] bg-repeat-x bg-left-top dark:[filter:brightness(0)_invert(1)]" style={{ backgroundSize: 'auto 2px' }} />

        {/* 1. Quick Action Buttons */}
        <div className="mt-10 flex flex-col md:flex-row gap-5 lg:gap-8">
          <Link href="/editor" className="flex-1">
            <button className="group relative w-full bg-[#F9F7F1] dark:bg-[#1C1B1A] border-2 border-foreground/90 p-5 md:p-6 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-foreground text-background rounded-sm group-hover:bg-background group-hover:text-foreground border border-transparent group-hover:border-foreground transition-colors shrink-0">
                  <PenTool className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-xl uppercase tracking-widest text-foreground">Write</h3>
                  <p className="text-muted-foreground text-xs mt-1 leading-tight">Start a new article.</p>
                </div>
              </div>
            </button>
          </Link>

          <Link href="/blogup" className="flex-1">
            <button className="group relative w-full bg-[#F9F7F1] dark:bg-[#1C1B1A] border-2 border-foreground/90 p-5 md:p-6 rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.8)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-foreground text-background rounded-sm group-hover:bg-background group-hover:text-foreground border border-transparent group-hover:border-foreground transition-colors shrink-0">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-xl uppercase tracking-widest text-foreground">Upload</h3>
                  <p className="text-muted-foreground text-xs mt-1 leading-tight">Submit document for review.</p>
                </div>
              </div>
            </button>
          </Link>
        </div>

        {/* 2. Stats Row */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS_ITEMS.map((stat, idx) => (
            <div key={idx} className="relative bg-[#FFFCF5] dark:bg-[#1F1E1D] p-4 md:p-5 shadow-sm border border-neutral-300 dark:border-neutral-800 transition-transform hover:rotate-0 hover:-translate-y-1" style={{ transform: `rotate(${stat.rotation})` }}>
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_bottom,transparent_23px,#3b82f6_24px)] bg-[length:100%_24px]" />
              <div className="relative z-10">
                <span className="text-muted-foreground text-[9px] uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                  <stat.icon className="w-3.5 h-3.5 opacity-60" /> {stat.label}
                </span>
                <span className="text-3xl md:text-4xl font-bold text-foreground tracking-tighter">
                  {stat.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Article List Section - Consistent and Smaller */}
        <div className="mt-16 pb-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 border-b-2 border-foreground/5 pb-3 gap-1 sm:gap-0">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground uppercase">
              Your Blog Posts
            </h2>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              {totalArticles} articles
            </span>
          </div>

          {/* Search and Sort Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <input
                type="text"
                placeholder="Search your posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F9F7F1]/50 dark:bg-[#1C1B1A]/50 border-2 border-foreground/10 focus:border-foreground/30 rounded-sm py-2.5 pl-10 pr-10 outline-none transition-all text-sm font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-foreground/5 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 min-w-fit">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Sort by</span>
              <div className="relative min-w-[160px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none bg-[#F9F7F1]/50 dark:bg-[#1C1B1A]/50 border-2 border-foreground/10 focus:border-foreground/30 rounded-sm py-2.5 pl-4 pr-10 outline-none transition-all text-xs font-bold uppercase tracking-tight cursor-pointer"
                >
                  <option value="publishedAt:desc">Newest First</option>
                  <option value="publishedAt:asc">Oldest First</option>
                  <option value="viewCount:desc">Most Viewed</option>
                  <option value="likes:desc">Most Liked</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-[#FAFAF8]/50 dark:bg-[#181817]/50 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-sm p-10 text-center">
              <p className="text-muted-foreground text-sm">No stories yet.</p>
              <Link href="/editor" className="text-sm font-bold hover:underline mt-2 inline-block">Start writing</Link>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8">
              {articles.map((article, idx) => {
                const rotation = (idx % 2 === 0) ? '-0.5deg' : '0.5deg';
                const titleFontClass = getFontClass(article.title);
                return (
                  <div key={article.documentId} className="group relative flex flex-col sm:flex-row gap-4 p-4 md:p-5 bg-[#FAFAF8] dark:bg-[#181817] shadow-sm border border-neutral-200 dark:border-neutral-800/80 transition-all duration-300 hover:shadow-md" style={{ transform: `rotate(${rotation})` }}>
                    <div className="absolute -top-2 right-4 text-neutral-400 opacity-40 group-hover:opacity-100 transition-opacity">
                      <Paperclip className="w-5 h-5" />
                    </div>

                    <Link 
                      href={`/read-article?slug=${article.slug}`}
                      className="relative w-full sm:w-36 md:w-44 aspect-[4/3] shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-900 rounded-sm block"
                    >
                      {article.featuredImage ? (
                        <Image 
                          src={article.featuredImage} 
                          alt={article.title} 
                          fill 
                          className="object-cover transition-transform group-hover:scale-105" 
                          unoptimized={true}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] font-mono text-neutral-400">NO IMAGE</div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start gap-3">
                        <Link href={`/read-article?slug=${article.slug}`} className="block group/title truncate">
                          <h3 className={cn("text-base md:text-lg font-bold text-foreground leading-snug group-hover/title:underline", titleFontClass)}>
                            {article.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => openDeleteModal(article)} className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-xs md:text-sm line-clamp-1 mt-1 mb-3">
                        {article.excerpt}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[10px] md:text-xs font-bold">
                        {article.category && <span className="text-foreground/60"># {article.category}</span>}
                        <span className="text-neutral-400 font-medium">
                          {formatDate(article.publishedAt)}
                        </span>
                        
                        <div className="flex items-center gap-3 ml-auto text-neutral-400">
                          <span className="flex items-center gap-1" title="Views"><Eye className="w-3.5 h-3.5" /> {article.viewCount}</span>
                          <span className="flex items-center gap-1" title="Likes"><Heart className="w-3.5 h-3.5" /> {article.likes}</span>
                          <span className="flex items-center gap-1" title="Comments"><MessageSquare className="w-3.5 h-3.5" /> {article.commentCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Proper Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="px-3 py-1.5 bg-[#F9F7F1] dark:bg-[#1C1B1A] border border-foreground/20 rounded-sm text-[10px] font-bold uppercase disabled:opacity-30 hover:bg-foreground hover:text-background transition-colors"
              >
                Prev
              </button>
              
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const isCurrent = page === currentPage;
                  // Show max 5 pages or ellipses
                  if (totalPages > 7) {
                    if (page !== 1 && page !== totalPages && (page < currentPage - 1 || page > currentPage + 1)) {
                       if (page === 2 || page === totalPages - 1) return <span key={page} className="px-1 text-xs opacity-40">..</span>;
                       return null;
                    }
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={isLoading}
                      className={cn(
                        "w-7 h-7 flex items-center justify-center border border-foreground/20 text-xs font-bold transition-all rounded-sm",
                        isCurrent ? "bg-foreground text-background border-foreground" : "hover:border-foreground"
                      )}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="px-3 py-1.5 bg-[#F9F7F1] dark:bg-[#1C1B1A] border border-foreground/20 rounded-sm text-[10px] font-bold uppercase disabled:opacity-30 hover:bg-foreground hover:text-background transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Request Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#F9F7F1] dark:bg-[#1C1B1A] border-2 border-foreground p-6 md:p-8 rounded-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.9)] scale-in-center animate-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold uppercase tracking-widest text-foreground">Request Deletion</h3>
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1 hover:bg-foreground/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed font-medium">
              You are requesting to delete <span className="text-foreground font-bold">&quot;{articleToDelete?.title}&quot;</span>. This request will be sent to the editors for review.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/60 mb-1.5">
                  Reason for Deletion
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Please provide a reason for deleting this article..."
                  rows={4}
                  className="w-full bg-white dark:bg-black/20 border-2 border-foreground/10 focus:border-foreground/30 rounded-sm py-3 px-4 outline-none transition-all text-sm font-medium resize-none"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handleDeleteArticle}
                  disabled={!deleteReason.trim() || isDeleting}
                  className="w-full py-3 bg-red-500 text-white font-bold uppercase tracking-widest text-xs border-2 border-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]"
                >
                  {isDeleting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-3 bg-transparent text-foreground font-bold uppercase tracking-widest text-xs border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:bg-foreground/5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubmitPage
