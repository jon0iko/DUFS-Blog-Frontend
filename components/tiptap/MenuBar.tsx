'use client'

import { Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  Heading,
  Heading1,
  Heading2,
  Heading3, 
  CaseUpper,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  Minus,
  ImageIcon,
  Link,
  Unlink
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'

interface MenuBarProps {
  editor: Editor | null
  onImageUpload: () => void
}

interface LinkPopoverPosition {
  top: number
  left: number
  width: number
}

// Helper to apply subtle active state styling - uses border instead of full background fill
const getActiveButtonClass = (isActive: boolean) => {
  return isActive 
    ? 'ring-1 ring-foreground/30 bg-secondary dark:bg-brand-black-80'
    : ''
}

export default function MenuBar({ editor, onImageUpload }: MenuBarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkPopoverPosition, setLinkPopoverPosition] = useState<LinkPopoverPosition | null>(null)
  const linkButtonRef = useRef<HTMLButtonElement | null>(null)
  const linkPopoverRef = useRef<HTMLDivElement | null>(null)

  const closeLinkInput = useCallback(() => {
    setShowLinkInput(false)
    setLinkUrl('')
    setLinkPopoverPosition(null)
  }, [])

  const updateLinkPopoverPosition = useCallback(() => {
    if (!linkButtonRef.current) return

    const triggerRect = linkButtonRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportPadding = 12
    const maxWidth = 460

    const width = Math.min(maxWidth, viewportWidth - viewportPadding * 2)
    let left = triggerRect.left

    if (left + width > viewportWidth - viewportPadding) {
      left = viewportWidth - viewportPadding - width
    }
    left = Math.max(left, viewportPadding)

    setLinkPopoverPosition({
      top: triggerRect.bottom + 8,
      left,
      width,
    })
  }, [])

  const addLink = useCallback(() => {
    const trimmedUrl = linkUrl.trim()

    if (trimmedUrl && editor) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: trimmedUrl })
        .run()
      closeLinkInput()
    }
  }, [closeLinkInput, editor, linkUrl])

  useEffect(() => {
    if (!showLinkInput) return

    updateLinkPopoverPosition()

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node
      if (linkPopoverRef.current?.contains(target)) return
      if (linkButtonRef.current?.contains(target)) return
      closeLinkInput()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLinkInput()
      }
    }

    const handleViewportChange = () => {
      updateLinkPopoverPosition()
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
    }
  }, [closeLinkInput, showLinkInput, updateLinkPopoverPosition])

  if (!editor) {
    return null
  }

  return (
    <div className="sticky top-0 border-b bg-background dark:bg-brand-black-100 shadow-sm z-50 rounded-t-lg dark:border-brand-black-80 border-border">
      {/* Toolbar with clear sections and better spacing for accessibility */}
      <div className="flex flex-wrap lg:flex-nowrap lg:overflow-x-auto gap-3 lg:gap-1.5 px-3 py-2 items-center lg:min-w-max">
        {/* ============ MEDIA SECTION - Prominent at Start ============ */}
        <Button
          type="button"
          onClick={onImageUpload}
          variant="ghost"
          size="icon" 
          className={`h-9 w-9 transition-all ${getActiveButtonClass(false)} hover:bg-secondary dark:hover:bg-brand-black-80`}
          title="Add Image or Media"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        {/* Spacer */}
        <div className="w-px h-7 bg-border dark:bg-brand-black-80 hidden lg:block mx-1" />

        {/* ============ TEXT FORMATTING ============ */}
        <div className="flex gap-1 shrink-0 items-center">
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            variant="ghost"
            size="icon"
            className={`h-9 w-9 transition-all ${getActiveButtonClass(editor.isActive('bold'))}`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            variant="ghost"
            size="icon" 
            className={`h-9 w-9 transition-all ${getActiveButtonClass(editor.isActive('italic'))}`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            variant="ghost"
            size="icon" 
            className={`h-9 w-9 transition-all ${getActiveButtonClass(editor.isActive('underline'))}`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Spacer */}
        <div className="w-px h-7 bg-border dark:bg-brand-black-80 hidden lg:block mx-1" />

        {/* ============ HEADINGS DROPDOWN ============ */}
        <div className="shrink-0">
          <DropdownMenu
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 transition-all ${getActiveButtonClass(editor.isActive('heading'))}`}
                title="Heading level (H1, H2, H3)"
              >
                <Heading className="h-4 w-4" />
              </Button>
            }
            align="left"
          >
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
            >
              <Heading1 className="h-4 w-4 mr-2 inline" /> Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
            >
              <Heading2 className="h-4 w-4 mr-2 inline" /> Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
            >
              <Heading3 className="h-4 w-4 mr-2 inline" /> Heading 3
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setParagraph().run()}
              isActive={!editor.isActive('heading')}
            >
              <CaseUpper className="h-4 w-4 mr-2 inline" /> Paragraph
            </DropdownMenuItem>
          </DropdownMenu>
        </div>

        <div className="w-px h-7 bg-border dark:bg-brand-black-80 hidden lg:block mx-1" />

        {/* ============ LISTS DROPDOWN ============ */}
        <div className="shrink-0">
          <DropdownMenu
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 transition-all ${getActiveButtonClass(editor.isActive('bulletList') || editor.isActive('orderedList'))}`}
                title="Insert list (bullet or numbered)"
              >
                <List className="h-4 w-4" />
              </Button>
            }
            align="left"
          >
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
            >
              <List className="h-4 w-4 mr-2 inline" /> Bullet List
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
            >
              <ListOrdered className="h-4 w-4 mr-2 inline" /> Numbered List
            </DropdownMenuItem>
          </DropdownMenu>
        </div>

        <div className="w-px h-7 bg-border dark:bg-brand-black-80 hidden lg:block mx-1" />

        {/* ============ TEXT ALIGNMENT ============ */}
        <div className="shrink-0">
          <DropdownMenu
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 transition-all hover:bg-secondary dark:hover:bg-brand-black-80"
                title="Align text (left, center, right)"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
            }
            align="left"
          >
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
            >
              ← Align Left
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
            >
              ↔ Align Center
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
            >
              → Align Right
            </DropdownMenuItem>
          </DropdownMenu>
        </div>

        <div className="w-px h-7 bg-border dark:bg-brand-black-80 hidden lg:block mx-1" />

        {/* ============ INSERT ELEMENTS ============ */}
        <div className="flex gap-1 shrink-0 items-center">
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            variant="ghost"
            size="icon" 
            className={`h-9 w-9 transition-all ${getActiveButtonClass(editor.isActive('blockquote'))}`}
            title="Insert quote or highlight text"
          >
            <Quote className="h-4 w-4" />             
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            variant="ghost"
            size="icon" 
            className="h-9 w-9 transition-all hover:bg-secondary dark:hover:bg-brand-black-80"
            title="Insert divider line"
          >
            <Minus className="h-4 w-4" />
          </Button>

          {/* Link Controls */}
          <div className="relative z-50">
            <Button
              ref={linkButtonRef}
              type="button"
              onClick={() => {
                if (editor.isActive('link')) {
                  editor.chain().focus().unsetLink().run()
                  closeLinkInput()
                } else {
                  setLinkUrl(editor.getAttributes('link').href ?? '')
                  setShowLinkInput(true)
                }
              }}
              variant="ghost"
              size="icon"
              className={`h-9 w-9 transition-all ${getActiveButtonClass(editor.isActive('link') || showLinkInput)}`}
              title={editor.isActive('link') ? 'Remove link from selected text' : 'Add link to selected text'}
            >
              {editor.isActive('link') ? (
                <Unlink className="h-4 w-4" />
              ) : (
                <Link className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="w-px h-7 bg-border dark:bg-brand-black-80 hidden lg:block mx-1" />

        {/* ============ UNDO/REDO - End of toolbar ============ */}
        <div className="flex gap-1 shrink-0 items-center ml-auto lg:ml-0">
          <Button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            variant="ghost"
            size="icon" 
            className="h-9 w-9 transition-all disabled:opacity-40 hover:bg-secondary dark:hover:bg-brand-black-80"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            variant="ghost"
            size="icon" 
            className="h-9 w-9 transition-all disabled:opacity-40 hover:bg-secondary dark:hover:bg-brand-black-80"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showLinkInput && linkPopoverPosition && (
        <div
          ref={linkPopoverRef}
          className="fixed bg-background dark:bg-brand-black-100 border border-border dark:border-brand-black-80 rounded-md p-2.5 shadow-xl z-[100]"
          style={{
            top: `${linkPopoverPosition.top}px`,
            left: `${linkPopoverPosition.left}px`,
            width: `${linkPopoverPosition.width}px`,
          }}
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="h-9 px-2.5 border border-border dark:border-brand-black-80 rounded text-sm flex-1 min-w-0 bg-background dark:bg-brand-black-100 text-foreground dark:text-white placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addLink()
                } else if (e.key === 'Escape') {
                  closeLinkInput()
                }
              }}
              autoFocus
            />

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                onClick={addLink}
                size="sm"
                variant="default"
                className="whitespace-nowrap"
                disabled={!linkUrl.trim()}
              >
                Add Link
              </Button>
              <Button
                type="button"
                onClick={closeLinkInput}
                size="sm"
                variant="ghost"
                className="whitespace-nowrap"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


