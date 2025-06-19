'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-muted/30">
      <Card className="w-full max-w-md p-6 shadow-lg">
        {children}
      </Card>
    </div>
  );
}