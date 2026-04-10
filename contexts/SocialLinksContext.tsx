'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { socialLinks as fallbackSocialLinks } from '@/data/dummy-data';
import { strapiAPI, type UISocialLink } from '@/lib/api';

interface SocialLinksContextType {
  socialLinks: UISocialLink[];
  isLoading: boolean;
  refreshSocialLinks: () => Promise<void>;
}

const SocialLinksContext = createContext<SocialLinksContextType | undefined>(undefined);

const fallbackSocialLinkData: UISocialLink[] = fallbackSocialLinks.map((link, index) => ({
  id: index + 1,
  platform: link.platform,
  href: link.href,
  icon: typeof link.icon === 'string' ? link.icon : undefined,
}));

const SOCIAL_LINKS_CACHE_KEY = 'dufs_social_links_cache';
const SOCIAL_LINKS_TIMESTAMP_KEY = 'dufs_social_links_cache_time';
const CACHE_DURATION_HOURS = 24; // Cache for 24 hours

let socialLinksPromise: Promise<UISocialLink[]> | null = null;

function getCachedSocialLinks(): UISocialLink[] | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(SOCIAL_LINKS_CACHE_KEY);
    const timestamp = localStorage.getItem(SOCIAL_LINKS_TIMESTAMP_KEY);
    
    if (!cached || !timestamp) return null;
    
    const cacheAge = Date.now() - parseInt(timestamp, 10);
    const cacheExpired = cacheAge > CACHE_DURATION_HOURS * 60 * 60 * 1000;
    
    if (cacheExpired) {
      localStorage.removeItem(SOCIAL_LINKS_CACHE_KEY);
      localStorage.removeItem(SOCIAL_LINKS_TIMESTAMP_KEY);
      return null;
    }
    
    return JSON.parse(cached) as UISocialLink[];
  } catch (error) {
    console.error('Failed to read social links from cache:', error);
    return null;
  }
}

function setCachedSocialLinks(links: UISocialLink[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SOCIAL_LINKS_CACHE_KEY, JSON.stringify(links));
    localStorage.setItem(SOCIAL_LINKS_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Failed to write social links to cache:', error);
  }
}

async function fetchSocialLinksOnce(): Promise<UISocialLink[]> {
  const cached = getCachedSocialLinks();
  if (cached) {
    return cached;
  }

  if (!socialLinksPromise) {
    socialLinksPromise = (async () => {
      try {
        const links = await strapiAPI.getSocialLinks();
        const result = links.length > 0 ? links : fallbackSocialLinkData;
        setCachedSocialLinks(result);
        return result;
      } catch (error) {
        console.error('Failed to fetch social links from Strapi:', error);
        return fallbackSocialLinkData;
      } finally {
        socialLinksPromise = null;
      }
    })();
  }

  return socialLinksPromise;
}

export function SocialLinksProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  const [socialLinks, setSocialLinks] = useState<UISocialLink[]>(fallbackSocialLinkData);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    const loadSocialLinks = async () => {
      // On homepage, always fetch fresh data (bypass cache)
      if (isHomePage) {
        setIsLoading(true);
        
        // Clear old cache to force refresh
        if (typeof window !== 'undefined') {
          localStorage.removeItem(SOCIAL_LINKS_CACHE_KEY);
          localStorage.removeItem(SOCIAL_LINKS_TIMESTAMP_KEY);
        }
        
        const links = await fetchSocialLinksOnce();
        
        if (mounted) {
          setSocialLinks(links);
          setIsLoading(false);
        }
      } else {
        // On other pages, try cache first
        setIsLoading(true);
        const cached = getCachedSocialLinks();
        
        if (cached) {
          // Use cached data immediately
          if (mounted) {
            setSocialLinks(cached);
            setIsLoading(false);
          }
        } else {
          // If no cache, fetch and cache
          const links = await fetchSocialLinksOnce();
          
          if (mounted) {
            setSocialLinks(links);
            setIsLoading(false);
          }
        }
      }
    };

    loadSocialLinks();

    return () => {
      mounted = false;
    };
  }, [isHomePage]);

  const refreshSocialLinks = useCallback(async () => {
    setIsLoading(true);

    try {
      const links = await strapiAPI.getSocialLinks();
      const nextLinks = links.length > 0 ? links : fallbackSocialLinkData;
      setCachedSocialLinks(nextLinks);
      setSocialLinks(nextLinks);
    } catch (error) {
      console.error('Failed to refresh social links from Strapi:', error);
      setSocialLinks(fallbackSocialLinkData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      socialLinks,
      isLoading,
      refreshSocialLinks,
    }),
    [socialLinks, isLoading, refreshSocialLinks]
  );

  return <SocialLinksContext.Provider value={value}>{children}</SocialLinksContext.Provider>;
}

export function useSocialLinks() {
  const context = useContext(SocialLinksContext);

  if (!context) {
    throw new Error('useSocialLinks must be used within a SocialLinksProvider');
  }

  return context;
}
