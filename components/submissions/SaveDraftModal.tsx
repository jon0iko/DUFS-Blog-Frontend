'use client';

import React, { useState } from 'react';
import { X, Save, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SaveDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  defaultName?: string;
  isUpdate?: boolean;
}

export default function SaveDraftModal({
  isOpen,
  onClose,
  onSave,
  defaultName = '',
  isUpdate = false,
}: SaveDraftModalProps) {
  const [draftName, setDraftName] = useState(defaultName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setDraftName(defaultName);
      setError(null);
    }
  }, [isOpen, defaultName]);

  const handleSave = async () => {
    if (!draftName.trim()) {
      setError('Please enter a name for your draft');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(draftName.trim());
      onClose();
    } catch (err) {
      console.error('Error saving draft:', err);
      setError('Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSaving) {
      handleSave();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        "relative w-full max-w-md mx-4 p-6 rounded-2xl",
        "bg-white dark:bg-brand-black-90",
        "border border-gray-200 dark:border-gray-700",
        "shadow-2xl",
        "animate-in fade-in-0 zoom-in-95 duration-200"
      )}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className={cn(
            "absolute top-4 right-4 p-2 rounded-full",
            "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
            "hover:bg-gray-100 dark:hover:bg-brand-black-90",
            "transition-colors"
          )}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-md bg-primary/10">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isUpdate ? 'Update Draft' : 'Save Draft'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isUpdate ? 'Update your saved draft' : 'Give your draft a name to save it'}
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="mb-6">
          <label 
            htmlFor="draft-name" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Draft Name
          </label>
          <input
            id="draft-name"
            type="text"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a name for your draft..."
            autoFocus
            className={cn(
              "w-full px-4 py-3 rounded-md",
              "bg-gray-50 dark:bg-brand-black-90",
              "border border-gray-200 dark:border-gray-700",
              "text-gray-900 dark:text-gray-100",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
              "transition-all"
            )}
          />
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-md"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !draftName.trim()}
            className="flex-1 rounded-md gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isUpdate ? 'Update' : 'Save Draft'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
