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
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-slate-950 transition-opacity duration-${fadeDuration}`}
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transitionDuration: `${fadeDuration}ms`,
      }}
      aria-label="Loading content"
      role="status"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinning Logo Container */}
        <div
          className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center rounded-full bg-white"
          style={{
            animation: 'spin 3s linear infinite',
          }}
        >
          <Image
            src="/images/loading.svg"
            alt="Loading"
            width={96}
            height={96}
            className="object-contain"
            priority
            unoptimized
          />
        </div>

        {/* Loading Text */}
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Loading...
        </p>
      </div>

      {/* CSS for spinning animation */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
