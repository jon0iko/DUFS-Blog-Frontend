'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingBanner from '@/components/layout/FloatingBanner';
import { ReactNode } from 'react';

interface LayoutContentProps {
  children: ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const isEditorPage = pathname === '/editor' || pathname === '/editor/';
  const isAuthPage = pathname.startsWith('/auth/');

  return (
    <div className="flex min-h-screen flex-col">
      {!isEditorPage && !isAuthPage && <Header />}
      <main className="flex-1">{children}</main>
      {!isEditorPage && !isAuthPage && <FloatingBanner />}
      {!isEditorPage && !isAuthPage && <Footer/> }
    </div>
  );
}
