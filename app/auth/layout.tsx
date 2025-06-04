'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-muted/30">
      <div className="mb-8">
        <Link href="/" className="flex items-center justify-center">
          <h1 className="text-3xl font-bold">DUFS Blog</h1>
        </Link>
      </div>
      
      <Card className="w-full max-w-md p-6 shadow-lg">
        {children}
      </Card>
    </div>
  );
}