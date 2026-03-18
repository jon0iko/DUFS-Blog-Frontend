interface RGB {
  r: number;
  g: number;
  b: number;
}

interface PublicationPalette {
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
  spineColor: string;
  overlayColor: string;
  borderColor: string;
  titleColor: string;
}

const DEFAULT_COLOR = '#7a1f1f';

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function normalizeHex(input?: string): string {
  if (!input) return DEFAULT_COLOR;
  const raw = input.trim().replace('#', '');

  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    const expanded = raw
      .split('')
      .map((ch) => ch + ch)
      .join('');
    return `#${expanded.toLowerCase()}`;
  }

  if (/^[0-9a-fA-F]{6}$/.test(raw)) {
    return `#${raw.toLowerCase()}`;
  }

  return DEFAULT_COLOR;
}

function hexToRgb(hex: string): RGB {
  const normalized = normalizeHex(hex).slice(1);
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g)
    .toString(16)
    .padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`;
}

function mix(base: RGB, target: RGB, ratio: number): RGB {
  const t = Math.max(0, Math.min(1, ratio));
  return {
    r: base.r + (target.r - base.r) * t,
    g: base.g + (target.g - base.g) * t,
    b: base.b + (target.b - base.b) * t,
  };
}

function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}

export function derivePublicationPalette(color?: string): PublicationPalette {
  const baseHex = normalizeHex(color);
  const base = hexToRgb(baseHex);

  // Improved gradient for better visual hierarchy and depth
  const light = rgbToHex(mix(base, { r: 255, g: 255, b: 255 }, 0.12));
  const mid = rgbToHex(mix(base, { r: 0, g: 0, b: 0 }, 0.52));
  const deep = rgbToHex(mix(base, { r: 0, g: 0, b: 0 }, 0.72));
  
  // Solid, darker spine for authentic book-like appearance
  const spine = rgbToHex(mix(base, { r: 0, g: 0, b: 0 }, 0.48));
  
  // Enhanced title contrast for readability
  const title = rgbToHex(mix(base, { r: 255, g: 255, b: 255 }, 0.82));

  return {
    gradientStart: light,
    gradientMid: mid,
    gradientEnd: deep,
    spineColor: spine, // Now fully opaque
    overlayColor: withAlpha(mid, 0.68), // Slightly more transparent for better hover text readability
    borderColor: withAlpha(light, 0.42), // More visible border definition
    titleColor: title,
  };
}
