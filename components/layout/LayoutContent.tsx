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
  const isSubmitPage = pathname === '/submit/';

  return (
    <div className="flex min-h-screen flex-col">
      {!isSubmitPage && <Header />}
      <main className="flex-1">{children}</main>
      {!isSubmitPage && <FloatingBanner />}
      {!isSubmitPage && <Footer/> }
    </div>
  );
}
