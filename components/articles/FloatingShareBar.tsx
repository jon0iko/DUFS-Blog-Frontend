'use client'

import React, { useState, useEffect } from 'react';
import { Facebook, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

interface FloatingShareBarProps {
  title: string;
  url: string;
}

export default function FloatingShareBar({ title, url }: FloatingShareBarProps) {
  const toast = useToast();
  const [isVisible, setIsVisible] = useState(false);
  
  // Convert relative URL to absolute
  const fullUrl = `https://dufsblog.com${url}`;
  
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl);
    toast.success('Link copied to clipboard!');
  };
  
  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 500px
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 w-full z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-2 shadow-lg transition-transform duration-300 lg:hidden",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <a 
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition"
            aria-label="Share on Facebook"
          >
            <Facebook size={18} />
          </a>
          <a 
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1DA1F2] hover:bg-blue-500 text-white transition"
            aria-label="Share on Twitter"
          >
            <Twitter size={18} />
          </a>
          <a 
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0077B5] hover:bg-blue-800 text-white transition"
            aria-label="Share on LinkedIn"
          >
            <Linkedin size={18} />
          </a>
          <button 
            onClick={copyToClipboard}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
            aria-label="Copy link"
          >
            <LinkIcon size={18} />
          </button>
        </div>
        
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 w-9 h-9 flex items-center justify-center"
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
          >
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
