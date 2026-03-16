'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroCropModalProps {
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void | Promise<void>;
  onCancel: () => void;
  fileName?: string;
}

function getOutputFormat(fileName: string): {
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  extension: 'jpg' | 'png' | 'webp';
  quality?: number;
} {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (ext === 'png') {
    return { mimeType: 'image/png', extension: 'png' };
  }

  if (ext === 'webp') {
    return { mimeType: 'image/webp', extension: 'webp', quality: 0.95 };
  }

  // Fallback for jpg/jpeg/gif/unknown: JPEG keeps file size small.
  return { mimeType: 'image/jpeg', extension: 'jpg', quality: 0.95 };
}

/**
 * Centers a 16:9 aspect crop within the image on first load.
 */
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      { unit: '%', width: 90 },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

/**
 * Draws the cropped 16:9 region of `image` onto a canvas.
 * Returns a JPEG blob via `onComplete`.
 */
async function getCroppedHeroBlob(
  image: HTMLImageElement,
  pixelCrop: PixelCrop,
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp',
  quality?: number
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2D context');

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Output size: 1600x900 for hero images
  const outputWidth = 1600;
  const outputHeight = 900;
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const sourceX = pixelCrop.x * scaleX;
  const sourceY = pixelCrop.y * scaleY;
  const sourceW = pixelCrop.width * scaleX;
  const sourceH = pixelCrop.height * scaleY;

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceW,
    sourceH,
    0,
    0,
    outputWidth,
    outputHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas is empty'));
      },
      mimeType,
      quality
    );
  });
}

export default function HeroCropModal({
  imageSrc,
  onCropComplete,
  onCancel,
  fileName = 'hero-image.jpg',
}: HeroCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState(false);

  // Set initial centered crop once image loads
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const initialCrop = centerAspectCrop(width, height, 16 / 9);
    setCrop(initialCrop);
    setCompletedCrop(convertToPixelCrop(initialCrop, width, height));
  }, []);

  // Draw live 16:9 preview on canvas whenever completedCrop changes
  useEffect(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return;

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const previewWidth = 112;
    const previewHeight = 63;
    canvas.width = previewWidth;
    canvas.height = previewHeight;

    ctx.clearRect(0, 0, previewWidth, previewHeight);
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      previewWidth,
      previewHeight
    );
  }, [completedCrop]);

  const handleConfirm = async () => {
    if (!completedCrop || !imgRef.current) return;

    setIsProcessing(true);
    try {
      const format = getOutputFormat(fileName);
      const blob = await getCroppedHeroBlob(
        imgRef.current,
        completedCrop,
        format.mimeType,
        format.quality
      );
      const sanitizedBaseName = fileName.replace(/\.[^.]+$/, '') || 'hero-image';
      const file = new File([blob], `${sanitizedBaseName}.${format.extension}`, {
        type: format.mimeType,
      });
      await onCropComplete(file);
    } catch (err) {
      console.error('Crop error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: '#111',
          border: '1px solid rgba(255,255,255,0.1)',
          maxHeight: 'calc(100dvh - 1.5rem)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-white/10 flex-shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide">
              Crop Your Hero Image
            </h3>
            <p className="text-xs text-white/40 mt-0.5 hidden sm:block">
              Drag to reposition · Resize from the corners
            </p>
            <p className="text-xs text-white/40 mt-0.5 sm:hidden">
              Drag · resize from corners
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-white/40 hover:text-white/80 transition-colors p-1 flex-shrink-0 ml-3"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Crop area */}
        <div className="flex flex-col items-center gap-3 px-3 py-3 sm:px-5 sm:py-5 flex-1 overflow-y-auto min-h-0">
          <div
            className="w-full flex justify-center rounded-xl overflow-hidden flex-shrink-0"
            style={{ background: '#000' }}
          >
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={16 / 9}
              minWidth={120}
              minHeight={68}
              keepSelection
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{
                  maxHeight: 'min(45vh, 360px)',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </ReactCrop>
          </div>

          {/* Live 16:9 preview */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div
              className="overflow-hidden ring-2 ring-white/20 flex-shrink-0 rounded-md"
              style={{ width: 112, height: 63 }}
            >
              {completedCrop ? (
                <canvas
                  ref={previewCanvasRef}
                  style={{ width: 112, height: 63 }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/10 text-white/30 text-xs text-center">
                  --
                </div>
              )}
            </div>
            <span className="text-xs text-white/30">Preview (16:9)</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 py-3 sm:px-5 sm:py-4 border-t border-white/10 flex-shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isProcessing}
            className="text-white/60 hover:text-white hover:bg-white/10 border border-white/15 text-xs sm:text-sm h-9"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!completedCrop || isProcessing}
            className="bg-white hover:bg-white/90 text-black font-black uppercase tracking-widest text-xs flex items-center gap-2 h-9"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Processing...
              </span>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Use This Image
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
}
