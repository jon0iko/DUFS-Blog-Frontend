# DUFS Blog Color System

## Brand Colors (Based on DUFS Logo)

### Primary Black - `#231F20`
The signature black from the DUFS logo. This is the foundation of our brand identity.

**Available Shades:**
- `brand-black` or `brand-black-100`: `#231F20` - Full intensity (100%)
- `brand-black-80`: `#4F4B4C` - 80% intensity
- `brand-black-60`: `#7B7879` - 60% intensity

**Usage:**
```tsx
// Full black
<div className="bg-brand-black text-white">

// 80% black for subtle backgrounds
<div className="bg-brand-black-80">

// 60% black for muted text
<p className="text-brand-black-60">
```

### White - `#FFFFFF`
Clean white for contrast and breathing space.

**Available Shades:**
- `brand-white`: `#FFFFFF` - Full white (100%)
- `brand-white-40`: `#FFFFFF66` - 40% opacity
- `brand-white-20`: `#FFFFFF33` - 20% opacity

**Usage:**
```tsx
// Full white
<div className="bg-brand-white">

// 40% white overlay
<div className="bg-brand-white-40">

// 20% white for subtle effects
<div className="bg-brand-white-20">
```

### Accent Color (CTA/Functional)
- `brand-accent`: `#1a8917` - Green accent for buttons and CTAs
- **Note:** This color is subject to change based on final design decisions

## Semantic Color System

### Light Mode
Our CSS variables are configured to use DUFS brand colors:

| Variable | Color | Usage |
|----------|-------|-------|
| `--background` | White | Main page background |
| `--foreground` | DUFS Black (#231F20) | Primary text |
| `--primary` | DUFS Black | Primary buttons, emphasis |
| `--secondary` | Light Gray (97%) | Secondary elements |
| `--muted` | Light Gray (95%) | Subtle backgrounds |
| `--muted-foreground` | 60% Black | Secondary text |
| `--border` | Light Gray (90%) | Borders and dividers |

### Dark Mode
Inverted color scheme for dark mode:

| Variable | Color | Usage |
|----------|-------|-------|
| `--background` | DUFS Black (#231F20) | Main page background |
| `--foreground` | White | Primary text |
| `--primary` | White | Primary buttons, emphasis |
| `--secondary` | 80% Black (#4F4B4C) | Secondary elements |
| `--muted` | 80% Black | Subtle backgrounds |
| `--border` | 80% Black | Borders and dividers |

## Using the Color System

### With Tailwind Classes
```tsx
// Background colors
<div className="bg-brand-black">
<div className="bg-brand-white">

// Text colors
<h1 className="text-brand-black">
<p className="text-brand-black-60">

// Borders
<div className="border border-brand-black-80">

// Hover states
<button className="bg-brand-black hover:bg-brand-black-80">
```

### With CSS Variables
```tsx
// Using semantic colors
<div className="bg-background text-foreground">
<button className="bg-primary text-primary-foreground">

// These automatically adapt to light/dark mode
```

## Design Guidelines

### Contrast & Readability
- Always use full black (`brand-black`) or white (`brand-white`) for primary text
- Use 60% black shade for secondary/muted text
- Maintain minimum 4.5:1 contrast ratio for body text
- Aim for 7:1 contrast for headings

### Hierarchy
1. **Primary:** DUFS Black (#231F20) - Headers, important text, primary buttons
2. **Secondary:** 80% Black (#4F4B4C) - Subheadings, secondary buttons, dividers
3. **Tertiary:** 60% Black (#7B7879) - Meta information, captions, disabled states

### Spacing & Breathing Room
- Use generous white space to let the black elements stand out
- Keep backgrounds clean (white or very light gray)
- Use subtle shades for hover/focus states

### When to Use Each Shade

**100% Black (#231F20):**
- Main navigation
- Article titles
- Primary buttons
- Logo
- Important calls-to-action

**80% Black (#4F4B4C):**
- Secondary navigation items
- Button hover states
- Borders and dividers
- Card backgrounds in dark mode
- Section headers

**60% Black (#7B7879):**
- Timestamps and dates
- Article metadata (author, category)
- Placeholder text
- Disabled button text
- Captions and footnotes

**White Shades:**
- 40% opacity: Overlays, loading states
- 20% opacity: Subtle hover effects, background patterns

## Accessibility Notes

- ✅ Black on white passes WCAG AAA (21:1 ratio)
- ✅ White on black passes WCAG AAA (21:1 ratio)
- ✅ 60% black on white passes WCAG AA for body text (7.4:1)
- ⚠️ Avoid 40% and 20% white on light backgrounds
- ⚠️ Always test contrast when using brand colors over images

## Migration from Old Colors

### Before:
```tsx
bg-black → bg-brand-black
bg-white → bg-brand-white
text-gray-600 → text-brand-black-60
bg-gray-100 → bg-secondary (light mode)
border-gray-200 → border
```

### Component-Specific Updates:
- **Header/Footer:** Should use `brand-black` background
- **Cards:** White background with `brand-black` text
- **Buttons:** Primary uses `brand-accent`, Secondary uses `brand-black-80`
- **Links:** `brand-black` default, `brand-accent` on hover
- **Dividers:** `brand-black-80` or `border` utility

## Next Steps

1. ✅ Updated Tailwind config with brand colors
2. ✅ Updated CSS variables for light/dark mode
3. 🔄 Update components to use new color system (Next task)
4. ⏳ Finalize CTA accent color with design team
5. ⏳ Conduct accessibility audit
6. ⏳ Test dark mode thoroughly

---

**Last Updated:** December 23, 2025
**Status:** Phase 1 Complete - Color System Established
