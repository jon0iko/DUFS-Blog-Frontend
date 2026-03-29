import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import BlockquoteComponent from './BlockquoteComponent'

export const CustomBlockquote = Node.create({
  name: 'blockquote',
  group: 'block',
  content: 'block+',
  defining: true,

  parseHTML() {
    return [{ tag: 'blockquote' }]
  },

  renderHTML() {
    return ['blockquote', 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlockquoteComponent)
  },
})
