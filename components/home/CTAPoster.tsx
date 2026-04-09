'use client';

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const CTAPoster = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="container px-4 md:px-6 mb-6">
      <section className="relative w-full rounded-[20px] overflow-hidden border border-black/10 px-4 sm:px-8 py-8 flex flex-col items-center justify-center min-h-[250px]">
        {/* LAYER 1: Solid Base (Fallback) */}
        <div className="absolute inset-0 bg-[#faf8f6]  z-0"></div>

        {/* LAYER 2: The Grainy GIF */}
        <div
          className="absolute inset-0 w-full h-full mix-blend-multiply z-10 pointer-events-none"
          style={{
            backgroundImage: "url('/images/grain.gif')",
            backgroundRepeat: "repeat",
            backgroundSize: "auto"
          }}
        />

      {/* LAYER 3: The Vignette Mask - Subtly dims edges to pull focus center */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.06)_100%)] z-20 pointer-events-none"></div>

      {/* CONTENT: Call to action */}
      <div className="relative z-30 text-center flex flex-col items-center max-w-5xl mx-auto w-full">
        <span className="text-[10px] sm:text-xs md:text-base uppercase tracking-wider font-bold text-black/60 mb-1">
          Contribute to the
        </span>
        
        <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-[110px] font-black text-[#1a1a1a] mb-6 font-altehaasgrotesk leading-[0.85] tracking-tighter uppercase relative break-words px-2">
          Film Society
          <br /> 
          <span className="text-transparent" style={{ WebkitTextStroke: "1.5px #1a1a1a" }}>Movement</span>
        </h2>

        {/* Action Button */}
        <div className="flex  items-center justify-center">
          {!isLoading && (
            <Link 
              href={isAuthenticated ? "/submit" : "/auth/signup"}
              className="group relative inline-flex items-center justify-center bg-[#1a1a1a] text-white px-12 py-3 rounded-full font-bold uppercase tracking-widest text-sm overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl"
            >
              <span className="relative z-10 transition-transform duration-300 group-hover:-translate-y-[150%]">
                {isAuthenticated ? "Write" : "Sign Up"}
              </span>
              <span className="absolute z-10 transition-transform duration-300 translate-y-[150%] group-hover:translate-y-0">
                {isAuthenticated ? "Write" : "Sign Up"}
              </span>
              <div className="absolute inset-0 bg-[#1a1a1a] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
            </Link>
          )}
        </div>
      </div>
      </section>
    </div>
  );
};

export default CTAPoster;
