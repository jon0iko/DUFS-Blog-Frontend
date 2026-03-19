// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { X, LogIn, LogOut, User, UserPlus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth hook
import { getUserAvatarUrl } from '@/lib/auth'; // Import avatar helper
import { useTheme } from 'next-themes';
import { Sun, Moon, Palette } from 'lucide-react';
import { useRef } from 'react';
import { useSocialLinks } from '@/contexts/SocialLinksContext';

interface NavigationItem {
  title: string;
  href: string;
  isExternal?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  navigation?: NavigationItem[];
}

export default function Sidebar({ isOpen, setIsOpen, navigation = [] }: SidebarProps) {
  const { isAuthenticated, user, logout } = useAuth(); // Use authentication context
  const { socialLinks } = useSocialLinks();
  const { theme, setTheme } = useTheme();
  const closeSidebar = () => setIsOpen(false);

  // Swipe-to-close gesture
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (delta > 60) {
      closeSidebar();
    }
    touchStartX.current = null;
  };

  // Fallback navigation if none provided
  const navItems = navigation.length > 0 ? navigation : [
    { title: 'Home', href: '/' },
    { title: 'Browse', href: '/browse' },
    { title: 'Write Content', href: '/submit' },
    { title: 'Publications', href: '/publications' },
  ];

  // Theme pill switcher
  const ThemePill = () => (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground font-medium">Theme</span>
      <div className="flex rounded-full border border-border overflow-hidden">
        {([
          { value: 'light', icon: Sun, label: 'Light' },
          { value: 'dark', icon: Moon, label: 'Dark' },
          { value: 'system', icon: Palette, label: 'System' },
        ] as const).map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              'flex items-center gap-1 px-2 py-1.5 text-xs font-medium transition-colors',
              theme === value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
            aria-label={label}
          >
            <Icon className="h-3 w-3 stroke-2" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[59] bg-black/50 backdrop-blur-sm md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar itself */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[60] h-[100dvh]",
          "w-full min-[375px]:w-[85vw] sm:w-80",
          "flex flex-col border-r-4 border-r-gray-800 dark:border-r-brand-accent bg-background p-6 shadow-lg ",
          "overflow-y-auto scrollbar-hide",
          "transition-transform duration-300 ease-in-out",
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Sidebar Navigation"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 24px))',
        }}
      >
        {/* Header section (will now scroll with content if needed) */}
        {/* Use flex-shrink-0 to prevent shrinking if content is very long */}
        <div className="mb-4 flex flex-shrink-0 items-center justify-between">
          <Link href="/" onClick={closeSidebar} className="flex items-center space-x-2">
              <img 
                src="/images/logoo.png" 
                alt="DUFS Blog Logo" 
                className="h-16 w-16 p-2 rounded-3xl object-contain" 
              />
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
          // Auth state: User card
          <div className="mb-5 rounded-2xl border border-border/60 bg-gradient-to-br from-muted/70 via-muted/40 to-background/80 p-4 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.75)] backdrop-blur-sm">
            

            <div className="mb-4 flex items-center gap-3">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-brand-accent/70 ring-2 ring-background/80">
                <Image
                  src={getUserAvatarUrl(user)}
                  alt={user?.username || 'User'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold leading-none text-foreground">
                  {user?.username}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <Link href="/account" className="flex-1" onClick={closeSidebar}>
                <Button
                  variant="outline"
                  className="h-9 w-full justify-center border-border/70 bg-background/80 font-medium hover:bg-background"
                  size="sm"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                className="h-9 flex-1 justify-center border border-transparent font-medium text-red-600 hover:border-red-200 hover:bg-red-50/80 dark:text-red-400 dark:hover:border-red-900/40 dark:hover:bg-red-900/20" 
                size="sm"
                onClick={() => { logout(); closeSidebar(); }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
          </div>
        ) : (
          // Non-auth state: CTA card
          <div className="mb-6 rounded-lg border border-border p-4">
            <p className="text-sm font-semibold text-foreground mb-1">New here?</p>
            <p className="text-xs text-muted-foreground mb-3">Join the DUFS community</p>
            <div className="flex flex-col gap-2">
              <Link href="/auth/signin" onClick={closeSidebar} className="w-full">
                <Button variant="outline" className="w-full justify-center">
                  <LogIn className="mr-0 h-4 w-4" /> Sign In
                </Button>
              </Link>
              <Link href="/auth/signup" onClick={closeSidebar} className="w-full">
                <Button variant="default" className="w-full justify-center">
                  <UserPlus className="mr-0 h-4 w-4" /> Create Account
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className='md:hidden mt-0 mb-8 flex-shrink-0'>
          <ThemePill />
        </div>

        {/* Navigation Section */}
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            {isAuthenticated ? 'Navigate' : 'Explore'}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <nav className="flex-shrink-0 mb-2">
          <ul className="space-y-5">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeSidebar}
                  target={item.isExternal ? '_blank' : undefined}
                  rel={item.isExternal ? 'noopener noreferrer' : undefined}
                  className="block text-lg font-medium text-foreground/90 hover:text-background hover:bg-brand-black-90 dark:hover:bg-white py-2 px-4 -mx-4 rounded transition-colors"
                >
                   {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="mt-6 flex-shrink-0 space-y-6">
          <Separator />
          {/* Social Links Section */}
          <div className="flex space-x-4">
            {socialLinks.map((link) => (
              <Link
                key={link.platform}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white hover:bg-muted-foreground/50 text-background dark:text-foreground hover:text-foreground transition-all duration-200"
                aria-label={`Visit our ${link.platform} page`}
              >
                {typeof link.icon === 'string' && link.icon ? (
                    // External Strapi icon URLs are rendered with img for flexible host support.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={link.icon} alt={`${link.platform} icon`}
                      className="h-6 w-6 object-contain"
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