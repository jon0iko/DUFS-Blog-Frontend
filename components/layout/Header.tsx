// components/layout/Header.tsx
'use client';

import { useState, useRef, useEffect } from 'react'; // Import useRef, useEffect
import Link from 'next/link';
import { Menu, Search, Moon, Sun, LogIn, X } from 'lucide-react'; // Added X icon
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // --- State for mobile search visibility ---
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null); // Ref for focusing input

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setIsMobileSearchActive(false); // Close search if opening sidebar
  };

  const toggleMobileSearch = () => {
    setIsMobileSearchActive(prevState => !prevState);
  };

  // Focus input when mobile search becomes active
  useEffect(() => {
    if (isMobileSearchActive && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isMobileSearchActive]);


  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-gray-800">
        <div className="container flex h-16 max-w-7xl items-center justify-between gap-4 px-4">

          {/* Left Side: Hamburger & Logo - Conditionally Hidden on Mobile Search */}
          <div className={cn(
            "flex items-center gap-2",
            isMobileSearchActive ? "hidden sm:flex" : "flex" // Hide on mobile when search is active
          )}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </Button>

            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-foreground">DUFS Blog</span>
            </Link>
          </div>

          {/* Mobile Search Input Area (Visible only when active and < sm) */}
          {isMobileSearchActive && (
            <div className="flex flex-1 items-center sm:hidden"> {/* Takes full width on mobile */}
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
          <div className={cn(
            "flex items-center gap-1 sm:gap-3",
            isMobileSearchActive ? "hidden sm:flex" : "flex" // Hide container on mobile when search is active
          )}>

            {/* Theme Toggle (Always Visible in this section WHEN section is visible) */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Login Link (Visible >= sm breakpoint) */}
            <Link
                href="/login"
                className={cn(
                    "items-center text-sm font-medium text-foreground/80 hover:text-foreground transition-colors",
                    "hidden sm:inline-flex"
                )}
            >
               <LogIn className="mr-1 h-4 w-4" />
                LOG IN
            </Link>

            {/* Search Icon Button (Visible < sm breakpoint, triggers mobile search input) */}
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileSearch} // Use toggle function
                aria-label="Search"
                className="sm:hidden" // Only show below sm
            >
                <Search className="h-5 w-5" />
            </Button>

            {/* Full Search Input (Visible >= sm breakpoint) */}
            <div className="relative hidden w-32 sm:block md:w-48">
               <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
               <Input
                  type="search"
                  placeholder="Search..."
                  className="h-9 w-full rounded-md pl-8 bg-background border"
               />
            </div>
          </div>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
    </>
  );
}