# Deployment Guide

## Quality Gates Before Deployment

This project has **multiple layers of validation** to ensure no broken code reaches production:

### 1. Pre-Commit (Local)
Every commit automatically runs:
- ✅ ESLint on changed files
- ✅ Prettier formatting on changed files
- ✅ TypeScript type checking

**Blocked if:** Any check fails

### 2. Pre-Deployment (Local)
Before `npm run deploy:preview` or `npm run deploy:prod`:
- ✅ Full type checking
- ✅ Full lint check (all files)
- ✅ Format validation
- ✅ Test suite

**Blocked if:** Any check fails

### 3. Build (Vercel)
When Vercel builds your app:
- ✅ Full validation suite (same as pre-deployment)
- ✅ Vite production build
- ✅ Environment variable validation

**Blocked if:** Build fails or validation fails

### 4. CI/CD (GitHub Actions - Optional)
On every push/PR to main:
- ✅ Type checking
- ✅ Linting
- ✅ Format checking
- ✅ Test suite
- ✅ Build validation

**Blocked if:** Any check fails (prevents merging)

---

## Deployment Flow

### Option 1: Automatic (Recommended)

**Setup:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Vercel auto-deploys on every push to `main`

**What happens:**
```bash
# You push to GitHub
git push origin main

# Vercel automatically:
# 1. Pulls latest code
# 2. Runs npm install
# 3. Runs npm run build (which includes validation)
# 4. Deploys if all checks pass
# 5. Fails deployment if any check fails
```

### Option 2: Manual via CLI

**Deploy preview:**
```bash
npm run deploy:preview
# Runs validation first, then deploys to preview URL
```

**Deploy production:**
```bash
npm run deploy:prod
# Runs validation first, then deploys to production
```

**What happens:**
```bash
# npm run deploy:prod triggers:
# 1. predeploy hook → npm run validate
#    - Type checking
#    - Linting (--max-warnings 0)
#    - Format checking
#    - Test suite
# 2. If validation passes → vercel --prod
# 3. Vercel runs npm run build
#    - Runs validation again (double safety)
#    - Builds production bundle
# 4. Deploys to production
```

---

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
   - Build Command: `npm run build` (auto-detected) ✅ Includes validation
   - Output Directory: `dist` (auto-detected)
   - Install Command: `npm install` (auto-detected)

3. **Add Environment Variables**
   - In project settings → Environment Variables
   - Add all variables from the checklist above
   - Apply to: **Production**, **Preview**, and **Development**

4. **Deploy**
   - Click "Deploy"
   - Vercel will run full validation before building
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

# Deploy to production (with validation)
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
- **Production**: Every push to `main` branch auto-deploys (after validation passes)
- **Preview**: Every PR gets a unique preview URL (after validation passes)
- **Build checks**: Failed validation prevents deployment

### Manual Deployments
```bash
# Preview deployment (for testing)
npm run deploy:preview

# Production deployment
npm run deploy:prod
```

---

## CI/CD with GitHub Actions (Optional but Recommended)

### Setup

1. **Add Secrets to GitHub**
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Add repository secrets:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_GOOGLE_MAPS_API_KEY`

2. **GitHub Actions is Already Configured**
   - Workflow file: `.github/workflows/ci.yml`
   - Runs on every push and PR
   - Blocks merging if checks fail

3. **Verify CI is Working**
   - Push to main or open a PR
   - Go to GitHub → Actions tab
   - Verify all checks pass ✅

### What CI Checks

On every push/PR:
- ✅ Type checking
- ✅ Linting (zero warnings allowed)
- ✅ Format validation
- ✅ Test suite
- ✅ Build validation

**Merge is blocked if any check fails.**

---

## Validation Scripts Reference

```bash
# Individual checks
npm run type-check    # TypeScript validation
npm run lint          # ESLint (max warnings: 0)
npm run format:check  # Prettier validation
npm run test:run      # Run test suite

# Combined validation
npm run validate      # Runs all checks above

# Build (includes validation)
npm run build         # Full validation + Vite build
npm run build:ci      # Build only (for CI after validation)

# Deployment (includes validation)
npm run deploy:preview  # Validate + deploy to preview
npm run deploy:prod     # Validate + deploy to production
```

---

## Rollback Strategy

If something breaks:

### 1. Quick Rollback via Vercel Dashboard
   - Go to Deployments tab
   - Find last working deployment
   - Click "..." → "Promote to Production"

### 2. Via Git
   ```bash
   git revert HEAD
   git push origin main
   # Auto-deploys the reverted state (after validation)
   ```

### 3. Via Vercel CLI
   ```bash
   # List deployments
   vercel ls

   # Promote a previous deployment
   vercel promote <deployment-url>
   ```

---

## Monitoring & Debugging

### Build Failures

**Check Vercel deployment logs for errors.**

Common issues:
- ❌ Type errors (caught by `tsc --noEmit`)
- ❌ Lint errors (caught by `eslint --max-warnings 0`)
- ❌ Format issues (caught by `prettier --check`)
- ❌ Test failures (caught by `vitest run`)
- ❌ Missing environment variables
- ❌ Dependency installation failures

**Solution:**
```bash
# Run locally to reproduce
npm run validate

# Fix issues
npm run lint:fix      # Auto-fix linting
npm run format        # Auto-fix formatting
# Fix type errors and test failures manually

# Verify all checks pass
npm run validate

# Deploy
git push origin main
```

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
- **GitHub Actions**: Free for public repos (2000 minutes/month for private)

For personal/family use, expect **$0/month** unless you exceed free tiers.

---

## Troubleshooting

### "Validation failed during deployment"

**Cause:** Code has type errors, lint errors, format issues, or failing tests.

**Solution:**
```bash
# Run locally to see what failed
npm run validate

# Fix issues
npm run lint:fix
npm run format
# Fix type errors and tests manually

# Verify
npm run validate

# Deploy
git push origin main
```

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

### "Tests failed" during deployment
- Run `npm run test:run` locally
- Fix failing tests
- Ensure tests pass before pushing

### CI checks failing on GitHub
- Check Actions tab for detailed error logs
- Ensure GitHub secrets are configured correctly
- Run `npm run validate` locally to reproduce

---

## Deployment Checklist (Summary)

**Before first deployment:**
- [ ] Code pushed to GitHub
- [ ] All tests passing locally (`npm run validate`)
- [ ] Environment variables prepared
- [ ] Vercel account created
- [ ] Repository connected to Vercel
- [ ] Environment variables added to Vercel
- [ ] (Optional) GitHub secrets configured for CI

**Before every deployment:**
- [ ] `npm run validate` passes locally
- [ ] All commits pass pre-commit hooks
- [ ] (If using PR workflow) CI checks pass on GitHub

**After deployment:**
- [ ] Verify app loads at Vercel URL
- [ ] Test all major features
- [ ] Check browser console for errors
- [ ] Verify API integrations work
- [ ] Run Lighthouse audit

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
- **GitHub Actions**: https://docs.github.com/en/actions

---

## Quality Gates Summary

```
┌─────────────────┐
│  Code Changes   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Pre-Commit     │  ← ESLint, Prettier, Type Check (staged files)
│  Hooks (Local)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Push to GitHub │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CI Checks      │  ← Type Check, Lint, Format, Tests, Build
│  (GitHub)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vercel Build   │  ← Full Validation + Production Build
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ✅ Deployed    │
└─────────────────┘
```

**Every layer must pass for code to reach production.**
