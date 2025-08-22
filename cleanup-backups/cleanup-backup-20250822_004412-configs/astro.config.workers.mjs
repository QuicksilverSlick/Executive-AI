/*
 * DREAMFORGE HIVE-MIND CHAIN OF CUSTODY
 *
 * @file-purpose: Cloudflare Workers-specific Astro configuration for Executive AI Training
 * @version: 1.0.0
 * @init-author: developer-agent
 * @init-cc-sessionId: cc-dev-20250815-680
 * @init-timestamp: 2025-08-15T14:49:00Z
 * @reasoning:
 * - **Objective:** Create Workers-optimized Astro configuration to fix asset bundling and deployment issues
 * - **Strategy:** Configure proper asset handling, module resolution, and Workers-specific settings
 * - **Outcome:** Error-free Workers deployment with optimized performance and asset resolution
 */

// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';
import icon from 'astro-icon';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// Workers-optimized configuration
export default defineConfig({
  base: '/',
  integrations: [
    react({
      experimentalReactChildren: true
    }),
    tailwind({
      applyBaseStyles: false,
    }),
    icon({
      include: {
        lucide: ['*'],
        mdi: ['*'],
      },
      svgoOptions: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeDoctype: false,
                removeXMLProcInst: false,
                removeComments: false,
                removeMetadata: false,
                removeEditorsNSData: false,
                cleanupAttrs: false,
                mergeStyles: false,
                inlineStyles: false,
                minifyStyles: false,
                cleanupNumericValues: false,
                convertColors: false,
                removeUnknownsAndDefaults: false,
                removeNonInheritableGroupAttrs: false,
                removeUselessStrokeAndFill: false,
                removeViewBox: false,
                cleanupEnableBackground: false,
                removeHiddenElems: false,
                removeEmptyText: false,
                convertShapeToPath: false,
                convertEllipseToCircle: false,
                moveElemsAttrsToGroup: false,
                moveGroupAttrsToElems: false,
                collapseGroups: false,
                convertPathData: false,
                convertTransform: false,
                removeEmptyAttrs: false,
                removeEmptyContainers: false,
                mergePaths: false,
                removeUnusedNS: false,
                sortAttrs: false,
                sortDefsChildren: false,
                removeTitle: false,
                removeDesc: false
              }
            }
          }
        ]
      }
    }),
    sitemap({
      filter: (page) => !page.includes('/api/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
    compress({
      CSS: true,
      HTML: {
        removeAttributeQuotes: false,
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyCSS: true,
        minifyJS: true
      },
      Image: false,
      JavaScript: true,
      SVG: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false
              }
            }
          }
        ]
      }
    }),
  ],
  site: 'https://executiveaitraining.com',
  compressHTML: true,
  
  // Workers-optimized build settings
  build: {
    inlineStylesheets: 'auto',
    assets: '_astro',
    splitting: false,
    format: 'directory',
    // Ensure proper output for Workers with static assets
    assetsPrefix: '/'
  },
  
  vite: {
    build: {
      cssMinify: 'lightningcss',
      rollupOptions: {
        output: {
          format: 'esm',
          entryFileNames: '_worker.js',
          assetFileNames: '_astro/[name].[hash][extname]',
          chunkFileNames: '_astro/[name].[hash].js',
          manualChunks: undefined
        },
        external: [],
        treeshake: {
          preset: 'smallest',
          moduleSideEffects: false
        }
      },
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug']
        },
        mangle: {
          safari10: true
        },
        format: {
          comments: false
        }
      },
      sourcemap: false,
      chunkSizeWarningLimit: 1000
    },
    
    ssr: {
      noExternal: [
        // Bundle everything for Workers
        '@fontsource/*',
        'react',
        'react-dom',
        'react-dom/server',
        'react-dom/server.browser',
        'astro-icon',
        '@iconify/*',
        'framer-motion',
        'web-vitals',
        'webrtc-adapter'
      ],
      external: [
        // Keep Node.js modules external (will be polyfilled)
        'node:crypto',
        'crypto',
        'node:buffer',
        'node:stream',
        'node:util',
        'node:path',
        'node:fs',
        'node:url',
        'node:querystring'
      ]
    },
    
    resolve: {
      alias: {
        // Workers-compatible aliases
        'react-dom/server': 'react-dom/server.browser',
        'react-dom/server.node': 'react-dom/server.browser'
      }
    },
    
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'framer-motion'
      ],
      exclude: [
        '@astrojs/cloudflare'
      ]
    },
    
    define: {
      // Workers environment flags
      'process.env.WORKERS_ENV': true,
      'process.env.NODE_ENV': '"production"'
    }
  },
  
  output: 'server',
  
  adapter: cloudflare({
    mode: 'advanced',
    functionPerRoute: false,
    runtime: {
      mode: 'local',
      type: 'workers'
    },
    routes: {
      strategy: 'include',
      include: ['/api/*'],
      exclude: ['/_astro/*', '/favicon.ico', '/robots.txt', '/sitemap.xml', '/images/*', '/audio/*', '/downloads/*']
    },
    // Workers-specific configuration for static assets
    wasmModuleImports: true
  }),
  
  prefetch: {
    prefetchAll: false, // Disable for Workers to reduce bundle size
    defaultStrategy: 'load'
  },
  
  image: {
    domains: ['executiveaitraining.com'],
    remotePatterns: [{ protocol: 'https' }],
    service: {
      entrypoint: 'astro/assets/services/noop'
    }
  }
});

/*
 * DREAMFORGE AUDIT TRAIL
 *
 * ---
 * @revision: 1.0.0
 * @author: developer-agent
 * @cc-sessionId: cc-dev-20250815-680
 * @timestamp: 2025-08-15T14:49:00Z
 * @reasoning:
 * - **Objective:** Created Workers-specific Astro configuration to optimize for Cloudflare Workers deployment
 * - **Strategy:** Configured proper bundling, asset handling, and Workers-specific optimizations
 * - **Outcome:** Dedicated configuration file that addresses Workers deployment issues and optimizes performance
 */