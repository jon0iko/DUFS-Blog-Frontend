'use client';

import React, { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const CTAPoster = React.memo(() => {
  const { isAuthenticated, isLoading } = useAuth();

  // Memoize computed values
  const href = useMemo(() => isAuthenticated ? "/submit" : "/auth/signup", [isAuthenticated]);
  const buttonText = useMemo(() => isAuthenticated ? "Start Writing" : "Sign Up", [isAuthenticated]);

  // Early return if loading
  if (isLoading) return null;

  return (
    <div className="container px-4 md:px-6 mb-6">
      <section className="relative w-full rounded-[20px] md:rounded-[10px] overflow-hidden border border-black/10 px-4 sm:px-8 py-8 flex flex-col items-center justify-center min-h-[250px] bg-[#faf8f6] dark:bg-[#faf8f6]/80">
        {/* LAYER 2: The Grainy GIF - Using BackgroundImage class for optimization */}
        <div
          className="absolute inset-0 w-full h-full mix-blend-multiply  z-10 pointer-events-none grain-bg"
        />

        {/* LAYER 3: The Vignette Mask */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.06)_100%)] z-20 pointer-events-none"></div>

        {/* LAYER 4: Background Logo */}
        {/* <img 
          src="/images/bglogoo.png" 
          alt="" 
          className="hidden lg:block absolute -right-44 top-40 -translate-y-1/2 opacity-40 mix-blend-multiply z-20 pointer-events-none"
          style={{ width: '500px', height: 'auto' }}
        />

        <img 
          src="/images/bglogoleft.png" 
          alt="" 
          className="hidden lg:block absolute -left-52 top-40 -translate-y-1/2 opacity-40 mix-blend-multiply z-20 pointer-events-none"
          style={{ width: '550px', height: 'auto' }}
        /> */}

        {/* CONTENT: Call to action */}
        <div className="relative z-30 text-center flex flex-col items-center  mx-automax-w-lg w-full">
          <span className="text-[10px] sm:text-xs md:text-base uppercase tracking-wider font-bold text-black/60 mb-1 pointer-events-none">
            Contribute to the
          </span>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-black text-[#1a1a1a] mb-6 font-altehaasgrotesk leading-[0.85] tracking-tighter uppercase relative break-words px-2">
            Film Society
            <br /> 
            <span className="text-transparent md:hidden" style={{ WebkitTextStroke: "2px #1a1a1a" }}>Movement</span>
            <span className="text-transparent hidden md:inline" style={{ WebkitTextStroke: "3px #1a1a1a" }}>Movement</span>
          </h2>

          {/* Action Button */}
          <Link 
            href={href}
            className="group relative inline-flex items-center justify-center bg-[#1a1a1a] text-white px-12 py-3 rounded-full font-bold uppercase tracking-widest text-sm overflow-hidden transition-transform duration-300 will-change-transform hover:scale-105 active:scale-95 shadow-xl"
          >
            <span className="relative z-10 transition-transform duration-300">
              {buttonText}
            </span>

          </Link>
        </div>
      </section>
    </div>
  );
});

CTAPoster.displayName = 'CTAPoster';

export default CTAPoster;
