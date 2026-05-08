# Deployment Guide

## Prerequisites Checklist

### 1. Vercel Account Setup
- [ ] Create/login to Vercel account at https://vercel.com
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login to CLI: `vercel login`

### 2. GitHub Repository
- [ ] Push code to GitHub repository
- [ ] Ensure `.env` is in `.gitignore` (already configured)
- [ ] Ensure `dist/` is in `.gitignore` (already configured)

### 3. Environment Variables Preparation
Gather these values before deployment:

#### Supabase (Required)
- [ ] `VITE_SUPABASE_URL` - From Supabase project settings
- [ ] `VITE_SUPABASE_ANON_KEY` - From Supabase project API settings (use public anon key, NOT service role)

#### Google Maps (Required)
- [ ] `VITE_GOOGLE_MAPS_API_KEY` - From Google Cloud Console
- [ ] Restrict API key to your Vercel domain in Google Cloud Console

#### Optional
- [ ] `VITE_GOOGLE_MAP_ID` - Custom styled map ID (if using)
- [ ] `VITE_DISABLE_LEGACY_GOOGLE_ROUTING` - Set to `true` if needed

---

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended for first deploy)

1. **Connect Repository**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel auto-detects Vite configuration

2. **Configure Build Settings**
   - Framework Preset: `Vite` (auto-detected)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

3. **Add Environment Variables**
   - In project settings → Environment Variables
   - Add all variables from the checklist above
   - Apply to: **Production**, **Preview**, and **Development**

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

### Option 2: Deploy via CLI

```bash
# First time setup
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? (default: palantir-for-family-trips)
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_GOOGLE_MAPS_API_KEY
# (paste values when prompted, select: production, preview, development)

# Deploy to production
npm run deploy:prod
```

---

## Post-Deployment Checklist

### 1. Security Configuration

#### Supabase RLS (Row Level Security)
- [ ] Verify RLS is enabled on all tables in Supabase dashboard
- [ ] Test that unauthorized users cannot access data
- [ ] Verify authentication flows work

#### Google Maps API
- [ ] Go to Google Cloud Console → APIs & Services → Credentials
- [ ] Edit your API key → Application restrictions
- [ ] Add your Vercel domain: `your-app.vercel.app`
- [ ] Save restrictions

#### Vercel Domain
- [ ] Note your deployment URL: `https://your-app.vercel.app`
- [ ] (Optional) Configure custom domain in Vercel dashboard

### 2. Verify Deployment

- [ ] Visit your Vercel URL
- [ ] Check browser console for errors
- [ ] Test all major features:
  - [ ] Trip creation
  - [ ] Map loads correctly
  - [ ] Data persists to Supabase
  - [ ] All pages/routes work
  - [ ] No API key errors

### 3. Performance Check

- [ ] Run Lighthouse audit (Chrome DevTools)
  - Target: 90+ performance score
  - Check for any red flags
  
- [ ] Check Vercel Analytics (if enabled)
  - Monitor Core Web Vitals
  - Check for slow requests

---

## Continuous Deployment

### Automatic Deployments (Recommended)
Once connected to GitHub:
- **Production**: Every push to `main` branch auto-deploys
- **Preview**: Every PR gets a unique preview URL
- **Build checks**: Failed builds prevent deployment

### Manual Deployments
```bash
# Preview deployment (for testing)
npm run deploy:preview

# Production deployment
npm run deploy:prod
```

---

## Rollback Strategy

If something breaks:

1. **Quick rollback via Vercel Dashboard**
   - Go to Deployments tab
   - Find last working deployment
   - Click "..." → "Promote to Production"

2. **Via Git**
   ```bash
   git revert HEAD
   git push origin main
   # Auto-deploys the reverted state
   ```

---

## Monitoring & Debugging

### Build Failures
- Check Vercel deployment logs for errors
- Common issues:
  - Type errors (caught by `tsc --noEmit`)
  - Missing environment variables
  - Dependency installation failures

### Runtime Errors
- Check browser console on deployed site
- Check Vercel Function Logs (if using any)
- Check Supabase logs for database issues

### Performance Issues
- Use Vercel Analytics
- Check Supabase query performance
- Monitor Google Maps API quota

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase public anon key | `eyJhbGc...` |
| `VITE_GOOGLE_MAPS_API_KEY` | ✅ | Google Maps API key (browser-restricted) | `AIzaSy...` |
| `VITE_GOOGLE_MAP_ID` | ❌ | Custom styled map ID | `abc123def456` |
| `VITE_DISABLE_LEGACY_GOOGLE_ROUTING` | ❌ | Disable legacy routing | `true` or `false` |

---

## Cost Estimate

- **Vercel**: Free tier (100GB bandwidth, unlimited deployments)
- **Supabase**: Free tier (500MB database, 2GB bandwidth)
- **Google Maps**: Pay-as-you-go ($7 per 1000 loads, $200 free credit/month)

For personal/family use, expect **$0/month** unless you exceed free tiers.

---

## Troubleshooting

### "Environment variable undefined" error
- Ensure all `VITE_*` variables are set in Vercel dashboard
- Redeploy after adding env vars

### Google Maps not loading
- Check API key restrictions in Google Cloud Console
- Verify `VITE_GOOGLE_MAPS_API_KEY` is correct
- Check browser console for specific errors

### Supabase connection errors
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check Supabase project is active
- Verify RLS policies allow access

### Build fails with TypeScript errors
- Run `npm run type-check` locally
- Fix all type errors before deploying

---

## Next Steps After Deployment

1. Set up Vercel Analytics (optional, free tier available)
2. Configure custom domain (optional)
3. Set up monitoring/alerts for downtime
4. Document API usage for family members
5. Consider setting up staging environment (use Git branches + preview deployments)

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html
