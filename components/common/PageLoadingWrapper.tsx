'use client'

import { ReactNode } from 'react'
import LoadingScreen from './LoadingScreen'

interface PageLoadingWrapperProps {
  /**
   * Whether the page content is currently loading
   */
  isLoading: boolean
  /**
   * The page content to display when not loading
   */
  children: ReactNode
}

/**
 * Wrapper component that shows a loading screen while page data is being fetched
 * 
 * Usage:
 * ```tsx
 * <PageLoadingWrapper isLoading={isLoading}>
 *   <YourPageContent />
 * </PageLoadingWrapper>
 * ```
 */
export default function PageLoadingWrapper({
  isLoading,
  children,
}: PageLoadingWrapperProps) {
  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      {children}
    </>
  )
}
