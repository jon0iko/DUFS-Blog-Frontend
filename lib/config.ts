export const config = {
  // Strapi Configuration
  strapi: {
    url: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://192.168.68.109:1337',
    apiToken: process.env.NEXT_PUBLIC_STRAPI_API_TOKEN || '',
    endpoints: {
      articles: '/api/articles',
      authors: '/api/authors', 
      categories: '/api/categories',
      tags: '/api/tags',
      siteConfig: '/api/site-config',
      banners: '/api/banners',
      submissions: '/api/submissions',
      navigation: '/api/navigation-items',
      socialLinks: '/api/social-links',
      auth: {
        login: '/api/auth/local',
        register: '/api/auth/local/register',
        me: '/api/users/me'
      }
    }
  },
  
  // Site Configuration
  site: {
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'DUFS Blog - Film Publication',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'A film publication guiding film lovers.',
    defaultLocale: 'en',
    supportedLocales: ['en', 'bn']
  },

  // Pagination and Limits
  pagination: {
    articlesPerPage: 12,
    relatedArticlesLimit: 3,
    featuredArticlesLimit: 4,
    editorsChoiceLimit: 4
  }
};

export default config; 