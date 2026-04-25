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
    // Force a single React copy so @splinetool/react-spline doesn't bundle its own
    // (the duplicate React breaks IntersectionObserver state and hides project cards).
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },

  integrations: [react()],
});
