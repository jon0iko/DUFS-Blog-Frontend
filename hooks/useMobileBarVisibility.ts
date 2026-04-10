import { useState, useEffect } from "react";

export function useMobileBarVisibility(
  isActive: boolean,
  targetId = "article-content",
): boolean {
  const [showMobileBar, setShowMobileBar] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    let rafId = 0;

    function check() {
      const el = document.getElementById(targetId);
      if (!el) return;
      const { top, bottom } = el.getBoundingClientRect();
      setShowMobileBar(bottom > 0 && top < window.innerHeight);
    }

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        check();
      });
    }

    check();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isActive, targetId]);

  return showMobileBar;
}
