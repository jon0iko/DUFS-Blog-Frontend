# Quick Reference - Zero Rebuild Article System

## 🎯 What Changed

### Removed ❌
- `app/articles/[slug]/page.tsx` - Dynamic route (caused rebuilds)

### Added ✨
- `app/read-article/page.tsx` - Universal reader (one file for all articles)
- `scripts/generate-article-pages.mjs` - SEO page generator
- `.github/workflows/deploy.yml` - CI/CD automation
- `DEPLOY.md` - Complete deployment guide

### Updated 🔧
- `package.json` - Added postbuild script
- `public/.htaccess` - Simplified URL rewriting

## 🚀 Quick Start

### Local Development
```bash
# Build
npm run build

# Dev server
npm run dev

# Test article
http://localhost:3000/read-article?slug=test-article
```

### Production Deployment
**Read DEPLOY.md** for complete instructions!

## 📋 Deployment Checklist

- [ ] Read DEPLOY.md thoroughly
- [ ] Set 6 GitHub repository secrets
- [ ] Create PHP webhook relay on cPanel (`public_html/webhooks/gh-dispatch.php`)
- [ ] Create GitHub Personal Access Token
- [ ] Configure Strapi webhook
- [ ] Do initial manual deployment
- [ ] Test automated flow
- [ ] Submit sitemap to Google

## 🔑 Required GitHub Secrets

1. `STRAPI_URL` - Strapi backend URL
2. `STRAPI_TOKEN` - Strapi API token (read-only)
3. `SITE_URL` - Frontend URL
4. `FTP_HOST` - cPanel FTP hostname
5. `FTP_USER` - cPanel FTP username
6. `FTP_PASS` - cPanel FTP password

## 🔄 Publish Workflow

```
📝 Publish in Strapi
    ↓
🔔 Webhook → cPanel PHP
    ↓
🚀 GitHub Actions triggered
    ↓
🏗️ Build + Generate SEO pages
    ↓
📤 FTP Deploy to cPanel
    ↓
✅ Live in ~3-5 min!
```

## 🌐 URL Structure

| URL Type | Example | Serves |
|----------|---------|--------|
| User visits | `/articles/my-article` | Universal reader page |
| Rewritten to | `/read-article?slug=my-article` | Via .htaccess |
| Bot visits | `/articles/my-article` | Static SEO HTML |
| Sitemap | `/sitemap.xml` | Auto-generated |
| Robots | `/robots.txt` | Auto-generated |

## 🎯 Benefits

✅ Zero rebuilds for new articles
✅ Always fresh content (client-side fetch)
✅ Perfect SEO (static meta tags)
✅ Automated deployment
✅ Shared hosting compatible

## 📖 Documentation Files

- **DEPLOY.md** - Complete deployment guide (READ THIS FIRST!)
- **IMPLEMENTATION_COMPLETE.md** - Technical implementation details
- **README_CHANGES.md** - Summary of all changes
- **QUICK_REFERENCE.md** - This file

## 🆘 Troubleshooting

### Build fails locally?
→ Missing env vars is normal, SEO pages skip gracefully

### Webhook not triggering?
→ Check `public_html/webhooks/webhook.log` on cPanel

### GitHub Actions failing?
→ Verify all 6 GitHub secrets are set correctly

### Articles not loading?
→ Check Strapi is accessible, article is published

### SEO pages not generated?
→ Ensure STRAPI_URL and STRAPI_TOKEN are set in CI

## 📞 Need Help?

1. Check DEPLOY.md troubleshooting section
2. Review GitHub Actions logs
3. Check cPanel webhook.log
4. Verify all environment variables

## 🎊 You're Ready!

**Next:** Open and follow **DEPLOY.md** step by step.

---

**Version:** 1.0
**Last Updated:** November 6, 2025
**Status:** ✅ Implementation Complete
