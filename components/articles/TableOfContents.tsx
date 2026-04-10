'use client'

import React, { useState, useEffect } from 'react';
import { List } from 'lucide-react';

interface TableOfContentsProps {
  content: string;
  className?: string;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ content, className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Parse HTML content to extract headings
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headingElements = doc.querySelectorAll('h2, h3');
    
    const headingsData = Array.from(headingElements).map((heading, index) => {
      const text = heading.textContent || '';
      // Create slug from text
      const id = `toc-${text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 50)}-${index}`;
      
      return {
        id,
        text,
        level: parseInt(heading.tagName.charAt(1)),
      };
    });

    setHeadings(headingsData);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    // Set up intersection observer for rendered headings
    const observeHeadings = () => {
      const articleContent = document.querySelector('.article-content');
      if (!articleContent) return;

      const headingElements = articleContent.querySelectorAll('h2, h3');
      
      // Assign IDs to the actual rendered headings to match our TOC
      headingElements.forEach((heading, index) => {
        if (headings[index]) {
          heading.id = headings[index].id;
        }
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveId(entry.target.id);
            }
          });
        },
        {
          rootMargin: '0px 0px -80% 0px',
          threshold: 0.1,
        }
      );

      headingElements.forEach((heading) => {
        observer.observe(heading);
      });

      return () => observer.disconnect();
    };

    // Delay to ensure content is rendered
    const timeout = setTimeout(observeHeadings, 500);
    return () => clearTimeout(timeout);
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className={className}>
      <div 
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <List className="w-5 h-5 text-primary" />
          <h4 className="text-lg font-semibold">In This Article</h4>
        </div>
        <button className="lg:hidden text-gray-500">
          {isOpen ? '−' : '+'}
        </button>
      </div>
      
      {isOpen && (
        <ul className="space-y-2 max-h-[70vh] overflow-y-auto">
          {headings.map((heading) => (
            <li 
              key={heading.id}
              style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}
            >
              <a
                href={`#${heading.id}`}
                className={`block text-sm py-1.5 px-3 rounded border-l-2 hover:bg-gray-100 dark:hover:bg-brand-black-90 transition-all ${
                  activeId === heading.id
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(heading.id);
                  if (element) {
                    const offset = 100;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth',
                    });
                  }
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
