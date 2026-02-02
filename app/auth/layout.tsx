'use client';

import React from 'react';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-secondary via-background to-secondary dark:from-brand-black dark:via-brand-black-80 dark:to-brand-black-60">
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
          <p className="text-lg font-semibold text-muted-foreground tracking-wide">
            Better Film Better Viewers
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card backdrop-blur-sm rounded-xl shadow-2xl border border-border p-8">
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