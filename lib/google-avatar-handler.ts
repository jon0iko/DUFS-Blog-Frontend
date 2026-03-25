/**
 * Production-grade Google Avatar Handler
 * Handles fetching, validating, re-encoding, and uploading Google profile pictures
 */

/**
 * Fetch a Google avatar URL and validate it's a real image
 * Returns the image data as a canvas-validated, re-encoded blob
 * @param imageUrl - Google picture URL
 * @param timeout - Fetch timeout in milliseconds
 * @returns Promise<{blob: Blob, dataUrl: string}> - Re-encoded blob and preview data URL
 */
export async function fetchAndValidateGoogleAvatar(
  imageUrl: string,
  timeout = 10000
): Promise<{ blob: Blob; dataUrl: string }> {
  if (!imageUrl) {
    throw new Error('Google avatar URL is empty');
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Fetch with proper CORS handling and no referrer
    const response = await fetch(imageUrl, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
      referrerPolicy: 'no-referrer',
      signal: controller.signal,
      headers: {
        // Some services respect this to avoid being blocked
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Google avatar: ${response.status} ${response.statusText}`
      );
    }

    // Get the blob
    let blob = await response.blob();

    if (blob.size === 0) {
      throw new Error('Downloaded image is empty');
    }

    // Validate it's actually an image by loading it in an Image element
    const validatedBlob = await validateAndReEncodeImage(blob);

    // Create a data URL for preview (works even with CORS-restricted images)
    const dataUrl = URL.createObjectURL(validatedBlob);

    return { blob: validatedBlob, dataUrl };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(
          'Google avatar fetch timeout (>10s). Please check your internet connection.'
        );
      }
      throw error;
    }
    throw new Error('Unknown error fetching Google avatar');
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Validate an image blob by loading it in an Image element,
 * then re-encode it as PNG to ensure compatibility and integrity
 * @param blob - Source image blob
 * @returns Promise<Blob> - Re-encoded PNG blob
 */
async function validateAndReEncodeImage(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Create image element to validate the blob
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const objectUrl = URL.createObjectURL(blob);

    img.onload = () => {
      // Image is valid, now re-encode it as PNG
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Convert canvas to blob (PNG format for lossless quality)
        canvas.toBlob(
          (canvasBlob) => {
            URL.revokeObjectURL(objectUrl);

            if (!canvasBlob) {
              reject(new Error('Failed to convert canvas to blob'));
              return;
            }

            if (canvasBlob.size === 0) {
              reject(new Error('Re-encoded image is empty'));
              return;
            }

            resolve(canvasBlob);
          },
          'image/png',
          0.95 // PNG quality
        );
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(
          error instanceof Error
            ? error
            : new Error('Failed to re-encode image')
        );
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error(
          'Invalid image format from Google. Please upload a profile picture manually.'
        )
      );
    };

    img.onabort = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image load was aborted'));
    };

    // Start loading
    img.src = objectUrl;
  });
}

/**
 * Create a File object from a blob with a proper filename
 * @param blob - Source blob
 * @param userId - User ID for filename
 * @param mimeType - MIME type (defaults to image/png)
 * @returns File
 */
export function createAvatarFile(
  blob: Blob,
  userId: number,
  mimeType = 'image/png'
): File {
  // Extract extension from MIME type
  const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png';
  const filename = `avatar-${userId}-${Date.now()}.${ext}`;

  return new File([blob], filename, { type: mimeType });
}

/**
 * Clean up object URLs to prevent memory leaks
 * @param url - Object URL to revoke
 */
export function revokeAvatarUrl(url: string | null): void {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}
