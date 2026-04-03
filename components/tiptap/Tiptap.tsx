'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Link } from '@tiptap/extension-link'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Typography } from '@tiptap/extension-typography'
import Placeholder from '@tiptap/extension-placeholder'
import { Mark } from '@tiptap/core'
import { Markdown } from 'tiptap-markdown'
import { useCallback, useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import MenuBar from './MenuBar'
import './tiptap.css'
import { uploadImageToStrapi, validateImageFile, getStrapiMediaUrl } from '@/lib/strapi-media'
import ImageWithCaption from './ImageWithCaption'
import StyledBlockquote from './StyledBlockquote'
import type { TiptapRef, TiptapProps } from './types'
import { useToast } from '@/components/ui/toast'
import { getToken } from '@/lib/auth'

// Re-export types for consumers
export type { TiptapRef, TiptapProps } from './types'

interface EditorImage {
  file: File
  tempUrl: string
  caption: string
  alt: string
}

const Tiptap = forwardRef<TiptapRef, TiptapProps>(({ 
  initialContent = '', 
  onContentChange, 
  onMarkdownChange,
  onWordCountChange,
  placeholder = 'Start writing your story...',
}, ref) => {
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [editorImages, setEditorImages] = useState<EditorImage[]>([])
  const lastContentRef = useRef<string>(initialContent)
  const isInitializedRef = useRef(false)

  const getEditorMarkdown = useCallback((editorInstance: Editor): string => {
    const markdownStorage = (editorInstance.storage as { markdown?: { getMarkdown?: () => string } }).markdown
    return markdownStorage?.getMarkdown?.() || ''
  }, [])

  const removeImageNodeBySrc = useCallback((editorInstance: Editor, src: string) => {
    const { doc } = editorInstance.state
    let targetPos: number | null = null
    let nodeSize = 0

    doc.descendants((node, pos) => {
      if (node.type.name === 'imageWithCaption' && node.attrs.src === src) {
        targetPos = pos
        nodeSize = node.nodeSize
        return false
      }
      return true
    })

    if (targetPos !== null && nodeSize > 0) {
      const tr = editorInstance.state.tr.delete(targetPos, targetPos + nodeSize)
      editorInstance.view.dispatch(tr)
    }
  }, [])

  const uploadAndInsertImage = useCallback(async (file: File, editorInstance: Editor) => {
    const validation = validateImageFile(file)
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid image file')
    }

    const localPreviewUrl = URL.createObjectURL(file)

    try {
      // Just insert the image with blob URL - don't upload yet
      editorInstance.chain().focus().insertContent({
        type: 'imageWithCaption',
        attrs: {
          src: localPreviewUrl,
          alt: file.name,
          caption: '',
        },
      }).run()

      // Store the file for later upload on publish
      setEditorImages(prev => [...prev, { 
        file, 
        tempUrl: localPreviewUrl, 
        caption: '',
        alt: file.name 
      }])
    } catch (error) {
      removeImageNodeBySrc(editorInstance, localPreviewUrl)
      URL.revokeObjectURL(localPreviewUrl)
      throw error
    }
  }, [removeImageNodeBySrc])

  const uploadImages = useCallback(async (files: File[], editorInstance: Editor) => {
    if (!files.length) return

    setIsUploading(true)
    const failures: string[] = []

    for (const file of files) {
      try {
        await uploadAndInsertImage(file, editorInstance)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to add image'
        failures.push(`${file.name}: ${message}`)
      }
    }

    if (failures.length > 0) {
      const shownFailures = failures.slice(0, 2).join(' | ')
      const suffix = failures.length > 2 ? ` (+${failures.length - 2} more)` : ''
      toast.error(`${shownFailures}${suffix}`, 'Image Upload Failed')
    } else if (files.length > 1) {
      toast.success(`${files.length} images added to your article`)
    }

    setIsUploading(false)
  }, [toast, uploadAndInsertImage])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        blockquote: false,
      }),
      StyledBlockquote,
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
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: '-',
        transformPastedText: false,
        transformCopiedText: false,
        breaks: false,
        linkify: true,
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
        class: 'dufs-article-render focus:outline-none min-h-[500px] p-6',
        'data-size': 'medium',
      },
      handlePaste: (_view, event) => {
        const clipboardItems = event.clipboardData?.items
        if (!clipboardItems?.length || !editor || editor.isDestroyed) return false

        const imageItems = Array.from(clipboardItems).filter(
          (item) => item.kind === 'file' && item.type.startsWith('image/')
        )

        if (!imageItems.length) return false

        const imageFiles = imageItems
          .map((item) => item.getAsFile())
          .filter((file): file is File => Boolean(file))

        if (!imageFiles.length) return true

        event.preventDefault()
        void uploadImages(imageFiles, editor)
        return true
      },
      handleDrop: (_view, event) => {
        if (!editor || editor.isDestroyed) return false

        const droppedFiles = Array.from(event.dataTransfer?.files || [])
          .filter((file) => file.type.startsWith('image/'))

        if (!droppedFiles.length) return false

        event.preventDefault()
        void uploadImages(droppedFiles, editor)
        return true
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const text = editor.getText()
      const markdown = getEditorMarkdown(editor)
      const words = text.trim().split(/\s+/).filter(word => word.length > 0).length
      
      // Only trigger callbacks if content actually changed
      if (html !== lastContentRef.current) {
        lastContentRef.current = html
        if (onContentChange) onContentChange(html)
        if (onMarkdownChange) onMarkdownChange(markdown)
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
    getMarkdown: () => {
      if (!editor || editor.isDestroyed) return ''
      return getEditorMarkdown(editor)
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
    uploadPendingImages: async () => {
      if (!editor || editor.isDestroyed || !editorImages.length) return
      
      setIsUploading(true)
      const token = getToken()
      
      if (!token) {
        toast.error('You must be signed in to upload images.')
        setIsUploading(false)
        return
      }

      try {
        for (const pendingImage of editorImages) {
          try {
            const uploadedImage = await uploadImageToStrapi(pendingImage.file, token)
            const realUrl = getStrapiMediaUrl(uploadedImage.url)

            const { doc } = editor.state
            let imagePos: number | null = null

            doc.descendants((node, pos) => {
              if (node.type.name === 'imageWithCaption' && node.attrs.src === pendingImage.tempUrl) {
                imagePos = pos
                return false
              }
              return true
            })

            if (imagePos !== null) {
              editor.chain()
                .setNodeSelection(imagePos)
                .updateAttributes('imageWithCaption', { src: realUrl })
                .run()
            }

            URL.revokeObjectURL(pendingImage.tempUrl)
          } catch (error) {
            console.error(`Failed to upload image ${pendingImage.file.name}:`, error)
            throw error
          }
        }

        setEditorImages([])
        toast.success('All images uploaded successfully!')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to upload images'
        toast.error(message)
        throw error
      } finally {
        setIsUploading(false)
      }
    },
  }), [editor, getEditorMarkdown, editorImages, toast])

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !editor) return

    await uploadImages([file], editor)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [editor, uploadImages])

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
      const markdown = getEditorMarkdown(editor)
      if (onMarkdownChange) onMarkdownChange(markdown)
      if (onWordCountChange) onWordCountChange(words)
    }
  }, [editor, getEditorMarkdown, initialContent, onMarkdownChange, onWordCountChange])

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
                <span>Adding image to editor...</span>
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
