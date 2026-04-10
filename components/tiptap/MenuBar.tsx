'use client'

import { Editor } from '@tiptap/react'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3, 
  CaseUpper,
  ChevronDown,
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
  const desktopLinkButtonRef = useRef<HTMLButtonElement | null>(null)
  const mobileLinkButtonRef = useRef<HTMLButtonElement | null>(null)
  const linkPopoverRef = useRef<HTMLDivElement | null>(null)

  const closeLinkInput = useCallback(() => {
    setShowLinkInput(false)
    setLinkUrl('')
    setLinkPopoverPosition(null)
  }, [])

  const updateLinkPopoverPosition = useCallback(() => {
    // Use desktop ref for desktop view, mobile ref for mobile view
    const triggerRect = (window.innerWidth >= 1024 ? desktopLinkButtonRef.current : mobileLinkButtonRef.current)?.getBoundingClientRect()
    if (!triggerRect) return

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
      // Check both desktop and mobile refs
      if (desktopLinkButtonRef.current?.contains(target) || mobileLinkButtonRef.current?.contains(target)) return
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

  const currentTextStyleLabel = editor.isActive('heading', { level: 1 })
    ? 'Heading 1'
    : editor.isActive('heading', { level: 2 })
      ? 'Heading 2'
      : editor.isActive('heading', { level: 3 })
        ? 'Heading 3'
        : 'Paragraph'

  return (
    <div className="sticky top-0 border-b bg-background dark:bg-brand-black-100 shadow-sm z-50 rounded-t-lg dark:border-brand-black-80 border-border">
      {/* ========== DESKTOP TOOLBAR (lg+) ========== */}
      <div className="hidden lg:flex flex-wrap lg:flex-nowrap lg:overflow-x-auto gap-1.5 px-3 py-2 items-center lg:min-w-max">
        {/* ============ MEDIA SECTION ============ */}
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
        <div className="w-px h-7 bg-border dark:bg-brand-black-80 mx-1" />

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
        <div className="w-px h-7 bg-border dark:bg-brand-black-80 mx-1" />

        {/* ============ HEADINGS DROPDOWN ============ */}
        <div className="shrink-0">
          <DropdownMenu
            trigger={
              <Button
                variant="ghost"
                className={`h-9 min-w-[118px] px-2.5 transition-all justify-between ${getActiveButtonClass(editor.isActive('heading'))}`}
                title="Text type (Paragraph, Heading 1, Heading 2, Heading 3)"
                aria-label={`Current text type: ${currentTextStyleLabel}`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  
                  <span className="text-xs font-medium truncate">{currentTextStyleLabel}</span>
                </span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
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

        <div className="w-px h-7 bg-border dark:bg-brand-black-80 mx-1" />

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

        <div className="w-px h-7 bg-border dark:bg-brand-black-80 mx-1" />

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

        <div className="w-px h-7 bg-border dark:bg-brand-black-80 mx-1" />

        {/* ============ INSERT ELEMENTS ============ */}
        <div className="flex gap-1 shrink-0 items-center">
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            variant="ghost"
            size="icon"
            className={`h-9 w-9 transition-all ${getActiveButtonClass(editor.isActive('blockquote'))}`}
            title="Add blockquote - select text first for best results"
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
              ref={desktopLinkButtonRef}
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

        <div className="w-px h-7 bg-border dark:bg-brand-black-80 mx-1" />

        {/* ============ UNDO/REDO ============ */}
        <div className="flex gap-1 shrink-0 items-center ml-auto">
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

      {/* ========== MOBILE TOOLBAR (< lg) - Two-row layout: Media + Formatting first (scrollable), Undo/Redo on second row ========== */}
      <div className="lg:hidden">
        {/* First row - horizontally scrollable */}
        <div className="overflow-x-auto rounded-t-lg">
          <div className="flex gap-1 px-2.5 py-2 items-center w-max bg-background dark:bg-brand-black-100">
          {/* ============ MEDIA BUTTON (FIRST) ============ */}
          <Button
            type="button"
            onClick={onImageUpload}
            variant="ghost"
            size="icon" 
            className={`h-8 w-8 flex-shrink-0 transition-all ${getActiveButtonClass(false)} hover:bg-secondary dark:hover:bg-brand-black-80`}
            title="Add Image"
            aria-label="Add image"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </Button>

          {/* Separator */}
          <div className="w-px h-5 bg-border dark:bg-brand-black-80 flex-shrink-0" />

          {/* ============ FORMATTING TOOLS ============ */}
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            variant="ghost"
            size="icon"
            className={`h-8 w-8 flex-shrink-0 transition-all ${getActiveButtonClass(editor.isActive('bold'))}`}
            title="Bold (Ctrl+B)"
            aria-label="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            variant="ghost"
            size="icon" 
            className={`h-8 w-8 flex-shrink-0 transition-all ${getActiveButtonClass(editor.isActive('italic'))}`}
            title="Italic (Ctrl+I)"
            aria-label="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            variant="ghost"
            size="icon" 
            className={`h-8 w-8 flex-shrink-0 transition-all ${getActiveButtonClass(editor.isActive('underline'))}`}
            title="Underline (Ctrl+U)"
            aria-label="Underline"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </Button>

          {/* Separator */}
          <div className="w-px h-5 bg-border dark:bg-brand-black-80 flex-shrink-0" />

          {/* ============ TEXT STYLES ============ */}
          <DropdownMenu
            trigger={
              <Button
                variant="ghost"
                className={`h-8 px-2 flex-shrink-0 transition-all justify-between ${getActiveButtonClass(editor.isActive('heading'))}`}
                title="Text type (Paragraph, Heading 1, Heading 2, Heading 3)"
                aria-label={`Current text type: ${currentTextStyleLabel}`}
              >
                <span className="flex items-center gap-1 min-w-0">
                  <span className="text-xs font-medium truncate">{currentTextStyleLabel}</span>
                </span>
                <ChevronDown className="h-3 w-3 shrink-0 opacity-70" />
              </Button>
            }
            align="left"
          >
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setParagraph().run()}
              isActive={!editor.isActive('heading')}
            >
              <CaseUpper className="h-4 w-4 mr-2 inline" /> Paragraph
            </DropdownMenuItem>
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
          </DropdownMenu>

          {/* Separator */}
          <div className="w-px h-5 bg-border dark:bg-brand-black-80 flex-shrink-0" />

          {/* ============ LISTS ============ */}
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            variant="ghost"
            size="icon"
            className={`h-8 w-8 flex-shrink-0 transition-all ${getActiveButtonClass(editor.isActive('bulletList'))}`}
            title="Bullet List"
            aria-label="Bullet list"
          >
            <List className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            variant="ghost"
            size="icon"
            className={`h-8 w-8 flex-shrink-0 transition-all ${getActiveButtonClass(editor.isActive('orderedList'))}`}
            title="Numbered List"
            aria-label="Numbered list"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>

          {/* Separator */}
          <div className="w-px h-5 bg-border dark:bg-brand-black-80 flex-shrink-0" />

          {/* ============ BLOCKS ============ */}
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            variant="ghost"
            size="icon" 
            className={`h-8 w-8 flex-shrink-0 transition-all ${getActiveButtonClass(editor.isActive('blockquote'))}`}
            title="Quote - select text first for best results"
            aria-label="Quote"
          >
            <Quote className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            variant="ghost"
            size="icon" 
            className="h-8 w-8 flex-shrink-0 transition-all hover:bg-secondary dark:hover:bg-brand-black-80"
            title="Divider"
            aria-label="Divider"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>

          {/* Separator */}
          <div className="w-px h-5 bg-border dark:bg-brand-black-80 flex-shrink-0" />

          {/* ============ ALIGNMENT ============ */}
          <DropdownMenu
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 transition-all hover:bg-secondary dark:hover:bg-brand-black-80"
                title="Align text"
                aria-label="Alignment"
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </Button>
            }
            align="left"
          >
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
            >
              ← Left
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
            >
              ↔ Center
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
            >
              → Right
            </DropdownMenuItem>
          </DropdownMenu>

          {/* Separator */}
          <div className="w-px h-5 bg-border dark:bg-brand-black-80 flex-shrink-0" />

          {/* ============ LINKS ============ */}
          <div className="relative z-40 flex-shrink-0">
            <Button
              ref={mobileLinkButtonRef}
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
              className={`h-8 w-8 flex-shrink-0 transition-all ${getActiveButtonClass(editor.isActive('link') || showLinkInput)}`}
              title={editor.isActive('link') ? 'Remove link' : 'Add link'}
              aria-label={editor.isActive('link') ? 'Remove link' : 'Add link'}
            >
              {editor.isActive('link') ? (
                <Unlink className="h-3.5 w-3.5" />
              ) : (
                <Link className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          </div>
        </div>

        {/* ============ SECOND ROW: UNDO/REDO (MOBILE ONLY) ============ */}
        <div className="flex gap-1 px-2.5 py-2 items-center border-t border-border dark:border-brand-black-80 bg-background dark:bg-brand-black-100">
          <Button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            variant="ghost"
            size="icon" 
            className="h-8 w-8 flex-shrink-0 transition-all disabled:opacity-40 hover:bg-secondary dark:hover:bg-brand-black-80"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            variant="ghost"
            size="icon" 
            className="h-8 w-8 flex-shrink-0 transition-all disabled:opacity-40 hover:bg-secondary dark:hover:bg-brand-black-80"
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo className="h-3.5 w-3.5" />
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


