"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, Search, Moon, Sun, LogIn, X, User, LogOut } from "lucide-react"; // Added User and LogOut icons
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import Sidebar from "./Sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth hook

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth(); // Use authentication context
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // --- State for mobile search visibility ---
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null); // Ref for focusing input

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setIsMobileSearchActive(false); // Close search if opening sidebar
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchActive((prevState) => !prevState);
  };

  // Focus input when mobile search becomes active
  useEffect(() => {
    if (isMobileSearchActive && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isMobileSearchActive]);

  // Handle logout action
  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-gray-800">
        <div className="container pl-6 flex h-16 items-center justify-between gap-4 font-light">
          <div
            className={cn(
              "flex items-center gap-6",
              isMobileSearchActive ? "hidden sm:flex" : "flex" // Hide on mobile when search is active
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="!w-7 !h-7 stroke-2" />
            </Button>

            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-foreground">
                DUFS Blog
              </span>
            </Link>
          </div>

          {/* Mobile Search Input Area (Visible only when active and < sm) */}
          {isMobileSearchActive && (
            <div className="flex flex-1 items-center sm:hidden">
              {" "}
              {/* Takes full width on mobile */}
              <Input
                ref={mobileSearchInputRef} // Attach ref
                id="mobile-search-input"
                type="search"
                placeholder="Search..."
                className="h-9 flex-1 rounded-md bg-muted pr-9" // Use flex-1, add padding for X button
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileSearch} // Close action
                className="-ml-9 z-10" // Position X button over the input's end
                aria-label="Close search"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          )}

          {/* Right Side Actions - Conditionally Hidden/Modified on Mobile Search */}
          <div
            className={cn(
              "flex items-center gap-1 sm:gap-4 justify-end",
              isMobileSearchActive ? "hidden sm:flex" : "flex" // Hide container on mobile when search is active
            )}
          >
            {/* Theme Toggle (Always Visible in this section WHEN section is visible) */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="!h-6 !w-6 stroke-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute !h-6 !w-6 stroke-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Auth Links - Different states based on authentication */}
            {!isAuthenticated ? (
              // Not authenticated - show login/signup
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
              // Authenticated - show user info and logout
              <div className="flex items-center gap-3">
                
                <Link href="/account" className="hidden sm:inline-flex items-center text-base font-bold gap-2">
                  <User className="h-6 w-6 stroke-2" />
                  <span className="hidden md:inline-block text-base font-bold">
                  {user?.username}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex font-bold hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={handleLogout}
                >
                  <LogOut className="!h-6 !w-6 stroke-2 mr-2" />
                  <span className="hidden md:inline-block">LOGOUT</span>
                </Button>
              </div>
            )}

            {/* Search Icon Button (Visible < sm breakpoint, triggers mobile search input) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileSearch} // Use toggle function
              aria-label="Search"
              className="sm:hidden hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Search className="!h-6 !w-6 stroke-2" />
            </Button>

            {/* Full Search Input (Visible >= sm breakpoint) */}
            <div className="relative hidden w-32 sm:block sm:w-40 md:w-64 lg:w-80 ml-auto">
              <Search className="absolute left-3 top-1/2 h-5 w-5 stroke-2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="h-10 w-full rounded-md pl-10 bg-background border font-medium"
              />
            </div>
          </div>
        </div>
        {/* Border below header - not full width */}
        <div className="container flex justify-center">
          <div className="w-full border-t-4 border-gray-900 dark:border-gray-100 shadow-lg rounded-full"></div>
        </div>

        {/* Spacing below border */}
        <div className="h-2"></div>
      </header>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
    </>
  );
}
