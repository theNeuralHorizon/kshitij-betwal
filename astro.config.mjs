// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// On Vercel deploy at the root path; everywhere else (GitHub Pages, local) keep `/portfolio`.
const isVercel = !!process.env.VERCEL;

export default defineConfig({
  site: isVercel
    ? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://kshitij-betwal.vercel.app')
    : 'https://theneuralhorizon.github.io',
  base: isVercel ? '/' : '/kshitij-betwal',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],
});
