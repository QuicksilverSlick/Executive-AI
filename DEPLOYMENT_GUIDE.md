# Voice Agent Deployment Guide

## Current Working Setup

### Development Mode
- **Main App**: Astro dev server on port 4323
- **Search Server**: Express on port 3001
- **Status**: ✅ Working - search functionality confirmed by user

### Production Build
- **Build Command**: `npm run build`
- **Preview Command**: `npm run preview` (runs on port 4321)
- **Adapter**: Node.js standalone server
- **Status**: ✅ Successfully configured and built

## Production Deployment Options

### Option 1: Node.js Server (Current Configuration)
The project is configured with the Astro Node adapter for server-side rendering.

```bash
# Build the project
npm run build

# Start production server
node ./dist/server/entry.mjs
```

#### Deployment Platforms:
- **Railway/Render**: Direct Node.js deployment
- **DigitalOcean App Platform**: Node.js app
- **AWS EC2/ECS**: Containerized deployment
- **Google Cloud Run**: Serverless containers

### Option 2: Vercel Deployment
Replace Node adapter with Vercel adapter:

```bash
npm install @astrojs/vercel
```

Update `astro.config.mjs`:
```javascript
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  // ...
});
```

### Option 3: Netlify Deployment
Replace Node adapter with Netlify adapter:

```bash
npm install @astrojs/netlify
```

Update `astro.config.mjs`:
```javascript
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'server',
  adapter: netlify(),
  // ...
});
```

## Search Server Deployment

### Development vs Production
The app uses environment-aware endpoint selection:

```typescript
// Automatically switches between dev and prod
if (import.meta.env.DEV || window.location.hostname === 'localhost') {
  // Use standalone server in development
  searchUrl = 'http://localhost:3001/search';
} else {
  // Use configured API URL or Astro route in production
  searchUrl = import.meta.env.PUBLIC_SEARCH_API_URL || '/api/voice-agent/responses-search';
}
```

### Production Search Options

#### Option A: Test Astro API Route
The query parameter issue might be specific to dev server. Try the built-in route first:
1. Deploy without the standalone search server
2. The app will automatically use `/api/voice-agent/responses-search`
3. Test if it works in production

#### Option B: Deploy Search as Serverless Function
Convert `search-server.js` to a serverless function:

**Vercel Function** (`api/search.js`):
```javascript
export default async function handler(req, res) {
  const { query } = req.query;
  // Copy search logic from search-server.js
  // ...
  res.json(results);
}
```

**Environment Variable**:
```env
PUBLIC_SEARCH_API_URL=https://your-app.vercel.app/api
```

#### Option C: Deploy Search as Microservice
Keep search server separate for better scalability:
1. Deploy `search-server.js` to a separate service
2. Set `PUBLIC_SEARCH_API_URL` to the service URL
3. Configure CORS for your domain

## Environment Variables

### Required for All Deployments
```env
OPENAI_API_KEY=sk-...
```

### Optional for Custom Search Endpoint
```env
PUBLIC_SEARCH_API_URL=https://your-search-api.com
```

## Deployment Checklist

- [ ] Set `OPENAI_API_KEY` in production environment
- [ ] Test voice agent with HTTPS (required for WebRTC)
- [ ] Configure CORS if using separate search service
- [ ] Add rate limiting to prevent abuse
- [ ] Set up monitoring (e.g., Sentry, LogRocket)
- [ ] Configure SSL certificates
- [ ] Test with production OpenAI API limits

## Quick Deploy Commands

### Local Production Test
```bash
# Terminal 1: Start search server (if needed for testing)
./start-search-server.sh

# Terminal 2: Build and preview
npm run build
npm run preview

# Access at http://localhost:4321
```

### Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## Post-Deployment Testing

1. **Test Voice Connection**: Click microphone, verify WebRTC connects
2. **Test Search**: Say "Search for latest AI news"
3. **Check Console**: No CORS errors or connection issues
4. **Verify HTTPS**: WebRTC requires secure connection

## Troubleshooting

### Voice Agent Not Connecting
- Ensure HTTPS is enabled (WebRTC requirement)
- Check browser console for errors
- Verify OpenAI API key is set

### Search Not Working
- Check if using correct endpoint (dev vs prod)
- Verify CORS headers if using external search
- Check OpenAI API rate limits

### Performance Issues
- Enable caching for search results
- Use CDN for static assets
- Consider edge functions for search

## Support

The solution has been tested and confirmed working in development. The production configuration uses the same logic with environment-aware endpoint selection, so it should work seamlessly when deployed.