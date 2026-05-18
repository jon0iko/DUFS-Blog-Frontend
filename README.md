# DUFS Blog - Film Publication Frontend

A modern, bilingual (English/Bengali) Next.js static frontend for DUFS Blog, designed to work with Strapi CMS backend.

## 🎬 Features

- **Bilingual Support**: Full English and Bengali language support with custom fonts
- **Modern Design**: Clean, responsive design with dark/light theme toggle
- **CMS-Ready**: Fully integrated with Strapi CMS for content management
- **SEO Optimized**: Comprehensive SEO with Open Graph, Twitter Cards, and JSON-LD
- **Article System**: Featured articles, editor's picks, hero articles, and categorization
- **User Authentication**: Complete auth system with article submissions
- **Search & Filtering**: Advanced content filtering and search capabilities
- **Performance**: Optimized with loading states, error boundaries, and caching
- **Accessibility**: WCAG compliant with proper semantic markup

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Strapi backend (see setup instructions below)

### Frontend Setup

1. **Clone and Install**
   ```bash
   git clone [repository-url]
   cd DUFS-Blog-Frontend
   npm install
   ```

2. **Environment Configuration**
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
   NEXT_PUBLIC_STRAPI_API_TOKEN=your_strapi_api_token
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SITE_NAME=DUFS Blog - Film Publication
   NEXT_PUBLIC_SITE_DESCRIPTION=A film publication guiding film lovers.
   ```

3. **Development**
   ```bash
   npm run dev
   ```

4. **Production Build**
   ```bash
   npm run build
   npm start
   ```

### Strapi Backend Setup

For complete Strapi setup instructions, see **[STRAPI_SETUP.md](./STRAPI_SETUP.md)**

Quick setup:
```bash
npx create-strapi-app@latest dufs-blog-backend --quickstart
cd dufs-blog-backend
npm run develop
```

Then configure the content types as detailed in the STRAPI_SETUP.md file.

## 🏗️ Architecture

### Frontend Stack
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Lucide Icons** - Icon library

### Backend Integration
- **Strapi CMS** - Headless CMS for content management
- **RESTful API** - Standard REST endpoints
- **JWT Authentication** - Secure user authentication
- **Media Management** - File uploads and optimization

## 📁 Project Structure

```
DUFS-Blog-Frontend/
├── app/                          # Next.js 14 App Router pages
│   ├── articles/[slug]/         # Article detail pages
│   ├── authors/[slug]/          # Author profile pages
│   ├── browse/                  # Browse/category pages
│   ├── auth/                    # Authentication pages
│   └── submit/                  # Article submission
├── components/                   # Reusable components
│   ├── ui/                      # Base UI components
│   ├── articles/                # Article-related components
│   ├── auth/                    # Authentication components
│   ├── browse/                  # Browse page components
│   ├── home/                    # Homepage components
│   └── layout/                  # Layout components
├── lib/                         # Utility libraries
│   ├── api.ts                   # Strapi API service
│   ├── config.ts                # Configuration management
│   ├── metadata.ts              # SEO metadata utilities
│   └── utils.ts                 # General utilities
├── types/                       # TypeScript type definitions
├── contexts/                    # React contexts
├── hooks/                       # Custom React hooks
└── public/                      # Static assets
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_STRAPI_URL` | Strapi backend URL | Yes |

### Font Configuration
(Kalpurush, Montserrat, Altehaas Grotesk, Zilla Slab)
- **Montserrat**: Primary font for English content
- **Kalpurush**: Primary font for Bengali content
- **Altehaas Grotesk**: Secondary font for some headings and UI elements
- **Zilla Slab**: Font for rendering english article content
- Local font files for better performance

## Deployment

### Github Actions
Currently the main branch is set to deploy to Cpanel automatically on push. For manual deployment:
1. Build the project:
   ```bash
   npm run build
   ```
2. Upload the `.next` folder and `public` folder to your hosting provider
3. Set environment variables in your hosting control panel


## 🧪 Development

### Code Quality
- **ESLint**: Code linting with Next.js config
- **TypeScript**: Full type safety
- **Prettier**: Code formatting (recommended)

### Development Workflow
1. Create feature branch
2. Implement changes with proper TypeScript types
3. Test thoroughly with error boundaries
4. Submit PR with clear description

### API Integration
The frontend uses a centralized API service (`lib/api.ts`) for all Strapi interactions:

```typescript
import { strapiAPI } from '@/lib/api';

// Get featured articles
const articles = await strapiAPI.getFeaturedArticles(4);

// Get article by slug
const article = await strapiAPI.getArticleBySlug('article-slug');
```

## 📝 Content Management

### For Content Managers
1. **Access Strapi Admin**: Navigate to your Strapi backend admin panel
2. **Create Content**: Use the intuitive content editor
3. **Manage Categories**: Organize content with categories and tags
4. **Review Submissions**: Approve/reject user submissions
5. **Configure Site**: Update site settings, navigation, and banners

### For Developers
- This website is built for static build intentionally for better performance on low cost hosting platforms. If hosting platform is upgraded, use server-side rendering (SSR) or incremental static regeneration (ISR) for better performance and SEO.
- Content types are fully defined in `types/index.ts`
- API service handles all backend communication
- Components use TypeScript interfaces for type safety


### Analytics Integration
Ready for Google Analytics 4 and Google Tag Manager integration via environment variables.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **DUFS** - Dhaka University Film Society
- **Next.js Team** - For the amazing React framework
- **Strapi Team** - For the flexible headless CMS

##  Support

For support and questions:
- Create an issue in this repository
---

**Built with ❤️ for the film community**
