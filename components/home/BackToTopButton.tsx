"use client";

import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { gsap } from "@/lib/gsap";

export default function BackToTopButton() {
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    // Set initial hidden state imperatively
    gsap.set(btn, { opacity: 0, scale: 0.8, y: 16, pointerEvents: "none" });

    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Slide in
          gsap.to(btn, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.45,
            ease: "back.out(1.7)",
            pointerEvents: "auto",
            overwrite: true,
          });
        } else {
          // Slide out
          gsap.to(btn, {
            opacity: 0,
            scale: 0.85,
            y: 12,
            duration: 0.3,
            ease: "power2.in",
            pointerEvents: "none",
            overwrite: true,
          });
        }
      },
      { threshold: 0 }
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      ref={btnRef}
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-lg ring-2 ring-primary/20 hover:scale-110 active:scale-95 transition-transform duration-150"
    >
      <ArrowUp className="h-5 w-5 stroke-[2.5]" />
    </button>
  );
}
