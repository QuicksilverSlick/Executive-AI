import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// Configuration for Node.js deployments (Railway, Render, etc.)
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    })
  ],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  server: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '3000')
  },
  vite: {
    ssr: {
      noExternal: ['react', 'react-dom', 'framer-motion']
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'framer-motion']
    }
  }
});