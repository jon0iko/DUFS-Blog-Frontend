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
 * Renders HTML content from Tiptap editor with unified styling
 * Uses the .dufs-article-render CSS system defined in globals.css
 * Applies appropriate font classes for Bengali and English text
 */
export default function ArticleHTMLContent({ 
  content, 
  fontSize = 'medium',
  className 
}: ArticleHTMLContentProps) {
  
  // Process HTML to add proper structure and font classes
  const processedContent = React.useMemo(() => {
    // Handle image captions in markdown format
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
          `<figure data-image-caption="true">` +
            `<img${imgAttrs} data-caption-image="true" class="rounded-lg shadow-lg" style="max-width: 500px; width: 100%; height: auto;" />` +
            `<figcaption class="caption-text">${caption}</figcaption>` +
          `</figure>`
        );
      }
    );

    // Add font classes to block elements based on content language
    // We only add the font class now, other styling is handled by .dufs-article-render CSS
    
    // Paragraphs
    html = html.replace(/<p([^>]*)>([^<]*(?:<(?!\/p>)[^<]*)*)<\/p>/gi, (match, attrs, content) => {
      const fontClass = getFontClassZillaSlab(getTextContent(content));
      return `<p${attrs} class="${fontClass}">` + content + '</p>';
    });
    
    // Headings
    html = html.replace(/<h([1-3])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level, attrs, content) => {
      const fontClass = getFontClassZillaSlab(getTextContent(content));
      return `<h${level}${attrs} class="${fontClass}">` + content + `</h${level}>`;
    });
    
    // Bold/Italic
    const inlineTags = ['strong', 'b', 'em', 'i', 'a', 'li'];
    inlineTags.forEach(tag => {
      const regex = new RegExp(`<${tag}([^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'gi');
      html = html.replace(regex, (match, attrs, content) => {
        // Only apply font class if it doesn't contain other tags (to avoid nesting font classes too much)
        if (!content.includes('<')) {
          const fontClass = getFontClassZillaSlab(content);
          return `<${tag}${attrs} class="${fontClass}">` + content + `</${tag}>`;
        }
        return match;
      });
    });
    
    // Style blockquotes — icon left, text right layout
    // Structured to match Tiptap's StyledBlockquote for visual consistency
    html = html.replace(/<blockquote([^>]*)>([\s\S]*?)<\/blockquote>/gi, (match, attrs, innerContent) => {
      const fontClass = getFontClassZillaSlab(getTextContent(innerContent));
      const compactQuoteContent = innerContent
        .replace(/<p[^>]*>/gi, '')
        .replace(/<\/p>/gi, '')
        .trim();

      return (
        `<div class="flex items-start gap-4 md:gap-6 my-10 not-prose">` +
          `<img src="/images/QuoteLight.svg" alt="" aria-hidden="true" class="quote-icon quote-icon-light block dark:hidden" />` +
          `<img src="/images/QuoteDark.svg" alt="" aria-hidden="true" class="quote-icon quote-icon-dark hidden dark:block" />` +
          `<blockquote${attrs} class="${fontClass}">` +
            `<span class="block w-full">${compactQuoteContent}</span>` +
          `</blockquote>` +
        `</div>`
      );
    });
    
    // Style figure elements with image captions
    html = html.replace(/<figure([^>]*)data-image-caption([^>]*)>([\s\S]*?)<\/figure>/gi, (match, attrs1, attrs2, innerContent) => {
      const styledInner = innerContent
        .replace(/<img([^>]*)>/g, (imgMatch: string, imgAttrs: string) => {
          const safeAttrs = imgAttrs.includes('data-caption-image')
            ? imgAttrs
            : `${imgAttrs} data-caption-image=\"true\"`;
          return `<img${safeAttrs} class="rounded-lg shadow-lg" style="max-width: 500px; width: 100%; height: auto;">`;
        });

      return `<figure${attrs1}data-image-caption${attrs2}>${styledInner}</figure>`;
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
  }, [content]);

  return (
    <div
      className={cn(
        'dufs-article-render article-content relative',
        className
      )}
      data-size={fontSize}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
