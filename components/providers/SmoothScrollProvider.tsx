"use client";

/**
 * SmoothScrollProvider
 *
 * Integrates Lenis smooth scrolling with GSAP's ScrollTrigger so every
 * scroll-triggered animation stays perfectly in sync.
 *
 * Performance considerations:
 * - Lenis is disabled for users who prefer reduced motion
 * - On touch devices, smoothTouch is off by default for native feel and perf
 * - lagSmoothing(0) prevents GSAP ticker from skipping frames under load
 */

import Lenis from "lenis";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { gsap } from "@/lib/gsap";
import { ScrollTrigger } from "@/lib/gsap";

const LenisContext = createContext<Lenis | null>(null);

/** Access the Lenis instance anywhere inside the provider tree */
export function useLenis() {
  return useContext(LenisContext);
}

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export default function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    // Respect OS-level reduced-motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      // Smooth easing — slightly slower on mobile via touchMultiplier
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Disable touch smoothing so mobile retains natural, snappy iOS/Android feel
      // while desktop wheel/trackpad gets the luxurious glide
      touchMultiplier: 1.5,
      wheelMultiplier: 1,
      infinite: false,
    });

    setLenisInstance(lenis);

    // Notify ScrollTrigger on every Lenis scroll tick
    lenis.on("scroll", ScrollTrigger.update);

    // Pipe Lenis into GSAP's RAF loop so GSAP + ScrollTrigger + Lenis stay
    // perfectly synchronised — single source-of-truth animation frame
    const rafCallback = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(rafCallback);

    // Prevent GSAP from dropping frames when the tab is busy
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(rafCallback);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  );
}
