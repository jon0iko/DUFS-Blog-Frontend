'use client'

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'

interface BlockquoteComponentProps {
  node: any
  selected: boolean
}

/**
 * Custom Blockquote component for Tiptap editor
 * Renders blockquotes with the same styling as published articles
 * Shows writers exactly how their quotes will look after publishing
 */
export default function BlockquoteComponent({
  selected,
}: BlockquoteComponentProps) {
  return (
    <NodeViewWrapper as="div" className="contents">
      <div
        className={`flex items-center gap-4 md:gap-6 my-10 px-4 py-6 rounded-lg transition-colors ${
          selected ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-transparent'
        }`}
      >
        {/* Quote Icon Light Mode */}
        <img
          src="/images/QuoteLight.svg"
          alt=""
          aria-hidden="true"
          className="quote-icon-light block dark:hidden shrink-0 w-12 h-12 md:w-[70px] md:h-[70px]"
          draggable={false}
        />

        {/* Quote Icon Dark Mode */}
        <img
          src="/images/QuoteDark.svg"
          alt=""
          aria-hidden="true"
          className="quote-icon-dark hidden dark:block shrink-0 w-12 h-12 md:w-[70px] md:h-[70px]"
          draggable={false}
        />

        {/* Blockquote Content */}
        <blockquote
          className={`flex-1 min-h-12 md:min-h-[70px] flex items-center italic text-2xl md:text-3xl leading-[1.55] text-gray-600 dark:text-gray-300 my-0 font-zillaslab ${
            selected ? 'ring-2 ring-blue-400 dark:ring-blue-600 rounded px-3' : ''
          }`}
        >
          <NodeViewContent  className="block w-full" />
        </blockquote>
      </div>
    </NodeViewWrapper>
  )
}

