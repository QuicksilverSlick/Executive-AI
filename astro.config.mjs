import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import icon from 'astro-icon';

export default defineConfig({
  integrations: [
    react(),
    tailwind(),
    icon()
  ],
  output: 'server',
  adapter: vercel()
});