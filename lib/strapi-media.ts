// Strapi Media Upload Helpers

export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'

interface UploadResponse {
  id: number
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
  const formData = new FormData()
  formData.append('files', file)

  const headers: HeadersInit = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers,
    body: formData,
  })

  console.log('Upload response status:', response)

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`)
  }

  const data = await response.json()
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

