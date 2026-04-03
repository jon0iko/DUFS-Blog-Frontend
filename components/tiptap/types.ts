// Tiptap component types

export interface TiptapRef {
  setContent: (content: string) => void;
  getContent: () => string;
  getMarkdown: () => string;
  clearContent: () => void;
  focus: () => void;
  uploadPendingImages: () => Promise<void>;
}

export interface TiptapProps {
  initialContent?: string;
  onContentChange?: (html: string) => void;
  onMarkdownChange?: (markdown: string) => void;
  onWordCountChange?: (count: number) => void;
  placeholder?: string;
}
