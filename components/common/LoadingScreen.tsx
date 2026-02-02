'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface LoadingScreenProps {
  /**
   * Show/hide the loading screen
   */
  isLoading: boolean
  /**
   * Minimum time to show loading screen (in ms)
   * Prevents flickering for fast loads
   * @default 300
   */
  minDuration?: number
  /**
   * Fade out duration (in ms)
   * @default 300
   */
  fadeDuration?: number
}

/**
 * Full-screen loading overlay with spinning organization logo
 * 
 * Features:
 * - Prevents layout shift and FOUC (Flash of Unstyled Content)
 * - Smooth fade-in/fade-out animations
 * - Configurable minimum display duration to prevent flickering
 * - Dark mode support
 */
export default function LoadingScreen({
  isLoading,
  minDuration = 300,
  fadeDuration = 300,
}: LoadingScreenProps) {
  const [shouldRender, setShouldRender] = useState(isLoading)
  const [isVisible, setIsVisible] = useState(isLoading)

  // Handle mounting/unmounting with animation
  useEffect(() => {
    if (isLoading) {
      setShouldRender(true)
      // Force a reflow to ensure the transition is triggered
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    } else {
      // Start fade out
      setIsVisible(false)
      // Remove from DOM after fade completes + minimum duration
      const hideTimer = setTimeout(() => {
        setShouldRender(false)
      }, fadeDuration + minDuration)

      return () => clearTimeout(hideTimer)
    }
  }, [isLoading, fadeDuration, minDuration])

  if (!shouldRender) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-background transition-opacity duration-${fadeDuration}`}
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transitionDuration: `${fadeDuration}ms`,
      }}
      aria-label="Loading content"
      role="status"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo Container with Orbital Rings */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
          {/* Outer Ring */}
          {/* <div
            className="absolute inset-0 rounded-full border-2 border-border/30"
            style={{
              animation: 'pulse-ring 2s ease-in-out infinite',
            }}
          /> */}
          
          {/* Middle Ring */}
          <div
            className="absolute inset-3 rounded-full border-2 border-border/50"
            style={{
              animation: 'pulse-ring 2s ease-in-out infinite 0.4s',
            }}
          />
          
          {/* Inner Ring */}
          <div
            className="absolute inset-6 rounded-full border-2 border-primary/40"
            style={{
              animation: 'pulse-ring 2s ease-in-out infinite 0.8s',
            }}
          />

          {/* Logo with Gentle Float */}
          <div
            className="relative z-10 w-24 h-24 md:w-28 md:h-28 flex items-center justify-center rounded-full bg-white dark:bg-white shadow-lg p-3"
            style={{
              animation: 'float 3s ease-in-out infinite',
            }}
          >
            <Image
              src="/images/loading.svg"
              alt="Loading"
              width={80}
              height={80}
              className="object-contain w-full h-full"
              priority
              unoptimized
            />
          </div>

          {/* Orbiting Dot */}
          <div
            className="absolute inset-0"
            style={{
              animation: 'rotate 4s linear infinite',
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
          </div>
        </div>

        {/* Loading Text with Dots Animation */}
        <div className="flex items-center gap-1">
          <p className="text-sm md:text-base text-muted-foreground">
            Loading
          </p>
          <span className="flex gap-1">
            <span
              className="w-1 h-1 bg-muted-foreground rounded-full"
              style={{ animation: 'bounce-dot 1.4s infinite 0s' }}
            />
            <span
              className="w-1 h-1 bg-muted-foreground rounded-full"
              style={{ animation: 'bounce-dot 1.4s infinite 0.2s' }}
            />
            <span
              className="w-1 h-1 bg-muted-foreground rounded-full"
              style={{ animation: 'bounce-dot 1.4s infinite 0.4s' }}
            />
          </span>
        </div>
      </div>

      {/* CSS for all animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.05);
          }
        }

        @keyframes pulse-ring {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.6;
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes bounce-dot {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 0.5;
          }
          40% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
