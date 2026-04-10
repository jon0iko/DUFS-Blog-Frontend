/**
 * Editor storage utilities
 * Handles localStorage operations for draft management and editor state
 */

/**
 * Storage key constants for editor state
 * Centralized to ensure consistency across components
 */
export const EDITOR_STORAGE_KEYS = {
  CONTENT: 'draft_content',
  WORD_COUNT: 'draft_word_count',
  DRAFT_ID: 'current_draft_id',
  DRAFT_NAME: 'current_draft_name',
} as const;

/**
 * Generate user-specific storage key
 * Prevents data collision between users on same device
 */
export function getStorageKey(userId: number | undefined, key: string): string {
  if (!userId) return `tiptap_guest_${key}`;
  return `tiptap_user_${userId}_${key}`;
}

/**
 * Save draft to localStorage with user isolation
 */
export function saveDraftToStorage(
  userId: number | undefined,
  draftData: {
    content: string;
    wordCount: number;
    draftId: string;
    draftName: string;
  }
): void {
  if (typeof window === 'undefined') return;

  const { content, wordCount, draftId, draftName } = draftData;

  localStorage.setItem(getStorageKey(userId, EDITOR_STORAGE_KEYS.CONTENT), content);
  localStorage.setItem(
    getStorageKey(userId, EDITOR_STORAGE_KEYS.WORD_COUNT),
    wordCount.toString()
  );
  localStorage.setItem(getStorageKey(userId, EDITOR_STORAGE_KEYS.DRAFT_ID), draftId);
  localStorage.setItem(getStorageKey(userId, EDITOR_STORAGE_KEYS.DRAFT_NAME), draftName);
}

/**
 * Load draft from localStorage with user isolation
 */
export function loadDraftFromStorage(userId: number | undefined): {
  content: string;
  wordCount: number;
  draftId: string | null;
  draftName: string;
} | null {
  if (typeof window === 'undefined') return null;

  const content = localStorage.getItem(getStorageKey(userId, EDITOR_STORAGE_KEYS.CONTENT));
  const wordCountRaw = localStorage.getItem(getStorageKey(userId, EDITOR_STORAGE_KEYS.WORD_COUNT));
  const draftId = localStorage.getItem(getStorageKey(userId, EDITOR_STORAGE_KEYS.DRAFT_ID));
  const draftName = localStorage.getItem(getStorageKey(userId, EDITOR_STORAGE_KEYS.DRAFT_NAME));

  if (!content) return null;

  return {
    content,
    wordCount: parseInt(wordCountRaw || '0', 10),
    draftId,
    draftName: draftName || '',
  };
}

/**
 * Clear draft from localStorage
 */
export function clearDraftFromStorage(userId: number | undefined): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(getStorageKey(userId, EDITOR_STORAGE_KEYS.CONTENT));
  localStorage.removeItem(getStorageKey(userId, EDITOR_STORAGE_KEYS.WORD_COUNT));
  localStorage.removeItem(getStorageKey(userId, EDITOR_STORAGE_KEYS.DRAFT_ID));
  localStorage.removeItem(getStorageKey(userId, EDITOR_STORAGE_KEYS.DRAFT_NAME));
}
