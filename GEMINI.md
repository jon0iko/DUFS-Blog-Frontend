# GEMINI.md - Project Context & Instructions

This file provides critical context and instructions for AI agents working on the DUFS Blog Frontend.

## 🚀 Project Overview
- **Name:** DUFS Blog (Dhaka University Film Society)
- **Type:** Next.js 14 (App Router) + TypeScript
- **Backend:** Strapi CMS v5 (Headless)
- **Primary Goal:** A high-performance, bilingual (English/Bengali) film publication platform.
- **Architecture:** **Two-Tier System**
    - **Humans:** Dynamic client-side fetching from Strapi (Zero wait for rebuilds).
    - **Bots:** Pre-rendered static SEO pages generated during CI/CD.

## 🛠️ Technical Stack
- **Framework:** Next.js 14 (App Router, Static Export)
- **Styling:** Tailwind CSS + Radix UI (Primitives)
- **Animations:** GSAP (Advanced) + Framer Motion (Simple)
- **Icons:** Lucide React
- **Editor:** Tiptap (Custom implementation for article submission)
- **Fonts:** 
    - **English:** Alte Haas Grotesk (Hero), Montserrat (UI), Roboto (Body)
    - **Bengali:** Kalpurush

## 📂 Key Directory Structure
- `app/`: Next.js App Router. Note: `/articles` is a virtual route handled by `.htaccess`. The actual logic resides in `/read-article`.
- `components/`: Organized by feature (e.g., `articles/`, `home/`, `submissions/`).
- `lib/`: Core utilities.
    - `api.ts`: Centralized Strapi API client.
    - `strapi-media.ts`: Media upload and URL helpers.
    - `fonts.ts`: Font configuration for bilingual support.
- `scripts/`: Build-time scripts (e.g., SEO page generation).
- `public/`: Static assets and the critical `.htaccess` file for bot routing.

## 📜 Development Conventions
- **API Interactions:** Always use `strapiAPI` from `@/lib/api`. It handles Strapi v5's flattened response format and authentication.
- **Typography:** 
    - Use `getFontClass(text)` from `@/lib/fonts` to dynamically apply the correct font family based on whether the content is English or Bengali.
    - Hero headlines should use `font-altehaasgrotesk`.
    - General UI text should use `font-montserrat`.
- **Animations:** 
    - Use GSAP for complex timelines (e.g., typing effects, hero transitions).
    - Ensure GSAP contexts are reverted in `useEffect` cleanups to prevent memory leaks and animation glitches.
- **Routing:** 
    - Internal links to articles should use the `/articles/[slug]` format.
    - The actual rendering happens in `app/read-article/page.tsx` via client-side search params.

## ⌨️ Key Commands
- `npm run dev`: Start the development server.
- `npm run build`: Production build (Standard Next.js build).
- `npm run export`: Full build followed by static export to the `out/` directory.
- `npm run lint`: Run ESLint checks.
- `npm run postbuild`: Automatically runs `scripts/generate-article-pages.mjs` to create SEO snapshots for bots.

## ⚠️ Important Constraints
- **Routing Logic:** Do NOT create a physical folder `app/articles/[slug]`. This will break the Two-Tier routing logic handled by Apache. Use `app/read-article/page.tsx` for article display.
- **Strapi v5:** Ensure all API calls account for the v5 flattened structure (no nested `attributes` or `data` wrappers within the result objects).
- **Bilingual Support:** Always consider both English and Bengali rendering. Test with Bengali text to ensure font fallback and line-heights are correct.
- **Static Export:** The project is configured for `output: 'export'`. Avoid using Next.js features that require a Node.js server at runtime (like `headers`, `redirects` in `next.config.js`, or dynamic server-side logic).

## 🤖 Interaction Guidelines
- When adding new features, maintain the "Writer's Desk" aesthetic (torn paper textures, coffee stains, grid patterns).
- Prioritize GSAP for animations to match the existing interactive feel of the "Writer's Corner".
- Always update `types/index.ts` if adding new content types or changing Strapi schemas.
- **Button Hover States:** Never dim the brightness of buttons when hovering. The objective of hover is to make buttons "pop" (e.g., by making the color lighter, increasing opacity, or adding a glow).
