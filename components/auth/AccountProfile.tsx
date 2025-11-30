'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, AtSign, Calendar, FileText, Clock, Trash2, Edit3, Loader2, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, cn } from '@/lib/utils';
import { strapiAPI } from '@/lib/api';
import { Draft } from '@/types';
import { useRouter } from 'next/navigation';

// Storage keys for loading drafts into editor
const STORAGE_KEY = 'tiptap_draft_content';
const STORAGE_WORD_COUNT_KEY = 'tiptap_draft_word_count';
const STORAGE_DRAFT_ID_KEY = 'tiptap_current_draft_id';
const STORAGE_DRAFT_NAME_KEY = 'tiptap_current_draft_name';

export default function AccountProfile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch user's drafts
  const fetchDrafts = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoadingDrafts(true);
    try {
      const userDrafts = await strapiAPI.getDraftsForUser(user.id);
      setDrafts(userDrafts);
    } catch (err) {
      console.error('Error fetching drafts:', err);
    } finally {
      setIsLoadingDrafts(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Get word count from content
  const getWordCount = (content: string) => {
    const text = content.replace(/<[^>]*>/g, ' ').trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(word => word.length > 0).length;
  };

  // Handle opening a draft in the editor
  const handleOpenDraft = (draft: Draft) => {
    // Calculate word count
    const wordCount = getWordCount(draft.content);
    
    // Save to local storage so editor can load it
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, draft.content);
      localStorage.setItem(STORAGE_WORD_COUNT_KEY, wordCount.toString());
      localStorage.setItem(STORAGE_DRAFT_ID_KEY, draft.documentId);
      localStorage.setItem(STORAGE_DRAFT_NAME_KEY, draft.name);
    }
    
    // Navigate to editor
    router.push('/submit');
  };

  // Handle deleting a draft
  const handleDeleteDraft = async (draft: Draft, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete "${draft.name}"?`)) {
      return;
    }

    setDeletingId(draft.documentId);
    
    try {
      await strapiAPI.deleteDraft(draft.documentId);
      setDrafts(prev => prev.filter(d => d.documentId !== draft.documentId));
    } catch (err) {
      console.error('Error deleting draft:', err);
      alert('Failed to delete draft');
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p>Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Information Card */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Account Information</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              Sign Out
            </Button>
          </div>
          <CardDescription>Manage your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium text-lg">{user.username}</p>
                <p className="text-sm text-muted-foreground">Member since {formatDate(user.createdAt)}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <AtSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Username</p>
                  <p>{user.username}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Joined</p>
                  <p>{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Saved Drafts Card */}
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Saved Drafts</CardTitle>
                <CardDescription>
                  {drafts.length > 0 
                    ? `${drafts.length} draft${drafts.length > 1 ? 's' : ''} saved`
                    : 'Your unpublished work'
                  }
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/submit')}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingDrafts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : drafts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-muted-foreground mb-4">You have no saved drafts yet</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/submit')}
              >
                Start Writing
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {drafts.map((draft) => (
                <div
                  key={draft.documentId}
                  onClick={() => handleOpenDraft(draft)}
                  className={cn(
                    "group flex items-center justify-between p-4 rounded-xl cursor-pointer",
                    "bg-gray-50 dark:bg-gray-800/50",
                    "border border-gray-100 dark:border-gray-700/50",
                    "hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10",
                    "transition-all duration-200"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {draft.name}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatRelativeTime(draft.updatedAt)}
                      </span>
                      <span>•</span>
                      <span>{getWordCount(draft.content)} words</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteDraft(draft, e)}
                      disabled={deletingId === draft.documentId}
                      className={cn(
                        "opacity-0 group-hover:opacity-100 transition-opacity",
                        "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      )}
                    >
                      {deletingId === draft.documentId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          Delete Account
        </Button>
      </div>
    </div>
  );
}