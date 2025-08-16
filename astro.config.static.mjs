import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import icon from 'astro-icon';

// Pure static output - NO adapter, NO SSR
export default defineConfig({
  integrations: [
    react(),
    tailwind(),
    icon()
  ],
  output: 'static',
  // NO adapter for pure static build
  build: {
    format: 'directory'
  }
});