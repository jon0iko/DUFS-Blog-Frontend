# DUFS Blog - Film Publication Frontend

A modern, bilingual (English/Bengali) Next.js frontend for a film blog, designed to work seamlessly with Strapi CMS backend.

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

## 🎨 Key Features

### Content Management
- **Articles**: Full CRUD with categories, tags, and media
- **Authors**: Author profiles with bio, avatar, and social links
- **Categories**: Hierarchical content organization
- **Submissions**: User-generated content workflow
- **Banners**: Promotional announcements system

### User Experience
- **Responsive Design**: Mobile-first responsive layout
- **Dark/Light Theme**: System preference with manual toggle
- **Loading States**: Skeleton loaders for better UX
- **Error Boundaries**: Graceful error handling
- **Search**: Real-time content search
- **Filtering**: Advanced content filtering options

### SEO & Performance
- **Metadata Generation**: Dynamic meta tags and Open Graph
- **Structured Data**: JSON-LD for rich snippets
- **Image Optimization**: Next.js Image component
- **Static Generation**: ISR for better performance
- **Sitemap**: Automatic sitemap generation

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_STRAPI_URL` | Strapi backend URL | Yes |
| `NEXT_PUBLIC_STRAPI_API_TOKEN` | Strapi API token | Yes |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL | Yes |
| `NEXT_PUBLIC_SITE_NAME` | Site name | No |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | Site description | No |

### Font Configuration
- **Roboto**: Primary font for English content
- **Kalpurush**: Primary font for Bengali content
- Local font files for better performance

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm run export  # For static export if needed
```

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
- Content types are fully defined in `types/index.ts`
- API service handles all backend communication
- Components use TypeScript interfaces for type safety
- Error boundaries provide graceful fallbacks

## 🌍 Internationalization

### Bilingual Support
- English and Bengali language support
- Language-specific fonts (Roboto/Kalpurush)
- Content can be monolingual or bilingual
- Proper RTL support for Bengali content

### Adding New Languages
1. Update `supportedLocales` in `lib/config.ts`
2. Add language options to Strapi content types
3. Update font configurations if needed
4. Test thoroughly with new language content

## 🔒 Security

- **API Token Authentication**: Secure Strapi API access
- **CORS Configuration**: Proper cross-origin setup
- **Input Validation**: Frontend and backend validation
- **XSS Protection**: Sanitized content rendering
- **Error Handling**: No sensitive data in error messages

## 📊 Analytics & SEO

### Built-in SEO Features
- Dynamic meta tags
- Open Graph and Twitter Cards
- JSON-LD structured data
- Canonical URLs
- Sitemap generation

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

## 🙏 Acknowledgments

- **DUFS** - Dhaka University Film Society
- **Next.js Team** - For the amazing React framework
- **Strapi Team** - For the flexible headless CMS
- **Vercel** - For the deployment platform

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the documentation in STRAPI_SETUP.md

---

**Built with ❤️ for the film community**
