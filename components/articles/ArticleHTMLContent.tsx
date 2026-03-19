'use client'

import React from 'react';
import { cn } from '@/lib/utils';
import { getFontClassZillaSlab, splitMixedText } from '@/lib/fonts';
import { marked } from 'marked';
import DOMPurify from 'dompurify';


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
  const typographyScale = {
    small: {
      body: 'text-base md:text-lg leading-[1.8]',
      h1: 'text-3xl md:text-4xl',
      h2: 'text-2xl md:text-3xl',
      h3: 'text-xl md:text-2xl',
      quote: 'text-xl md:text-2xl',
      caption: 'text-sm md:text-base',
      code: 'text-xs md:text-sm',
    },
    medium: {
      body: 'text-lg md:text-xl leading-[1.8]',
      h1: 'text-4xl md:text-5xl',
      h2: 'text-3xl md:text-4xl',
      h3: 'text-2xl md:text-3xl',
      quote: 'text-2xl md:text-3xl',
      caption: 'text-base md:text-lg',
      code: 'text-sm md:text-base',
    },
    large: {
      body: 'text-xl md:text-2xl leading-[1.85]',
      h1: 'text-5xl md:text-6xl',
      h2: 'text-4xl md:text-5xl',
      h3: 'text-3xl md:text-4xl',
      quote: 'text-3xl md:text-4xl',
      caption: 'text-lg md:text-xl',
      code: 'text-base md:text-lg',
    },
  };

  const currentScale = typographyScale[fontSize];

  const contentFontClass = 'font-zillaslab';
  const widerFontClass = 'tracking-wide';

  // Process HTML to add proper styling and font classes
  const processedContent = React.useMemo(() => {
    const markdownWithImageCaptions = content.replace(
      /!\[([^\]]*)\]\(([^)\s]+(?:\s+"[^"]*")?)\)\s*\n\s*\*([^\n]+?)\*\s*(?=\n|$)/g,
      (match, alt, src, caption) => {
        return (
          `\n<figure data-image-caption="true">` +
            `<img src="${src}" alt="${alt}" data-caption-image="true" />` +
            `<figcaption>${caption}</figcaption>` +
          `</figure>\n`
        );
      }
    );

    const rawHtml = marked.parse(markdownWithImageCaptions, { gfm: true, breaks: false, async: false });
    let html = DOMPurify.sanitize(rawHtml as string);

    // Helper function to extract text from HTML for font detection
    const getTextContent = (htmlStr: string): string => {
      const tmp = document.createElement('DIV');
      tmp.innerHTML = htmlStr;
      return tmp.textContent || tmp.innerText || '';
    };

    // Backward-compatible fallback for image + caption markdown that reached HTML as adjacent paragraphs.
    html = html.replace(
      /<p>\s*<img([^>]*)>\s*<\/p>\s*<p>\s*(?:<em>|<i>)([\s\S]*?)(?:<\/em>|<\/i>)\s*<\/p>/gi,
      (match, imgAttrs, caption) => {
        return (
          `<figure data-image-caption="true" class="my-10 flex flex-col items-center">` +
            `<img${imgAttrs} data-caption-image="true" class="rounded-lg shadow-lg" style="max-width: 500px; width: 100%; height: auto;" />` +
            `<figcaption class="caption-text mt-2 text-center italic text-gray-600 dark:text-gray-400 ${currentScale.caption}">${caption}</figcaption>` +
          `</figure>`
        );
      }
    );

    // Wrap paragraphs with proper styling and font class
    html = html.replace(/<p([^>]*)>([^<]*(?:<(?!\/p>)[^<]*)*)<\/p>/gi, (match, attrs, content) => {
      const fontClass = getFontClassZillaSlab(getTextContent(content));
      return `<p${attrs} class="mb-8 ${currentScale.body} ${widerFontClass} text-gray-700 dark:text-gray-300 ${fontClass}">` + content + '</p>';
    });
    
    // Style h2 headings with prominent left border and serif font
    html = html.replace(/<h2([^>]*)>([^<]*)<\/h2>/gi, (match, attrs, content) => {
      const fontClass = getFontClassZillaSlab(content);
      return `<h2${attrs} class="${currentScale.h2} font-bold ${widerFontClass} mb-5 text-gray-900 dark:text-gray-100 ${fontClass}">` + content + '</h2>';
    });

    // Style h1 headings
    html = html.replace(/<h1([^>]*)>([^<]*)<\/h1>/gi, (match, attrs, content) => {
      const fontClass = getFontClassZillaSlab(content);
      return `<h1${attrs} class="${currentScale.h1} font-bold ${widerFontClass}  mb-8 text-gray-900 dark:text-gray-100 ${fontClass}">` + content + '</h1>';
    });

    // Style h3 headings
    html = html.replace(/<h3([^>]*)>([^<]*)<\/h3>/gi, (match, attrs, content) => {
      const fontClass = getFontClassZillaSlab(content);
      return `<h3${attrs} class="${currentScale.h3} font-bold ${widerFontClass} mb-4 text-gray-900 dark:text-gray-100 ${fontClass}">` + content + '</h3>';
    });
    
    // Style strong/bold text
    html = html.replace(/<strong([^>]*)>([^<]*)<\/strong>/gi, (match, attrs, content) => {
      const fontClass = getFontClassZillaSlab(content);
      return `<strong${attrs} class="font-bold text-gray-900 dark:text-gray-100 ${fontClass}">` + content + '</strong>';
    });

    html = html.replace(/<b([^>]*)>([^<]*)<\/b>/gi, (match, attrs, content) => {
      const fontClass = getFontClassZillaSlab(content);
      return `<b${attrs} class="font-bold text-gray-900 dark:text-gray-100 ${fontClass}">` + content + '</b>';
    });
    
    // Style emphasis/italic text
    html = html.replace(/<em([^>]*)>([^<]*)<\/em>/gi, (match, attrs, content) => {
      const fontClass = getFontClassZillaSlab(content);
      return `<em${attrs} class="italic text-gray-700 dark:text-gray-300 ${fontClass}">` + content + '</em>';
    });

    html = html.replace(/<i([^>]*)>([^<]*)<\/i>/gi, (match, attrs, content) => {
      const fontClass = getFontClassZillaSlab(content);
      return `<i${attrs} class="italic text-gray-700 dark:text-gray-300 ${fontClass}">` + content + '</i>';
    });
    
    // Style blockquotes — icon left, text right layout
    html = html.replace(/<blockquote([^>]*)>([\s\S]*?)<\/blockquote>/gi, (match, attrs, innerContent) => {
      const fontClass = getFontClassZillaSlab(getTextContent(innerContent));
      const compactQuoteContent = innerContent
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/p>/gi, '')
        .trim();

      return (
        `<div class="flex items-center gap-4 md:gap-6 my-10">` +
          `<img src="/images/QuoteLight.svg" alt="" aria-hidden="true" class="quote-icon-light block dark:hidden shrink-0 w-12 h-12 md:w-[70px] md:h-[70px]" />` +
          `<img src="/images/QuoteDark.svg" alt="" aria-hidden="true" class="quote-icon-dark hidden dark:block shrink-0 w-12 h-12 md:w-[70px] md:h-[70px]" />` +
          `<blockquote${attrs} class="flex-1 min-h-12 md:min-h-[70px] flex items-center italic ${currentScale.quote} leading-[1.55] text-gray-600 dark:text-gray-300 my-0 ${fontClass}">` +
            `<span class="block w-full">${compactQuoteContent}</span>` +
          `</blockquote>` +
        `</div>`
      );
    });
    
    // Style links
    html = html.replace(/<a([^>]*)>([^<]*)<\/a>/gi, (match, attrs, content) => {
      const fontClass = getFontClassZillaSlab(content);
      return `<a${attrs} class="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium ${fontClass}">` + content + '</a>';
    });
    
    // Style code blocks
    html = html.replace(/<code([^>]*)>([^<]*)<\/code>/gi, (match, attrs, content) => {
      return `<code${attrs} class="bg-gray-100 dark:bg-brand-black-90 text-pink-600 dark:text-pink-400 px-2 py-1 rounded font-mono ${currentScale.code}">` + content + '</code>';
    });
    
    // Style lists with better spacing
    html = html.replace(/<ul([^>]*)>/g, `<ul$1 class="list-disc list-outside my-7 ml-6 space-y-3 text-gray-700 dark:text-gray-300 ${currentScale.body}">`);
    html = html.replace(/<ol([^>]*)>/g, `<ol$1 class="list-decimal list-outside my-7 ml-6 space-y-3 text-gray-700 dark:text-gray-300 ${currentScale.body}">`);
    
    html = html.replace(/<li([^>]*)>([^<]*)<\/li>/gi, (match, attrs, content) => {
      const fontClass = getFontClassZillaSlab(content);
      return `<li${attrs} class="ml-2 leading-[1.75] ${fontClass}">` + content + '</li>';
    });
    
    // Style figure elements with image captions - same max-width sizing
    html = html.replace(/<figure([^>]*)data-image-caption([^>]*)>([\s\S]*?)<\/figure>/gi, (match, attrs1, attrs2, innerContent) => {
      const styledInner = innerContent
        .replace(/<img([^>]*)>/g, (imgMatch: string, imgAttrs: string) => {
          const safeAttrs = imgAttrs.includes('data-caption-image')
            ? imgAttrs
            : `${imgAttrs} data-caption-image=\"true\"`;
          return `<img${safeAttrs} class="rounded-lg shadow-lg" style="max-width: 500px; width: 100%; height: auto;">`;
        })
        .replace(/<figcaption([^>]*)>/gi, `<figcaption$1 class="caption-text mt-2 text-center italic text-gray-600 dark:text-gray-400 ${currentScale.caption}">`);

      return `<figure${attrs1}data-image-caption${attrs2} class="my-10 flex flex-col items-center">${styledInner}</figure>`;
    });

    // Style standalone content images (exclude decorative quote icons and figure-caption images).
    html = html.replace(/<img([^>]*)>/g, (match, attrs) => {
      if (
        /\/images\/Quote(Light|Dark)\.svg/i.test(attrs) ||
        /data-caption-image\s*=\s*['\"]?true/i.test(attrs)
      ) {
        return `<img${attrs}>`;
      }

      return `<div class="my-10 flex justify-center"><img${attrs} class="rounded-lg shadow-lg" style="max-width: 500px; width: 100%; height: auto;"></div>`;
    });
    
    // Style hr
    html = html.replace(/<hr([^>]*)>/g, '<hr$1 class="my-10 border-t border-gray-300 dark:border-gray-600">');

    // Apply Bengali font only to Bengali text runs inside mixed-language content.
    const applyMixedLanguageFontSpans = (htmlStr: string): string => {
      const container = document.createElement('DIV');
      container.innerHTML = htmlStr;

      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];

      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        if (!node.nodeValue || !node.nodeValue.trim()) continue;
        if (!/[\u0980-\u09FF]/.test(node.nodeValue)) continue;
        textNodes.push(node);
      }

      textNodes.forEach((textNode) => {
        const source = textNode.nodeValue || '';
        const segments = splitMixedText(source);
        if (!segments.length) return;

        const fragment = document.createDocumentFragment();

        segments.forEach((segment) => {
          if (!segment.text) return;
          if (segment.isBengali) {
            const span = document.createElement('SPAN');
            span.className = 'font-kalpurush';
            span.textContent = segment.text;
            fragment.appendChild(span);
            return;
          }

          fragment.appendChild(document.createTextNode(segment.text));
        });

        textNode.parentNode?.replaceChild(fragment, textNode);
      });

      return container.innerHTML;
    };

    return applyMixedLanguageFontSpans(html);
  }, [content, currentScale, widerFontClass]);

  return (
    <div
      className={cn(
        'article-content',
        contentFontClass,
        'max-w-none',
        'text-gray-800 dark:text-gray-200',
        // Film grain texture overlay effect
        'relative',
        className
      )}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
