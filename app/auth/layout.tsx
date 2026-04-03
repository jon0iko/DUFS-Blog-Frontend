'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const isSessionEnded = reason === 'session-ended';
  const redirectUrl = searchParams.get('redirect');

  const handleNavigate = () => {
    if (isSessionEnded) {
      router.push('/');
    } else {
      // Always try to go back in browser history when canceling login
      router.back();
      
      // Fallback after a short delay if history is empty
      setTimeout(() => {
        if (window.history.length <= 1) {
          router.push('/');
        }
      }, 100);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Full-bleed background image — desktop */}
      <Image
        src="/images/Authbg.webp"
        alt=""
        fill
        priority
        className=" object-cover object-center select-none pointer-events-none"
        quality={90}
      />
      {/* Full-bleed background image — mobile */}
      {/* <Image
        src="/images/Authbg_mobile.webp"
        alt=""
        fill
        priority
        className="md:hidden object-cover object-center select-none pointer-events-none"
        quality={90}
      /> */}

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Top-left back/home button */}
      <button
        onClick={handleNavigate}
        className="absolute top-4 left-4 z-20 md:top-5 md:left-5 flex items-center gap-1.5 text-white/70 hover:text-white transition-colors duration-200 group"
      >
        {isSessionEnded ? (
          <>
          <ArrowLeft className="w-4 h-4 md:w-4 md:h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span className="text-xs md:text-sm font-medium uppercase tracking-widest">Home</span>
          </>
        ) : (
          <>
            <ArrowLeft className="w-4 h-4 md:w-4 md:h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span className="text-xs md:text-sm font-medium uppercase tracking-widest">Back</span>
          </>
        )}
      </button>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Slogan Section */}
        {/* <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/Dufs_logo.png"
              alt="DUFS Logo"
              width={80}
              height={80}
              className="w-20 h-20 object-contain brightness-0 invert"
            />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">DUFS Blog</h1>
          <p className="text-sm font-medium text-white/50 tracking-[0.2em] uppercase">
            Better Film Better Viewers
          </p>
        </div> */}

        {/* Form Card */}
        <div className="bg-black/85 md:bg-black/60 md:backdrop-blur-2xl rounded-xl border border-white/10 p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)]">
          {children}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white/80  uppercase">
            © {new Date().getFullYear()} DUFS.<span className="md:hidden"><br /></span> All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}