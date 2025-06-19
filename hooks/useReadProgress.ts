'use client'

import { useState, useEffect } from 'react';

interface UseReadProgressOptions {
  targetId?: string;
}

export default function useReadProgress({ targetId }: UseReadProgressOptions = {}) {
  const [completion, setCompletion] = useState(0);
  useEffect(() => {
    const updateScrollCompletion = () => {
      let startPosition = 0;
      let endPosition = document.body.scrollHeight - window.innerHeight;
      let currentProgress = window.scrollY;
      
      // If a target element is specified, calculate progress relative to that element
      if (targetId) {
        const target = document.getElementById(targetId);
        if (target) {
          const { top, bottom } = target.getBoundingClientRect();
          startPosition = window.pageYOffset + top;
          endPosition = window.pageYOffset + bottom - window.innerHeight;
          
          // Limit currentProgress to the range of the target element
          currentProgress = Math.max(window.pageYOffset - startPosition, 0);
          const availableScroll = Math.max(endPosition - startPosition, 0);
          
          if (availableScroll > 0) {
            setCompletion(Math.min(100, Math.max(0, (currentProgress / availableScroll) * 100)));
            return;
          }
        }
      }
      
      // Fallback to document scroll if target not found or has no height
      if (endPosition > startPosition) {
        setCompletion(Math.min(100, Math.max(0, (currentProgress / (endPosition - startPosition)) * 100)));
      }
    };

    // Set initial value
    updateScrollCompletion();

    // Add event listener
    window.addEventListener('scroll', updateScrollCompletion);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', updateScrollCompletion);
    };
  }, [targetId]);

  return completion;
}
