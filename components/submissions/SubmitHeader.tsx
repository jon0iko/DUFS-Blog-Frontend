'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, MoreVertical, FileText, Edit3, FilePlus, Sun, Moon, Check, MessageSquareWarning, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { strapiAPI } from '@/lib/api'
import { useToast } from '@/components/ui/toast'

interface SubmitHeaderProps {
  wordCount: number
  onSaveDraft: () => void
  onViewDrafts: () => void
  onPublish: () => void
  onClear: () => void
  onNewArticle: () => void
  isUploading: boolean
  onBack?: () => void
  currentDraftName?: string
}

export default function SubmitHeader({ 
  wordCount, 
  onSaveDraft,
  onViewDrafts,
  onPublish, 
  onClear,
  onNewArticle,
  isUploading,
  onBack,
  currentDraftName
}: SubmitHeaderProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const toast = useToast()
  const { user } = useAuth()
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [issueDescription, setIssueDescription] = useState('')
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false)

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const isThemeSelected = (value: 'light' | 'dark' | 'system') => theme === value

  const openIssueDialog = () => {
    setIsReportDialogOpen(true)
  }

  const closeIssueDialog = () => {
    if (isSubmittingIssue) return
    setIsReportDialogOpen(false)
    setIssueDescription('')
  }

  const handleSubmitIssue = async () => {
    const trimmedDescription = issueDescription.trim()
    if (!trimmedDescription) {
      toast.warning('Please describe the issue before submitting.', 'Description Required')
      return
    }

    setIsSubmittingIssue(true)
    try {
      await strapiAPI.createUserRequestReport({
        section: 'EditorIssue',
        description: trimmedDescription,
        userId: user?.id,
      })
      toast.success('Issue reported successfully. Thank you for the feedback.', 'Report Submitted')
      closeIssueDialog()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to submit issue report.'
      toast.error(message, 'Report Failed')
    } finally {
      setIsSubmittingIssue(false)
    }
  }

  return (
    <>
      <header className="flex-shrink-0 z-100 border-b bg-background shadow-lg">
        <div className="container max-w-5xl px-4 py-2 h-16">
          <div className="flex items-center justify-between gap-4 h-full">
          {/* Left: Back Button + Logo */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white shadow-sm">
              <Image 
                src="/images/Logo.svg" 
                alt="DUFS Logo" 
                width={32} 
                height={32}
                className="h-8 w-auto"
              />
            </div>
            {/* Current Draft Name */}
            {currentDraftName && (
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Edit3 className="h-3.5 w-3.5" />
                <span className="font-medium truncate max-w-[200px]">{currentDraftName}</span>
              </div>
            )}
          </div>

          {/* Center: Word Count (Desktop) */}
          <div className="hidden md:flex items-center text-sm text-muted-foreground">
            <span>{wordCount} words</span>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Word count badge (Mobile) */}
            <div className="md:hidden px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
              {wordCount}
            </div>

            {/* Desktop Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onNewArticle}
                className="flex items-center gap-2 rounded-md"
              >
                <FilePlus className="h-4 w-4" />
                <span className="hidden lg:inline">New</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onViewDrafts}
                className="flex items-center gap-2 rounded-md"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden lg:inline">Drafts</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onSaveDraft}
                disabled={isUploading}
                className="flex items-center gap-2  rounded-md"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              <Button
                size="sm"
                onClick={onPublish}
                disabled={isUploading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-md shadow-lg px-4 py-2 uppercase text-sm"
              >
                {isUploading ? 'Publishing...' : 'Publish'}
              </Button>
            </div>

            {/* Desktop: Theme Menu */}
            <div className="hidden sm:block">
              <DropdownMenu
                align="right"
                trigger={
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                }
              >
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center">
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </span>
                    {isThemeSelected('light') && <Check className="h-4 w-4" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center">
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </span>
                    {isThemeSelected('dark') && <Check className="h-4 w-4" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openIssueDialog}>
                  <div className="flex items-center">
                    <MessageSquareWarning className="h-4 w-4 mr-2" />
                    Report an issue
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onClear}>
                  <div className="flex items-center">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Content
                  </div>
                </DropdownMenuItem>
              </DropdownMenu>
            </div>

            {/* Mobile: Publish Button + Menu */}
            <div className="sm:hidden flex items-center gap-2">
              <Button
                size="sm"
                onClick={onPublish}
                disabled={isUploading}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white rounded-md shadow-lg px-3 py-2 text-xs font-bold"
              >
                {isUploading ? '...' : 'Publish'}
              </Button>
              <DropdownMenu
                trigger={
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                }
              >
                <DropdownMenuItem onClick={onNewArticle}>
                  <div className='flex'>
                  <FilePlus className="h-4 w-4 mr-2" />
                  New Article
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewDrafts}>
                  <div className='flex'>
                  <FileText className="h-4 w-4 mr-2" />
                  Drafts
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSaveDraft}>
                  <div className='flex'>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <div className='flex items-center justify-between w-full'>
                    <span className='flex items-center'>
                      <Sun className="h-4 w-4 mr-2" />
                      Light Theme
                    </span>
                    {isThemeSelected('light') && <Check className="h-4 w-4" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <div className='flex items-center justify-between w-full'>
                    <span className='flex items-center'>
                      <Moon className="h-4 w-4 mr-2" />
                      Dark Theme
                    </span>
                    {isThemeSelected('dark') && <Check className="h-4 w-4" />}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openIssueDialog}>
                  <div className='flex'>
                    <MessageSquareWarning className="h-4 w-4 mr-2" />
                    Report an issue
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onClear}>
                  <div className='flex'>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Content
                  </div>
                </DropdownMenuItem>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      </header>

      {isReportDialogOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeIssueDialog} />
          <div className="relative w-full max-w-md mx-4 rounded-2xl border border-border bg-background p-5 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">Report an issue</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Describe what went wrong in the editor.<br/> We will try to fix it as soon as possible.
              </p>
            </div>

            <textarea
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Describe the issue..."
              rows={5}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              disabled={isSubmittingIssue}
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={closeIssueDialog} disabled={isSubmittingIssue}>
                Cancel
              </Button>
              <Button onClick={handleSubmitIssue} disabled={isSubmittingIssue || !issueDescription.trim()}>
                {isSubmittingIssue ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
