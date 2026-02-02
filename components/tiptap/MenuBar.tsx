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
  Unlink,
  Table,
  ChevronDown
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu'

interface MenuBarProps {
  editor: Editor | null
  onImageUpload: () => void
}

export default function MenuBar({ editor, onImageUpload }: MenuBarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run()
      setLinkUrl('')
      setShowLinkInput(false)
    }
  }, [editor, linkUrl])

  if (!editor) {
    return null
  }

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <div className="sticky top-0 border-b bg-background shadow-sm z-50 rounded-t-lg dark:border-brand-black-80">
      {/* Compact toolbar - two rows on mobile, single row on desktop */}
      <div className="flex flex-wrap lg:flex-nowrap lg:overflow-x-auto gap-0.5 p-1.5 items-center lg:min-w-max">
        {/* Text Formatting */}
        <div className="flex gap-0.5 shrink-0 items-center">
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="icon" className="h-8 w-8" title="Italic (Ctrl+I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            variant={editor.isActive('underline') ? 'default' : 'ghost'}
            size="icon" className="h-8 w-8" title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="w-px h-6 bg-border hidden lg:block dark:bg-white" />

        {/* Headings Dropdown */}
        <div className="shrink-0">
          <DropdownMenu
            trigger={
              <Button
                variant={editor.isActive('heading') ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-2 gap-0.5"
                title="Heading level"
              >
                <Heading className="h-3.5 w-3.5" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            }
            align="left"
          >
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-100 dark:bg-brand-black-90' : ''}
            >
              <Heading1 className="h-4 w-4 mr-2 inline" /> Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-100 dark:bg-brand-black-90' : ''}
            >
              <Heading2 className="h-4 w-4 mr-2 inline" /> Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-100 dark:bg-brand-black-90' : ''}
            >
              <Heading3 className="h-4 w-4 mr-2 inline" /> Heading 3
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={!editor.isActive('heading') ? 'bg-gray-100 dark:bg-brand-black-90' : ''}
            >
              <CaseUpper className="h-4 w-4 mr-2 inline" /> Paragraph
            </DropdownMenuItem>
          </DropdownMenu>
        </div>

        <div className="w-px h-6 bg-border hidden lg:block dark:bg-white" />

        {/* Lists Dropdown */}
        <div className="shrink-0">
          <DropdownMenu
            trigger={
              <Button
                variant={editor.isActive('bulletList') || editor.isActive('orderedList') ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-2 gap-0.5"
                title="List style"
              >
                <List className="h-3.5 w-3.5" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            }
            align="left"
          >
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'bg-gray-100 dark:bg-brand-black-90' : ''}
            >
              <List className="h-4 w-4 mr-2 inline" /> Bullet List
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'bg-gray-100 dark:bg-brand-black-90' : ''}
            >
              <ListOrdered className="h-4 w-4 mr-2 inline" /> Numbered List
            </DropdownMenuItem>
          </DropdownMenu>
        </div>

        <div className="w-px h-6 bg-border hidden lg:block dark:bg-white" />

        {/* Alignment Dropdown */}
        <div className="shrink-0">
          <DropdownMenu
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 gap-0.5"
                title="Text alignment"
              >
                <AlignLeft className="h-3.5 w-3.5" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            }
            align="left"
          >
            <DropdownMenuItem
              onClick={() => {
                editor.chain().focus().setTextAlign('left').run()
              }}
              className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100 dark:bg-brand-black-90' : ''}
            >
             Align Left
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                editor.chain().focus().setTextAlign('center').run()
              }}
              className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100 dark:bg-brand-black-90' : ''}
            >
              Align Center
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                editor.chain().focus().setTextAlign('right').run()
              }}
              className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100 dark:bg-brand-black-90' : ''}
            >
              Align Right
            </DropdownMenuItem>
          </DropdownMenu>
        </div>

        <div className="w-px h-6 bg-border hidden lg:block dark:bg-white" />

        {/* Insert Elements */}
        <div className="flex gap-0.5 shrink-0 items-center">
          <Button
            type="button"
            onClick={onImageUpload}
            variant="ghost"
            size="icon" className="h-8 w-8" title="Insert Image"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </Button>
          <Button
          type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
            size="icon" className="h-8 w-8" title="Insert Quote"
          >
          <Quote className="h-3.5 w-3.5" />             
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            variant="ghost"
            size="icon" className="h-8 w-8" title="Horizontal Rule"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            onClick={insertTable}
            variant={editor.isActive('table') ? 'default' : 'ghost'}
            size="icon" className="h-8 w-8" title="Insert Table"
          >
            <Table className="h-3.5 w-3.5" />
          </Button>

          {/* Link Controls */}
          <div className="relative z-50">
            {showLinkInput ? (
              <div className="absolute top-full left-0 mt-1 flex gap-0.5 bg-background border rounded-md p-2 shadow-lg z-50 whitespace-nowrap">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="URL"
                  className="px-2 py-1 border rounded text-sm w-40 sm:w-64"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addLink()
                    } else if (e.key === 'Escape') {
                      setShowLinkInput(false)
                      setLinkUrl('')
                    }
                  }}
                  autoFocus
                />
                <Button
                  type="button"
                  onClick={addLink}
                  size="sm"
                  variant="default"
                >
                  Add
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowLinkInput(false)
                    setLinkUrl('')
                  }}
                  size="sm"
                  variant="ghost"
                >
                  ✕
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  if (editor.isActive('link')) {
                    editor.chain().focus().unsetLink().run()
                  } else {
                    setShowLinkInput(true)
                  }
                }}
                variant={editor.isActive('link') ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}
              >
                {editor.isActive('link') ? (
                  <Unlink className="h-3.5 w-3.5" />
                ) : (
                  <Link className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="w-px h-6 bg-border hidden lg:block dark:bg-white" />

        {/* Undo/Redo */}
        <div className="flex gap-0.5 shrink-0 items-center">
          <Button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            variant="ghost"
            size="icon" className="h-8 w-8" title="Undo (Ctrl+Z)"
          >
            <Undo className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            variant="ghost"
            size="icon" className="h-8 w-8" title="Redo (Ctrl+Y)"
          >
            <Redo className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}


