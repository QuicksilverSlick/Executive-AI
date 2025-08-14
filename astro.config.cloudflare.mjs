/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Astro configuration optimized for Cloudflare Pages deployment with voice agent support
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-unknown-20250813-657
 * @init-timestamp: 2025-08-14T00:00:00Z
 * @reasoning:
 * - **Objective:** Configure Astro for Cloudflare Pages with WebRTC and voice agent compatibility
 * - **Strategy:** Use Cloudflare adapter with proper runtime configuration and optimizations
 * - **Outcome:** Production-ready Astro config for Cloudflare Pages deployment
 */

// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';
import icon from 'astro-icon';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    icon({
      include: {
        lucide: ['*'], // Include all Lucide icons (tree-shaken at build time)
        mdi: ['*'], // Include Material Design Icons as needed
      },
    }),
    sitemap({
      filter: (page) => !page.includes('/api/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      customPages: [
        'https://executiveaitraining.com/',
        'https://executiveaitraining.com/services',
        'https://executiveaitraining.com/case-studies',
        'https://executiveaitraining.com/ai-audit',
      ],
    }),
    compress({
      CSS: true,
      HTML: {
        removeAttributeQuotes: false,
      },
      Image: false, // Let Cloudflare handle image optimization
      JavaScript: true,
      SVG: true,
    }),
  ],
  site: 'https://executiveaitraining.com',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
  },
  vite: {
    build: {
      cssMinify: 'lightningcss',
      rollupOptions: {
        output: {
          assetFileNames: '_assets/[hash][extname]',
        },
      },
    },
    ssr: {
      noExternal: ['@fontsource/*'],
    },
    define: {
      // Ensure environment variables are available in the build
      'process.env.OPENAI_API_KEY': JSON.stringify(process.env.OPENAI_API_KEY),
      'process.env.ALLOWED_ORIGINS': JSON.stringify(process.env.ALLOWED_ORIGINS),
      'process.env.VOICE_AGENT_RATE_LIMIT': JSON.stringify(process.env.VOICE_AGENT_RATE_LIMIT),
      'process.env.VOICE_AGENT_TOKEN_DURATION': JSON.stringify(process.env.VOICE_AGENT_TOKEN_DURATION),
    },
  },
  output: 'server',
  adapter: cloudflare({
    // Cloudflare Pages configuration
    mode: 'directory',
    functionPerRoute: false, // Bundle all routes into a single function for better performance
    runtime: {
      mode: 'local',
      type: 'pages',
      // Enable Node.js compatibility for OpenAI SDK and other Node.js modules
      bindings: {
        // Environment variables will be automatically bound from Cloudflare dashboard
      },
    },
  }),
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  image: {
    domains: ['executiveaitraining.com'],
    remotePatterns: [{ protocol: 'https' }],
    // Use Cloudflare's image optimization
    service: {
      entrypoint: 'astro/assets/services/noop'
    }
  },
  // Security configuration for Cloudflare Pages
  security: {
    checkOrigin: true,
  },
  // Experimental features for better Cloudflare compatibility
  experimental: {
    optimizeHoistedScript: true,
  },
  // Server configuration for API routes
  server: {
    headers: {
      // Add security headers for development
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  // Route configuration for proper API handling
  redirects: {
    // Ensure proper routing for voice agent endpoints
    '/api/voice-agent/token': '/api/voice-agent/token',
    '/api/voice-agent/refresh-token': '/api/voice-agent/refresh-token',
    '/api/voice-agent/proxy': '/api/voice-agent/proxy',
  },
});

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-unknown-20250813-657
 * @timestamp: 2025-08-14T00:00:00Z
 * @reasoning:
 * - **Objective:** Astro configuration specifically optimized for Cloudflare Pages deployment
 * - **Strategy:** Cloudflare adapter with Node.js compatibility, security headers, and performance optimizations
 * - **Outcome:** Production-ready configuration that maintains voice agent functionality on Cloudflare Pages
 */