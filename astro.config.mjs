// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';
import icon from 'astro-icon';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// Import polyfills for Cloudflare Workers compatibility (production only)
// Commented out for dev - polyfills are injected at build time
// import './src/polyfills.js';

// https://astro.build/config
export default defineConfig({
  base: '/',
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
      Image: false, // We'll handle images separately
      JavaScript: true,
      SVG: true,
    }),
  ],
  site: 'https://executiveaitraining.com',
  compressHTML: true,
  build: {
    inlineStylesheets: 'never', // Don't inline CSS, keep as separate files
    assets: '_assets', // Directory name for assets
  },
  vite: {
    build: {
      cssMinify: 'lightningcss',
      rollupOptions: {
        output: {
          assetFileNames: '_assets/[hash][extname]', // Include _assets in the filename
          chunkFileNames: '_assets/[hash].js',
          entryFileNames: '_assets/[name].[hash].js',
        },
      },
    },
    ssr: {
      noExternal: process.env.NODE_ENV === 'production' 
        ? ['@fontsource/*', 'react', 'react-dom', 'react-dom/server', 'react-dom/server.browser']
        : ['@fontsource/*'],
      external: ['node:crypto', 'crypto', 'node:buffer', 'node:stream', 'node:util']
    },
    resolve: {
      alias: process.env.NODE_ENV === 'production' 
        ? {
            'react-dom/server': 'react-dom/server.browser',
            'react-dom/server.node': 'react-dom/server.browser'
          }
        : {}
    },
    optimizeDeps: {
      include: ['react', 'react-dom']
    }
  },
  output: 'server',
  adapter: cloudflare({
    mode: process.env.NODE_ENV === 'production' ? 'directory' : 'advanced',
    functionPerRoute: false,
    runtime: {
      mode: 'local',
      type: 'pages'
    }
  }),
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  image: {
    domains: ['executiveaitraining.com'],
    remotePatterns: [{ protocol: 'https' }],
  },
});
