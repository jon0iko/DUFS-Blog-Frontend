# Tiptap Editor Implementation

## Overview

A full-featured, responsive rich text editor built with Tiptap for the DUFS Blog submission page. The editor includes a sticky toolbar with comprehensive formatting options and Strapi media integration.

## Features

### Text Formatting
- **Bold**, *Italic*, <u>Underline</u>, ~~Strikethrough~~
- `Inline Code`
- Highlight text with background color
- Multiple heading levels (H1, H2, H3)

### Content Structure
- Bullet lists
- Numbered lists
- Blockquotes
- Horizontal rules
- Code blocks

### Alignment
- Left align
- Center align
- Right align
- Justify

### Media & Links
- Image upload with Strapi integration
- Link insertion and management
- Image preview before upload
- Automatic image optimization

### Tables
- Insert tables (3x3 by default)
- Resizable columns
- Header row support
- Cell selection and editing

### User Experience
- **Sticky toolbar** - Stays at top while scrolling
- Responsive design for mobile and desktop
- Undo/Redo functionality
- Keyboard shortcuts
- Real-time preview
- Auto-save capability (ready to implement)

## Components

### 1. `Tiptap.jsx` - Main Editor Component
Location: `components/tiptap/Tiptap.jsx`

The core editor component with:
- All Tiptap extensions configured
- Image upload handling
- Content management
- Save/Publish actions

### 2. `MenuBar.tsx` - Toolbar Component
Location: `components/tiptap/MenuBar.tsx`

Sticky toolbar with all formatting controls:
- Text formatting buttons
- Heading controls
- List and quote buttons
- Alignment options
- Insert media/links/tables
- Undo/Redo

### 3. `tiptap.css` - Custom Styling
Location: `components/tiptap/tiptap.css`

Custom CSS for:
- Editor content styling
- Table styles
- Link and image formatting
- Dark mode support
- Responsive adjustments

### 4. `strapi-media.ts` - Media Upload Helper
Location: `lib/strapi-media.ts`

Utility functions for:
- Uploading images to Strapi
- Validating image files
- Converting files to base64
- Managing media URLs

## Installation

All required packages are already installed:

```bash
# Core Tiptap packages
@tiptap/react
@tiptap/starter-kit
@tiptap/pm

# Extensions
@tiptap/extension-underline
@tiptap/extension-link
@tiptap/extension-image
@tiptap/extension-text-align
@tiptap/extension-highlight
@tiptap/extension-table
@tiptap/extension-table-row
@tiptap/extension-table-cell
@tiptap/extension-table-header
@tiptap/extension-text-style
@tiptap/extension-color
@tiptap/extension-typography
@tiptap/extension-code-block-lowlight
lowlight
```

## Usage

The editor is integrated into the submission page at `/submit`:

```tsx
import Tiptap from '@/components/tiptap/Tiptap'

export default function SubmitPage() {
  return (
    <div className="container">
      <Tiptap />
    </div>
  )
}
```

## Configuration

### Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

### Strapi Setup

Ensure your Strapi backend has:
1. Upload plugin enabled
2. Proper CORS configuration
3. Authentication enabled for uploads

## Keyboard Shortcuts

- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + U` - Underline
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Y` - Redo
- `Ctrl/Cmd + Shift + Z` - Redo (alternative)

## Image Upload Flow

1. User clicks the image button in toolbar
2. File picker opens
3. User selects an image
4. Image is validated (type and size)
5. Base64 preview is shown immediately
6. Image uploads to Strapi in background
7. Preview is replaced with Strapi URL
8. Upload status is indicated

## Customization

### Changing Default Content

Edit the `content` property in `Tiptap.jsx`:

```javascript
content: `
  <h2>Your Custom Title</h2>
  <p>Your custom content here...</p>
`,
```

### Adding More Extensions

1. Install the extension:
```bash
pnpm add @tiptap/extension-your-extension
```

2. Import and add to extensions array:
```javascript
import YourExtension from '@tiptap/extension-your-extension'

extensions: [
  // ... existing extensions
  YourExtension,
]
```

3. Add corresponding button to MenuBar

### Styling Customization

Edit `tiptap.css` to customize:
- Colors and fonts
- Spacing and sizing
- Dark mode styles
- Table appearance

## API Integration

### Getting Editor Content

```javascript
const getContent = () => {
  if (!editor) return ''
  return editor.getHTML() // Returns HTML string
}

// Or get JSON
const getJSON = () => {
  if (!editor) return null
  return editor.getJSON()
}
```

### Setting Content

```javascript
editor?.commands.setContent('<p>New content</p>')
```

### Clearing Content

```javascript
editor?.commands.clearContent()
```

## Future Enhancements

### Planned Features
- [ ] Auto-save drafts to localStorage
- [ ] Article metadata fields (title, tags, category)
- [ ] Word count indicator
- [ ] Reading time estimator
- [ ] Markdown export
- [ ] Collaborative editing
- [ ] Version history
- [ ] Image galleries
- [ ] Embed support (YouTube, Twitter, etc.)
- [ ] Custom color picker for highlights
- [ ] Font size controls
- [ ] Print preview

### Strapi Integration
- [ ] Save drafts to Strapi
- [ ] Publish articles to Strapi
- [ ] Update existing articles
- [ ] Category/tag selection
- [ ] Author assignment
- [ ] Featured image upload
- [ ] SEO metadata fields

## Troubleshooting

### Editor Not Rendering
- Check that all Tiptap packages are installed
- Verify CSS file is imported
- Check browser console for errors

### Image Upload Failing
- Verify `NEXT_PUBLIC_STRAPI_URL` is set
- Check Strapi CORS settings
- Ensure user is authenticated
- Check file size and type validation

### Toolbar Not Sticky
- Verify `sticky top-0` classes in MenuBar
- Check CSS for conflicting z-index values
- Ensure parent container allows sticky positioning

### TypeScript Errors
- Some Tiptap extension types may show errors
- Using `@ts-expect-error` comments where needed
- Extensions work correctly despite type warnings

## Resources

- [Tiptap Documentation](https://tiptap.dev/)
- [Tiptap Examples](https://tiptap.dev/examples)
- [Strapi Upload API](https://docs.strapi.io/developer-docs/latest/plugins/upload.html)
- [Next.js Documentation](https://nextjs.org/docs)

## License

Part of the DUFS Blog project.
