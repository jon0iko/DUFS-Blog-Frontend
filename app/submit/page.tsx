'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/common/LoadingScreen';
import Tiptap from "@/components/tiptap/Tiptap"
import type { TiptapRef } from "@/components/tiptap/types"
import SubmitHeader from '@/components/submissions/SubmitHeader';
import PublishModal from '@/components/submissions/PublishModal';
import SaveDraftModal from '@/components/submissions/SaveDraftModal';
import DraftsListModal from '@/components/submissions/DraftsListModal';
import { strapiAPI } from '@/lib/api';
import { Draft } from '@/types';
import { useToast } from '@/components/ui/toast';

// Helper to generate user-specific storage keys
const getStorageKey = (userId: number | undefined, key: string): string => {
  if (!userId) return `tiptap_guest_${key}`;
  return `tiptap_user_${userId}_${key}`;
};

// Storage key constants
const STORAGE_KEYS = {
  CONTENT: 'draft_content',
  WORD_COUNT: 'draft_word_count',
  DRAFT_ID: 'current_draft_id',
  DRAFT_NAME: 'current_draft_name',
} as const;

export default function SubmitPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const tiptapRef = useRef<TiptapRef>(null);
  const toast = useToast();
  
  // Editor state
  const [wordCount, setWordCount] = useState(0);
  const [content, setContent] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [editorKey, setEditorKey] = useState(0);
  const [isPageReady, setIsPageReady] = useState(false);
  
  // Modal state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [showDraftsListModal, setShowDraftsListModal] = useState(false);
  
  // Draft tracking
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [currentDraftName, setCurrentDraftName] = useState<string>('');
  
  // Loading states
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);

  // Clear any guest data when user logs in
  useEffect(() => {
    if (user?.id && typeof window !== 'undefined') {
      // Check if there's guest data and migrate it
      const guestContent = localStorage.getItem('tiptap_guest_draft_content');
      const userContent = localStorage.getItem(getStorageKey(user.id, STORAGE_KEYS.CONTENT));
      
      // If user has no content but guest has content, offer to migrate
      if (guestContent && !userContent) {
        localStorage.setItem(getStorageKey(user.id, STORAGE_KEYS.CONTENT), guestContent);
        localStorage.setItem(getStorageKey(user.id, STORAGE_KEYS.WORD_COUNT), 
          localStorage.getItem('tiptap_guest_draft_word_count') || '0');
      }
      
      // Clear guest data after potential migration
      localStorage.removeItem('tiptap_guest_draft_content');
      localStorage.removeItem('tiptap_guest_draft_word_count');
      localStorage.removeItem('tiptap_guest_current_draft_id');
      localStorage.removeItem('tiptap_guest_current_draft_name');
    }
  }, [user?.id]);

  // Load content from local storage on mount (user-specific)
  useEffect(() => {
    if (typeof window !== 'undefined' && !authLoading) {
      const savedContent = localStorage.getItem(getStorageKey(user?.id, STORAGE_KEYS.CONTENT)) || '';
      const savedWordCount = parseInt(localStorage.getItem(getStorageKey(user?.id, STORAGE_KEYS.WORD_COUNT)) || '0', 10);
      const savedDraftId = localStorage.getItem(getStorageKey(user?.id, STORAGE_KEYS.DRAFT_ID)) || null;
      const savedDraftName = localStorage.getItem(getStorageKey(user?.id, STORAGE_KEYS.DRAFT_NAME)) || '';
      
      setInitialContent(savedContent);
      setContent(savedContent);
      setWordCount(savedWordCount);
      setCurrentDraftId(savedDraftId);
      setCurrentDraftName(savedDraftName);
      setIsPageReady(true);
    }
  }, [user?.id, authLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleContentChange = useCallback((html: string) => {
    setContent(html);
    // Save to local storage immediately
    if (typeof window !== 'undefined' && isPageReady) {
      localStorage.setItem(getStorageKey(user?.id, STORAGE_KEYS.CONTENT), html);
    }
  }, [user?.id, isPageReady]);

  const handleWordCountChange = useCallback((count: number) => {
    setWordCount(count);
  }, []);

  // Save word count to localStorage periodically (debounced via content change)
  useEffect(() => {
    if (isPageReady && typeof window !== 'undefined') {
      localStorage.setItem(getStorageKey(user?.id, STORAGE_KEYS.WORD_COUNT), wordCount.toString());
    }
  }, [wordCount, user?.id, isPageReady]);

  // Open save draft modal
  const handleSaveDraft = useCallback(() => {
    if (!content || content === '<p></p>') {
      toast.warning('Please write some content before saving a draft.', 'No Content');
      return;
    }
    setShowSaveDraftModal(true);
  }, [content, toast]);

  // Actually save the draft
  const handleSaveDraftConfirm = useCallback(async (name: string) => {
    if (!user?.id) {
      throw new Error('You must be logged in to save drafts');
    }

    try {
      if (currentDraftId) {
        // Update existing draft
        await strapiAPI.updateDraft(currentDraftId, name, content);
        toast.success('Draft updated successfully');
      } else {
        // Create new draft
        const newDraft = await strapiAPI.createDraft(name, content, user.id);
        setCurrentDraftId(newDraft.documentId);
        
        // Save draft ID to local storage
        if (typeof window !== 'undefined') {
          localStorage.setItem(getStorageKey(user.id, STORAGE_KEYS.DRAFT_ID), newDraft.documentId);
        }
        toast.success('Draft saved successfully');
      }
      
      setCurrentDraftName(name);
      if (typeof window !== 'undefined') {
        localStorage.setItem(getStorageKey(user?.id, STORAGE_KEYS.DRAFT_NAME), name);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save draft';
      toast.error(errorMessage, 'Save Failed');
      throw error;
    }
  }, [user?.id, content, currentDraftId, toast]);

  // Open drafts list modal
  const handleViewDrafts = useCallback(() => {
    setShowDraftsListModal(true);
  }, []);

  // Load a draft into the editor
  const handleLoadDraft = useCallback((draft: Draft) => {
    setIsLoadingDraft(true);
    
    try {
      // Update state
      setContent(draft.content);
      setCurrentDraftId(draft.documentId);
      setCurrentDraftName(draft.name);
      
      // Calculate word count
      const text = draft.content.replace(/<[^>]*>/g, ' ').trim();
      const count = text ? text.split(/\s+/).filter(word => word.length > 0).length : 0;
      setWordCount(count);
      
      // Save to local storage
      if (typeof window !== 'undefined' && user?.id) {
        localStorage.setItem(getStorageKey(user.id, STORAGE_KEYS.CONTENT), draft.content);
        localStorage.setItem(getStorageKey(user.id, STORAGE_KEYS.WORD_COUNT), count.toString());
        localStorage.setItem(getStorageKey(user.id, STORAGE_KEYS.DRAFT_ID), draft.documentId);
        localStorage.setItem(getStorageKey(user.id, STORAGE_KEYS.DRAFT_NAME), draft.name);
      }
      
      // Update the editor directly via ref
      if (tiptapRef.current) {
        tiptapRef.current.setContent(draft.content);
      } else {
        // Fallback: force editor re-render with new content
        setInitialContent(draft.content);
        setEditorKey(prev => prev + 1);
      }
      
      toast.success(`Draft "${draft.name}" loaded successfully`);
    } catch (error) {
      toast.error('Failed to load draft', 'Load Failed');
    } finally {
      setIsLoadingDraft(false);
    }
  }, [user?.id, toast]);

  const handlePublish = useCallback(() => {
    if (!content || content === '<p></p>') {
      toast.warning('Please write some content before publishing.', 'No Content');
      return;
    }
    setShowPublishModal(true);
  }, [content, toast]);

  const handlePublishSuccess = useCallback(async () => {
    // If we were editing a draft, delete it after successful publish
    if (currentDraftId) {
      try {
        await strapiAPI.deleteDraft(currentDraftId);
      } catch (err) {
        console.error('Failed to delete draft after publish:', err);
      }
    }
    
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(getStorageKey(user?.id, STORAGE_KEYS.CONTENT));
      localStorage.removeItem(getStorageKey(user?.id, STORAGE_KEYS.WORD_COUNT));
      localStorage.removeItem(getStorageKey(user?.id, STORAGE_KEYS.DRAFT_ID));
      localStorage.removeItem(getStorageKey(user?.id, STORAGE_KEYS.DRAFT_NAME));
    }
    
    toast.success('Article published successfully! Redirecting...', 'Success');
    setTimeout(() => router.push('/'), 1000);
  }, [router, currentDraftId, user?.id, toast]);

  const handleClear = useCallback(() => {
    if (confirm('Are you sure you want to clear all content? This will not delete saved drafts in the cloud.')) {
      // Clear state
      setContent('');
      setWordCount(0);
      setCurrentDraftId(null);
      setCurrentDraftName('');
      
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(getStorageKey(user?.id, STORAGE_KEYS.CONTENT));
        localStorage.removeItem(getStorageKey(user?.id, STORAGE_KEYS.WORD_COUNT));
        localStorage.removeItem(getStorageKey(user?.id, STORAGE_KEYS.DRAFT_ID));
        localStorage.removeItem(getStorageKey(user?.id, STORAGE_KEYS.DRAFT_NAME));
      }
      
      // Clear editor via ref
      if (tiptapRef.current) {
        tiptapRef.current.clearContent();
      } else {
        // Fallback: force editor re-render
        setInitialContent('');
        setEditorKey(prev => prev + 1);
      }
      
      toast.info('Content cleared successfully');
    }
  }, [user?.id, toast]);

  const handleNewArticle = useCallback(() => {
    // If there's unsaved content, confirm before clearing
    const hasContent = content && content !== '<p></p>';
    if (hasContent) {
      if (!confirm('Start a new article? Any unsaved changes will be lost. Make sure to save your draft first if needed.')) {
        return;
      }
    }
    
    // Clear state
    setContent('');
    setWordCount(0);
    setCurrentDraftId(null);
    setCurrentDraftName('');
    
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(getStorageKey(user?.id, STORAGE_KEYS.CONTENT));
      localStorage.removeItem(getStorageKey(user?.id, STORAGE_KEYS.WORD_COUNT));
      localStorage.removeItem(getStorageKey(user?.id, STORAGE_KEYS.DRAFT_ID));
      localStorage.removeItem(getStorageKey(user?.id, STORAGE_KEYS.DRAFT_NAME));
    }
    
    // Clear editor via ref
    if (tiptapRef.current) {
      tiptapRef.current.clearContent();
    } else {
      // Fallback: force editor re-render
      setInitialContent('');
      setEditorKey(prev => prev + 1);
    }
  }, [content, user?.id]);

  const handleBack = useCallback(() => {
    // Content is already saved to local storage on every change
    router.back();
  }, [router]);

  // Show loading while checking auth
  if (authLoading || !isPageReady) {
    return <LoadingScreen isLoading={true} />;
  }

  return (
    <>
      {isAuthenticated && (
        <div className="fixed inset-0 flex flex-col bg-[#ececec] dark:bg-[#101418] dark:border-white">
          <SubmitHeader
            wordCount={wordCount}
            onSaveDraft={handleSaveDraft}
            onViewDrafts={handleViewDrafts}
            onPublish={handlePublish}
            onClear={handleClear}
            onNewArticle={handleNewArticle}
            isUploading={isLoadingDraft}
            onBack={handleBack}
            currentDraftName={currentDraftName}
          />
          <div className="container max-w-5xl py-4 px-4 flex-1 flex flex-col min-h-0 rounded-lg dark:border-white">
            <Tiptap 
              ref={tiptapRef}
              key={editorKey}
              initialContent={initialContent}
              onContentChange={handleContentChange}
              onWordCountChange={handleWordCountChange}
              placeholder="Start writing your post content..."
            />
          </div>
        </div>
      )}
      
      {/* Publish Modal */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        content={content}
        onPublishSuccess={handlePublishSuccess}
      />
      
      {/* Save Draft Modal */}
      <SaveDraftModal
        isOpen={showSaveDraftModal}
        onClose={() => setShowSaveDraftModal(false)}
        onSave={handleSaveDraftConfirm}
        defaultName={currentDraftName}
        isUpdate={!!currentDraftId}
      />
      
      {/* Drafts List Modal */}
      <DraftsListModal
        isOpen={showDraftsListModal}
        onClose={() => setShowDraftsListModal(false)}
        onLoadDraft={handleLoadDraft}
      />
    </>
  );
}