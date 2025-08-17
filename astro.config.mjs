import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
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
  adapter: cloudflare({
    mode: 'directory',
    functionPerRoute: false
  })
});