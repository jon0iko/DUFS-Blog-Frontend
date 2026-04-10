'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'

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
 * Full-screen loading overlay — all animations driven by a GSAP timeline.
 *
 * GSAP handles every motion (logo float, rings, orbit, dots) in a single
 * synchronized RAF loop, avoiding multiple CSS animation timelines.
 */
export default function LoadingScreen({
  isLoading,
  minDuration = 300,
  fadeDuration = 300,
}: LoadingScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(false)

  // Build the looping animation timeline on first mount
  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay || mountedRef.current) return
    mountedRef.current = true

    const logo = overlay.querySelector<HTMLElement>('[data-loading="logo"]')
    const rings = overlay.querySelectorAll<HTMLElement>('[data-loading="ring"]')
    const orbit = overlay.querySelector<HTMLElement>('[data-loading="orbit"]')
    const dots = overlay.querySelectorAll<HTMLElement>('[data-loading="dot"]')

    // Logo gentle float
    // if (logo) {
    //   gsap.to(logo, {
    //     y: -8,
    //     scale: 1.04,
    //     duration: 1.6,
    //     repeat: -1,
    //     yoyo: true,
    //     ease: 'sine.inOut',
    //   })
    // }

    // Pulsing rings
    if (rings.length) {
      gsap.to(rings, {
        scale: 1.12,
        opacity: 0.9,
        duration: 1,
        repeat: -1,
        yoyo: true,
        stagger: 0.35,
        ease: 'sine.inOut',
        transformOrigin: '50% 50%',
      })
    }

    // Rotation orbit
    if (orbit) {
      gsap.to(orbit, {
        rotation: 360,
        duration: 4,
        repeat: -1,
        ease: 'none',
        transformOrigin: '50% 50%',
      })
    }

    // Loading dots bounce
    if (dots.length) {
      gsap.to(dots, {
        y: -6,
        opacity: 1,
        duration: 0.35,
        repeat: -1,
        yoyo: true,
        stagger: 0.18,
        ease: 'power1.out',
      })
    }
  }, [])

  // Manage body scroll state when loading
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

  // Fade in / fade out based on isLoading
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
      style={{ opacity: 1 }}
      aria-label="Loading content"
      role="status"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Animated Logo Container with Orbital Rings */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
          {/* Pulsing ring */}
          <div
            data-loading="ring"
            className="absolute inset-3 rounded-full border-2 border-foreground/25 dark:border-white/55"
            style={{ opacity: 0.45 }}
          />

          {/* Logo float — GSAP-driven */}
          <div
            data-loading="logo"
            className="relative z-10 w-24 h-24 md:w-28 md:h-28 flex items-center justify-center rounded-full bg-white dark:bg-white shadow-lg p-3"
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

          {/* Orbiting dot — GSAP rotation */}
          <div data-loading="orbit" className="absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
          </div>
        </div>

        {/* Loading dots — GSAP bounce */}
        <div className="flex items-center gap-1">
          <p className="text-sm md:text-base text-muted-foreground">Loading</p>
          <span className="flex gap-1 ml-1">
            <span data-loading="dot" className="w-1 h-1 bg-muted-foreground rounded-full opacity-50" />
            <span data-loading="dot" className="w-1 h-1 bg-muted-foreground rounded-full opacity-50" />
            <span data-loading="dot" className="w-1 h-1 bg-muted-foreground rounded-full opacity-50" />
          </span>
        </div>
      </div>
    </div>
  )
}
