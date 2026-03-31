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
import { formatRelativeTime } from '@/lib/date-utils';
import { getWordCount } from '@/lib/content-utils';
import { getStorageKey, EDITOR_STORAGE_KEYS, saveDraftToStorage } from '@/lib/storage-utils';
import { updateUserData, changePassword, deleteAccount, getAuthorForCurrentUser, uploadUserAvatar, removeUserAvatar, getUserAvatarUrl, getToken } from '@/lib/auth';
import { validatePhoneNumber, formatPhoneNumber, COUNTRIES } from '@/lib/phone-validation';
import { Draft } from '@/types';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, X as CloseIcon } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { getFontClass } from '@/lib/fonts';
import AvatarCropModal from './AvatarCropModal';
import ConfirmDialog from '@/components/common/ConfirmDialog';



export default function AccountProfile() {
  const { user, logout, updateLocalUser } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const auth = useAuth();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('information');
  
  // Edit states
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingFullName, setIsEditingFullName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Form values
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
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
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [cropModalImageSrc, setCropModalImageSrc] = useState<string | null>(null);
  const [showAvatarCropModal, setShowAvatarCropModal] = useState(false);
  const [cropFileName, setCropFileName] = useState('avatar.png');
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  
  // Author slug for "View Posts" link
  const [authorSlug, setAuthorSlug] = useState<string | null>(null);

  // Initialize form values from user
  useEffect(() => {
    if (user) {
      setNewUsername(user.username || '');
      setNewFullName(user.fullName || '');
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

  const handleNew = () => {
    // Clear the editor content storage
    if (typeof window !== 'undefined' && user?.id) {
      localStorage.removeItem(getStorageKey(user.id, EDITOR_STORAGE_KEYS.CONTENT));
      localStorage.removeItem(getStorageKey(user.id, EDITOR_STORAGE_KEYS.WORD_COUNT));
      localStorage.removeItem(getStorageKey(user.id, EDITOR_STORAGE_KEYS.DRAFT_ID));
      localStorage.removeItem(getStorageKey(user.id, EDITOR_STORAGE_KEYS.DRAFT_NAME));
    }
    router.push('/editor');
  };



  // Handle opening a draft in the editor
  const handleOpenDraft = (draft: Draft) => {
    const wordCount = getWordCount(draft.content);
    
    if (typeof window !== 'undefined' && user?.id) {
      saveDraftToStorage(user.id, {
        content: draft.content,
        wordCount,
        draftId: draft.documentId,
        draftName: draft.name,
      });
    }
    
    router.push('/editor');
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

  // Save Full Name
  const handleSaveFullName = async () => {
    if (!user) return;
    if (newFullName === (user.fullName || '')) {
      setIsEditingFullName(false);
      return;
    }
    
    setIsSaving(true);
    setSaveError(null);
    
    // We need to extend updateUserData in lib/auth.ts to accept fullName
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${config.strapi.url}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName: newFullName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || 'Failed to update full name');
      }

      const updatedUser = await response.json();
      updateLocalUser(updatedUser);
      toast.success('Full Name updated successfully');
      setSaveSuccess('Full Name updated successfully');
      setIsEditingFullName(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update full name';
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
      // go to homepage and refresh to clear any user data
      auth.refreshUser();
      // Add a small delay to ensure the state update is processed before navigation
      setTimeout(() => {
        window.location.href = '/?reason=account-deleted';
      }, 100);
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

  const cancelEditFullName = () => {
    setNewFullName(user?.fullName || '');
    setIsEditingFullName(false);
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

    // Open crop modal with selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setCropModalImageSrc(reader.result as string);
      setCropFileName(file.name || 'avatar.png');
      setShowAvatarCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarCropComplete = (croppedFile: File) => {
    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }

    const previewUrl = URL.createObjectURL(croppedFile);
    setAvatarPreview(previewUrl);
    setSelectedAvatarFile(croppedFile);
    setShowAvatarCropModal(false);
    setCropModalImageSrc(null);
  };

  const handleAvatarCropCancel = () => {
    setShowAvatarCropModal(false);
    setCropModalImageSrc(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  // Upload avatar
  const handleAvatarUpload = async () => {
    if (!user || !selectedAvatarFile) return;

    setIsUploadingAvatar(true);
    setSaveError(null);

    try {
      const updatedUser = await uploadUserAvatar(user.id, selectedAvatarFile);
      updateLocalUser(updatedUser);
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(null);
      setSelectedAvatarFile(null);
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
    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
    setSelectedAvatarFile(null);
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

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* User Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">My Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your profile</p>
        </div>
        {authorSlug && (
          <Link href={`/author?slug=${authorSlug}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View Posts
            </Button>
          </Link>
        )}
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="information" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 place-items-center md:place-items-stretch">
          <TabsTrigger value="information" className='!text-xs md:!text-sm'>Information</TabsTrigger>
          <TabsTrigger value="drafts" className='!text-xs md:!text-sm'>Drafts</TabsTrigger>
          <TabsTrigger value="bookmarks" className='!text-xs md:!text-sm'>Bookmarks</TabsTrigger>
        </TabsList>
        
        {/* Success/Error Messages */}
        {(saveSuccess || saveError) && (
          <div className={cn(
            "mt-4 p-4 rounded-lg flex items-start gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300",
            saveSuccess 
              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
          )}>
            {saveSuccess ? <Check className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            <span className="flex-1">{saveSuccess || saveError}</span>
          </div>
        )}
        
        {/* Information Tab */}
        <TabsContent value="information" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Profile Picture with Upload */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                <div className="flex flex-col items-center sm:items-start gap-2">
                  <div className="relative group flex-shrink-0">
                    {/* Avatar display */}
                    <div className="h-24 w-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center relative border border-primary/20">
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
                    
                    {/* Camera overlay button - only on image */}
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className={cn(
                        "absolute inset-0 rounded-full flex items-center justify-center",
                        "bg-black/50 opacity-0 sm:group-hover:opacity-100 transition-opacity",
                        "cursor-pointer",
                        isUploadingAvatar && "cursor-not-allowed opacity-50"
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
                  
                  {/* Helper text - visible on all screens */}
                  <p className="md:hidden text-xs text-muted-foreground text-center sm:text-left">
                    Click on the image to change
                  </p>
                </div>
                
                <div className="flex-1">
                  <div>
                    <p className="font-semibold text-lg">{user.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Member since {formatDate(user.createdAt)}
                    </p>
                  </div>
                  
                  {/* Avatar action buttons */}
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    {avatarPreview ? (
                      <>
                        <Button
                          size="sm"
                          onClick={handleAvatarUpload}
                          disabled={isUploadingAvatar}
                        >
                          {isUploadingAvatar ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Save Avatar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelAvatarSelect}
                          disabled={isUploadingAvatar}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : user.Avatar ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRemoveAvatar}
                        disabled={isUploadingAvatar}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {isUploadingAvatar ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CloseIcon className="h-4 w-4 mr-2" />
                        )}
                        Remove Photo
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {/* Email (Read-only) */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address
                </label>
                <div className="pl-6 space-y-1">
                  <p className="text-base text-foreground font-medium">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Email cannot be changed for security</p>
                </div>
              </div>
              
              {/* Username (Editable) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <AtSign className="h-4 w-4 text-muted-foreground" />
                    Username
                  </label>
                  {!isEditingUsername && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditingUsername(true)}
                      className="h-8 px-2 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingUsername ? (
                  <div className="pl-6 space-y-3">
                    <Input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter username"
                      disabled={isSaving}
                      className="max-w-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Username must be unique and between 3-20 characters
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleSaveUsername}
                        disabled={isSaving}
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                        Save
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
                  <div className="pl-6">
                    <p className="text-base text-foreground font-medium">{user.username}</p>
                  </div>
                )}
              </div>
              
              {/* Full Name (Editable) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <AtSign className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </label>
                  {!isEditingFullName && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditingFullName(true)}
                      className="h-8 px-2 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingFullName ? (
                  <div className="pl-6 space-y-3">
                    <Input
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={isSaving}
                      className="max-w-sm"
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleSaveFullName}
                        disabled={isSaving}
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={cancelEditFullName}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="pl-6">
                    <p className="text-base text-foreground font-medium">
                      {user.fullName || <span className="text-muted-foreground italic">Not provided</span>}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Bio (Editable) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    Bio
                  </label>
                  {!isEditingBio && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditingBio(true)}
                      className="h-8 px-2 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingBio ? (
                  <div className="pl-6 space-y-3">
                    <Textarea
                      value={newBio}
                      onChange={(e) => setNewBio(e.target.value.slice(0, 500))}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      disabled={isSaving}
                      maxLength={500}
                      className="max-w-2xl resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {newBio.length} / 500 characters
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleSaveBio}
                        disabled={isSaving}
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                        Save
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
                  <div className="pl-6">
                    <p className="text-base text-foreground whitespace-pre-wrap">
                      {user.Bio || <span className="text-muted-foreground italic">Not provided</span>}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Phone Number (Editable) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone Number
                  </label>
                  {!isEditingPhone && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditingPhone(true)}
                      className="h-8 px-2 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingPhone ? (
                  <div className="pl-6 space-y-3">
                    <div className="flex gap-3 max-w-2xl">
                      <select
                        value={newCountry}
                        onChange={(e) => setNewCountry(e.target.value)}
                        className={cn(
                          "h-10 rounded-md px-3 py-2 text-sm font-medium",
                          "bg-background border border-input",
                          "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          "transition-colors cursor-pointer",
                          "min-w-[140px] flex-shrink-0"
                        )}
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
                      Enter a valid phone number for {COUNTRIES.find(c => c.code === newCountry)?.name || newCountry}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={handleSavePhone}
                        disabled={isSaving}
                        className="font-medium"
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={cancelEditPhone}
                        disabled={isSaving}
                        className="font-medium"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="pl-6">
                    {user.phoneNumber ? (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{COUNTRIES.find(c => c.code === user.Country)?.name || user.Country}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-base text-foreground font-medium">{user.phoneNumber}</span>
                      </div>
                    ) : (
                      <span className="text-base text-muted-foreground italic">Not provided</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Join Date (Read-only) */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Member Since
                </label>
                <div className="pl-6">
                  <p className="text-base text-foreground font-medium">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              {/* Password Change */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Password
                  </label>
                  {!isChangingPassword && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsChangingPassword(true)}
                      className="h-8 px-2 text-xs"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Change
                    </Button>
                  )}
                </div>
                {isChangingPassword ? (
                  <div className="pl-6 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-foreground">Current Password</label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        disabled={isSaving}
                        className="mt-1.5 max-w-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground">New Password</label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        disabled={isSaving}
                        className="mt-1.5 max-w-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-foreground">Confirm New Password</label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        disabled={isSaving}
                        className="mt-1.5 max-w-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleChangePassword}
                        disabled={isSaving}
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                        Update Password
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
                  <div className="pl-6">
                    <p className="text-base text-foreground font-medium">••••••••</p>
                  </div>
                )}
              </div>
              
              <Separator className="my-6" />
              
              {/* Sign Out & Delete Account */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Account Actions</h3>
                <div className="flex flex-col sm:flex-row gap-3">
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
                  ) : null}
                </div>
              </div>
              
              {showDeleteConfirm && (
                <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-destructive">
                      Delete Account - This action cannot be undone
                    </p>
                    <p className="text-xs text-muted-foreground">
                      To confirm, type <strong>DELETE</strong> below:
                    </p>
                  </div>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE"
                    className="max-w-sm"
                    disabled={isDeleting}
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                      Delete My Account
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
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Drafts Tab */}
        <TabsContent value="drafts" className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    Saved Drafts
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {drafts.length > 0 
                      ? `You have ${drafts.length} draft${drafts.length > 1 ? 's' : ''}`
                      : 'Your unpublished work'
                    }
                  </CardDescription>
                </div>
                <Button 
                  onClick={handleNew}
                  className="flex items-center gap-2 h-10"
                >
                  <Edit3 className="h-4 w-4" />
                  New Post
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingDrafts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : drafts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gray-100 dark:bg-brand-black-90 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-foreground font-medium mb-2">No drafts yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Your unsaved work will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {drafts.map((draft) => (
                    <button
                      key={draft.documentId}
                      onClick={() => handleOpenDraft(draft)}
                      className={cn(
                        "w-full group flex items-center justify-between p-3 sm:p-4 rounded-lg text-left transition-all",
                        "bg-white dark:bg-brand-black-90",
                        "border border-border",
                        "hover:bg-white/80 dark:hover:bg-brand-black-80",
                        "active:scale-[0.98]"
                      )}
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="font-semibold text-sm sm:text-base text-foreground truncate group-hover:text-primary transition-colors">
                          {draft.name || 'Untitled'}
                        </h4>
                        <div className="whitespace-nowrap flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatRelativeTime(draft.updatedAt)}
                          </span>
                          <span>•</span>
                          <span>{getWordCount(draft.content)} words</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteDraft(draft, e)}
                          disabled={deletingId === draft.documentId}
                          className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {deletingId === draft.documentId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Bookmarks Tab */}
        <TabsContent value="bookmarks" className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Bookmark className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  Bookmarked Articles
                </CardTitle>
                <CardDescription className="mt-2">
                  {bookmarks.length > 0 
                    ? `You have ${bookmarks.length} bookmarked article${bookmarks.length > 1 ? 's' : ''}`
                    : 'Articles you want to read later'
                  }
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingBookmarks ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                </div>
              ) : bookmarks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gray-100 dark:bg-brand-black-90 flex items-center justify-center">
                    <Bookmark className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-foreground font-medium mb-2">No bookmarks yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Bookmark articles to save them for later</p>
                  <Button 
                    onClick={() => router.push('/browse')}
                    variant="outline"
                    className="flex-inline items-center gap-2"
                  >
                    <Bookmark className="h-4 w-4" />
                    Browse Articles
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookmarks.map((bookmark) => (
                    <Link
                      key={bookmark.bookmarkDocumentId}
                      href={`/read-article?slug=${bookmark.slug}`}
                      className={cn(
                        "group flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg transition-all",
                        "bg-white dark:bg-brand-black-90",
                        "border border-border",
                        "hover:bg-white/80 dark:hover:bg-brand-black-80",
                        "active:scale-[0.98]"
                      )}
                    >
                      {/* Article Thumbnail */}
                      <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden relative bg-gray-200 dark:bg-gray-700">
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
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className={cn(
                          "font-semibold text-sm sm:text-base text-foreground line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors",
                          getFontClass(bookmark.title)
                        )}>
                          {bookmark.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-2">
                          {bookmark.authorName && (
                            <span className={cn("truncate text-xs sm:text-xs", getFontClass(bookmark.authorName))}>{bookmark.authorName}</span>
                          )}
                          {bookmark.authorName && bookmark.category && (
                            <span>•</span>
                          )}
                          {bookmark.category && (
                            <span className={cn("text-amber-600 dark:text-amber-400", getFontClass(bookmark.category))}>{bookmark.category}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleRemoveBookmark(bookmark.bookmarkDocumentId, e)}
                        disabled={removingBookmarkId === bookmark.bookmarkDocumentId}
                        className="h-9 w-9 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Remove bookmark"
                      >
                        {removingBookmarkId === bookmark.bookmarkDocumentId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showAvatarCropModal && cropModalImageSrc && (
        <AvatarCropModal
          imageSrc={cropModalImageSrc}
          fileName={cropFileName}
          onCropComplete={handleAvatarCropComplete}
          onCancel={handleAvatarCropCancel}
        />
      )}
    </div>
  );
}
