/**
 * SidebarLoader - Client Component
 * Fetches navigation data from Strapi v5 and passes to Sidebar
 */

'use client';

import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { strapiAPI } from '@/lib/api';

interface SidebarLoaderProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function SidebarLoader({ isOpen, setIsOpen }: SidebarLoaderProps) {
  const [navData, setNavData] = useState([
    { title: 'Home', href: '/', isExternal: false },
    { title: 'Browse', href: '/browse', isExternal: false },
    { title: 'Submit Article', href: '/submit', isExternal: false },
    { title: 'Account', href: '/account', isExternal: false },
  ]);

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const response = await strapiAPI.getNavigationItems();
        const navigationItems = response.data || [];

        const transformed = navigationItems.map(item => ({
          title: item.title || '',
          href: item.href || '',
          isExternal: item.isExternal || false,
        }));

        if (transformed.length > 0) {
          setNavData(transformed);
        }
      } catch (error) {
        console.error('Failed to load navigation:', error);
        // Keep fallback navigation
      }
    };

    fetchNavigation();
  }, []);

  return <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} navigation={navData} />;
}
