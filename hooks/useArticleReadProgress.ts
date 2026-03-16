"use client";

/**
 * useArticleReadProgress
 *
 * Persists and restores scroll position within the article content section
 * across visits, using localStorage.
 *
 * Rules:
 * - Only the position WITHIN the article content element is stored (not
 *   full-page scroll), so comments / related articles are excluded.
 * - Positions are saved when the user leaves the page (route change,
 *   tab hide, or tab/window close).
 * - If the user has scrolled past the bottom of the article content
 *   (finished reading), any previously saved position is cleared.
 * - We keep the last MAX_STORED articles; older ones are evicted (LRU).
 *   Increase MAX_STORED freely — each entry is ~100 bytes.
 */

import { useEffect, useRef } from "react";
import type Lenis from "lenis";

const STORAGE_KEY = "dufs_article_read_progress";
const MAX_STORED = 5;
// Minimum pixels scrolled into the article before we bother saving
const MIN_SAVE_PX = 80;

interface ArticleProgress {
  slug: string;
  /** Pixels scrolled past the top of the article-content element */
  position: number;
  savedAt: number;
}

// ── localStorage helpers ────────────────────────────────────────────────────

function readStorage(): ArticleProgress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ArticleProgress[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: ArticleProgress[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

export function getSavedArticlePosition(slug: string): number | null {
  const entry = readStorage().find((p) => p.slug === slug);
  return entry != null ? entry.position : null;
}

// ── hook ────────────────────────────────────────────────────────────────────

interface Options {
  slug: string;
  /** Ref attached to the article-content element */
  contentRef: React.RefObject<HTMLElement | null>;
  /** True once the article HTML is in the DOM and the layout is settled */
  isReady: boolean;
  /** Lenis instance for conflict-free programmatic scrolling */
  lenis?: Lenis | null;
}

export function useArticleReadProgress({
  slug,
  contentRef,
  isReady,
  lenis,
}: Options): void {
  const didSaveRef = useRef(false);
  const didRestoreRef = useRef(false);

  // ── helpers ────────────────────────────────────────────────────────────

  /** Document-relative top of the article content element */
  function getArticleDocTop(): number {
    const el = contentRef.current;
    if (!el) return 0;
    return el.getBoundingClientRect().top + window.scrollY;
  }

  /** How far the user has scrolled INTO the article content */
  function positionInArticle(): number {
    return Math.max(0, window.scrollY - getArticleDocTop());
  }

  /** True when the viewport bottom has passed the article content bottom */
  function hasFinishedReading(): boolean {
    const el = contentRef.current;
    if (!el) return false;
    return window.scrollY + window.innerHeight >= getArticleDocTop() + el.offsetHeight;
  }

  function persist(): void {
    if (didSaveRef.current || !slug) return;
    didSaveRef.current = true;

    if (hasFinishedReading()) {
      // User finished — remove any saved position
      writeStorage(readStorage().filter((p) => p.slug !== slug));
      return;
    }

    const pos = positionInArticle();
    if (pos < MIN_SAVE_PX) return; // trivially small — not worth restoring

    const others = readStorage().filter((p) => p.slug !== slug);
    others.unshift({ slug, position: pos, savedAt: Date.now() });
    writeStorage(others.slice(0, MAX_STORED));
  }

  // ── restore: fires once the article content is in the DOM ──────────────
  useEffect(() => {
    if (!isReady || !slug || didRestoreRef.current) return;

    const saved = getSavedArticlePosition(slug);
    if (saved == null || saved < MIN_SAVE_PX) return;

    didRestoreRef.current = true;
    const target = getArticleDocTop() + saved;

    if (lenis) {
      lenis.scrollTo(target, { immediate: true });
    } else {
      window.scrollTo({ top: target, behavior: "instant" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, slug]);

  // ── save: on route change (cleanup), tab hide, and window close ────────
  useEffect(() => {
    if (!slug) return;

    // Reset for the new slug
    didSaveRef.current = false;
    didRestoreRef.current = false;

    const onBeforeUnload = () => persist();
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") persist();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      persist(); // route change / unmount
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);
}
