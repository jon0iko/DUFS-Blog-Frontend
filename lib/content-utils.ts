/**
 * Content manipulation utilities
 * Functions for handling text content, word counts, and content analysis
 */

/**
 * Calculate word count from HTML or plain text content
 * Strips HTML tags before counting
 */
export function getWordCount(content: string): number {
  if (!content) return 0;
  
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, ' ').trim();
  
  if (!plainText) return 0;
  
  // Split by whitespace and filter out empty strings
  return plainText.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Calculate reading time estimate from content
 * Assumes 200 words per minute
 */
export function calculateReadingTime(content: string): number {
  const wordCount = getWordCount(content);
  return Math.ceil(wordCount / 200) || 1;
}

/**
 * Strip HTML tags from content
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Get excerpt from HTML content
 * Strips HTML and truncates to word limit
 */
export function getExcerpt(content: string, wordLimit: number = 50): string {
  if (!content) return '';
  
  const plainText = stripHtmlTags(content);
  const words = plainText.split(/\s+/);
  
  if (words.length <= wordLimit) return plainText;
  
  return words.slice(0, wordLimit).join(' ') + '...';
}

/**
 * Normalize loaded content from storage/API
 * Removes empty HTML tags and whitespace
 */
export function normalizeContent(value: string): string {
  const trimmed = value.trim();
  
  // Check for empty or placeholder content
  if (!trimmed || trimmed === '<p></p>' || trimmed === '<p><br></p>') {
    return '';
  }
  
  return value;
}
