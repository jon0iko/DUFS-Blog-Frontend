/**
 * SidebarLoader - Server Component
 * Fetches navigation data from Strapi v5 and passes to Sidebar
 */

import Sidebar from './Sidebar';
import { serverStrapiAPI } from '@/lib/server-api';

interface SidebarLoaderProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default async function SidebarLoader({ isOpen, setIsOpen }: SidebarLoaderProps) {
  try {
    // Strapi v5: getNavigationItems returns NavigationResponse with data array
    const response = await serverStrapiAPI.getNavigationItems();
    const navigationItems = response.data;

    // Transform to navigation format, handling Strapi v5 flat structure
    const navData = navigationItems.map(item => ({
      title: item.title || '',
      href: item.href || '',
      isExternal: item.isExternal || false,
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
