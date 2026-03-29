'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { gsap } from '@/lib/gsap';

// ── Geometry ─────────────────────────────────────────────────────────────────
const SIZE = 76;

// Light Mode SVG overlay math (BacktoTop_light.svg is 107x107)
const L_CX = 53.5;
const L_CY = 53.5;
const L_R  = 49.475;                 // Dead center of the gap 
const L_W  = 6;                      // Kept slightly thinner than the actual 8px gap to prevent anti-aliasing bleeds
const L_C  = 2 * Math.PI * L_R;
const L_ARR = L_C + 4;               // Slightly larger array to prevent repeating dash gaps

// Dark Mode SVG overlay math (BacktoTop_dark.svg is 104x104)
const D_CX = 52.02;
const D_CY = 52.02;
const D_R  = 48.085;                 // Dead center of the gap 
const D_W  = 5.8;                    // Kept slightly thinner than the actual 7.8px gap to prevent anti-aliasing bleeds
const D_C  = 2 * Math.PI * D_R;
const D_ARR = D_C + 4;

interface FilmProgressWheelProps { targetId?: string }

export default function FilmProgressWheel({ targetId }: FilmProgressWheelProps) {
  const rafRef       = useRef<number>(0);
  const buttonRef    = useRef<HTMLButtonElement>(null);
  const arcLightRef  = useRef<SVGCircleElement>(null);
  const arcDarkRef   = useRef<SVGCircleElement>(null);
  const visibleRef   = useRef(false);

  const computeProgress = useCallback(() => {
    let p = 0;
    let isPast = false;

    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        const { top, height } = el.getBoundingClientRect();
        const scrollable = height - window.innerHeight;
        if (scrollable <= 0) p = top <= 0 ? 1 : 0;
        else p = Math.min(1, Math.max(0, -top / scrollable));
      }
    } else {
      const s = document.documentElement.scrollHeight - window.innerHeight;
      p = s > 0 ? Math.min(1, Math.max(0, window.scrollY / s)) : 0;
    }

    // Check if we reached related articles or footer area
    const relatedSection = document.getElementById('related-articles-section');
    if (relatedSection) {
      const relatedTop = relatedSection.getBoundingClientRect().top;
      // Hide when the related section comes well into view
      if (relatedTop < window.innerHeight - 100) {
        isPast = true;
      }
    } else {
      // Fallback: hide if at the absolute bottom of the page
      const isAtBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 150;
      if (p === 1 && isAtBottom) {
        isPast = true;
      }
    }

    return { p, isPast };
  }, [targetId]);

  // Scroll handler — all DOM updates skip React state for max fps
  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    const update = () => {
      const { p, isPast } = computeProgress();
      const wasVisible  = visibleRef.current;
      const isVisible   = p > 0.015 && !isPast;

      // Direct DOM: progress arc dashOffset
      if (arcLightRef.current) arcLightRef.current.style.strokeDashoffset = String(L_C * (1 - p));
      if (arcDarkRef.current)  arcDarkRef.current.style.strokeDashoffset  = String(D_C * (1 - p));

      if (!wasVisible && isVisible) {
        visibleRef.current = true;
        btn.style.pointerEvents = 'auto';
        gsap.killTweensOf(btn);
        gsap.fromTo(btn,
          { opacity: 0, scale: 0.45, y: 22 },
          { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(2.2)' },
        );
      } else if (wasVisible && !isVisible) {
        visibleRef.current = false;
        btn.style.pointerEvents = 'none';
        gsap.killTweensOf(btn);
        gsap.to(btn, { opacity: 0, scale: 0.5, y: 20, duration: 0.28, ease: 'power2.in' });
      }
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        update();
      });
    };

    // Set initial hidden state via GSAP so it owns the transform
    gsap.set(btn, { opacity: 0, scale: 0.5, y: 20 });
    btn.style.pointerEvents = 'none';
    update();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [computeProgress]);

  const handleMouseEnter = useCallback(() => {
    if (!buttonRef.current) return;
    gsap.to(buttonRef.current, { scale: 1.08, duration: 0.22, ease: 'power2.out' });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!buttonRef.current) return;
    gsap.to(buttonRef.current, { scale: 1, duration: 0.5, ease: 'elastic.out(1.1, 0.4)' });
  }, []);

  const handleClick = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    // Press burst then elastic return
    gsap.timeline()
      .to(btn,   { scale: 0.9, duration: 0.1,  ease: 'power3.in' })
      .to(btn,   { scale: 1.05, duration: 0.28, ease: 'power2.out' })
      .to(btn,   { scale: 1,    duration: 0.5,  ease: 'elastic.out(1.2, 0.35)' });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="fixed bottom-8 inset-x-0 z-30 pointer-events-none">
      <div className="container mx-auto px-4 flex justify-end">
        <button
          ref={buttonRef}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-label="Back to top"
          className="hidden lg:flex relative items-center justify-center rounded-full cursor-pointer select-none focus-visible:outline-none drop-shadow-lg pointer-events-auto"
          style={{ width: SIZE, height: SIZE }}
        >
          {/* Light Mode Layer */}
          <div className="w-full h-full absolute inset-0 dark:hidden">
            <img 
              src="/images/BacktoTop_light.svg" 
              alt="Back to top" 
              className="w-full h-full object-contain" 
            />
            <svg viewBox="0 0 107 107" aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none">
              <circle
                ref={arcLightRef}
                cx={L_CX} cy={L_CY} r={L_R}
                fill="none"
                strokeWidth={L_W}
                strokeLinecap="round"
                strokeDasharray={L_ARR}
                strokeDashoffset={L_ARR}
                className="stroke-border transition-colors duration-300"
                style={{ transformOrigin: `${L_CX}px ${L_CY}px`, transform: 'rotate(-90deg)' }}
              />
            </svg>
          </div>

          {/* Dark Mode Layer */}
          <div className="w-full h-full absolute inset-0 hidden dark:block">
            <img 
              src="/images/BacktoTop_dark.svg" 
              alt="Back to top" 
              className="w-full h-full object-contain" 
            />
            <svg viewBox="0 0 104 104" aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none">
              <circle
                ref={arcDarkRef}
                cx={D_CX} cy={D_CY} r={D_R}
                fill="none"
                strokeWidth={D_W}
                strokeLinecap="round"
                strokeDasharray={D_ARR}
                strokeDashoffset={D_ARR}
                className="stroke-border transition-colors duration-300"
                style={{ transformOrigin: `${D_CX}px ${D_CY}px`, transform: 'rotate(-90deg)' }}
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
