// Strapi Media Upload Helpers
import config from "./config"

export const STRAPI_URL = config.strapi.url

interface UploadResponse {
  id: number
  documentId?: string
  name: string
  url: string
  formats?: {
    thumbnail?: { url: string }
    small?: { url: string }
    medium?: { url: string }
    large?: { url: string }
  }
}

/**
 * Upload an image to Strapi Media Library
 */
export async function uploadImageToStrapi(
  file: File,
  token?: string
): Promise<UploadResponse> {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file')
  }

  const formData = new FormData()
  formData.append('files', file)

  const headers: HeadersInit = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45000)

  let response: Response
  try {
    response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers,
      body: formData,
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Image upload timed out. Please try again.')
    }
    throw new Error('Could not reach the upload server. Please check your connection and try again.')
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    let errorMessage = `Upload failed (${response.status})`
    try {
      const contentType = response.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const errorData = await response.json()
        const message = errorData?.error?.message || errorData?.message
        if (message) {
          errorMessage = `Upload failed: ${message}`
        }
      } else {
        const text = await response.text()
        if (text) {
          errorMessage = `Upload failed: ${text}`
        }
      }
    } catch {
      if (response.statusText) {
        errorMessage = `Upload failed: ${response.statusText}`
      }
    }
    throw new Error(errorMessage)
  }

  const data = await response.json()
  if (!Array.isArray(data) || !data[0]) {
    throw new Error('Upload failed: invalid upload response from server')
  }
  return data[0]
}

/**
 * Get full URL for a Strapi media file
 */
export function getStrapiMediaUrl(path: string): string {
  if (path.startsWith('http')) {
    return path
  }
  return `${STRAPI_URL}${path}`
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!file || file.size === 0) {
    return {
      valid: false,
      error: 'The selected image is empty or invalid.',
    }
  }

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload JPG, PNG, GIF, or WebP images.',
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 5MB limit.',
    }
  }

  return { valid: true }
}

/**
 * Convert file to base64 for preview
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Validate document file before upload
 */
export function validateDocumentFile(file: File): { valid: boolean; error?: string } {
  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'text/plain',
    'text/markdown',
  ];
  const validExtensions = ['.pdf', '.docx', '.txt', '.md'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  // Check file extension
  const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  if (!validExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload PDF, DOCX, TXT, or MD files.',
    };
  }

  // Check MIME type (some files may not have MIME type set)
  if (file.type && !validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload PDF, DOCX, TXT, or MD files.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit.',
    };
  }

  return { valid: true };
}

/**
 * Upload a document to Strapi Media Library
 */
export async function uploadDocumentToStrapi(
  file: File,
  token?: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('files', file);

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data[0];
}

