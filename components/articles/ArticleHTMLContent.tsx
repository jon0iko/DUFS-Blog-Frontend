'use client'

import React from 'react';
import { cn } from '@/lib/utils';
import { isBengaliText, getFontClass } from '@/lib/fonts';

interface ArticleHTMLContentProps {
  content: string;
  fontSize?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Renders HTML content from Tiptap editor with beautiful markdown-like styling
 * Designed for film society aesthetics with cinematic feel
 * Applies appropriate font classes for Bengali and English text
 */
export default function ArticleHTMLContent({ 
  content, 
  fontSize = 'medium',
  className 
}: ArticleHTMLContentProps) {
  
  const fontSizeClasses = {
    small: 'text-base md:text-lg leading-relaxed',
    medium: 'text-lg md:text-xl leading-relaxed',
    large: 'text-xl md:text-2xl leading-relaxed'
  };

  // Detect if content has Bengali text
  const hasBengali = isBengaliText(content);
  const contentFontClass = hasBengali ? 'font-kalpurush' : 'font-roboto';

  // Process HTML to add proper styling and font classes
  const processedContent = React.useMemo(() => {
    let html = content;

    // Helper function to extract text from HTML for font detection
    const getTextContent = (htmlStr: string): string => {
      const tmp = document.createElement('DIV');
      tmp.innerHTML = htmlStr;
      return tmp.textContent || tmp.innerText || '';
    };

    // Wrap paragraphs with proper styling and font class
    html = html.replace(/<p([^>]*)>([^<]*(?:<(?!\/p>)[^<]*)*)<\/p>/gi, (match, attrs, content) => {
      const fontClass = getFontClass(getTextContent(content));
      return `<p${attrs} class="mb-6 leading-8 text-gray-800 dark:text-gray-200 ${fontClass}">` + content + '</p>';
    });
    
    // Style h2 headings with prominent left border and serif font
    html = html.replace(/<h2([^>]*)>([^<]*)<\/h2>/gi, (match, attrs, content) => {
      const fontClass = getFontClass(content);
      return `<h2${attrs} class="text-3xl md:text-4xl font-bold mt-12 mb-8 text-gray-900 dark:text-gray-100 ${fontClass}">` + content + '</h2>';
    });

    // Style h1 headings
    html = html.replace(/<h1([^>]*)>([^<]*)<\/h1>/gi, (match, attrs, content) => {
      const fontClass = getFontClass(content);
      return `<h1${attrs} class="text-4xl md:text-5xl font-bold mt-14 mb-8 text-gray-900 dark:text-gray-100 ${fontClass}">` + content + '</h1>';
    });

    // Style h3 headings
    html = html.replace(/<h3([^>]*)>([^<]*)<\/h3>/gi, (match, attrs, content) => {
      const fontClass = getFontClass(content);
      return `<h3${attrs} class="text-2xl md:text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100 ${fontClass}">` + content + '</h3>';
    });
    
    // Style strong/bold text
    html = html.replace(/<strong([^>]*)>([^<]*)<\/strong>/gi, (match, attrs, content) => {
      const fontClass = getFontClass(content);
      return `<strong${attrs} class="font-bold text-gray-900 dark:text-gray-100 ${fontClass}">` + content + '</strong>';
    });

    html = html.replace(/<b([^>]*)>([^<]*)<\/b>/gi, (match, attrs, content) => {
      const fontClass = getFontClass(content);
      return `<b${attrs} class="font-bold text-gray-900 dark:text-gray-100 ${fontClass}">` + content + '</b>';
    });
    
    // Style emphasis/italic text
    html = html.replace(/<em([^>]*)>([^<]*)<\/em>/gi, (match, attrs, content) => {
      const fontClass = getFontClass(content);
      return `<em${attrs} class="italic text-gray-700 dark:text-gray-300 ${fontClass}">` + content + '</em>';
    });

    html = html.replace(/<i([^>]*)>([^<]*)<\/i>/gi, (match, attrs, content) => {
      const fontClass = getFontClass(content);
      return `<i${attrs} class="italic text-gray-700 dark:text-gray-300 ${fontClass}">` + content + '</i>';
    });
    
    // Style blockquotes with elegant design
    html = html.replace(/<blockquote([^>]*)>([^<]*(?:<(?!\/blockquote>)[^<]*)*)<\/blockquote>/gi, (match, attrs, content) => {
      const fontClass = getFontClass(getTextContent(content));
      return `<blockquote${attrs} class="border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/40 italic py-5 px-6 my-8 rounded-r text-amber-950 dark:text-amber-100 shadow-sm leading-loose ${fontClass}">` + content + '</blockquote>';
    });
    
    // Style links
    html = html.replace(/<a([^>]*)>([^<]*)<\/a>/gi, (match, attrs, content) => {
      const fontClass = getFontClass(content);
      return `<a${attrs} class="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium ${fontClass}">` + content + '</a>';
    });
    
    // Style code blocks
    html = html.replace(/<code([^>]*)>([^<]*)<\/code>/gi, (match, attrs, content) => {
      return `<code${attrs} class="bg-gray-100 dark:bg-brand-black-90 text-pink-600 dark:text-pink-400 px-2 py-1 rounded font-mono text-sm">` + content + '</code>';
    });
    
    // Style lists with better spacing
    html = html.replace(/<ul([^>]*)>/g, '<ul$1 class="list-disc list-outside my-6 ml-4 space-y-3 text-gray-800 dark:text-gray-200">');
    html = html.replace(/<ol([^>]*)>/g, '<ol$1 class="list-decimal list-outside my-6 ml-6 space-y-3 text-gray-800 dark:text-gray-200">');
    
    html = html.replace(/<li([^>]*)>([^<]*)<\/li>/gi, (match, attrs, content) => {
      const fontClass = getFontClass(content);
      return `<li${attrs} class="ml-2 ${fontClass}">` + content + '</li>';
    });
    
    // Style images - max 500px width, maintain aspect ratio for consistency with editor
    html = html.replace(/<img([^>]*)>/g, (match, attrs) => {
      return `<div class="my-10 flex justify-center"><img${attrs} class="rounded-lg shadow-lg" style="max-width: 500px; width: 100%; height: auto;"></div>`;
    });

    // Style figure elements with image captions - same max-width sizing
    html = html.replace(/<figure([^>]*)data-image-caption([^>]*)>([\s\S]*?)<\/figure>/gi, (match, attrs1, attrs2, innerContent) => {
      // Extract and restyle the img inside
      const styledInner = innerContent.replace(/<img([^>]*)>/g, (imgMatch: string, imgAttrs: string) => {
        return `<img${imgAttrs} class="rounded-lg shadow-lg" style="max-width: 500px; width: 100%; height: auto;">`;
      });
      return `<figure${attrs1}data-image-caption${attrs2} class="my-10 flex flex-col items-center">${styledInner}</figure>`;
    });
    
    // Style hr
    html = html.replace(/<hr([^>]*)>/g, '<hr$1 class="my-10 border-t border-gray-300 dark:border-gray-600">');

    return html;
  }, [content]);

  return (
    <div
      className={cn(
        'article-content',
        fontSizeClasses[fontSize],
        contentFontClass,
        'max-w-none',
        'text-gray-800 dark:text-gray-200',
        // Film grain texture overlay effect
        'relative',
        className
      )}
      dangerouslySetInnerHTML={{ __html: processedContent }}
      style={{
        // Add subtle film grain texture
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
      }}
    />
  );
}
