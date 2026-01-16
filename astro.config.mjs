// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Enable CSS minification
      cssMinify: true,
      // Optimize chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Split GSAP into its own chunk for better caching
            gsap: ['gsap', 'gsap/ScrollTrigger'],
            // Lenis in its own chunk
            lenis: ['lenis']
          }
        }
      }
    }
  },
  // Prefetch links for faster navigation
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
  },
  // Compress HTML output
  compressHTML: true
});