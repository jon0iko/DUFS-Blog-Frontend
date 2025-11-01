/**
 * SidebarLoader - Server Component
 * Fetches navigation data from Strapi and passes to Sidebar
 */

import Sidebar from './Sidebar';
import { serverStrapiAPI } from '@/lib/server-api';
import type { NavigationItem } from '@/types';

interface SidebarLoaderProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default async function SidebarLoader({ isOpen, setIsOpen }: SidebarLoaderProps) {
  try {
    const response = await serverStrapiAPI.getNavigationItems();
    const navigationItems = Array.isArray(response.data) ? response.data : [response.data];

    const navData = (navigationItems as NavigationItem[]).map(item => ({
      title: typeof item === 'object' && 'title' in item ? (item as any).title : '',
      href: typeof item === 'object' && 'href' in item ? (item as any).href : '',
      isExternal: typeof item === 'object' && 'isExternal' in item ? (item as any).isExternal : false,
    }));

    return <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} navigation={navData} />;
  } catch (error) {
    console.error('Failed to load navigation:', error);
    // Fallback navigation
    const fallbackNav = [
      { title: 'Home', href: '/', isExternal: false },
      { title: 'Browse', href: '/browse', isExternal: false },
      { title: 'Submit Article', href: '/submit', isExternal: false },
      { title: 'Account', href: '/account', isExternal: false },
    ];
    return <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} navigation={fallbackNav} />;
  }
}
