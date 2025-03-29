// components/layout/Header.tsx
'use client'; // Header needs to be a client component for state and theme

import { useState } from 'react'; // Import useState
import Link from 'next/link';
import { Menu, Search, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import Sidebar from './Sidebar'; // Import the Sidebar component

export default function Header() {
  const { theme, setTheme } = useTheme();
  // --- State for sidebar visibility ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Toggle function inside Header ---
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <> {/* Use Fragment to render Header and Sidebar side-by-side in the DOM tree */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-gray-800">
        <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            {/* --- Button to toggle sidebar - ALWAYS VISIBLE --- */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar} // Use the local toggle function
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </Button>

            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-foreground sm:inline-block">
                DUFS Blog Logo
              </span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Theme Toggle */}
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

            {/* Login Link */}
            <Link href="/login" className="text-sm font-medium text-foreground/80 hover:text-foreground">
              LOG IN
            </Link>

            {/* Search Input */}
            <div className="relative w-32 md:w-48">
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

      {/* --- Render Sidebar conditionally or always, controlled by CSS --- */}
      {/* Pass state and setter down to Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
    </>
  );
}