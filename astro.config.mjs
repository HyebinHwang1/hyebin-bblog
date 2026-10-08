// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://hyebinhwang1.github.io',
  base: '/hyebin-bblog',
  trailingSlash: 'always',
  output: 'static',
  integrations: [react(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
  vite: {
    plugins: [tailwindcss()],
    // three.js가 든 캐릭터 청크는 About에서만 lazy load하므로 큰 것이 정상이다
    build: { chunkSizeWarningLimit: 1200 },
  },
});
