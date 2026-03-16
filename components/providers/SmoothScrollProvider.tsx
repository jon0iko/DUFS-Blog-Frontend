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
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  // Scroll to top on every route change
  useEffect(() => {
    if (lenisInstance) {
      lenisInstance.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Respect OS-level reduced-motion preference
    // Disable browser's native scroll restoration so it never jumps
    // to a remembered position on page load or client-side navigation
    history.scrollRestoration = "manual";

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

    // ── Scrollbar interaction fix ──────────────────────────────────────────
    // The native scrollbar lives in the gap between
    // document.documentElement.clientWidth and window.innerWidth.
    //
    // Two separate glitches need handling:
    //
    // 1. HOVER GLITCH — as the scrollbar thumb animates past a stationary
    //    cursor that is already over the scrollbar gutter, the browser
    //    "captures" the thumb mid-flight and snaps the scroll position.
    //    Fix: stop Lenis the moment the cursor enters the gutter so the
    //    thumb stays frozen while the cursor is there; resume on exit.
    //
    // 2. DRAG GLITCH — clicking/dragging the scrollbar fires native scroll
    //    events that fight the ongoing Lenis animation.
    //    Fix: stop Lenis on pointerdown inside the gutter; resume on pointerup.
    let isOverScrollbar = false;

    const onPointerMove = (e: PointerEvent) => {
      const overScrollbar = e.clientX > document.documentElement.clientWidth;
      if (overScrollbar && !isOverScrollbar) {
        isOverScrollbar = true;
        lenis.stop();
      } else if (!overScrollbar && isOverScrollbar) {
        isOverScrollbar = false;
        lenis.start();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.clientX > document.documentElement.clientWidth) {
        lenis.stop();

        const resume = () => {
          // Only restart if the cursor has left the scrollbar gutter
          if (!isOverScrollbar) lenis.start();
          window.removeEventListener("pointerup", resume);
          window.removeEventListener("pointercancel", resume);
        };
        window.addEventListener("pointerup", resume);
        window.addEventListener("pointercancel", resume);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    // ──────────────────────────────────────────────────────────────────────

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
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
