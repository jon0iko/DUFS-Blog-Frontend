'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState } from 'react';

// React component for rendering the image with caption
const ImageComponent = (props) => {
  const { node, updateAttributes, selected } = props;
  const { src, alt, caption } = node.attrs;
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionValue, setCaptionValue] = useState(caption || '');

  const handleCaptionChange = (e) => {
    setCaptionValue(e.target.value);
  };

  const handleCaptionBlur = () => {
    setIsEditingCaption(false);
    updateAttributes({ caption: captionValue });
  };

  const handleCaptionKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditingCaption(false);
      updateAttributes({ caption: captionValue });
    }
    if (e.key === 'Escape') {
      setIsEditingCaption(false);
      setCaptionValue(caption || '');
    }
  };

  const startEditing = () => {
    setCaptionValue(caption || '');
    setIsEditingCaption(true);
  };

  return (
    <NodeViewWrapper className="my-6 flex justify-center">
      <figure 
        className={`relative ${selected ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}`}
        style={{ maxWidth: '500px' }}
      >
        {/* Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt || caption || 'Image'}
          className="rounded-lg shadow-lg"
          style={{ maxWidth: '500px', width: '100%', height: 'auto' }}
          draggable={false}
        />

        {/* Caption */}
        <figcaption className="mt-2 text-center">
          {isEditingCaption ? (
            <input
              type="text"
              value={captionValue}
              onChange={handleCaptionChange}
              onBlur={handleCaptionBlur}
              onKeyDown={handleCaptionKeyDown}
              placeholder="Add a caption..."
              className="w-full text-sm text-gray-600 dark:text-gray-400 text-center bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-primary px-2 py-1"
              autoFocus
            />
          ) : (
            <span
              onClick={startEditing}
              className="text-sm text-gray-600 dark:text-gray-400 italic cursor-pointer hover:text-gray-800 dark:hover:text-gray-300 transition-colors block"
            >
              {caption || 'Click to add caption...'}
            </span>
          )}
        </figcaption>
      </figure>
    </NodeViewWrapper>
  );
};

// Custom Tiptap extension for image with caption
export const ImageWithCaption = Node.create({
  name: 'imageWithCaption',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      caption: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-image-caption]',
        getAttrs: (node) => {
          if (typeof node === 'string') return {};
          const element = node;
          const img = element.querySelector('img');
          const figcaption = element.querySelector('figcaption');
          return {
            src: img?.getAttribute('src'),
            alt: img?.getAttribute('alt'),
            caption: figcaption?.textContent || '',
          };
        },
      },
      // Also parse regular images and convert them
      {
        tag: 'img[src]',
        getAttrs: (node) => {
          if (typeof node === 'string') return {};
          const element = node;
          return {
            src: element.getAttribute('src'),
            alt: element.getAttribute('alt'),
            caption: '',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, caption } = HTMLAttributes;

    return [
      'figure',
      mergeAttributes({
        'data-image-caption': 'true',
        class: 'my-10 flex flex-col items-center',
      }),
      [
        'img',
        {
          src,
          alt: alt || caption || 'Image',
          class: 'rounded-lg shadow-lg',
          style: 'max-width: 500px; width: 100%; height: auto;',
        },
      ],
      [
        'figcaption',
        {
          style: 'text-align: center; font-style: italic; color: #6b7280; margin-top: 0.5rem; font-size: 0.875rem;',
        },
        caption || '',
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },

  addCommands() {
    return {
      setImageWithCaption:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

export default ImageWithCaption;
