"use client";

import React from "react";
import { Heart, Bookmark, Share2, MessageCircle, Sun, Moon, Coffee } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import ShareMenu from "./ShareMenu";

type ThemeOption = "light" | "dark" | "sepia";
const THEME_CYCLE: ThemeOption[] = ["light", "dark", "sepia"];
const THEME_ICON: Record<ThemeOption, React.ReactNode> = {
  light: <Sun className="w-5 h-5" />,
  dark: <Moon className="w-5 h-5" />,
  sepia: <Coffee className="w-5 h-5" />,
};

interface ArticleMobileActionsBarProps {
  show: boolean;
  likes: number;
  hasLiked: boolean;
  isLikeLoading: boolean;
  isBookmarked: boolean;
  isBookmarkLoading: boolean;
  isAuthenticated: boolean;
  fontSize: string;
  isSepiaMode: boolean;
  onLike: () => void;
  onBookmark: () => void;
  onDiscuss: () => void;
  onFontSizeChange: (size: "small" | "medium" | "large") => void;
  onSepiaChange: (isSepia: boolean) => void;
}

export default function ArticleMobileActionsBar({
  show,
  likes,
  hasLiked,
  isLikeLoading,
  isBookmarked,
  isBookmarkLoading,
  isAuthenticated,
  isSepiaMode,
  onLike,
  onBookmark,
  onDiscuss,
  onSepiaChange,
}: ArticleMobileActionsBarProps) {
  const { theme, setTheme } = useTheme();

  const displayedTheme: ThemeOption = isSepiaMode
    ? "sepia"
    : theme === "dark"
    ? "dark"
    : "light";

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
    <div
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out",
        show ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="bg-card/95 backdrop-blur-md border-t border-border shadow-2xl px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex items-center">
          {/* Like */}
          <button
            onClick={onLike}
            disabled={isLikeLoading}
            className={cn(
              "flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-xl transition-all active:scale-95",
              hasLiked ? "text-red-500" : "text-muted-foreground",
              !isAuthenticated && "opacity-60",
            )}
          >
            <Heart className={cn("w-5 h-5", hasLiked && "fill-current")} />
            <span className="text-[11px] font-medium tabular-nums">{likes}</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={onBookmark}
            disabled={isBookmarkLoading}
            className={cn(
              "flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-xl transition-all active:scale-95",
              isBookmarked ? "text-amber-500" : "text-muted-foreground",
              !isAuthenticated && "opacity-60",
            )}
          >
            <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-current")} />
            <span className="text-[11px] font-medium">Save</span>
          </button>

          {/* Discuss */}
          <button
            onClick={onDiscuss}
            className="flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-xl text-muted-foreground active:scale-95 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[11px] font-medium">Discuss</span>
          </button>

          {/* Share */}
          <div className="flex flex-1 justify-center relative cursor-pointer">
            <ShareMenu align="left" directNativeShare>
              <button
                className="flex flex-col items-center justify-center gap-0.5 w-full py-1.5 rounded-xl text-muted-foreground active:scale-95 transition-all"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-[11px] font-medium">Share</span>
              </button>
            </ShareMenu>
          </div>

          
          {/* Theme — cycles light → dark → sepia */}
          <button
            onClick={cycleTheme}
            className="flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-xl text-muted-foreground active:scale-95 transition-all"
          >
            {THEME_ICON[displayedTheme]}
            <span className="text-[11px] font-medium capitalize">{displayedTheme}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
