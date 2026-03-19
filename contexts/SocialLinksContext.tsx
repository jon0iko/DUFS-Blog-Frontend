'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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

let socialLinksCache: UISocialLink[] | null = null;
let socialLinksPromise: Promise<UISocialLink[]> | null = null;

async function fetchSocialLinksOnce(): Promise<UISocialLink[]> {
  if (socialLinksCache) {
    return socialLinksCache;
  }

  if (!socialLinksPromise) {
    socialLinksPromise = (async () => {
      try {
        const links = await strapiAPI.getSocialLinks();
        socialLinksCache = links.length > 0 ? links : fallbackSocialLinkData;
      } catch (error) {
        console.error('Failed to fetch social links from Strapi:', error);
        socialLinksCache = fallbackSocialLinkData;
      } finally {
        socialLinksPromise = null;
      }

      return socialLinksCache;
    })();
  }

  return socialLinksPromise;
}

export function SocialLinksProvider({ children }: { children: ReactNode }) {
  const [socialLinks, setSocialLinks] = useState<UISocialLink[]>(socialLinksCache ?? fallbackSocialLinkData);
  const [isLoading, setIsLoading] = useState<boolean>(!socialLinksCache);

  useEffect(() => {
    let mounted = true;

    const loadSocialLinks = async () => {
      setIsLoading(true);
      const links = await fetchSocialLinksOnce();

      if (mounted) {
        setSocialLinks(links);
        setIsLoading(false);
      }
    };

    loadSocialLinks();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshSocialLinks = useCallback(async () => {
    setIsLoading(true);

    try {
      const links = await strapiAPI.getSocialLinks();
      const nextLinks = links.length > 0 ? links : fallbackSocialLinkData;
      socialLinksCache = nextLinks;
      setSocialLinks(nextLinks);
    } catch (error) {
      console.error('Failed to refresh social links from Strapi:', error);
      socialLinksCache = fallbackSocialLinkData;
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
