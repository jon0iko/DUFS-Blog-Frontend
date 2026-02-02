'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Link } from '@tiptap/extension-link'
import { TextAlign } from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Typography } from '@tiptap/extension-typography'
import Placeholder from '@tiptap/extension-placeholder'
import { Mark } from '@tiptap/core'
import { useCallback, useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import MenuBar from './MenuBar'
import './tiptap.css'
import { uploadImageToStrapi, validateImageFile, fileToBase64, getStrapiMediaUrl } from '@/lib/strapi-media'
import Cookies from 'js-cookie'
import ImageWithCaption from './ImageWithCaption'
import type { TiptapRef, TiptapProps } from './types'
import { useToast } from '@/components/ui/toast'

// Re-export types for consumers
export type { TiptapRef, TiptapProps } from './types'

const Tiptap = forwardRef<TiptapRef, TiptapProps>(({ 
  initialContent = '', 
  onContentChange, 
  onWordCountChange,
  placeholder = 'Start writing your story...',
}, ref) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const lastContentRef = useRef<string>(initialContent)
  const isInitializedRef = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      // Use our custom image with caption extension
      ImageWithCaption,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2 bg-gray-100 dark:bg-brand-black-90 font-bold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2',
        },
      }),
      TextStyle,
      Color,
      Typography,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      // Bengali Language Mark - applies Kalpurush font to Bengali text
      Mark.create({
        name: 'bengaliMark',
        parseHTML: () => [{ tag: 'span[data-bengali]' }],
        renderHTML: ({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) => [
          'span',
          { ...HTMLAttributes, 'data-bengali': 'true', class: 'font-kalpurush' },
          0,
        ],
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[500px] p-6 overflow-y-auto',
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const text = editor.getText()
      const words = text.trim().split(/\s+/).filter(word => word.length > 0).length
      
      // Only trigger callbacks if content actually changed
      if (html !== lastContentRef.current) {
        lastContentRef.current = html
        if (onContentChange) onContentChange(html)
        if (onWordCountChange) onWordCountChange(words)
      }
    },
  }, []) // Empty deps - editor created once

  // Expose methods via ref for parent component to use
  useImperativeHandle(ref, () => ({
    setContent: (content: string) => {
      if (editor && !editor.isDestroyed) {
        lastContentRef.current = content
        editor.commands.setContent(content, { emitUpdate: false })
      }
    },
    getContent: () => {
      return editor?.getHTML() || ''
    },
    clearContent: () => {
      if (editor && !editor.isDestroyed) {
        lastContentRef.current = ''
        editor.commands.clearContent()
      }
    },
    focus: () => {
      editor?.commands.focus()
    },
  }), [editor])

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !editor) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid image file', 'Upload Failed')
      return
    }

    setIsUploading(true)

    try {
      // Show preview immediately using base64
      const base64Preview = await fileToBase64(file)
      
      // Insert image with our custom extension
      editor.chain().focus().insertContent({
        type: 'imageWithCaption',
        attrs: {
          src: base64Preview,
          alt: file.name,
          caption: '',
        },
      }).run()

      // Upload to Strapi in background
      const token = Cookies.get('jwt')
      const uploadedImage = await uploadImageToStrapi(file, token)
      const imageUrl = getStrapiMediaUrl(uploadedImage.url)

      // Find and replace the base64 image with the uploaded URL
      const { state } = editor
      const { doc } = state
      let imagePos: number | null = null

      doc.descendants((node, pos) => {
        if (node.type.name === 'imageWithCaption' && node.attrs.src === base64Preview) {
          imagePos = pos
          return false
        }
      })

      if (imagePos !== null) {
        editor.chain()
          .setNodeSelection(imagePos)
          .updateAttributes('imageWithCaption', { src: imageUrl })
          .run()
      }

      console.log('Image uploaded successfully:', uploadedImage)
    } catch (error) {
      console.error('Image upload failed:', error)
      toast.warning('Failed to upload image. Using local preview instead.', 'Upload Warning')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [editor])

  // Set initial content when editor is ready - only once
  useEffect(() => {
    if (editor && !editor.isDestroyed && !isInitializedRef.current) {
      if (initialContent) {
        editor.commands.setContent(initialContent, { emitUpdate: false })
        lastContentRef.current = initialContent
      }
      isInitializedRef.current = true
      
      // Calculate initial word count
      const text = editor.getText()
      const words = text.trim().split(/\s+/).filter(word => word.length > 0).length
      if (onWordCountChange) onWordCountChange(words)
    }
  }, [editor, initialContent, onWordCountChange])

  return (
    <div className="w-full mx-auto h-full flex flex-col shadow-xl">
      <div className="border rounded-t-lg bg-card shadow-lg relative flex flex-col h-full overflow-visible dark:border-brand-black-80">
        <MenuBar editor={editor} onImageUpload={handleImageUpload} />
        <div className="bg-background overflow-y-auto flex-1 min-h-0 relative">
          <EditorContent editor={editor} />
          {isUploading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Uploading image...</span>
              </div>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  )
})

Tiptap.displayName = 'Tiptap'

export default Tiptap
