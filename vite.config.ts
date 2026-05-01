import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    https: {},
  },
  plugins: [
    basicSsl(),
    react(),
    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
      exclude: undefined,
      include: undefined,
      includePublic: true,
      logStats: true,
      svg: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                cleanupNumericValues: false,
                removeViewBox: false,
              },
            },
          },
          'sortAttrs',
          {
            name: 'addAttributesToSVGElement',
            params: {
              attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
            },
          },
        ],
      },
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 80 },
      avif: { quality: 70 },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules')) {
            // Firebase y Supabase — muy pesados, separados
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('supabase') || id.includes('@supabase')) return 'vendor-supabase';

            // Gráficos — solo se usan en admin
            if (id.includes('recharts') || id.includes('d3')) return 'vendor-charts';

            // Animaciones — solo en páginas con motion
            if (id.includes('framer-motion')) return 'vendor-motion';

            // Validación — solo en formularios
            if (id.includes('zod') || id.includes('@hookform') || id.includes('react-hook-form')) return 'vendor-forms';

            // Carousel — solo en home
            if (id.includes('embla')) return 'vendor-embla';

            // Fechas — solo cuando se muestran pedidos/historial
            if (id.includes('date-fns')) return 'vendor-dates';

            // Íconos — muy grande, cacheado aparte
            if (id.includes('lucide-react')) return 'vendor-lucide';

            // Router
            if (id.includes('react-router-dom') || id.includes('@remix-run')) return 'vendor-router';

            // React core — el más crítico, siempre necesario
            if (id.includes('react-dom') || (id.includes('/react/') && !id.includes('react-router'))) return 'vendor-react';

            // React Query
            if (id.includes('@tanstack') || id.includes('react-query')) return 'vendor-query';

            // UI Components (Radix)
            if (id.includes('@radix-ui') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) return 'vendor-ui';

            // Toast / Sonner
            if (id.includes('sonner') || id.includes('react-hot-toast')) return 'vendor-toast';

            // Todo lo demás
            return 'vendor-core';
          }
        },
      },
    },
    chunkSizeWarningLimit: 800,
    reportCompressedSize: false,
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}));
