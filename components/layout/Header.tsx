"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Moon, Sun, LogIn, UserPlus, LogOut, Palette, Search, X, SquareUserRound, User, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import Sidebar from "./Sidebar";
import HeaderSearchInput from "./HeaderSearchInput";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import Avatar from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { getUserAvatarUrl } from '@/lib/auth'; 
import { gsap } from "@/lib/gsap";
import { strapiAPI } from "@/lib/api";
import { useToast } from "@/components/ui/toast";


export default function Header() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const isHomePage = pathname === '/' || pathname === '';
  const toast = useToast();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportIssueText, setReportIssueText] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Ref for GSAP-driven header show/hide
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const isVisible = useRef(true);

  // Initialize hero-background state
  useEffect(() => {
    if (isHomePage && typeof window !== 'undefined') {
      const currentScrollY = window.scrollY;
      const carouselHeight = window.innerHeight * 0.80 + 4;
      setIsScrolledPastHero(currentScrollY > carouselHeight);
    } else {
      setIsScrolledPastHero(true);
    }
  }, [isHomePage]);

  // GSAP hide/show animation + background tracking — single passive scroll listener
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const onScroll = () => {
      const currentScrollY = window.scrollY;

      // Hero threshold
      if (isHomePage) {
        const carouselHeight = window.innerHeight * 0.80 + 4;
        setIsScrolledPastHero(currentScrollY > carouselHeight);
      } else {
        setIsScrolledPastHero(true);
      }

      // GSAP-driven hide / reveal — direction-aware with refined easing
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        if (isVisible.current) {
          isVisible.current = false;
          gsap.to(header, {
            yPercent: -100,
            duration: 0.4,
            ease: "power2.in",
            overwrite: true,
          });
        }
      } else if (currentScrollY < lastScrollY.current) {
        if (!isVisible.current) {
          isVisible.current = true;
          gsap.to(header, {
            yPercent: 0,
            duration: 0.55,
            ease: "power3.out",
            overwrite: true,
          });
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomePage]);

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

  const handleSignIn = useCallback(() => {
    const currentPath = window.location.pathname + window.location.search + window.location.hash;
    window.location.href = `/auth/signin?redirect=${encodeURIComponent(currentPath)}`;
  }, []);

  const handleReportIssue = async () => {
    if (!reportIssueText.trim()) return;

    setIsSubmittingReport(true);
    try {
      await strapiAPI.createUserRequestReport({
        section: "IssueReportHome",
        description: reportIssueText,
        userId: user?.id,
      });
      toast.success("Your report has been submitted successfully.");
      setIsReportModalOpen(false);
      setReportIssueText("");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit your report.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <>
      <header 
        ref={headerRef}
        className={cn(
          "top-0 z-50 w-full border-b transition-colors duration-300",
          isHomePage ? "fixed" : "sticky",
          isScrolledPastHero 
            ? "bg-background backdrop-blur-md border-border shadow-lg" 
            : "border-transparent"
        )}
      >
        <div className="container flex h-16 items-center justify-between gap-2 px-4 md:gap-6 md:px-6">

          {/* Mobile inline search takeover */}
          {isSearchOpen && (
            <div className="flex md:hidden items-center gap-2 w-full">
              <HeaderSearchInput
                className="flex-1"
                inputClassName={cn(
                  isScrolledPastHero
                    ? "bg-background text-foreground placeholder:text-muted-foreground"
                    : "bg-white/15 backdrop-blur-md text-white placeholder:text-white/80"
                )}
                isOverlay={!isScrolledPastHero}
                autoFocus
                onClose={() => setIsSearchOpen(false)}
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close search"
                onClick={() => setIsSearchOpen(false)}
                className={cn(
                  "flex-shrink-0 transition-colors duration-300",
                  isScrolledPastHero
                    ? "hover:bg-gray-100 dark:hover:bg-brand-black-90"
                    : "text-white hover:bg-white/20"
                )}
              >
                <X className="!h-5 !w-5 stroke-[2.5]" />
              </Button>
            </div>
          )}

          {/* Left Zone: Hamburger + Logo — hidden on mobile when search is open */}
          <div className={cn("flex items-center gap-2 md:gap-4 flex-shrink-0", isSearchOpen && "hidden md:flex")}>
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

            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <img 
                src="/images/logoo.png" 
                alt="DUFS Blog Logo" 
                className="h-10 w-12  object-contain" 
              />
              <span 
                className={cn(
                  "text-xl md:text-2xl font-black tracking-tight transition-colors duration-300 font-montserrat",
                  isScrolledPastHero 
                    ? "text-foreground" 
                    : "text-white drop-shadow-lg"
                )}
              >
                DUFS Blog
              </span>
            </Link>
          </div>

          {/* Right Zone: Search + Auth Actions — hidden on mobile when search is open */}
          <div className={cn("flex items-center gap-2 md:gap-3 flex-1 justify-end md:max-w-3xl", isSearchOpen && "hidden md:flex")}>
            {/* Desktop Search Bar — hidden on mobile */}
            <HeaderSearchInput
              className="hidden md:block w-full max-w-md transition-all duration-300"
              inputClassName={cn(
                isScrolledPastHero 
                  ? "bg-background border-black dark:border-input text-foreground placeholder:text-muted-foreground" 
                  : "bg-white/15 backdrop-blur-md border-white/30 text-white placeholder:text-white/80"
              )}
              isOverlay={!isScrolledPastHero}
            />

            {/* Mobile Search Icon Button — hidden on md+ */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "flex md:hidden flex-shrink-0 transition-colors duration-300",
                isScrolledPastHero 
                  ? "hover:bg-gray-100 dark:hover:bg-brand-black-90" 
                  : "text-white hover:bg-white/20"
              )}
              aria-label="Search"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="!h-5 !w-5 stroke-[2.5]" />
            </Button>

            {!isAuthenticated ? (
              <>
                {/* Login Button — hidden on mobile */}
                <Button
                  onClick={handleSignIn}
                  variant="ghost"
                  className={cn(
                    "hidden md:flex items-center gap-2 font-semibold transition-all duration-300 whitespace-nowrap",
                    isScrolledPastHero 
                      ? "text-foreground hover:bg-gray-100 dark:hover:bg-brand-black-90" 
                      : "text-white hover:bg-white/20"
                  )}
                >
                  <LogIn className="h-5 w-5 stroke-[2.5]" />
                  <span className="hidden lg:inline">Log In</span>
                </Button>

                {/* Sign Up Button — hidden on mobile */}
                <Button
                  asChild
                  className={cn(
                    "hidden md:flex items-center gap-2 font-semibold transition-all duration-300 whitespace-nowrap",
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

                {/* Theme Toggle — hidden on mobile (moved to sidebar) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "hidden md:flex transition-colors duration-300 flex-shrink-0",
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
                      size="sm"
                      className={cn(
                        "cursor-pointer border border-foreground/50 hover:border-foreground transition-all duration-300 md:w-10 md:h-10 md:text-sm",
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
                    <div className="flex items-center ">
                    <User className="h-4 w-4 stroke-2 mr-2"/>
                    <span className="font-bold">Profile</span>
                    </div>
                  </DropdownMenuItem>
                  
                  {/* Theme Settings Nested Dropdown */}
                  <div className="relative">
                    <DropdownMenuItem
                      onSelect={(e:any) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e:any) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsThemeMenuOpen(!isThemeMenuOpen);
                      }}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center">
                        <Palette className="mr-2 h-4 w-4 stroke-2" />
                        <span className="font-bold">Theme Settings</span>
                      </div>
                      <span className="ml-2 text-xs font-bold">›</span>
                    </DropdownMenuItem>
                    
                    {isThemeMenuOpen && (
                      <div className="pl-6 space-y-1 py-1 border-l-2 border-border ml-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleThemeChange("light");
                          }}
                          className={cn(
                            "w-full text-left px-3 py-1.5 text-sm rounded-sm transition-colors font-bold",
                            theme === "light" 
                              ? "bg-primary/10 text-primary" 
                              : "hover:bg-gray-100 dark:hover:bg-brand-black-90"
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
                            "w-full text-left px-3 py-1.5 text-sm rounded-sm transition-colors font-bold",
                            theme === "dark" 
                              ? "bg-primary/10 text-primary" 
                              : "hover:bg-gray-100 dark:hover:bg-brand-black-90"
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
                            "w-full text-left px-3 py-1.5 text-sm rounded-sm transition-colors font-bold",
                            theme === "system" 
                              ? "bg-primary/10 text-primary" 
                              : "hover:bg-gray-100 dark:hover:bg-black-90"
                          )}
                        >
                          <Palette className="mr-2 h-3.5 w-3.5 inline stroke-2" />
                          System
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border my-1"></div>
                  <DropdownMenuItem
                    onClick={() => setIsReportModalOpen(true)}
                    className="text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4 inline stroke-2" />
                    <span className="font-bold">Report Issue</span>
                  </DropdownMenuItem>

                  <div className="border-t border-border my-1"></div>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="mr-2 h-4 w-4 inline stroke-2" />
                    <span className="font-bold">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Report Issue Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-background border border-border p-6 md:p-8 rounded-lg shadow-lg animate-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold uppercase tracking-widest text-foreground">Report Issue</h3>
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 hover:bg-foreground/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed font-medium">
              Please describe the issue you encountered. We will review and take action.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/60 mb-1.5">
                  Issue Description
                </label>
                <textarea
                  value={reportIssueText}
                  onChange={(e) => setReportIssueText(e.target.value)}
                  placeholder="Describe the issue you're experiencing..."
                  rows={4}
                  className="w-full bg-muted border-2 border-foreground/10 focus:border-foreground/30 rounded-sm py-3 px-4 outline-none transition-all text-sm font-medium resize-none"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={handleReportIssue}
                  disabled={!reportIssueText.trim() || isSubmittingReport}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold uppercase tracking-wide text-xs rounded-md transition-colors disabled:opacity-50"
                >
                  {isSubmittingReport ? "Submitting..." : "Submit Report"}
                </button>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="w-full py-2.5 bg-muted hover:bg-muted/80 text-foreground font-semibold uppercase tracking-wide text-xs rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
