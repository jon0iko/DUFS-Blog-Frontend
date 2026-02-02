'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/common/LoadingScreen';
import QuickActions from '@/components/dashboard/QuickActions';
import StatsOverview from '@/components/dashboard/StatsOverview';
import UserArticlesList, { UserArticle } from '@/components/dashboard/UserArticlesList';
import { getUserArticles, getUserArticleStats, strapiAPI } from '@/lib/api';
import { getStrapiMediaUrl } from '@/lib/strapi-media';

export default function SubmitPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
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
  const ITEMS_PER_PAGE = 10;

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
        
        // Fetch articles and stats in parallel
        const [articlesData, userStats] = await Promise.all([
          getUserArticles(user.id, currentPage, ITEMS_PER_PAGE),
          getUserArticleStats(user.id),
        ]);
        
        // Fetch comment counts for all articles in parallel
        const articleCommentCounts = await Promise.all(
          articlesData.articles.map(article => 
            strapiAPI.getCommentCountForArticle(article.documentId)
              .catch(() => 0) // Default to 0 if fetching fails
          )
        );
        
        // Transform articles to match UserArticle interface
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
        setStats(userStats);
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
  }, [user?.id, isAuthenticated, currentPage]);

  const handleDeleteArticle = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }
    
    // TODO: Implement delete functionality with Strapi API
    console.log('Delete article:', documentId);
    // After successful deletion, refresh the list
    setArticles(prev => prev.filter(article => article.documentId !== documentId));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show loading while checking auth or fetching data
  if (authLoading || (isAuthenticated && isLoading)) {
    return <LoadingScreen isLoading={true} />;
  }

  return (
    <>
      {isAuthenticated && (
        <div className="min-h-screen">
          <div className="container py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
                Writer Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your articles
              </p>
            </div>

            {/* Horizontal line */}
            <div className="border-b border-gray-300 dark:border-gray-500 mb-8"></div>

            {/* Quick Actions */}
            <div className="mb-8">
              {/* <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
                Create New Content
              </h2> */}
              <QuickActions />
            </div>

            {/* Stats Overview */}
            <div className="mb-8">
              <StatsOverview stats={stats} />
            </div>

            {/* User Articles */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-black dark:text-white">
                  Your Blog Posts
                </h2>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {totalArticles} {totalArticles === 1 ? 'article' : 'articles'}
                </span>
              </div>
              <UserArticlesList 
                articles={articles} 
                onDelete={handleDeleteArticle}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
