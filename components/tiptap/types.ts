// Tiptap component types

export interface TiptapRef {
  setContent: (content: string) => void;
  getContent: () => string;
  clearContent: () => void;
  focus: () => void;
}

export interface TiptapProps {
  initialContent?: string;
  onContentChange?: (html: string) => void;
  onWordCountChange?: (count: number) => void;
  placeholder?: string;
}
