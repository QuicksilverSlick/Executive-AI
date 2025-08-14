# Production Search Setup

## Current Development Setup
- **Main App**: Astro on port 4323
- **Search Server**: Express on port 3001
- **Issue**: This requires two separate servers

## Production Options

### Option 1: Use Astro API Routes in Production (Recommended)
The query parameter issue appears to be specific to Astro's dev server. In production, the API routes should work correctly.

**Steps:**
1. Update `main.ts` to use environment-based URLs:

```typescript
// In main.ts executeWebSearch function
const searchUrl = import.meta.env.DEV 
  ? 'http://localhost:3001/search'  // Development: use standalone server
  : '/api/voice-agent/responses-search';  // Production: use Astro route

const response = await fetch(`${searchUrl}?${queryParams.toString()}`);
```

2. Deploy with an Astro adapter (Vercel, Netlify, Node, etc.)

### Option 2: Deploy Search as a Microservice
Keep the search server separate for better scalability.

**Benefits:**
- Independent scaling
- Can use different hosting (AWS Lambda, Cloud Functions)
- Easier to update search logic without touching main app

**Implementation:**
1. Deploy `search-server.js` to a service like:
   - Vercel Functions
   - Netlify Functions
   - AWS Lambda
   - Google Cloud Functions
   - Railway/Render

2. Update the search URL in `main.ts`:
```typescript
const SEARCH_API_URL = process.env.PUBLIC_SEARCH_API_URL || 'http://localhost:3001';
const searchUrl = `${SEARCH_API_URL}/search?${queryParams.toString()}`;
```

### Option 3: Use Edge Functions
Modern platforms offer edge functions that can handle this:

**Vercel Example:**
```javascript
// api/search.js (Vercel Edge Function)
export const config = { runtime: 'edge' };

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  
  // Your search logic here
  return Response.json({ results: '...' });
}
```

### Option 4: Integrate Search Directly into Realtime Session
Instead of calling an external API, configure the Realtime API to handle search internally:

```typescript
// In connection.ts session configuration
tools: [
  {
    type: 'function',
    name: 'web_search',
    description: 'Search the web for current information',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' }
      },
      required: ['query']
    }
  }
]
```

Then let OpenAI handle the search directly without calling your API.

## Recommended Production Approach

### For Quick Deployment:
1. Try the Astro API route in production first (it might just work)
2. Set up environment-based URL switching

### For Robust Solution:
1. Deploy search as a serverless function
2. Use environment variables for the search API URL
3. Add proper error handling and fallbacks

### Environment Variables Needed:
```env
# .env.production
OPENAI_API_KEY=your-key-here
PUBLIC_SEARCH_API_URL=https://your-search-api.vercel.app
```

### Testing Production Locally:
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Implementation Example

Here's how to make it work for both dev and production:

```typescript
// src/lib/voice-agent/webrtc/main.ts

private async executeWebSearch(callId: string, args: { query: string }): Promise<void> {
  try {
    const queryParams = new URLSearchParams({
      query: args.query,
      conversationContext: this.getConversationContext()
    });
    
    // Determine the search endpoint based on environment
    const searchUrl = this.getSearchEndpoint(queryParams);
    
    const response = await fetch(searchUrl);
    // ... rest of the function
  }
}

private getSearchEndpoint(queryParams: URLSearchParams): string {
  // Check if we're in development
  if (import.meta.env.DEV || window.location.hostname === 'localhost') {
    // Development: Use standalone server
    return `http://localhost:3001/search?${queryParams.toString()}`;
  } else {
    // Production: Use the configured endpoint or default to API route
    const baseUrl = import.meta.env.PUBLIC_SEARCH_API_URL || '';
    return baseUrl 
      ? `${baseUrl}/search?${queryParams.toString()}`
      : `/api/voice-agent/responses-search?${queryParams.toString()}`;
  }
}
```

## Deployment Checklist

- [ ] Test Astro API route in production build
- [ ] Set up environment variables in hosting platform
- [ ] Configure CORS for production domain
- [ ] Add rate limiting for search API
- [ ] Set up monitoring and error tracking
- [ ] Test with production OpenAI API key
- [ ] Verify WebRTC works with HTTPS

## Security Considerations

1. **API Key Security**: Never expose OpenAI API key to client
2. **Rate Limiting**: Implement rate limits on search endpoint
3. **CORS**: Configure proper CORS headers for your domain
4. **HTTPS**: WebRTC requires HTTPS in production
5. **Input Validation**: Sanitize search queries