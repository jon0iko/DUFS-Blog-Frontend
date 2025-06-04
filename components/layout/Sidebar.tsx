// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { X, LogIn, LogOut, User, UserPlus } from 'lucide-react';
import { navigation, socialLinks } from '@/data/dummy-data'; // Adjust path if needed
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth hook

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const { isAuthenticated, user, logout } = useAuth(); // Use authentication context
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-45 bg-black/50 backdrop-blur-sm md:hidden" // Keep overlay logic as is, usually just for mobile
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar itself */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-screen w-80 flex-shrink-0 ", // Increased width from w-64 to w-80
          "flex flex-col border-r-4 border-r-gray-800 dark:border-r-white bg-background p-6 shadow-lg ", // Added bold right border with white color in dark mode
          "overflow-y-auto scrollbar-hide", // Added scrollbar-hide to hide the scrollbar
          "transition-transform duration-300 ease-in-out", // Animation
          isOpen ? 'translate-x-0' : '-translate-x-full' // Control visibility
        )}
        aria-label="Sidebar Navigation"
        style={{ 
          // CSS to hide scrollbars but keep scrolling functionality
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none' // IE and Edge
        }}
      >
        {/* Header section (will now scroll with content if needed) */}
        {/* Use flex-shrink-0 to prevent shrinking if content is very long */}
        <div className="mb-8 flex flex-shrink-0 items-center justify-between">
          <Link href="/" onClick={closeSidebar} className="flex items-center space-x-2">
              <span className="font-bold text-xl text-foreground">
                DUFS Blog Logo
              </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSidebar}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close sidebar"
          >
            <X className='!h-6 !w-6' />
          </Button>
        </div>

        {/* User Authentication Section */}
        {isAuthenticated ? (
          <div className="mb-6 py-3 px-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">{user?.username}</p>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center mt-3 space-x-2">
              <Link href="/account" className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="sm"
                  onClick={closeSidebar}
                >
                  <User className="mr-2 h-4 w-4" /> Account
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                className="flex-1 justify-start" 
                size="sm"
                onClick={() => {
                  logout();
                  closeSidebar();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-6 flex items-center space-x-2">
            <Link href="/auth/signin" onClick={closeSidebar} className="flex-1">
              <Button variant="outline" className="w-full">
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </Button>
            </Link>
            
            <Link href="/auth/signup" onClick={closeSidebar} className="flex-1">
              <Button variant="default" className="w-full">
                <UserPlus className="mr-2 h-4 w-4" /> Sign Up
              </Button>
            </Link>
          </div>
        )}

        {/* Navigation Section (will now scroll) */}
        {/* Removed flex-grow and overflow-y-auto from nav */}
        <nav className="flex-shrink-0">
          <ul className="space-y-5">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeSidebar}
                  className="block text-lg font-medium text-foreground/90 hover:text-background hover:bg-gray-900 dark:hover:bg-gray-300 py-2 px-4 -mx-4 rounded transition-colors"
                >
                   {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section (Separator, Social, etc. - will now scroll) */}
        {/* Use mt-6 or similar for spacing instead of relying on flex-grow */}
        <div className="mt-6 flex-shrink-0">
          <Separator className="" /> {/* Removed my-6, rely on parent div margin */}

          {/* Social Links Section */}
          <div className="mt-6"> {/* Added margin-top */}
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <Link
                  key={link.platform}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Visit our ${link.platform} page`}
                >
                  {link.icon ? (
                      <Image
                        src={link.icon} alt={`${link.platform} icon`}
                        width={24} height={24} className="h-6 w-6"
                      />
                  ) : (
                    <span className='uppercase text-xs'>{link.platform}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}