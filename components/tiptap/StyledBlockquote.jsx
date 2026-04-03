'use client';

import React from 'react';
import Blockquote from '@tiptap/extension-blockquote';
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';

const StyledBlockquoteView = () => {
  return (
    <NodeViewWrapper className="dufs-editor-blockquote not-prose my-4">
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

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': ({ editor }) => {
        if (!editor.isActive('blockquote')) return false

        // Exit blockquote and create a new paragraph below
        return editor
          .chain()
          .command(({ tr, dispatch }) => {
            const { $from } = tr.selection
            
            // Find the blockquote parent
            let blockquoteDepth = 0
            for (let d = $from.depth; d > 0; d--) {
              if ($from.node(d).type.name === 'blockquote') {
                blockquoteDepth = d
                break
              }
            }

            if (blockquoteDepth === 0) return false

            // Get position after blockquote
            const blockquoteNode = $from.node(blockquoteDepth)
            const blockquotePos = $from.before(blockquoteDepth)
            const posAfter = blockquotePos + blockquoteNode.nodeSize

            // Insert new paragraph and move cursor there
            const paragraph = editor.state.schema.nodes.paragraph.create()
            tr.insert(posAfter, paragraph)
            tr.setSelection(tr.selection.constructor.near(tr.doc.resolve(posAfter + 1)))

            if (dispatch) dispatch(tr)
            return true
          })
          .run()
      },
    }
  },
});

export default StyledBlockquote;
