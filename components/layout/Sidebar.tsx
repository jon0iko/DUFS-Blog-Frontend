// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { navigation, socialLinks } from '@/data/dummy-data'; // Adjust path if needed
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
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
          "overflow-y-auto", // *** Apply scrolling to the entire aside ***
          "transition-transform duration-300 ease-in-out", // Animation
          isOpen ? 'translate-x-0' : '-translate-x-full' // Control visibility
        )}
        aria-label="Sidebar Navigation"
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