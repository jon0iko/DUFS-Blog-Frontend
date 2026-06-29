import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const BENGALI_CHAR_MAP: Record<string, string> = {
  // Vowels
  'অ': 'a',
  'আ': 'aa',
  'ই': 'i',
  'ঈ': 'ii',
  'উ': 'u',
  'ঊ': 'uu',
  'ঋ': 'ri',
  'এ': 'e',
  'ঐ': 'oi',
  'ও': 'o',
  'ঔ': 'ou',

  // Consonants
  'ক': 'k',
  'খ': 'kh',
  'গ': 'g',
  'ঘ': 'gh',
  'ঙ': 'ng',
  'চ': 'c',
  'ছ': 'ch',
  'জ': 'j',
  'ঝ': 'jh',
  'ঞ': 'n',
  'ট': 't',
  'ঠ': 'th',
  'ড': 'd',
  'ঢ': 'dh',
  'ণ': 'n',
  'ত': 't',
  'থ': 'th',
  'দ': 'd',
  'ধ': 'dh',
  'ন': 'n',
  'প': 'p',
  'ফ': 'ph',
  'ব': 'b',
  'ভ': 'bh',
  'ম': 'm',
  'য': 'j',
  'র': 'r',
  'ল': 'l',
  'শ': 'sh',
  'ষ': 'ss',
  'স': 's',
  'হ': 'h',
  'ড়': 'r',
  'ঢ়': 'rh',
  'য়': 'y',
  'ৎ': 't',
  'ং': 'ng',
  'ঃ': 'h',
  'ঁ': 'n',

  // Vowel signs (kar)
  'া': 'aa',
  'ি': 'i',
  'ী': 'ii',
  'ু': 'u',
  'ূ': 'uu',
  'ৃ': 'ri',
  'ে': 'e',
  'ৈ': 'oi',
  'ো': 'o',
  'ৌ': 'ou',

  // Bengali digits
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
}

function transliterateBangla(text: string): string {
  return Array.from(text)
    .map((char) => {
      if (char === '্') {
        // Remove virama; this keeps joined consonants slug-friendly.
        return ''
      }
      return BENGALI_CHAR_MAP[char] ?? char
    })
    .join('')
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateString;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function slugify(text: string): string {
  const hasBangla = /[\u0980-\u09FF]/.test(text)
  const sourceText = hasBangla ? transliterateBangla(text) : text

  return sourceText
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase() 
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}