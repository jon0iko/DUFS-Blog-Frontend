'use client';

import React from 'react';
import Blockquote from '@tiptap/extension-blockquote';
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';

const StyledBlockquoteView = () => {
  return (
    <NodeViewWrapper className="dufs-editor-blockquote not-prose my-10">
      <div className="flex items-center gap-4 md:gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/QuoteLight.svg"
          alt=""
          aria-hidden="true"
          contentEditable={false}
          draggable={false}
          className="quote-icon dufs-editor-quote-icon-light shrink-0"
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/QuoteDark.svg"
          alt=""
          aria-hidden="true"
          contentEditable={false}
          draggable={false}
          className="quote-icon dufs-editor-quote-icon-dark shrink-0"
        />

        <blockquote
          className="dufs-editor-blockquote-text flex-1 min-h-12 md:min-h-[70px] flex items-center italic my-0"
          style={{ borderLeft: 'none', paddingLeft: 0, margin: 0 }}
        >
          <NodeViewContent as="div" className="dufs-editor-blockquote-content block w-full" />
        </blockquote>
      </div>
    </NodeViewWrapper>
  );
};

const StyledBlockquote = Blockquote.extend({
  addNodeView() {
    return ReactNodeViewRenderer(StyledBlockquoteView);
  },
});

export default StyledBlockquote;
