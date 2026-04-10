import { normalizeMarkdownForStorage } from './markdown';

interface ArticleSubmissionData {
  title: string;
  slug: string;
  content: string;
  language: 'en' | 'bn';
  categoryId: number;  // Strapi v5 uses numeric ID for relations
  selectedTags: number[];  // Strapi v5 uses numeric IDs for relations
  uploadedImageId: number | string | null;
  authorId: number | null;  // Author ID to connect the article to the author
  token: string;
}

/**
 * Submit a new article to Strapi v5
 * 
 * Strapi v5 Relation Format (REST API):
 * - Relations use numeric `id`, NOT `documentId`
 * - For manyToOne relations (like category): pass the numeric id directly
 * - For manyToMany relations (like tags): pass array of numeric ids
 * - For media: use the numeric ID directly
 */
export async function submitNewArticleService(data: ArticleSubmissionData) {
  const {
    title,
    slug,
    content,
    language,
    categoryId,
    selectedTags,
    uploadedImageId,
    authorId,
    token,
  } = data;

  try {
    // Direct access to env var to avoid config issues, with fallback
    const strapi_url = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

    const articleData: Record<string, unknown> = {
      title,
      slug,
        content: normalizeMarkdownForStorage(content),
      language,
      InFeatured: false,
      InSlider: false,
      viewCount: 0,
      likes: 0,
      BlogDate: null, // Will be set by admin later
      SubmitDate: new Date().toISOString(), // Current date/time when submitted
    };

    // Add category relation (manyToOne) - Strapi v5 REST API uses numeric ID directly
    if (categoryId) {
      articleData.category = categoryId;
    }

    // Add tag relations (manyToMany) - Strapi v5 REST API uses array of numeric IDs
    if (selectedTags.length > 0) {
      articleData.tags = selectedTags;
    }

    // Add featured image relation - media uses numeric ID
    if (uploadedImageId) {
      articleData.featuredImage = uploadedImageId;
    }
    
    // Add author relation (manyToOne) - Strapi v5 REST API uses numeric ID directly
    if (authorId) {
      articleData.author = authorId;
    }

    // Use query parameter to ensure article is created as draft (not published)
    // In Strapi v5, articles with draftAndPublish enabled are drafts by default
    // Adding status=draft explicitly ensures it stays unpublished
    const endpoint = `${strapi_url}/api/articles?status=draft`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ data: articleData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Strapi error response:', errorData);
      throw new Error(errorData?.error?.message || 'Failed to submit article');
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Article submission error:', error);
    throw error;
  }
}
