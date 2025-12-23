'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, AtSign, Calendar, FileText, Clock, Trash2, Edit3, Loader2, 
  ChevronRight, Bookmark, Phone, Globe, Lock, LogOut, AlertTriangle,
  Check, Pencil, Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, cn } from '@/lib/utils';
import { strapiAPI, BookmarkedArticle } from '@/lib/api';
import { config } from '@/lib/config';
import { updateUserData, changePassword, deleteAccount, getAuthorForCurrentUser, uploadUserAvatar, removeUserAvatar, getUserAvatarUrl } from '@/lib/auth';
import { validatePhoneNumber, formatPhoneNumber, COUNTRIES } from '@/lib/phone-validation';
import { Draft } from '@/types';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, X as CloseIcon } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { getFontClass } from '@/lib/fonts';

// Storage keys for loading drafts into editor
const STORAGE_KEY = 'tiptap_draft_content';
const STORAGE_WORD_COUNT_KEY = 'tiptap_draft_word_count';
const STORAGE_DRAFT_ID_KEY = 'tiptap_current_draft_id';
const STORAGE_DRAFT_NAME_KEY = 'tiptap_current_draft_name';

export default function AccountProfile() {
  const { user, logout, updateLocalUser } = useAuth();
  const router = useRouter();
  const toast = useToast();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('information');
  
  // Edit states
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Form values
  const [newUsername, setNewUsername] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Loading and error states
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  
  // Drafts state
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(true);
  const [removingBookmarkId, setRemovingBookmarkId] = useState<string | null>(null);
  
  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Avatar state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  
  // Author slug for "View Posts" link
  const [authorSlug, setAuthorSlug] = useState<string | null>(null);

  // Initialize form values from user
  useEffect(() => {
    if (user) {
      setNewUsername(user.username || '');
      setNewBio(user.Bio || '');
      setNewPhone(user.phoneNumber || '');
      setNewCountry(user.Country || 'BD');
    }
  }, [user]);

  // Fetch author slug
  useEffect(() => {
    async function fetchAuthorSlug() {
      const author = await getAuthorForCurrentUser();
      if (author?.slug) {
        setAuthorSlug(author.slug);
      }
    }
    fetchAuthorSlug();
  }, []);

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

  // Fetch user's bookmarks
  const fetchBookmarks = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoadingBookmarks(true);
    try {
      const userBookmarks = await strapiAPI.getBookmarksForUser(user.id);
      setBookmarks(userBookmarks);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    } finally {
      setIsLoadingBookmarks(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDrafts();
    fetchBookmarks();
  }, [fetchDrafts, fetchBookmarks]);

  // Clear messages after timeout
  useEffect(() => {
    if (saveSuccess || saveError) {
      const timer = setTimeout(() => {
        setSaveSuccess(null);
        setSaveError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess, saveError]);

  // Handle removing a bookmark
  const handleRemoveBookmark = async (bookmarkDocumentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setRemovingBookmarkId(bookmarkDocumentId);
    
    try {
      await strapiAPI.removeBookmark(bookmarkDocumentId);
      setBookmarks(prev => prev.filter(b => b.bookmarkDocumentId !== bookmarkDocumentId));
      toast.success('Bookmark removed successfully');
    } catch (err) {
      console.error('Error removing bookmark:', err);
      toast.error('Failed to remove bookmark', 'Remove Failed');
    } finally {
      setRemovingBookmarkId(null);
    }
  };

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
    const wordCount = getWordCount(draft.content);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, draft.content);
      localStorage.setItem(STORAGE_WORD_COUNT_KEY, wordCount.toString());
      localStorage.setItem(STORAGE_DRAFT_ID_KEY, draft.documentId);
      localStorage.setItem(STORAGE_DRAFT_NAME_KEY, draft.name);
    }
    
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
      toast.error('Failed to delete draft', 'Delete Failed');
    } finally {
      setDeletingId(null);
    }
  };

  // Save username
  const handleSaveUsername = async () => {
    if (!user) return;
    if (!newUsername.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    if (newUsername === user.username) {
      setIsEditingUsername(false);
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const updatedUser = await updateUserData(user.id, { username: newUsername.trim() });
      updateLocalUser(updatedUser);
      toast.success('Username updated successfully');
      setSaveSuccess('Username updated successfully');
      setIsEditingUsername(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update username';
      toast.error(errorMessage, 'Update Failed');
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Save bio
  const handleSaveBio = async () => {
    if (!user) return;
    if (newBio === (user.Bio || '')) {
      setIsEditingBio(false);
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const updatedUser = await updateUserData(user.id, { Bio: newBio.trim() });
      updateLocalUser(updatedUser);
      toast.success('Bio updated successfully');
      setSaveSuccess('Bio updated successfully');
      setIsEditingBio(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bio';
      toast.error(errorMessage, 'Update Failed');
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Save phone number
  const handleSavePhone = async () => {
    if (!user) return;
    
    // Validate phone number
    if (newPhone && !validatePhoneNumber(newPhone, newCountry)) {
      const errorMessage = `Invalid phone number for ${COUNTRIES.find(c => c.code === newCountry)?.name || newCountry}`;
      toast.error(errorMessage, 'Validation Error');
      setSaveError(errorMessage);
      return;
    }
    
    if (newPhone === (user.phoneNumber || '') && newCountry === (user.Country || '')) {
      setIsEditingPhone(false);
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const formattedPhone = newPhone ? formatPhoneNumber(newPhone, newCountry) : '';
      const updatedUser = await updateUserData(user.id, { 
        phoneNumber: formattedPhone,
        Country: newCountry 
      });
      updateLocalUser(updatedUser);
      toast.success('Phone number updated successfully');
      setSaveSuccess('Phone number updated successfully');
      setIsEditingPhone(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update phone number';
      toast.error(errorMessage, 'Update Failed');
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields', 'Validation Error');
      setSaveError('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match', 'Validation Error');
      setSaveError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters', 'Validation Error');
      setSaveError('Password must be at least 6 characters');
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setSaveSuccess('Password changed successfully');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      toast.error(errorMessage, 'Update Failed');
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!user) return;
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm', 'Validation Error');
      setSaveError('Please type DELETE to confirm');
      return;
    }
    
    setIsDeleting(true);
    setSaveError(null);
    
    try {
      await deleteAccount(user.id);
      toast.success('Account deleted successfully');
      router.push('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete account';
      toast.error(errorMessage, 'Delete Failed');
      setSaveError(errorMessage);
      setIsDeleting(false);
    }
  };

  // Cancel edit handlers
  const cancelEditUsername = () => {
    setNewUsername(user?.username || '');
    setIsEditingUsername(false);
  };

  const cancelEditBio = () => {
    setNewBio(user?.Bio || '');
    setIsEditingBio(false);
  };

  const cancelEditPhone = () => {
    setNewPhone(user?.phoneNumber || '');
    setNewCountry(user?.Country || 'BD');
    setIsEditingPhone(false);
  };

  const cancelChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsChangingPassword(false);
  };

  // Handle avatar file selection
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file', 'Invalid File');
      setSaveError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB', 'File Too Large');
      setSaveError('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload avatar
  const handleAvatarUpload = async () => {
    if (!user || !avatarInputRef.current?.files?.[0]) return;

    setIsUploadingAvatar(true);
    setSaveError(null);

    try {
      const file = avatarInputRef.current.files[0];
      const updatedUser = await uploadUserAvatar(user.id, file);
      updateLocalUser(updatedUser);
      setAvatarPreview(null);
      toast.success('Avatar updated successfully');
      setSaveSuccess('Avatar updated successfully');
      // Clear the file input
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar';
      toast.error(errorMessage, 'Upload Failed');
      setSaveError(errorMessage);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Cancel avatar selection
  const cancelAvatarSelect = () => {
    setAvatarPreview(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  // Remove avatar
  const handleRemoveAvatar = async () => {
    if (!user || !user.Avatar) return;

    setIsUploadingAvatar(true);
    setSaveError(null);

    try {
      const updatedUser = await removeUserAvatar(user.id);
      updateLocalUser(updatedUser);
      toast.success('Avatar removed successfully');
      setSaveSuccess('Avatar removed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove avatar';
      toast.error(errorMessage, 'Remove Failed');
      setSaveError(errorMessage);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Get current avatar URL
  const currentAvatarUrl = getUserAvatarUrl(user);

  if (!user) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Header - Medium style */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Account</h1>
        {authorSlug && (
          <Link href={`/author?slug=${authorSlug}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Posts
            </Button>
          </Link>
        )}
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="information" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="information">Information</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
        </TabsList>
        
        {/* Success/Error Messages */}
        {(saveSuccess || saveError) && (
          <div className={cn(
            "mt-4 p-3 rounded-lg flex items-center gap-2 text-sm",
            saveSuccess 
              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          )}>
            {saveSuccess ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {saveSuccess || saveError}
          </div>
        )}
        
        {/* Information Tab */}
        <TabsContent value="information">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture with Upload */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  {/* Avatar display */}
                  <div className="h-20 w-20 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center relative">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Avatar preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Image
                        src={currentAvatarUrl}
                        alt={user.username}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  
                  {/* Camera overlay button */}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className={cn(
                      "absolute inset-0 rounded-full flex items-center justify-center",
                      "bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity",
                      "cursor-pointer",
                      isUploadingAvatar && "cursor-not-allowed"
                    )}
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </button>
                  
                  {/* Hidden file input */}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                    disabled={isUploadingAvatar}
                  />
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-lg">{user.username}</p>
                  <p className="text-sm text-muted-foreground">
                    Member since {formatDate(user.createdAt)}
                  </p>
                  
                  {/* Avatar action buttons */}
                  {avatarPreview ? (
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={handleAvatarUpload}
                        disabled={isUploadingAvatar}
                      >
                        {isUploadingAvatar ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : null}
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelAvatarSelect}
                        disabled={isUploadingAvatar}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : user.Avatar ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRemoveAvatar}
                      disabled={isUploadingAvatar}
                      className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <CloseIcon className="h-4 w-4 mr-1" />
                      )}
                      Remove Photo
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-2">
                      Hover over image to change
                    </p>
                  )}
                </div>
              </div>
              
              <Separator />
              
              {/* Email (Read-only) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <p className="text-foreground pl-6">{user.email}</p>
                <p className="text-xs text-muted-foreground pl-6">Email cannot be changed</p>
              </div>
              
              {/* Username (Editable) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <AtSign className="h-4 w-4" />
                    Username
                  </div>
                  {!isEditingUsername && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditingUsername(true)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingUsername ? (
                  <div className="pl-6 space-y-2">
                    <Input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter username"
                      disabled={isSaving}
                    />
                    <p className="text-xs text-muted-foreground">
                      Username must be unique
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleSaveUsername}
                        disabled={isSaving}
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={cancelEditUsername}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-foreground pl-6">{user.username}</p>
                )}
              </div>
              
              {/* Bio (Editable) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Bio
                  </div>
                  {!isEditingBio && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditingBio(true)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingBio ? (
                  <div className="pl-6 space-y-2">
                    <Textarea
                      value={newBio}
                      onChange={(e) => setNewBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      disabled={isSaving}
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleSaveBio}
                        disabled={isSaving}
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={cancelEditBio}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-foreground pl-6">
                    {user.Bio || <span className="text-muted-foreground italic">No bio added</span>}
                  </p>
                )}
              </div>
              
              {/* Phone Number (Editable) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </div>
                  {!isEditingPhone && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditingPhone(true)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingPhone ? (
                  <div className="pl-6 space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={newCountry}
                        onChange={(e) => setNewCountry(e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        disabled={isSaving}
                      >
                        {COUNTRIES.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="Enter phone number"
                        disabled={isSaving}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Phone number must be valid for the selected country
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleSavePhone}
                        disabled={isSaving}
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={cancelEditPhone}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="pl-6">
                    {user.phoneNumber ? (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{COUNTRIES.find(c => c.code === user.Country)?.name || user.Country}</span>
                        <span>•</span>
                        <span>{user.phoneNumber}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">No phone number added</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Join Date (Read-only) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Joined
                </div>
                <p className="text-foreground pl-6">{formatDate(user.createdAt)}</p>
              </div>
              
              <Separator />
              
              {/* Password Change */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    Password
                  </div>
                  {!isChangingPassword && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsChangingPassword(true)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Change
                    </Button>
                  )}
                </div>
                {isChangingPassword ? (
                  <div className="pl-6 space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Current Password</label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">New Password</label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        disabled={isSaving}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Confirm New Password</label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        disabled={isSaving}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleChangePassword}
                        disabled={isSaving}
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={cancelChangePassword}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-foreground pl-6">••••••••</p>
                )}
              </div>
              
              <Separator />
              
              {/* Logout & Delete Account */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={logout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
                
                {!showDeleteConfirm ? (
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                ) : (
                  <div className="flex-1 p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                    <p className="text-sm text-destructive font-medium mb-2">
                      Are you sure? This action cannot be undone.
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Type <strong>DELETE</strong> to confirm
                    </p>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type DELETE"
                      className="mb-3"
                      disabled={isDeleting}
                    />
                    <div className="flex gap-2">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                      >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete My Account'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText('');
                        }}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Drafts Tab */}
        <TabsContent value="drafts">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Saved Drafts</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
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
                  className="w-full sm:w-auto"
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
                <div className="space-y-2.5 sm:space-y-2">
                  {drafts.map((draft) => (
                    <div
                      key={draft.documentId}
                      onClick={() => handleOpenDraft(draft)}
                      className={cn(
                        "group flex items-center justify-between p-3.5 sm:p-4 rounded-xl cursor-pointer",
                        "bg-gray-50 dark:bg-gray-800/50",
                        "border border-gray-100 dark:border-gray-700/50",
                        "hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10",
                        "active:scale-[0.98] transition-all duration-200"
                      )}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                          {draft.name}
                        </h4>
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            {formatRelativeTime(draft.updatedAt)}
                          </span>
                          <span>•</span>
                          <span>{getWordCount(draft.content)} words</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteDraft(draft, e)}
                          disabled={deletingId === draft.documentId}
                          className={cn(
                            "sm:opacity-0 group-hover:opacity-100 transition-opacity",
                            "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20",
                            "h-9 w-9 p-0 sm:h-8 sm:w-8"
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
        </TabsContent>
        
        {/* Bookmarks Tab */}
        <TabsContent value="bookmarks">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Bookmark className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl">Bookmarked Articles</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {bookmarks.length > 0 
                      ? `${bookmarks.length} article${bookmarks.length > 1 ? 's' : ''} saved`
                      : 'Articles you want to read later'
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingBookmarks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                </div>
              ) : bookmarks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Bookmark className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-muted-foreground mb-4">You haven&apos;t bookmarked any articles yet</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/browse')}
                  >
                    Browse Articles
                  </Button>
                </div>
              ) : (
                <div className="space-y-2.5 sm:space-y-3">
                  {bookmarks.map((bookmark) => (
                    <Link
                      key={bookmark.bookmarkDocumentId}
                      href={`/read-article?slug=${bookmark.slug}`}
                      className={cn(
                        "group flex gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-xl",
                        "bg-gray-50 dark:bg-gray-800/50",
                        "border border-gray-100 dark:border-gray-700/50",
                        "hover:border-amber-500/30 hover:bg-amber-50/50 dark:hover:bg-amber-900/10",
                        "active:scale-[0.98] transition-all duration-200"
                      )}
                    >
                      {/* Article Thumbnail */}
                      <div className="flex-shrink-0 w-20 h-16 sm:w-24 sm:h-18 rounded-lg overflow-hidden relative bg-gray-100 dark:bg-gray-700">
                        <Image
                          src={bookmark.featuredImage 
                            ? (bookmark.featuredImage.startsWith('http') 
                                ? bookmark.featuredImage 
                                : `${config.strapi.url}${bookmark.featuredImage}`)
                            : '/images/placeholder.jpg'
                          }
                          alt={bookmark.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      {/* Article Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug",
                          getFontClass(bookmark.title)
                        )}>
                          {bookmark.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1.5 sm:mt-2">
                          {bookmark.authorName && (
                            <span className={cn("truncate max-w-[120px] sm:max-w-none", getFontClass(bookmark.authorName))}>{bookmark.authorName}</span>
                          )}
                          {bookmark.authorName && bookmark.category && (
                            <span>•</span>
                          )}
                          {bookmark.category && (
                            <span className={cn("text-amber-600 dark:text-amber-400 truncate max-w-[100px] sm:max-w-none", getFontClass(bookmark.category))}>{bookmark.category}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleRemoveBookmark(bookmark.bookmarkDocumentId, e)}
                          disabled={removingBookmarkId === bookmark.bookmarkDocumentId}
                          className={cn(
                            "sm:opacity-0 group-hover:opacity-100 transition-opacity",
                            "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20",
                            "h-9 w-9 p-0 sm:h-8 sm:w-8"
                          )}
                          title="Remove bookmark"
                        >
                          {removingBookmarkId === bookmark.bookmarkDocumentId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
