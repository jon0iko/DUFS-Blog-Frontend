"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Moon, Sun, LogIn, UserPlus, LogOut, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import Avatar from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { getUserAvatarUrl } from '@/lib/auth'; 
import { useScroll, useMotionValueEvent } from "framer-motion";


export default function Header() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const isHomePage = pathname === '/' || pathname === '';
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  // Initialize hero state when page changes or on mount
  useEffect(() => {
    if (isHomePage && typeof window !== 'undefined') {
      const currentScrollY = window.scrollY;
      const carouselHeight = window.innerHeight * 0.80 + 4;
      setIsScrolledPastHero(currentScrollY > carouselHeight);
    } else {
      setIsScrolledPastHero(true);
    }
  }, [isHomePage]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const currentScrollY = latest;
    const previousScrollY = lastScrollY.current;
    
    // Only apply hero threshold logic on homepage
    if (isHomePage && typeof window !== 'undefined') {
      // Carousel is 80vh on both mobile and desktop
      // Add progress bar height (4px) for accurate calculation
      const carouselHeight = window.innerHeight * 0.80 + 4;
      setIsScrolledPastHero(currentScrollY > carouselHeight);
    } else {
      // On other pages, always show solid background
      setIsScrolledPastHero(true);
    }
    
    // Hide header if scrolling down and past 100px
    if (currentScrollY > previousScrollY && currentScrollY > 100) {
      setIsHeaderVisible(false);
    } 
    // Show header if scrolling up
    else if (currentScrollY < previousScrollY) {
      setIsHeaderVisible(true);
    }

    lastScrollY.current = currentScrollY;
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setIsThemeMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <header 
        className={cn(
          "top-0 z-50 w-full border-b transition-all duration-300 ease-in-out ",
          isHomePage ? "fixed" : "sticky",
          !isHeaderVisible && "-translate-y-full",
          isScrolledPastHero 
            ? "bg-background backdrop-blur-md border-border shadow-lg" 
            : "border-transparent"
        )}
      >
        <div className="container flex h-16 items-center justify-between gap-6 px-6">
          {/* Left Group: Menu Button + Logo + Site Title */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
              className={cn(
                "transition-colors duration-300",
                isScrolledPastHero 
                  ? "hover:bg-gray-100 dark:hover:bg-brand-black-90" 
                  : "text-white hover:bg-white/20"
              )}
            >
              <Menu className="!w-6 !h-6 stroke-[2.5]" />
            </Button>

            <Link href="/" className="flex items-center gap-3">
              <img 
                src="/images/logoo.png" 
                alt="DUFS Blog Logo" 
                className="h-10 w-12 object-contain" 
              />
              <span 
                className={cn(
                  "text-2xl font-black tracking-tight transition-colors duration-300 font-montserrat",
                  isScrolledPastHero 
                    ? "text-foreground" 
                    : "text-white drop-shadow-lg"
                )}
              >
                DUFS Blog
              </span>
            </Link>
          </div>

          {/* Right Group: Search Bar + Auth Actions */}
          <div className="flex items-center gap-3 flex-1 justify-end max-w-3xl">
            {/* Search Bar */}
            <SearchBar
              className="w-full max-w-md transition-all duration-300"
              inputClassName={cn(
                isScrolledPastHero 
                  ? "bg-background border-input text-foreground placeholder:text-muted-foreground" 
                  : "bg-white/15 backdrop-blur-md border-white/30 text-white placeholder:text-white/80"
              )}
              isOverlay={!isScrolledPastHero}
            />

            {!isAuthenticated ? (
              <>
                {/* Login Button */}
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "flex items-center gap-2 font-semibold transition-all duration-300 whitespace-nowrap",
                    isScrolledPastHero 
                      ? "text-foreground hover:bg-gray-100 dark:hover:bg-brand-black-90" 
                      : "text-white hover:bg-white/20"
                  )}
                >
                  <Link href="/auth/signin">
                    <LogIn className="h-5 w-5 stroke-[2.5]" />
                    <span className="hidden lg:inline">Log In</span>
                  </Link>
                </Button>

                {/* Sign Up Button */}
                <Button
                  asChild
                  className={cn(
                    "flex items-center gap-2 font-semibold transition-all duration-300 whitespace-nowrap",
                    isScrolledPastHero 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "bg-white text-gray-900 hover:bg-white/90"
                  )}
                >
                  <Link href="/auth/signup">
                    <UserPlus className="h-5 w-5 stroke-[2.5]" />
                    <span className="hidden lg:inline">Sign Up</span>
                  </Link>
                </Button>

                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "transition-colors duration-300 flex-shrink-0",
                    isScrolledPastHero 
                      ? "hover:bg-gray-100 dark:hover:bg-brand-black-90" 
                      : "text-white hover:bg-white/20"
                  )}
                  aria-label="Toggle theme"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  <Sun className="!h-5 !w-5 stroke-[2.5] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute !h-5 !w-5 stroke-[2.5] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </>
            ) : (
              <>
                {/* User Avatar Dropdown (When Authenticated) */}
                <DropdownMenu
                  trigger={
                    <Avatar
                      src={getUserAvatarUrl(user)}
                      initials={user?.username?.charAt(0).toUpperCase() || "U"}
                      size="md"
                      className={cn(
                        "cursor-pointer transition-all duration-300 ring-2",
                        isScrolledPastHero
                          ? "ring-gray-200 dark:ring-gray-700 hover:ring-primary dark:hover:ring-primary"
                          : "ring-white/40 hover:ring-white/60"
                      )}
                    />
                  }
                  align="right"
                >
                  <DropdownMenuItem
                    onClick={() => {
                      window.location.href = "/account";
                    }}
                  >
                    Profile
                  </DropdownMenuItem>
                  
                  {/* Theme Settings Nested Dropdown */}
                  <div className="relative">
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsThemeMenuOpen(!isThemeMenuOpen);
                      }}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center">
                        <Palette className="mr-2 h-4 w-4 stroke-2" />
                        Theme Settings
                      </div>
                      <span className="ml-2 text-xs">›</span>
                    </DropdownMenuItem>
                    
                    {isThemeMenuOpen && (
                      <div className="pl-6 space-y-1 py-1 border-l-2 border-gray-200 dark:border-gray-700 ml-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleThemeChange("light");
                          }}
                          className={cn(
                            "w-full text-left px-3 py-1.5 text-sm rounded-sm transition-colors",
                            theme === "light" 
                              ? "bg-primary/10 text-primary font-medium" 
                              : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                        >
                          <Sun className="mr-2 h-3.5 w-3.5 inline stroke-2" />
                          Light
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleThemeChange("dark");
                          }}
                          className={cn(
                            "w-full text-left px-3 py-1.5 text-sm rounded-sm transition-colors",
                            theme === "dark" 
                              ? "bg-primary/10 text-primary font-medium" 
                              : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                        >
                          <Moon className="mr-2 h-3.5 w-3.5 inline stroke-2" />
                          Dark
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleThemeChange("system");
                          }}
                          className={cn(
                            "w-full text-left px-3 py-1.5 text-sm rounded-sm transition-colors",
                            theme === "system" 
                              ? "bg-primary/10 text-primary font-medium" 
                              : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          )}
                        >
                          <Palette className="mr-2 h-3.5 w-3.5 inline stroke-2" />
                          System
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="mr-2 h-4 w-4 inline stroke-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
    </>
  );
}
