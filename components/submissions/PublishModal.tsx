"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Check,
  Plus,
  Globe,
  Tag as TagIcon,
} from "lucide-react";
import { strapiAPI } from "@/lib/api";
import {
  uploadImageToStrapi,
  validateImageFile,
  fileToBase64,
} from "@/lib/strapi-media";
import { getToken, getAuthorForCurrentUser } from "@/lib/auth";
import { submitNewArticleService } from "@/lib/submit-service";
import { Category, Tag } from "@/types";
import { slugify } from "@/lib/utils";
import HeroCropModal from "./HeroCropModal";
import { useToast } from "@/components/ui/toast";
import type { TiptapRef } from "@/components/tiptap/types";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentMarkdown: string;
  onPublishSuccess: () => void;
  tiptapRef?: React.RefObject<TiptapRef>;
}

interface FormData {
  title: string;
  language: "en" | "bn";
  categoryId: number | null;  // Strapi v5 uses numeric ID
  selectedTags: number[];  // Strapi v5 uses numeric IDs
  customTags: { name: string; id: number }[];  // Track custom tags with their Strapi IDs
}

interface FormErrors {
  title?: string;
  language?: string;
  category?: string;
  image?: string;
  terms?: string;
  general?: string;
}

export default function PublishModal({
  isOpen,
  onClose,
  contentMarkdown,
  onPublishSuccess,
  tiptapRef,
}: PublishModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const termsCheckboxRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: "",
    language: "en",
    categoryId: null,
    selectedTags: [],
    customTags: [],
  });

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [customTagInput, setCustomTagInput] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [rawFileName, setRawFileName] = useState<string>("hero-image.jpg");
  const [showCropModal, setShowCropModal] = useState(false);

  // Load categories and tags
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setIsLoadingData(true);
    try {
      const [categoriesResponse, tagsResponse] = await Promise.all([
        strapiAPI.getCategories(),
        strapiAPI.getTags(),
      ]);

      setCategories(categoriesResponse.data);
      // Limit tags to 10 as requested
      setAvailableTags(tagsResponse.data.slice(0, 10));
    } catch (error) {
      console.error("Failed to load categories/tags:", error);
      setErrors((prev) => ({
        ...prev,
        general: "Failed to load form data. Please try again.",
      }));
    } finally {
      setIsLoadingData(false);
    }
  };

  // Handle image selection
  const handleImageSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validation = validateImageFile(file);
      if (!validation.valid) {
        setErrors((prev) => ({ ...prev, image: validation.error }));
        return;
      }

      setErrors((prev) => ({ ...prev, image: undefined }));

      // Open crop modal with selected image
      const source = await fileToBase64(file);
      setRawFileName(file.name);
      setRawImageSrc(source);
      setShowCropModal(true);

      // Reset input so same file can be selected again
      e.target.value = "";
    },
    []
  );

  const handleCropComplete = useCallback((croppedFile: File) => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(croppedFile);
    setImagePreview(URL.createObjectURL(croppedFile));
    setShowCropModal(false);
    setRawImageSrc(null);
    setErrors((prev) => ({ ...prev, image: undefined }));
  }, [imagePreview]);

  const handleCropCancel = useCallback(() => {
    setShowCropModal(false);
    setRawImageSrc(null);
  }, []);

  // Handle tag selection - use numeric ID
  const toggleTag = useCallback((tagId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter((id) => id !== tagId)
        : [...prev.selectedTags, tagId],
    }));
  }, []);

  // Handle custom tag addition - creates tag in Strapi immediately
  const addCustomTag = useCallback(async () => {
    const tagName = customTagInput.trim();
    if (!tagName) return;
    
    // Check if tag already exists in custom tags
    if (formData.customTags.some(t => t.name.toLowerCase() === tagName.toLowerCase())) {
      setCustomTagInput("");
      return;
    }
    
    // Check if tag already exists in available tags (selected or not)
    const existingAvailableTag = availableTags.find(
      t => t.name.toLowerCase() === tagName.toLowerCase()
    );
    if (existingAvailableTag) {
      // Just select the existing tag instead of creating a new one
      if (!formData.selectedTags.includes(existingAvailableTag.id)) {
        setFormData((prev) => ({
          ...prev,
          selectedTags: [...prev.selectedTags, existingAvailableTag.id],
        }));
      }
      setCustomTagInput("");
      return;
    }

    setIsCreatingTag(true);
    try {
      // Create tag in Strapi immediately
      const createdTag = await strapiAPI.getOrCreateTag(tagName);
      console.log("Created custom tag:", createdTag);
      
      setFormData((prev) => ({
        ...prev,
        customTags: [...prev.customTags, { name: createdTag.name, id: createdTag.id }],
      }));
      setCustomTagInput("");
    } catch (error) {
      console.error("Failed to create tag:", error);
      setErrors((prev) => ({
        ...prev,
        general: "Failed to create tag. Please try again.",
      }));
    } finally {
      setIsCreatingTag(false);
    }
  }, [customTagInput, formData.customTags, formData.selectedTags, availableTags]);

  // Remove custom tag - deletes from Strapi
  const removeCustomTag = useCallback(async (tag: { name: string; id: number }) => {
    try {
      // Delete tag from Strapi
      await strapiAPI.deleteTag(tag.id);
      console.log("Deleted custom tag:", tag);
      
      setFormData((prev) => ({
        ...prev,
        customTags: prev.customTags.filter((t) => t.id !== tag.id),
      }));
    } catch (error) {
      console.error("Failed to delete tag:", error);
      // Still remove from UI even if delete fails (tag might be in use)
      setFormData((prev) => ({
        ...prev,
        customTags: prev.customTags.filter((t) => t.id !== tag.id),
      }));
    }
  }, []);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the Terms of Publication";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission initiated");

    if (!validateForm()) return;

    if (!contentMarkdown.trim()) {
      setErrors({
        general: "Editor content could not be converted to markdown. Please close this dialog and try again.",
      });
      return;
    }

    console.log("Form validated successfully");

    setIsSubmitting(true);
    setErrors({});

    try {
      const token = getToken();

      // Upload pending images from editor before publishing
      if (tiptapRef?.current) {
        try {
          console.log("Uploading pending images from editor...");
          await tiptapRef.current.uploadPendingImages();
          console.log("Pending images uploaded successfully");
        } catch (uploadError) {
          const uploadErrorMessage =
            uploadError instanceof Error
              ? uploadError.message
              : "Failed to upload images in article content.";
          toast.error(uploadErrorMessage, "Image Upload Failed");
          throw uploadError;
        }
      }

      // Get the updated markdown with real image URLs
      const updatedMarkdown = tiptapRef?.current?.getMarkdown() || contentMarkdown;

      // First, upload the featured image if present
      let uploadedImageId: number | string | null = null;
      if (imageFile) {
        if (!token) {
          throw new Error("Your session expired. Please sign in again before submitting.");
        }

        try {
          const uploadResult = await uploadImageToStrapi(imageFile, token);
          uploadedImageId = uploadResult.id ?? uploadResult.documentId ?? null;
          if (!uploadedImageId) {
            throw new Error("Image uploaded but no media id was returned by Strapi.");
          }
        } catch (uploadError) {
          const uploadErrorMessage =
            uploadError instanceof Error
              ? uploadError.message
              : "Failed to upload featured image to Strapi.";
          toast.error(uploadErrorMessage, "Image Upload Failed");
          throw uploadError;
        }
      }

      // Get the author ID for the current user
      const author = await getAuthorForCurrentUser();
      const authorId = author?.id ?? null;
      
      if (!authorId) {
        console.warn("No author found for current user - article will be created without author");
      }

      // Combine selected tags with custom tags (already created in Strapi)
      const customTagIds = formData.customTags.map(tag => tag.id);
      const allTagIds = [...formData.selectedTags, ...customTagIds];
      console.log("All tag IDs for article:", allTagIds);

      // Generate a unique slug from title or use default
      const titleForSlug = formData.title.trim() || "untitled-article";
      const baseSlug = slugify(titleForSlug);
      const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;


      // Call the server-side submission function with updated markdown
      console.log("Calling submitNewArticleService...");
      await submitNewArticleService({
        title: formData.title || "Untitled Article",
        slug: uniqueSlug,
        content: updatedMarkdown,
        language: formData.language,
        categoryId: formData.categoryId!,  // Already validated as not null
        selectedTags: allTagIds,
        uploadedImageId,
        authorId,
        token: token || "",
      });

      // Success!
      setShowSuccess(true);

      // Close modal after showing success
      setTimeout(() => {
        setShowSuccess(false);
        onPublishSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to submit article. Please try again.";
      toast.error(errorMessage, "Submission Failed");
      setErrors({
        general: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        language: "en",
        categoryId: null,
        selectedTags: [],
        customTags: [],
      });
      setImageFile(null);
      
      // Use a functional update or a ref to avoid capturing the stale imagePreview
      // but here we can just check the current state since it's an effect
      setImagePreview(prev => {
        if (prev?.startsWith("blob:")) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });

      setErrors({});
      setShowSuccess(false);
      setAgreedToTerms(false);
      setRawImageSrc(null);
      setRawFileName("hero-image.jpg");
      setShowCropModal(false);
    }
    // We only want this to run when isOpen changes to true
  }, [isOpen]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Scroll to terms error when it appears
  useEffect(() => {
    if (errors.terms && termsCheckboxRef.current) {
      setTimeout(() => {
        termsCheckboxRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 100);
    }
  }, [errors.terms]);

  if (!isOpen) return null;

  return (
    <>
      {showCropModal && rawImageSrc && (
        <HeroCropModal
          imageSrc={rawImageSrc}
          fileName={rawFileName}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative flex h-[100dvh] w-full max-w-none flex-col overflow-hidden bg-background shadow-2xl rounded-none sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:mx-4 sm:rounded-md animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4 py-3 sm:px-6 sm:py-4 gap-2">
          <h2 className="text-base font-semibold sm:text-lg truncate">Submit Your Article</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-muted flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div ref={contentScrollRef} className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          {isLoadingData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-3 text-muted-foreground">Loading...</span>
            </div>
          ) : showSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Article Submitted!</h3>
              <p className="text-muted-foreground">
                Your article has been submitted for review. We&apos;ll notify
                you once it&apos;s published.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Info Message */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  All fields are optional. You can leave them empty and we will fill them in on your behalf.
                </p>
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{errors.general}</p>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Enter your post title..."
                  className={`h-12 text-base ${
                    errors.title
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                />
                <div className="flex justify-between">
                  {errors.title ? (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.title}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formData.title.length}/200
                  </span>
                </div>
              </div>

              {/* Featured Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Featured Image
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    relative cursor-pointer border-2 border-dashed rounded-xl 
                    transition-all duration-200 overflow-hidden
                    ${
                      imagePreview
                        ? "border-primary/50 bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                    }
                    ${errors.image ? "border-destructive" : ""}
                  `}
                >
                  {imagePreview ? (
                    <div className="relative aspect-video">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          Click to change image
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-6">
                      <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-sm font-medium text-center">
                        Click to upload featured image
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, or WebP (max 5MB)
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Recommended:</span> 1200×675px (16:9 ratio)
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {errors.image && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.image}
                  </p>
                )}
              </div>

              {/* Language & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Language */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Language
                  </label>
                  <Select
                    value={formData.language}
                    onValueChange={(value: "en" | "bn") =>
                      setFormData((prev) => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        <span className="flex items-center gap-2">
                          English
                        </span>
                      </SelectItem>
                      <SelectItem value="bn">
                        <span className="flex items-center gap-2">
                          Bangla
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Category
                  </label>
                  <Select
                    value={formData.categoryId?.toString() ?? ""}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, categoryId: parseInt(value, 10) }))
                    }
                  >
                    <SelectTrigger
                      className={`h-11 ${
                        errors.category ? "border-destructive" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.Name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <TagIcon className="h-4 w-4" />
                  Tags{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    (optional)
                  </span>
                </label>

                {/* Existing Tags */}
                {availableTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => {
                      const isSelected = formData.selectedTags.includes(
                        tag.id
                      );
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`
                            px-3 py-1.5 text-sm rounded-full border transition-all duration-200
                            ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/50 hover:bg-muted border-transparent hover:border-primary/30"
                            }
                          `}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 inline mr-1" />
                          )}
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Custom Tags */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCustomTag();
                        }
                      }}
                      placeholder="Add custom tag..."
                      className="h-10"
                      disabled={isCreatingTag}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCustomTag}
                      className="h-10 px-4"
                      disabled={isCreatingTag}
                    >
                      {isCreatingTag ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Custom Tags Display */}
                  {formData.customTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.customTags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-secondary text-secondary-foreground"
                        >
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => removeCustomTag(tag)}
                            className="ml-1 hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Terms of Publication */}
              <div
                ref={termsCheckboxRef}
                className={`space-y-2 rounded-lg border transition-all duration-200 p-3 sm:p-4 ${
                  errors.terms
                    ? 'border-destructive bg-destructive/5'
                    : 'border-border/60 bg-muted/20'
                }`}
              >
                <label className="flex items-start gap-3 text-sm cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (e.target.checked) {
                        setErrors((prev) => ({ ...prev, terms: undefined }));
                      }
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  />
                  <span className="leading-relaxed">
                    I agree to the{' '}
                    <a
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium hover:opacity-80 transition-opacity"
                    >
                      Terms of Publication
                    </a>{' '}
                    of DUFS Blog.
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-sm text-destructive flex items-center gap-2 mt-2 animate-in fade-in slide-in-from-bottom-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{errors.terms}</span>
                  </p>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!isLoadingData && !showSuccess && (
          <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t bg-background/95 backdrop-blur-sm px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6 sm:py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 rounded-md sm:h-10 sm:w-auto w-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-11 rounded-md bg-green-600 px-6 text-white hover:bg-green-500 sm:h-10 sm:w-auto w-full font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Request to Publish"
              )}
            </Button>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
