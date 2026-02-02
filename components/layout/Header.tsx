"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Menu, Search, Moon, Sun, LogIn, X, LogOut } from "lucide-react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const currentScrollY = latest;
    const previousScrollY = lastScrollY.current;
    
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
    setIsMobileSearchActive(false);
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchActive((prevState) => !prevState);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <header 
        className={cn(
          "sticky top-0 z-40 w-full bg-background/95 border-b transition-transform duration-300 ease-in-out",
          !isHeaderVisible && "-translate-y-full"
        )}
      >
        <div className="container pl-6 flex h-16 items-center justify-between gap-4 font-light">
          <div
            className={cn(
              "flex items-center gap-6",
              isMobileSearchActive ? "hidden sm:flex" : "flex"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
              className="hover:bg-gray-100 dark:hover:bg-brand-black-90"
            >
              <Menu className="!w-7 !h-7 stroke-2" />
            </Button>

            <Link href="/" className="flex items-center space-x-2">
              <img src="/images/logoo.png" alt="Logo" className="h-12 w-14" />
            </Link>
          </div>

          {/* Mobile Search Input Area (Visible only when active and < sm) */}
          {isMobileSearchActive && (
            <div className="flex flex-1 items-center gap-2 sm:hidden">
              <SearchBar
                className="flex-1"
                autoFocus
                isMobile
                onClose={() => setIsMobileSearchActive(false)}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileSearch}
                aria-label="Close search"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          )}

          {/* Right Side Actions */}
          <div
            className={cn(
              "flex items-center gap-1 sm:gap-4 justify-end",
              isMobileSearchActive ? "hidden sm:flex" : "flex"
            )}
          >
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-brand-black-90"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="!h-6 !w-6 stroke-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute !h-6 !w-6 stroke-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Search Icon Button (Visible < sm breakpoint) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileSearch}
              aria-label="Search"
              className="sm:hidden hover:bg-gray-100 dark:hover:bg-brand-black-90"
            >
              <Search className="!h-6 !w-6 stroke-2" />
            </Button>

            {/* Desktop Search Input (Visible >= sm breakpoint) */}
            <SearchBar
              className="hidden sm:block w-40 md:w-64 lg:w-80 border rounded border-black"
            />

            {/* Auth Links */}
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/signin"
                  className={cn(
                    "items-center text-base font-bold text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                    "hidden sm:inline-flex"
                  )}
                >
                  <LogIn className="mr-2 h-6 w-6 stroke-2" />
                  <span>SIGN IN</span>
                </Link>
              </div>
            ) : (
              <DropdownMenu
                trigger={
                  <Avatar
                    src={getUserAvatarUrl(user)}
                    initials={user?.username?.charAt(0).toUpperCase() || "U"}
                    size="md"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
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
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="mr-2 h-4 w-4 inline stroke-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenu>
            )}
          </div>
        </div>
        {/* Border below header
        <div className="container flex justify-center">
          <div className="w-full border-t-4 border-gray-900 dark:border-gray-100 shadow-lg rounded-full"></div>
        </div> */}

        <div className="h-2"></div>
      </header>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
    </>
  );
}
