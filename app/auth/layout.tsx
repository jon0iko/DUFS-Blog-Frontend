'use client';

import React from 'react';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center px-4 py-12 bg-gradient-to-br from-muted to-muted/50 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        {/* Logo and Slogan Section */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/Dufs_logo.png"
              alt="DUFS Logo"
              width={80}
              height={80}
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">DUFS Blog</h1>
          <p className="text-lg font-semibold text-primary tracking-wide">
            Better Film Better Viewers
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card dark:bg-card rounded-xl shadow-xl border border-border dark:border-border p-8 backdrop-blur-sm">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 DUFS Blog. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}