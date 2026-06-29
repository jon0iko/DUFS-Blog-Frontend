import 'server-only';
import { config } from './config';
import type { Article, ArticleResponse } from '@/types';

/**
 * Build-time data fetching (Server Components only).
 *
 * These run during `next build` so the homepage hero can be baked into the
 * static HTML — that lets the browser start downloading the LCP image
 * immediately instead of waiting for the JS bundle + a client fetch.
 *
 * Everything here is defensive: if Strapi is unreachable at build time the
 * functions resolve to empty data and the client falls back to its normal
 * runtime fetch, so the build never fails and content is never lost.
 */

const BUILD_FETCH_TIMEOUT_MS = 10_000;

/**
 * Canonical site origin for metadata/SEO. The CI build sets SITE_URL (non-public);
 * fall back to the public var and finally the config default for local builds.
 */
export function getSiteUrl(): string {
  return (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    config.site.url
  ).replace(/\/$/, '');
}

async function buildFetch<T>(endpoint: string): Promise<T | null> {
  const url = `${config.strapi.url}${endpoint}`;
  const token = process.env.STRAPI_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // force-cache keeps the page statically exportable; at build time this
      // still performs the request once.
      cache: 'force-cache',
      signal: AbortSignal.timeout(BUILD_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Strapi down / not reachable during build — fall back to client fetch.
    return null;
  }
}

/**
 * Hero/slider articles, mirrors strapiAPI.getHeroArticles() so the client can
 * seamlessly revalidate over the build-time snapshot.
 */
export async function getHeroArticlesBuildTime(): Promise<Article[]> {
  const sp = new URLSearchParams();
  sp.append('filters[InSlider][$eq]', 'true');
  sp.append('status', 'published');
  sp.append('sort', 'updatedAt:desc');
  sp.append('fields[0]', 'title');
  sp.append('fields[1]', 'BlogDate');
  sp.append('fields[2]', 'createdAt');
  sp.append('fields[3]', 'updatedAt');
  sp.append('fields[4]', 'publishedAt');
  sp.append('fields[5]', 'slug');
  sp.append('fields[6]', 'publication_author_name');
  sp.append('populate[featuredImage]', 'true');
  sp.append('populate[author][fields][0]', 'Name');
  sp.append('populate[author][populate][users_permissions_user][fields][0]', 'id');
  sp.append('populate[author][populate][users_permissions_user][populate][Avatar][fields][0]', 'url');

  const data = await buildFetch<ArticleResponse>(
    `${config.strapi.endpoints.articles}?${sp.toString()}`,
  );
  return data?.data ?? [];
}
