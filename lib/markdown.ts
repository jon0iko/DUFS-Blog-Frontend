export function normalizeMarkdownForStorage(markdown: string): string {
  const cleaned = markdown
    // Remove rich-text span wrappers leaked by unsupported markdown marks.
    .replace(/<\/?span[^>]*>/gi, '')
    // Keep blockquote lines as plain markdown text, not embedded HTML.
    .replace(/^\s*>\s*<[^>]+>(.*?)<\/[^>]+>\s*$/gm, '> $1');

  return cleaned
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function isLikelyMarkdown(content: string): boolean {
  if (!content.trim()) return false;

  const hasHtmlTag = /<\/?[a-z][\s\S]*>/i.test(content);
  if (hasHtmlTag) return false;

  return /(^|\n)(#{1,6}\s|[-*+]\s|\d+\.\s|>\s|```|!\[[^\]]*\]\([^\)]*\)|\[[^\]]+\]\([^\)]*\)|\*\*[^*]+\*\*|_[^_]+_)/m.test(content);
}
