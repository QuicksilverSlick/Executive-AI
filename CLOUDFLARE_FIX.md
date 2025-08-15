# Cloudflare Pages - Fix Deployment Issue

## Problem
Cloudflare Pages is building from old commit `d35805c` instead of latest `4d752d3`.

## Solution: Create New Pages Project

### Step 1: Delete Current Project (Optional)
If you want to keep the same project name:
1. Go to Pages project → Settings → Delete project
2. Confirm deletion

### Step 2: Create New Pages Project
1. Go to **Workers & Pages** → **Create application** → **Pages**
2. Click **Connect to Git**
3. Select **GitHub** 
4. Choose repository: `QuicksilverSlick/Executive-AI`
5. Configure build settings:
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty)

### Step 3: Set Environment Variables
Add these in the project settings:
- `OPENAI_API_KEY` = Your API key
- `NODE_VERSION` = 18

### Step 4: Deploy
Click **Save and Deploy**

## Alternative: Manual Deployment via CLI

If GitHub integration continues to fail:

```bash
# Install wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy directly from local
npm run build
wrangler pages deploy dist --project-name executive-ai-training
```

## Verify Fix is Applied

The latest code includes these React SSR fixes in `astro.config.mjs`:

```javascript
vite: {
  ssr: {
    noExternal: ['@fontsource/*', 'react', 'react-dom'],
    external: ['node:crypto', 'crypto']
  },
  resolve: {
    alias: {
      'react-dom/server': 'react-dom/server.browser'
    }
  }
}
```

This configuration ensures React uses browser-compatible rendering, which resolves the `MessageChannel is not defined` error.

## Expected Result
Once deployed with the latest code, the application should:
- Build successfully without MessageChannel errors
- Deploy to your Pages URL
- Be ready for custom domain configuration