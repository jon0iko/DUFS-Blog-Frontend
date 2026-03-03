'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AvatarCropModalProps {
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
  fileName?: string;
}

/**
 * Centers a 1:1 aspect crop within the image on first load.
 */
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      { unit: '%', width: 80 },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

/**
 * Draws the cropped region of `image` onto a canvas and clips it to a circle.
 * Returns a transparent circular PNG blob via `onComplete`.
 */
async function getCroppedCircleBlob(
  image: HTMLImageElement,
  pixelCrop: PixelCrop
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2D context');

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  // Output size: 400×400 is plenty for an avatar
  const outputSize = 400;
  canvas.width = outputSize;
  canvas.height = outputSize;

  const sourceX = pixelCrop.x * scaleX;
  const sourceY = pixelCrop.y * scaleY;
  const sourceW = pixelCrop.width * scaleX;
  const sourceH = pixelCrop.height * scaleY;

  // Clip to circle before drawing
  ctx.beginPath();
  ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
  ctx.clip();

  ctx.drawImage(image, sourceX, sourceY, sourceW, sourceH, 0, 0, outputSize, outputSize);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas is empty'));
      },
      'image/png',
      1
    );
  });
}

export default function AvatarCropModal({
  imageSrc,
  onCropComplete,
  onCancel,
  fileName = 'avatar.png',
}: AvatarCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState(false);

  // Set initial centered crop once image loads
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  // Draw live circular preview on canvas whenever completedCrop changes
  useEffect(() => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return;

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const size = 56; // preview circle px
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      size,
      size
    );
  }, [completedCrop]);

  const handleConfirm = async () => {
    if (!completedCrop || !imgRef.current) return;

    setIsProcessing(true);
    try {
      const blob = await getCroppedCircleBlob(imgRef.current, completedCrop);
      const file = new File([blob], fileName.replace(/\.[^.]+$/, '.png'), {
        type: 'image/png',
      });
      onCropComplete(file);
    } catch (err) {
      console.error('Crop error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const modal = (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
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
              Crop Your Avatar
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

        {/* Crop area — scrollable body */}
        <div className="flex flex-col items-center gap-3 px-3 py-3 sm:px-5 sm:py-5 flex-1 overflow-y-auto min-h-0">
          <div
            className="w-full flex justify-center rounded-xl overflow-hidden flex-shrink-0"
            style={{ background: '#000' }}
          >
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
              minWidth={60}
              minHeight={60}
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

          {/* Live circular preview — compact row on mobile */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div
              className="rounded-full overflow-hidden ring-2 ring-white/20 flex-shrink-0"
              style={{ width: 56, height: 56 }}
            >
              {completedCrop ? (
                <canvas
                  ref={previewCanvasRef}
                  style={{ width: 56, height: 56, borderRadius: '50%' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/10 text-white/30 text-xs text-center">
                  —
                </div>
              )}
            </div>
            <span className="text-xs text-white/30">Preview</span>
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
                Use This Photo
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
