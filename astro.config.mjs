import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build
export default defineConfig({
  site: 'https://exposition.lk',
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
  ],
  server: { port: 4321, host: true },
});
