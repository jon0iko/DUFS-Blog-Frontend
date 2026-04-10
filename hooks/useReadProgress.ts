'use client'

import { useEffect, useRef } from 'react';

interface UseReadProgressOptions {
  targetId?: string;
}

/**
 * Returns a ref to attach to the progress bar element.
 * Updates are applied directly via style mutation inside a RAF callback —
 * zero React re-renders, GPU-composited transform, 60 fps.
 */
export default function useReadProgress({ targetId }: UseReadProgressOptions = {}) {
  const barRef = useRef<HTMLDivElement>(null);
  const rafId  = useRef<number>(0);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    function computeProgress(): number {
      if (targetId) {
        const target = document.getElementById(targetId);
        if (target) {
          const { top, height } = target.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          // scrollStart = when viewport top aligns with element top  (progress = 0)
          // scrollEnd   = when viewport bottom aligns with element bottom (progress = 1)
          // scrollEnd - scrollStart = height - windowHeight
          const scrollable = height - windowHeight;

          if (scrollable <= 0) {
            // Article fits entirely in the viewport; complete once it's fully visible
            return top <= 0 ? 1 : 0;
          }

          // -top is how far the element top has scrolled above the viewport
          return Math.min(1, Math.max(0, -top / scrollable));
        }
      }

      // Fallback: whole-page progress
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      return scrollable > 0
        ? Math.min(1, Math.max(0, window.scrollY / scrollable))
        : 0;
    }

    function onScroll() {
      // De-duplicate: only schedule one RAF per frame
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = 0;
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${computeProgress()})`;
        }
      });
    }

    // Run once synchronously so the bar is correct on first render
    bar.style.transform = `scaleX(${computeProgress()})`;

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [targetId]);

  return barRef;
}
