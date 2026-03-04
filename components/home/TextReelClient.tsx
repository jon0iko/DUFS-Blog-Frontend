"use client";

/**
 * TextReelClient — infinite marquee driven by GSAP ticker.
 *
 * Visual feature: the marquee subtly accelerates when the user scrolls
 * (velocity-linked speed), creating a cinematic "film reel pulled by motion"
 * impression, then smoothly decays back to the base speed. This effect is
 * disabled on devices that prefer reduced motion.
 *
 * Performance notes:
 * - The transform is applied in a single `gsap.to()` with `ease: "none"` so it
 *   runs entirely in GSAP's RAF loop (same loop as Lenis — no duplicate frames).
 * - No will-change is set programmatically; the element already receives a
 *   compositor-promoted layer from the translateX transform itself.
 * - The velocity tracker uses passive wheel listeners and never causes reflow.
 */

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

interface TextReelClientProps {
  text: string;
  /** Base duration for one full pass in seconds (default: 50) */
  baseDuration?: number;
  /** Number of repeated text instances per track */
  reps?: number;
}

export default function TextReelClient({
  text,
  baseDuration = 50,
  reps = 5,
}: TextReelClientProps) {
  const track1Ref = useRef<HTMLDivElement>(null);
  const track2Ref = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const velocityRef = useRef(0);
  const targetTimeScaleRef = useRef(1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const track1 = track1Ref.current;
    const track2 = track2Ref.current;
    if (!track1 || !track2) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    // Both tracks start at their natural DOM positions:
    //   track1 → translateX(0%)  (visual x = 0)
    //   track2 → translateX(0%)  (visual x ≈ 100vw, placed after track1 in flex)
    // Animating both to xPercent(-100) moves everything left by one track-width,
    // creating a seamless infinite loop when repeat: -1 is set.
    const tween = gsap.to([track1, track2], {
      xPercent: -100,
      duration: baseDuration,
      ease: "none",
      repeat: -1,
    });
    tweenRef.current = tween;

    /* ── Scroll velocity effect ────────────────────────────────── */
    const handleWheel = (e: WheelEvent) => {
      // Clamp velocity so it doesn't become absurdly fast
      const delta = Math.min(Math.abs(e.deltaY), 300);
      velocityRef.current = delta;
    };

    window.addEventListener("wheel", handleWheel, { passive: true });

    // Smooth decay of time-scale back to 1 — runs on GSAP ticker
    const decayCallback = () => {
      if (velocityRef.current > 0.5) {
        const boost = 1 + (velocityRef.current / 600) * 2.5; // max ~2.25× faster
        targetTimeScaleRef.current = boost;
        velocityRef.current *= 0.88; // exponential decay
      } else {
        targetTimeScaleRef.current = 1;
        velocityRef.current = 0;
      }

      // Lerp tween timeScale toward target
      if (tweenRef.current) {
        const current = tweenRef.current.timeScale();
        const target = targetTimeScaleRef.current;
        const next = current + (target - current) * 0.12;
        tweenRef.current.timeScale(next);
      }
    };

    gsap.ticker.add(decayCallback);

    return () => {
      tween.kill();
      gsap.ticker.remove(decayCallback);
      window.removeEventListener("wheel", handleWheel);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [baseDuration]);

  const items = Array.from({ length: reps }, (_, i) => (
    <span
      key={i}
      className="
        inline-block
        text-black font-black uppercase tracking-normal
        text-4xl sm:text-5xl md:text-7xl lg:text-7xl
        pointer-events-none select-none
      "
    >
      {text}
    </span>
  ));

  return (
    <div
      className="flex overflow-hidden gap-4 relative user-select-none"
      aria-hidden="true"
    >
      <div
        ref={track1Ref}
        className="flex-shrink-0 flex justify-around items-center min-w-full gap-4"
      >
        {items}
      </div>
      <div
        ref={track2Ref}
        className="flex-shrink-0 flex justify-around items-center min-w-full gap-4"
        aria-hidden="true"
      >
        {items}
      </div>
    </div>
  );
}
