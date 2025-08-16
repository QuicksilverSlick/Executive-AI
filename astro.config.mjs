import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    })
  ],
  output: 'server',
  adapter: vercel({
    // Include dependencies that might be getting externalized
    includeFiles: [
      './node_modules/react/**/*',
      './node_modules/react-dom/**/*',
      './node_modules/framer-motion/**/*'
    ],
    // Use Node.js 18 runtime (stable for 2025)
    runtime: 'nodejs18.x',
    // Optimize for serverless
    functionPerRoute: false,
    // WebSocket support for voice agent
    webAnalytics: {
      enabled: false
    },
    speedInsights: {
      enabled: false
    }
  }),
  vite: {
    ssr: {
      noExternal: ['react', 'react-dom', 'framer-motion']
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'framer-motion']
    }
  }
});