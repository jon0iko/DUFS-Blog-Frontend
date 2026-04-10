import React from 'react'
import { splitMixedText } from '@/lib/fonts'
import { cn } from '@/lib/utils'

interface MultiLangTextProps {
  text: string
  className?: string
  bengaliClassName?: string
  englishClassName?: string
}

/**
 * Component to render text with appropriate fonts based on language
 * Bengali text uses Kalpurush font, English uses Roboto
 */
export function MultiLangText({
  text,
  className,
  bengaliClassName,
  englishClassName,
}: MultiLangTextProps) {
  const segments = splitMixedText(text)

  return (
    <>
      {segments.map((segment, index) => (
        <span
          key={index}
          className={cn(
            className,
            segment.isBengali
              ? cn('font-kalpurush', bengaliClassName)
              : cn('font-roboto', englishClassName)
          )}
        >
          {segment.text}
        </span>
      ))}
    </>
  )
}
