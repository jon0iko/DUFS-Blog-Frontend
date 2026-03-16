"use client";

import React from "react";
import { Heart, Bookmark, MessageCircle, Share2, Sun, Moon, Coffee } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type FontSize = "small" | "medium" | "large";

const FONT_SIZE_CYCLE: FontSize[] = ["small", "medium", "large"];
const FONT_SIZE_LABEL: Record<FontSize, string> = {
  small: "small",
  medium: "medium",
  large: "large",
};
const FONT_SIZE_CLASS: Record<FontSize, string> = {
  small: "text-xs",
  medium: "text-sm",
  large: "text-base",
};

type ThemeOption = "light" | "dark" | "sepia";
const THEME_CYCLE: ThemeOption[] = ["light", "dark", "sepia"];
const ThemeIcon: Record<ThemeOption, React.ReactNode> = {
  light: <Sun className="w-5 h-5" />,
  dark: <Moon className="w-5 h-5" />,
  sepia: <Coffee className="w-5 h-5" />,
};

export interface ArticleSidebarActionsProps {
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  likes: number;
  hasLiked: boolean;
  isLikeLoading: boolean;
  isBookmarked: boolean;
  isBookmarkLoading: boolean;
  isAuthenticated: boolean;
  isSepiaMode: boolean;
  onLike: () => void;
  onBookmark: () => void;
  onShare: () => void;
  onDiscuss: () => void;
  onSepiaChange: (isSepia: boolean) => void;
}

export default function ArticleSidebarActions({
  fontSize,
  onFontSizeChange,
  likes,
  hasLiked,
  isLikeLoading,
  isBookmarked,
  isBookmarkLoading,
  isAuthenticated,
  isSepiaMode,
  onLike,
  onBookmark,
  onShare,
  onDiscuss,
  onSepiaChange,
}: ArticleSidebarActionsProps) {
  const { theme, setTheme } = useTheme();

  // Displayed theme: sepia overrides the global theme locally
  const displayedTheme: ThemeOption = isSepiaMode
    ? "sepia"
    : ((theme as ThemeOption) ?? "system");

  const cyclefontSize = () => {
    const idx = FONT_SIZE_CYCLE.indexOf(fontSize);
    onFontSizeChange(FONT_SIZE_CYCLE[(idx + 1) % FONT_SIZE_CYCLE.length]);
  };

  const cycleTheme = () => {
    const idx = THEME_CYCLE.indexOf(displayedTheme);
    const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    if (next === "sepia") {
      onSepiaChange(true);
    } else {
      setTheme(next);
      onSepiaChange(false);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col items-center sticky top-24 self-start h-fit gap-3">
      {/* Font Size Control */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        <button
          onClick={cyclefontSize}
          className="flex flex-col items-center gap-0.5 w-10 py-1.5 rounded-xl text-muted-foreground hover:text-foreground transition-all"
          title="Cycle font size"
        >
          <span className={cn("font-bold leading-none", FONT_SIZE_CLASS[fontSize])}>A</span>
          <span className="text-[9px] uppercase tracking-wide mt-0.5">{FONT_SIZE_LABEL[fontSize]}</span>
        </button>
      </div>

      {/* Theme Control */}
      <div className="flex flex-col items-center gap-1.5 pb-4 border-b border-border w-full">
        <button
          onClick={cycleTheme}
          className="flex flex-col items-center gap-0.5 w-10 py-1.5 rounded-xl text-muted-foreground hover:text-foreground transition-all"
          title="Cycle theme"
        >
          {ThemeIcon[displayedTheme]}
          <span className="text-[9px] uppercase tracking-wide mt-0.5">{displayedTheme}</span>
        </button>
      </div>

      {/* Like */}
      <button
        onClick={onLike}
        disabled={isLikeLoading}
        className={cn(
          "flex flex-col items-center gap-0.5 w-10 py-1.5 rounded-xl transition-all",
          hasLiked
            ? "text-red-500"
            : "text-muted-foreground hover:text-foreground",
          !isAuthenticated && "opacity-50",
        )}
        title={
          isAuthenticated ? (hasLiked ? "Unlike" : "Like") : "Sign in to like"
        }
      >
        <Heart className={cn("w-5 h-5", hasLiked && "fill-current")} />
        <span className="text-xs font-medium tabular-nums">{likes}</span>
      </button>

      {/* Bookmark */}
      <button
        onClick={onBookmark}
        disabled={isBookmarkLoading}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl transition-all",
          isBookmarked
            ? "text-amber-500"
            : "text-muted-foreground hover:text-foreground",
          !isAuthenticated && "opacity-50",
        )}
        title={
          isAuthenticated
            ? isBookmarked
              ? "Remove bookmark"
              : "Bookmark"
            : "Sign in to bookmark"
        }
      >
        <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-current")} />
      </button>

      {/* Discuss */}
      <button
        onClick={onDiscuss}
        className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground transition-all"
        title="Discuss article"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {/* Share */}
      <button
        onClick={onShare}
        className="flex items-center justify-center w-10 h-10 rounded-xl text-muted-foreground hover:text-foreground transition-all"
        title="Share article"
      >
        <Share2 className="w-5 h-5" />
      </button>
    </aside>
  );
}
