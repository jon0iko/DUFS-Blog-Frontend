'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Article } from '@/types';
import { featuredArticles, editorsChoiceArticles } from '@/data/dummy-data';
import { Separator } from '@/components/ui/separator';
import ShareButtons from '@/components/articles/ShareButtons';
import RelatedArticles from '@/components/articles/RelatedArticles';
import AuthorInfo from '@/components/articles/AuthorInfo';
import CommentSection from '@/components/articles/CommentSection';
import ArticleActions from '@/components/articles/ArticleActions';
import ReadingProgressBar from '@/components/articles/ReadingProgressBar';
import FloatingShareBar from '@/components/articles/FloatingShareBar';

interface ArticleContentProps {
  slug: string;
}

export default function ArticleContent({ slug }: ArticleContentProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [isBengali, setIsBengali] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd fetch from an API
    // For now, we'll use the dummy data
    const allArticles = [...featuredArticles, ...editorsChoiceArticles];
    const foundArticle = allArticles.find(a => a.slug === slug);
    
    if (foundArticle) {
      setArticle(foundArticle);
      setIsBengali(foundArticle.isBengali);
    }
    
    setIsLoading(false);
  }, [slug]);

  // Add dummy content since our dummy data doesn't have full content
  const dummyContent = `
    <p>Cinema has always been a window to different cultures and realities. In this piece, we explore the nuances of modern filmmaking and its impact on society.</p>
    <p>The director's vision comes through in every frame, with careful attention to lighting, composition, and pacing. Each scene builds upon the last, creating a narrative tapestry that engages viewers on multiple levels.</p>
    <h2>The Art of Visual Storytelling</h2>
    <p>Visual storytelling is at the heart of this film. The camera moves deliberately, guiding our eyes to details that matter while obscuring others until the right moment. This technique creates tension and release throughout the viewing experience.</p>
    <p>Color plays an important role too. Notice how the palette shifts from cool blues in the opening scenes to warmer tones as the protagonist undergoes their transformation. This subtle visual cue reinforces the emotional journey without relying on exposition.</p>
    <h2>Sound and Silence</h2>
    <p>The sound design deserves special attention. Rather than bombarding us with constant music, the director knows when to let silence speak. Those quiet moments often carry the most weight, allowing us to feel the emotional resonance of what we're witnessing.</p>
    <p>When music does appear, it's thoughtfully chosen to complement rather than overwhelm the scene. The score becomes another character in the story, one that whispers to our subconscious rather than shouting for attention.</p>
    <blockquote>"Cinema is a matter of what's in the frame and what's out." - Martin Scorsese</blockquote>
    <p>This quote perfectly encapsulates the thinking behind every decision made in this film. What we don't see is often as important as what we do, and the negative space tells its own story.</p>
    <h2>Cultural Context</h2>
    <p>Understanding the cultural context adds another layer of appreciation. The film is firmly rooted in its time and place, yet speaks to universal human experiences that transcend boundaries.</p>
    <p>Local traditions, social structures, and historical events all inform the narrative, creating a rich tapestry that rewards repeated viewings. Even seemingly minor details can contain significant meaning when viewed through this cultural lens.</p>
  `;

  const bengaliDummyContent = `
    <p>চলচ্চিত্র সর্বদা বিভিন্ন সংস্কৃতি এবং বাস্তবতার দিকে একটি জানালা। এই রচনায়, আমরা আধুনিক চলচ্চিত্র নির্মাণ এবং সমাজের উপর এর প্রভাব অন্বেষণ করি।</p>
    <p>পরিচালকের দৃষ্টিভঙ্গি প্রতিটি ফ্রেমে প্রকাশ পায়, আলোকসজ্জা, কম্পোজিশন এবং গতি সম্পর্কে সতর্ক মনোযোগ সহকারে। প্রতিটি দৃশ্য শেষেরটির উপর নির্মিত হয়, একটি কাহিনীর ট্যাপেস্ট্রি তৈরি করে যা দর্শকদের একাধিক স্তরে জড়িত করে।</p>
    <h2>দৃশ্য গল্প বলার শিল্প</h2>
    <p>দৃশ্য গল্প বলা এই ছবির কেন্দ্রস্থলে রয়েছে। ক্যামেরা ইচ্ছাকৃতভাবে চলে, আমাদের চোখকে গুরুত্বপূর্ণ বিবরণে নির্দেশিত করে যখন অন্যদের সঠিক মুহূর্ত পর্যন্ত অস্পষ্ট করে। এই কৌশলটি সমগ্র দেখার অভিজ্ঞতা জুড়ে টেনশন এবং রিলিজ তৈরি করে।</p>
    <p>রঙও একটি গুরুত্বপূর্ণ ভূমিকা পালন করে। লক্ষ্য করুন কিভাবে প্যালেট প্রারম্ভিক দৃশ্যে শীতল নীল থেকে নায়ককে রূপান্তর করার সাথে সাথে উষ্ণ টোনে পরিবর্তিত হয়। এই সূক্ষ্ম ভিজ্যুয়াল সংকেত এক্সপোজিশনের উপর নির্ভর না করেই আবেগের যাত্রা জোরদার করে।</p>
    <h2>শব্দ এবং নীরবতা</h2>
    <p>শব্দ ডিজাইনটি বিশেষ মনোযোগের যোগ্য। আমাদের ক্রমাগত সঙ্গীতে বোমাবর্ষণ করার পরিবর্তে, পরিচালক জানেন কখন নীরবতাকে কথা বলতে দেওয়া উচিত। সেই নীরব মুহুর্তগুলি প্রায়ই সবচেয়ে বেশি ওজন বহন করে, আমাদের যা দেখছি তার আবেগী অনুরণন অনুভব করতে দেয়।</p>
    <p>যখন সঙ্গীত উপস্থিত হয়, এটি দৃশ্যকে অভিভূত করার পরিবর্তে সম্পূরকভাবে চিন্তাশীলভাবে নির্বাচিত হয়। স্কোরটি গল্পের আরেকটি চরিত্রে পরিণত হয়, এমন একজন যা মনোযোগের জন্য চিৎকার করার পরিবর্তে আমাদের অবচেতনে ফিসফিস করে।</p>
    <blockquote>"সিনেমা হল এটি কি ফ্রেমের মধ্যে আছে এবং কি বাইরে আছে তার বিষয়।" - মার্টিন স্কর্সেসি</blockquote>
    <p>এই উদ্ধৃতিটি নিখুঁতভাবে এই ফিল্মে করা প্রতিটি সিদ্ধান্তের পিছনে চিন্তাভাবনা ক্যাপসুল করে। আমরা যা দেখি না তা প্রায়ই যা আমরা করি তার চেয়ে গুরুত্বপূর্ণ, এবং নেতিবাচক স্থানটি তার নিজের গল্প বলে।</p>
    <h2>সাংস্কৃতিক প্রসঙ্গ</h2>
    <p>সাংস্কৃতিক প্রসঙ্গ বোঝা প্রশংসার আরেকটি স্তর যোগ করে। ফিল্মটি তার সময় এবং স্থানে দৃঢ়ভাবে শিকড়বদ্ধ, তবুও সার্বজনীন মানব অভিজ্ঞতার কথা বলে যা সীমানা অতিক্রম করে।</p>
    <p>স্থানীয় ঐতিহ্য, সামাজিক কাঠামো এবং ঐতিহাসিক ঘটনাগুলি সবই কাহিনীকে অবহিত করে, একটি সমৃদ্ধ ট্যাপেস্ট্রি তৈরি করে যা বারবার দেখার পুরস্কার দেয়। এমনকি আপাতদৃষ্টিতে ছোটখাটো বিবরণও এই সাংস্কৃতিক লেন্সের মাধ্যমে দেখলে উল্লেখযোগ্য অর্থ ধারণ করতে পারে।</p>
  `;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl py-10 px-4 sm:px-6 animate-pulse">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-2/4 mb-8"></div>
        <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto max-w-5xl py-10 px-4 sm:px-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="mb-8">The article you're looking for doesn't exist or has been removed.</p>
        <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium">
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <article className="bg-white dark:bg-gray-900">
      {/* Reading progress bar */}
      <ReadingProgressBar targetId="article-content" />
      
      {/* Floating share bar for mobile */}
      <FloatingShareBar title={article?.title || ''} url={`/articles/${article?.slug}`} />
      
      {/* Hero section */}
      <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh]">
        <Image 
          src={article?.imageSrc || '/images/hero.jpg'} 
          alt={article?.title || 'Article Image'} 
          fill 
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <div className="container mx-auto max-w-5xl">
            <div className="max-w-3xl">
              <Link 
                href={`/browse?category=${article?.category}`}
                className="text-sm font-medium uppercase tracking-wider text-white bg-black bg-opacity-60 px-3 py-1 rounded hover:bg-opacity-80 transition mb-3 inline-block"
              >
                {article?.category}
              </Link>
              <h1 className={cn(
                "text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight",
                isBengali && "font-kalpurush"
              )}>
                {article?.title}
              </h1>
              <div className="flex flex-wrap items-center text-white text-sm md:text-base">
                <span>By <Link href={`/authors/${article?.author.name.toLowerCase().replace(/\s+/g, '-')}`} className="hover:underline">{article?.author.name}</Link></span>
                <span className="mx-2">•</span>
                <time dateTime={article?.publishedAt}>{article?.publishedAt}</time>
                {article?.viewCount && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{article.viewCount.toLocaleString()} views</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl py-10 px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Article content */}
          <div className="lg:col-span-8">
            <div 
              id="article-content"
              className={cn(
                "prose dark:prose-invert max-w-none prose-headings:scroll-mt-16",
                "prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium",
                "prose-img:rounded-lg prose-img:mx-auto",
                "prose-blockquote:border-l-blue-600 dark:prose-blockquote:border-l-blue-400 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:font-medium",
                isBengali ? "font-kalpurush text-lg leading-relaxed" : "font-roboto text-base md:text-lg leading-relaxed"
              )}
              dangerouslySetInnerHTML={{ 
                __html: article?.content || (isBengali ? bengaliDummyContent : dummyContent)
              }}
            />
            
            <Separator className="my-8" />
            
            {/* Article actions (like, bookmark) */}
            <ArticleActions articleId={article?.id || ''} />
            
            {/* Author information */}
            <div className="mt-10">
              <AuthorInfo author={article?.author} />
            </div>
            
            {/* Tags */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {(article?.tags || ['film', 'cinema', 'culture', 'analysis']).map(tag => (
                  <Link 
                    key={tag}
                    href={`/browse?tag=${tag}`} 
                    className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-1 rounded-full text-sm transition"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Back to top button */}
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-2 rounded-full transition group"
                aria-label="Back to top"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="transform transition-transform group-hover:-translate-y-1"
                >
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
                <span>Back to top</span>
              </button>
            </div>
            
            {/* Comments section */}
            <div className="mt-12">
              <CommentSection articleId={article?.id || ''} />
            </div>
          </div>
          
          {/* Sidebar */}          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-10">
              {/* Share buttons */}
              <ShareButtons title={article?.title || ''} url={`/articles/${article?.slug}`} />
              
              {/* Related articles */}
              <RelatedArticles currentArticleId={article?.id || ''} category={article?.category || ''} />
            </div>
          </aside>
        </div>
      </div>
      
      {/* Bottom article recommendations */}
      <div className="bg-gray-50 dark:bg-gray-800 py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold mb-8">More From DUFS Blog</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArticles.slice(0, 3).map((article) => (
              <div key={article.id} className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                <div className="h-48 relative">
                  <Image
                    src={article.imageSrc}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <Link 
                    href={`/articles/${article.slug}`}
                    className={cn(
                      "text-xl font-semibold mb-2 block hover:text-blue-600 dark:hover:text-blue-400 transition",
                      article.isBengali && "font-kalpurush"
                    )}
                  >
                    {article.title}
                  </Link>
                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                    {article.excerpt}
                  </p>                  <div className="mt-3 text-xs text-gray-500">
                    <Link href={`/authors/${article.author.name.toLowerCase().replace(/\s+/g, '-')}`} className="hover:underline">
                      {article.author.name}
                    </Link>
                    <span className="mx-2">•</span>
                    <time dateTime={article.publishedAt}>{article.publishedAt}</time>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
