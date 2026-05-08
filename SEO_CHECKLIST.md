# SEO Deployment Checklist

## Pre-Deployment

- [x] Add comprehensive meta tags to index.html
- [x] Create OG image for social sharing
- [x] Add favicon and manifest.json
- [x] Create robots.txt and sitemap.xml
- [ ] **Update URLs in index.html** with your actual Vercel domain
- [ ] **Update sitemap.xml** with your actual Vercel domain

## Post-Deployment SEO Tasks

### 1. Update Dynamic URLs

After deploying to Vercel, replace placeholder URLs:

**In [index.html](index.html):**
```html
<!-- Replace all instances of: -->
https://palantir-for-family-trips.vercel.app/

<!-- With your actual domain: -->
https://your-actual-domain.vercel.app/
```

**In [public/sitemap.xml](public/sitemap.xml):**
```xml
<loc>https://your-actual-domain.vercel.app/</loc>
```

**In [public/robots.txt](public/robots.txt):**
```
Sitemap: https://your-actual-domain.vercel.app/sitemap.xml
```

### 2. Privacy Decision

**For Public Project:**
- Keep `public/robots.txt` as-is (allows indexing)
- Share on social media to generate backlinks
- Add to GitHub topics for discoverability

**For Private Project:**
- Replace `public/robots.txt` with contents from `public/robots-private.txt`
- Add authentication to Vercel deployment (Pro plan required)
- Or keep as-is if you just don't want it searchable but don't mind the URL being accessible

### 3. Google Search Console (if making public)

1. Go to https://search.google.com/search-console
2. Add your Vercel domain
3. Verify ownership via HTML tag or DNS
4. Submit your sitemap: `https://your-domain.vercel.app/sitemap.xml`
5. Monitor indexing status

### 4. Social Media Testing

**Test how your site appears on social:**
- **Facebook/LinkedIn**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **General**: https://www.opengraph.xyz/

Paste your deployed URL and verify:
- Title displays correctly
- Description is clear
- OG image loads (the blue Palantir logo graphic)

### 5. Performance & SEO Audit

**Run Lighthouse in Chrome DevTools:**
```bash
# Or use CLI
npm install -g lighthouse
lighthouse https://your-domain.vercel.app --view
```

**Target scores:**
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 95+

**Common fixes if scores are low:**
- Add `alt` text to images
- Ensure proper heading hierarchy (h1 → h2 → h3)
- Add `aria-labels` to interactive elements
- Optimize images (use WebP format)
- Enable caching headers (already in vercel.json)

### 6. Analytics (Optional)

**Vercel Analytics** (free tier):
1. Go to your Vercel project → Analytics tab
2. Enable Web Analytics
3. Add this to your index.html `<head>`:
   ```html
   <script defer src="/_vercel/insights/script.js"></script>
   ```

**Google Analytics** (if you want more detailed tracking):
1. Create GA4 property at https://analytics.google.com
2. Add tracking script to index.html
3. Monitor traffic, user behavior, conversions

### 7. Security Headers

Vercel automatically adds many security headers, but you can enhance them in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### 8. Custom Domain (Optional)

**If you want a custom domain:**
1. Buy domain from Namecheap, Google Domains, etc.
2. In Vercel dashboard → Domains
3. Add your custom domain
4. Update DNS records (Vercel provides instructions)
5. Update all URLs in meta tags, sitemap, robots.txt

---

## SEO Best Practices for This Project

### Content Strategy

Since this is a demo/portfolio project, consider:

1. **Blog Post / Case Study**
   - Write about building it on Medium, Dev.to, or your blog
   - Link back to the live demo
   - Explain technical decisions

2. **GitHub README**
   - Your README is now SEO-optimized
   - Add GitHub topics: `react`, `vite`, `dashboard`, `palantir-ui`
   - Star/watch to increase visibility

3. **Social Sharing**
   - Share on Twitter/X with hashtags: #webdev #react #buildinpublic
   - Post on LinkedIn with project highlights
   - Share in Reddit communities (r/reactjs, r/webdev)

### Technical SEO

- [x] Fast page load (Vite optimizes this)
- [x] Mobile responsive (ensure this is tested)
- [x] HTTPS (Vercel provides automatically)
- [x] Semantic HTML structure
- [ ] Add structured data (JSON-LD) - optional for this project
- [ ] Add breadcrumbs navigation - optional

### Example Structured Data (Optional)

Add to index.html `<head>` for rich search results:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Family Trip Command Center",
  "description": "A Palantir-style operations dashboard for coordinating family trips",
  "url": "https://your-domain.vercel.app",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
</script>
```

---

## Monitoring

**Weekly checks:**
- [ ] Vercel deployment status (green)
- [ ] No broken links (use broken-link-checker CLI)
- [ ] Lighthouse score still high
- [ ] No console errors on production

**Monthly checks:**
- [ ] Google Search Console for indexing issues
- [ ] Analytics review (if enabled)
- [ ] Update sitemap lastmod date if content changed

---

## Privacy & Legal

- [x] LICENSE file added (MIT)
- [ ] Privacy policy (if collecting any user data)
- [ ] Cookie notice (if using analytics/tracking)
- [ ] Terms of service (optional for portfolio projects)

---

## Current Status

✅ SEO foundation complete  
⏸️ Awaiting deployment URL to finalize  
📋 Use this checklist after deployment  

**Next immediate action:** Deploy to Vercel, then update all URLs in the checklist above.
