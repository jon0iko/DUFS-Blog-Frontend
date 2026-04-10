import { config } from '@/lib/config';

interface ArticleSubmissionData {
  title: string;
  slug: string;
  content: string;
  language: 'en' | 'bn';
  categoryId: string;
  selectedTags: string[];
  uploadedImageId: number | null;
  token: string;
}

export async function submitNewArticle(data: ArticleSubmissionData) {
  const {
    title,
    slug,
    content,
    language,
    categoryId,
    selectedTags,
    uploadedImageId,
    token,
  } = data;

  try {
    const strapi_url = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';


    const articleData: Record<string, unknown> = {
      title,
      slug,
        content,
      language,
      InFeatured: false,
      InSlider: false,
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
