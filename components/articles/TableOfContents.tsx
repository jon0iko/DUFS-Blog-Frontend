'use client'

import React, { useState, useEffect } from 'react';

interface TableOfContentsProps {
  contentId: string;
  className?: string;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ contentId, className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const contentElement = document.getElementById(contentId);
    if (!contentElement) return;

    // Find all headings in the content
    const headingElements = contentElement.querySelectorAll('h2, h3, h4');
    
    const headingsData = Array.from(headingElements).map((heading, index) => {
      // If headings don't have IDs, assign them
      const id = heading.id || `heading-${index}`;
      if (!heading.id) heading.id = id;
      
      return {
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1)),
      };
    });

    setHeadings(headingsData);

    // Set up intersection observer to determine active heading
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

    // Observe all headings
    headingElements.forEach((heading) => {
      observer.observe(heading);
    });

    return () => {
      observer.disconnect();
    };
  }, [contentId]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className={className}>
      <h4 className="text-lg font-semibold mb-4">Table of Contents</h4>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li 
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}
          >
            <a
              href={`#${heading.id}`}
              className={`block text-sm py-1 border-l-2 pl-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                activeId === heading.id
                  ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-medium'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
