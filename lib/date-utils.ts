/**
 * Date formatting utilities
 * Centralized date formatting functions used across components
 * Handles relative time formatting, localization, and date display
 */

/**
 * Format date as relative time string (e.g., "5m ago", "yesterday")
 * Supports different granularities and localizations
 */
export function formatRelativeTime(dateString: string): string {
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
}

/**
 * Format date as relative time string (compact version for comments)
 * e.g., "just now", "5m", "2h", "1d", "2w", "3mo", "1y"
 */
export function formatRelativeTimeCompact(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

/**
 * Format date as localized date string
 * e.g., "March 27, 2026"
 */
export function formatDateLocalized(dateString?: string, locale: string = 'en-US'): string {
  if (!dateString) {
    return new Date().toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date as short date string
 * e.g., "Mar 27"
 */
export function formatDateShort(dateString?: string, locale: string = 'en-US'): string {
  if (!dateString) {
    return new Date().toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
    });
  }

  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date for display in articles
 * e.g., "MAR 27, 2026" (uppercase)
 */
export function formatArticleDate(dateString?: string, locale: string = 'en-US'): string {
  if (!dateString) {
    return new Date()
      .toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      .toUpperCase();
  }

  const date = new Date(dateString);
  return date
    .toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase();
}

/**
 * Get current date and time in UTC+6 timezone
 * Returns ISO string combined with UTC+6 time for Strapi
 */
export function getCurrentDateTimeUTC6(): string {
  // Create date in UTC+6 (Bangladesh time)
  const now = new Date();
  const utc6Offset = 6 * 60; // UTC+6 is 360 minutes ahead of UTC
  const localOffset = now.getTimezoneOffset(); // User's local offset in minutes
  const diff = utc6Offset + localOffset; // Total adjustment needed
  const utc6Date = new Date(now.getTime() + diff * 60 * 1000);
  
  return utc6Date.toISOString();
}
