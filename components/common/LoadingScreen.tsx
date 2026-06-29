'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

interface LoadingScreenProps {
  isLoading: boolean
  minDuration?: number
  fadeDuration?: number
}

export default function LoadingScreen({
  isLoading,
  minDuration = 300,
  fadeDuration = 300,
}: LoadingScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    if (isLoading) {
      html.style.overflow = 'hidden'
      body.style.overflow = 'hidden'
    } else {
      html.style.overflow = ''
      body.style.overflow = ''
    }
    return () => {
      html.style.overflow = ''
      body.style.overflow = ''
    }
  }, [isLoading])

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    if (isLoading) {
      overlay.style.visibility = 'visible'
      gsap.to(overlay, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.25,
        ease: 'power2.out',
        overwrite: true,
      })
    } else {
      gsap.to(overlay, {
        opacity: 0,
        pointerEvents: 'none',
        duration: fadeDuration / 1000,
        delay: minDuration / 1000,
        ease: 'power2.in',
        overwrite: true,
        onComplete: () => {
          if (overlay) overlay.style.visibility = 'hidden'
        },
      })
    }
  }, [isLoading, minDuration, fadeDuration])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-background"
      style={{
        opacity: isLoading ? 1 : 0,
        visibility: isLoading ? 'visible' : 'hidden',
        pointerEvents: isLoading ? 'auto' : 'none',
      }}
      aria-hidden={!isLoading}
      aria-label="Loading content"
      role="status"
    >
      {/* All animations are pure CSS — visible the instant the HTML paints,
          no JS hydration needed for the spinner to appear. */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
          {/* Pulsing ring — CSS animation */}
          <div
            className="absolute inset-3 rounded-full border-2 border-foreground/25 dark:border-white/55"
            style={{
              animation: 'loading-pulse 2s ease-in-out infinite',
            }}
          />

          {/* Logo */}
          <div className="relative z-10 w-24 h-24 md:w-28 md:h-28 flex items-center justify-center rounded-full bg-white dark:bg-white shadow-lg p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/loading.svg"
              alt="Loading"
              width={80}
              height={80}
              className="object-contain w-full h-full"
            />
          </div>

          {/* Orbiting dot — CSS animation */}
          <div
            className="absolute inset-0"
            style={{ animation: 'loading-orbit 4s linear infinite' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
          </div>
        </div>

        {/* Loading text with CSS-animated dots */}
        <div className="flex items-center gap-1">
          <p className="text-sm md:text-base text-muted-foreground">Loading</p>
          <span className="flex gap-1 ml-1">
            <span className="w-1 h-1 bg-muted-foreground rounded-full" style={{ animation: 'loading-dot 1.2s ease-in-out infinite 0s' }} />
            <span className="w-1 h-1 bg-muted-foreground rounded-full" style={{ animation: 'loading-dot 1.2s ease-in-out infinite 0.2s' }} />
            <span className="w-1 h-1 bg-muted-foreground rounded-full" style={{ animation: 'loading-dot 1.2s ease-in-out infinite 0.4s' }} />
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-pulse {
          0%, 100% { transform: scale(1); opacity: 0.45; }
          50% { transform: scale(1.12); opacity: 0.9; }
        }
        @keyframes loading-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes loading-dot {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
