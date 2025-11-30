'use client'

import { useState, useEffect, useCallback } from 'react';

interface UseReadProgressOptions {
  targetId?: string;
}

export default function useReadProgress({ targetId }: UseReadProgressOptions = {}) {
  const [completion, setCompletion] = useState(0);

  const updateScrollCompletion = useCallback(() => {
    // If a target element is specified, calculate progress relative to that element
    if (targetId) {
      const target = document.getElementById(targetId);
      if (target) {
        const rect = target.getBoundingClientRect();
        const elementTop = rect.top;
        const elementHeight = rect.height;
        const windowHeight = window.innerHeight;
        
        // Calculate how much of the element has been scrolled through
        // Start counting when the top of the element reaches the top of the viewport
        // End when the bottom of the element reaches the top of the viewport
        
        if (elementTop >= windowHeight) {
          // Element is below the viewport - 0% progress
          setCompletion(0);
          return;
        }
        
        if (elementTop + elementHeight <= 0) {
          // Element is above the viewport - 100% progress
          setCompletion(100);
          return;
        }
        
        // Calculate progress based on how much has scrolled past the top of the viewport
        // When elementTop = windowHeight, progress = 0
        // When elementTop + elementHeight = 0, progress = 100
        const scrollableDistance = elementHeight + windowHeight;
        const scrolledDistance = windowHeight - elementTop;
        
        // Adjust to start counting when element top hits top of viewport
        const adjustedScrolled = Math.max(0, scrolledDistance - windowHeight);
        const adjustedTotal = elementHeight;
        
        if (adjustedTotal > 0) {
          const progress = (adjustedScrolled / adjustedTotal) * 100;
          setCompletion(Math.min(100, Math.max(0, progress)));
          return;
        }
      }
    }
    
    // Fallback to document scroll if target not found
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    if (scrollHeight > 0) {
      setCompletion(Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)));
    }
  }, [targetId]);

  useEffect(() => {
    // Set initial value after a small delay to ensure DOM is ready
    const timeoutId = setTimeout(updateScrollCompletion, 100);

    // Add event listeners
    window.addEventListener('scroll', updateScrollCompletion, { passive: true });
    window.addEventListener('resize', updateScrollCompletion, { passive: true });
    
    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', updateScrollCompletion);
      window.removeEventListener('resize', updateScrollCompletion);
    };
  }, [updateScrollCompletion]);

  return completion;
}
