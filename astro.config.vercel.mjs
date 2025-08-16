// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';
import icon from 'astro-icon';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';

// Vercel-optimized Astro configuration
export default defineConfig({
  base: '/',
  integrations: [
    react({
      experimentalReactChildren: true,
    }),
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
        minifyCSS: true,
        minifyJS: true,
      },
      Image: true,
      JavaScript: true,
      SVG: true,
    }),
  ],
  site: 'https://executiveaitraining.com',
  compressHTML: true,
  // Vercel-optimized build settings
  build: {
    inlineStylesheets: 'auto',
    assets: '_astro',
    splitting: true, // Enable code splitting for better performance
    format: 'directory',
  },
  vite: {
    build: {
      cssMinify: 'lightningcss',
      rollupOptions: {
        output: {
          format: 'esm',
          assetFileNames: '_astro/[name].[hash][extname]',
          chunkFileNames: '_astro/[name].[hash].js',
          manualChunks: {
            'vendor': ['react', 'react-dom'],
            'voice-agent': ['openai', 'webrtc-adapter'],
            'animations': ['framer-motion'],
          }
        },
      },
      target: 'esnext',
      minify: 'terser',
      sourcemap: process.env.NODE_ENV === 'development',
    },
    ssr: {
      // Vercel-specific SSR optimizations
      external: ['@astrojs/vercel'],
      noExternal: ['openai', 'webrtc-adapter'],
    },
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
        '~/': new URL('./src/', import.meta.url).pathname,
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'framer-motion', 'openai'],
      exclude: ['@astrojs/vercel']
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.VERCEL_ENV': JSON.stringify(process.env.VERCEL_ENV || 'development'),
    }
  },
  output: 'server',
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    speedInsights: {
      enabled: true,
    },
    edgeMiddleware: false,
    functionPerRoute: false,
    maxDuration: 30,
    isr: {
      // Cache static pages for 1 hour, voice API pages not cached
      exclude: ['/api/voice-agent/**/*', '/api/openai/**/*'],
      expiration: 3600,
    },
  }),
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  image: {
    domains: ['executiveaitraining.com'],
    remotePatterns: [{ protocol: 'https' }],
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      },
    },
  },
  // Performance optimizations for voice applications
  server: {
    host: true,
    port: 4321,
  },
  devToolbar: {
    enabled: process.env.NODE_ENV === 'development',
  },
});