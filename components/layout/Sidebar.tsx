// components/layout/Sidebar.tsx
'use client'; // Keep 'use client' for onClick handlers

import Link from 'next/link';
import { X } from 'lucide-react';
import { navigation, socialLinks } from '@/data/dummy-data'; // Adjust path if needed
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button'; // Import Button for close
import Image from 'next/image';
import { cn } from '@/lib/utils';

// --- Props Interface ---
interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {

  // Function to close sidebar, e.g., on link click
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Optional: Overlay for dimming content when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-45 bg-black/50 backdrop-blur-sm md:hidden" // Show overlay only below md? Adjust if needed
          onClick={closeSidebar} // Close sidebar when clicking overlay
          aria-hidden="true"
        />
      )}

      {/* Sidebar itself */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 h-screen w-64 flex-shrink-0 ", // Positioning & Size
          "flex flex-col border-r bg-background p-6 shadow-lg ", // Structure, Style
          "transition-transform duration-300 ease-in-out", // Animation
          isOpen ? 'translate-x-0' : '-translate-x-full' // Control visibility
        )}
        aria-label="Sidebar Navigation"
      >
        {/* Header section with Close button */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" onClick={closeSidebar} className="flex items-center space-x-2">
              <span className="font-bold text-xl text-foreground">
                DUFS Blog Logo
              </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSidebar} // Use the function
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close sidebar"
          >
            <X size={24} />
          </Button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-grow overflow-y-auto"> {/* Allow scrolling if content overflows */}
          <ul className="space-y-3">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeSidebar} // Close sidebar on navigation
                  className="block text-base font-medium text-foreground/80 hover:text-foreground transition-colors"
                >
                   {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Separator className="my-6" />

        {/* Social Links Section */}
        <div className="">
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
      </aside>
    </>
  );
}