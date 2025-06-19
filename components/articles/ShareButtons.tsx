'use client'

import React from 'react';
import { Facebook, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
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
    alert('Link copied to clipboard!');
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Share this article</h3>
      <div className="flex space-x-3">
        <a 
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition"
          aria-label="Share on Facebook"
        >
          <Facebook size={20} />
        </a>
        <a 
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1DA1F2] hover:bg-blue-500 text-white transition"
          aria-label="Share on Twitter"
        >
          <Twitter size={20} />
        </a>
        <a 
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0077B5] hover:bg-blue-800 text-white transition"
          aria-label="Share on LinkedIn"
        >
          <Linkedin size={20} />
        </a>
        <button 
          onClick={copyToClipboard}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
          aria-label="Copy link"
        >
          <LinkIcon size={20} />
        </button>
      </div>
    </div>
  );
}
