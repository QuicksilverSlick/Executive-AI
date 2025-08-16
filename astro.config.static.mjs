import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/static';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import icon from 'astro-icon';

// Static output configuration for Vercel
export default defineConfig({
  integrations: [
    react(),
    tailwind(),
    icon()
  ],
  output: 'static',
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  }),
  build: {
    format: 'directory'
  }
});