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
      Image: false, // We'll handle images separately
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
  },
  output: 'server',
  adapter: cloudflare({
    mode: 'advanced',
    runtime: {
      mode: 'local',
      type: 'pages',
      bindings: {
        "OPENAI_API_KEY": {
          type: "var",
          value: process.env.OPENAI_API_KEY,
        }
      }
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
