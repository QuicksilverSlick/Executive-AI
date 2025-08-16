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
  // Pages-optimized build settings
  build: {
    inlineStylesheets: 'auto',
    assets: '_astro',
    splitting: false,
    format: 'directory'
  },
  vite: {
    build: {
      cssMinify: 'lightningcss',
      rollupOptions: {
        output: {
          format: 'esm',
          assetFileNames: '_astro/[name].[hash][extname]',
          chunkFileNames: '_astro/[name].[hash].js',
          manualChunks: undefined
        },
        external: []
      },
      target: 'esnext',
      minify: 'terser',
      sourcemap: false
    },
    ssr: {
      // Bundle everything for Pages compatibility
      noExternal: true,
      external: []
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
      include: ['react', 'react-dom', 'framer-motion'],
      exclude: ['@astrojs/cloudflare']
    }
  },
  output: 'server',
  adapter: cloudflare({
    mode: 'directory',
    functionPerRoute: false,
    // Bundle all dependencies for Pages compatibility
    bundling: {
      external: [],
      noExternal: true
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
