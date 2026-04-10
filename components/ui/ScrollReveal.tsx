"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { ScrollTrigger } from "@/lib/gsap";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in seconds (applied via GSAP, not CSS variable) */
  delay?: number;
  /** Y offset to animate from (default 40px) */
  yOffset?: number;
  /** Animation duration in seconds (default 0.8) */
  duration?: number;
}

/**
 * Scroll-triggered reveal powered by GSAP ScrollTrigger.
 * Replaces the old IntersectionObserver + CSS keyframe approach.
 *
 * Automatically respects prefers-reduced-motion: if the user has opted-out
 * of motion the element is made immediately visible without animation.
 */
export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  yOffset = 40,
  duration = 0.8,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    // Only hide if the element is below the fold when JS runs (avoid flash for above-fold content)
    const rect = el.getBoundingClientRect();
    if (rect.top > window.innerHeight) {
      gsap.set(el, { opacity: 0, y: yOffset });
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: "power3.out",
        });
      },
    });

    return () => {
      st.kill();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ── Stagger variant ────────────────────────────────────────────────────────
 * Wraps a group of items and staggers their entrance on scroll.
 * The container queries for direct children and animates them in sequence.
 *
 * Usage:
 *   <StaggerReveal>
 *     <Card />
 *     <Card />
 *     <Card />
 *   </StaggerReveal>
 */
interface StaggerRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Delay between each child animation (seconds, default: 0.08) */
  staggerDelay?: number;
  /** Y distance to travel from (default: 40px) */
  yOffset?: number;
  /** When to start the trigger (default: "top 85%") */
  start?: string;
  /** Extra initial delay before the stagger starts (default: 0) */
  delay?: number;
}

export function StaggerReveal({
  children,
  className = "",
  staggerDelay = 0.08,
  yOffset = 36,
  start = "top 85%",
  delay = 0,
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const items = Array.from(el.children) as HTMLElement[];
    if (!items.length) return;

    // Only set hidden state for elements below the fold
    const rect = el.getBoundingClientRect();
    if (rect.top > window.innerHeight) {
      gsap.set(items, { opacity: 0, y: yOffset });
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => {
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: staggerDelay,
          delay,
        });
      },
    });

    return () => st.kill();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
