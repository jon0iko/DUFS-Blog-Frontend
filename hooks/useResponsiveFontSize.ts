import { useState, useEffect } from "react";

type FontSize = "small" | "medium" | "large";

export function useResponsiveFontSize(): [FontSize, (size: FontSize) => void] {
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    // Initialize based on current viewport - avoids flicker
    if (typeof window !== "undefined") {
      return window.matchMedia("(max-width: 1024px)").matches ? "medium" : "large";
    }
    return "large"; // Server-side default
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      setFontSize(e.matches ? "medium" : "large");
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return [fontSize, setFontSize];
}
