# Cloudflare Pages Deployment Configuration

<!--
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Documentation for Cloudflare Pages deployment configuration
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-unknown-20250816-590
 * @init-timestamp: 2025-08-16T12:20:00Z
 * @reasoning:
 * - **Objective:** Document Pages deployment configuration changes
 * - **Strategy:** Provide clear deployment instructions and troubleshooting guide
 * - **Outcome:** Complete deployment documentation for team reference
 -->

## Overview

This project has been configured for **Cloudflare Pages** deployment using Astro's `@astrojs/cloudflare` adapter in `directory` mode. This ensures all dependencies are properly bundled and resolves import path issues.

## Key Configuration Changes

### 1. Astro Configuration (`astro.config.mjs`)

- **Adapter Mode**: Changed from `advanced` to `directory`
- **Bundling**: Enabled `noExternal: true` to bundle all dependencies
- **SSR Configuration**: Simplified to bundle everything for Pages compatibility

### 2. Wrangler Configuration (`wrangler.toml`)

- **Pages Mode**: Added `pages_build_output_dir = "dist"`
- **Removed Workers-specific**: Removed `main`, `assets`, and `routes` configuration
- **Environment Support**: Maintained KV namespaces and environment variables

### 3. Build Scripts (`package.json`)

- **`pages:build`**: Astro build + Pages optimization
- **`pages:test`**: Deployment verification tests
- **`pages:deploy`**: Full deployment with validation
- **`pages:deploy:preview`**: Preview deployment

## Deployment Commands

### Local Development
```bash
npm run dev
```

### Build for Pages
```bash
npm run pages:build
```

### Test Deployment Readiness
```bash
npm run pages:test
```

### Deploy to Production
```bash
npm run pages:deploy
```

### Deploy to Preview
```bash
npm run pages:deploy:preview
```

## Build Output Structure

```
dist/
├── _astro/           # Static assets (CSS, JS, images)
├── _worker.js/       # Server-side functions (Pages Functions)
│   ├── index.js      # Main worker entry point
│   └── pages/        # API routes and server-rendered pages
├── _headers          # HTTP headers configuration
├── _redirects        # URL redirects and SPA fallback
├── _routes.json      # Route handling configuration
└── *.html           # Pre-rendered static pages
```

## Key Benefits

1. **Dependency Bundling**: All imports are bundled, eliminating external import errors
2. **Static Asset Optimization**: `_astro/*` files served as static assets
3. **Server Functions**: API routes and dynamic pages handled by Pages Functions
4. **Caching**: Optimized headers for static asset caching
5. **SPA Support**: Proper fallback handling for client-side routing

## Troubleshooting

### Import Resolution Issues
- Ensure `noExternal: true` is set in Vite SSR configuration
- Check that `bundling.noExternal: true` is set in Cloudflare adapter

### Missing Functions
- Verify `_worker.js/` directory exists in build output
- Check that API routes are included in `_routes.json`

### Static Asset Issues
- Confirm `_astro/` directory contains all assets
- Verify `_headers` file exists for caching configuration

### Deployment Failures
- Run `npm run pages:test` to verify build output
- Check wrangler configuration for correct `pages_build_output_dir`

## Environment Variables

Set these in Cloudflare dashboard or via `wrangler secret put`:

- `OPENAI_API_KEY`: OpenAI API key for voice agent
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins
- `JWT_SECRET`: Secret for signing JWT tokens

## KV Namespaces

Configure these in your Cloudflare dashboard:

- `SESSIONS`: User session storage
- `RATE_LIMITS`: Rate limiting data
- `VOICE_TOKENS`: Voice authentication tokens
- `PERFORMANCE_LOGS`: Performance monitoring logs

## Monitoring

After deployment, monitor:

- Function execution time and errors in Cloudflare dashboard
- Static asset cache hit rates
- API endpoint response times
- KV namespace usage

---

**Note**: This configuration is optimized for Cloudflare Pages. For Workers deployment, use the separate Workers configuration files.

<!--
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250816-590
 * @timestamp: 2025-08-16T12:20:00Z
 * @reasoning:
 * - **Objective:** Complete deployment documentation
 * - **Strategy:** Comprehensive guide covering configuration, deployment, and troubleshooting
 * - **Outcome:** Team-ready documentation for Pages deployment
 */