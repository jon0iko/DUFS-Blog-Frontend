import { config } from '@/lib/config';

interface ArticleSubmissionData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  language: 'en' | 'bn';
  categoryId: string;
  selectedTags: string[];
  uploadedImageId: number | null;
  token: string;
}

export async function submitNewArticle(data: ArticleSubmissionData) {
  console.log('submitNewArticle CALLED'); // Aggressive logging
  const {
    title,
    slug,
    excerpt,
    content,
    language,
    categoryId,
    selectedTags,
    uploadedImageId,
    token,
  } = data;

  try {
    const strapi_url = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    console.log('Submitting article to:', strapi_url);
    console.log('Config object was:', config); // Debugging why config might be failing

    const articleData: Record<string, unknown> = {
      title,
      slug,
      excerpt,
      content,
      language,
      isFeatured: false,
      isEditorsPick: false,
      isHero: false,
      viewCount: 0,
      likes: 0,
    };

    // Add category relation
    if (categoryId) {
      articleData.category = categoryId;
    }

    // Add tag relations
    if (selectedTags.length > 0) {
      articleData.tags = selectedTags;
    }

    // Add featured image relation
    if (uploadedImageId) {
      articleData.featuredImage = uploadedImageId;
    }
    console.log('Article data prepared:', articleData);

    console.log(`${strapi_url}/api/articles`);

    const response = await fetch(`${strapi_url}/api/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ data: articleData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || 'Failed to submit article');
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Article submission error:', error);
    throw error;
  }
}
