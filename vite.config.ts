import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
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
            // Agrupar Firebase y Supabase que son los más pesados
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('supabase') || id.includes('@supabase')) return 'vendor-supabase';

            // Agrupar gráficos
            if (id.includes('recharts') || id.includes('d3')) return 'vendor-charts';

            // Separar librerías pesadas para mejor caché y paralelización
            if (id.includes('lucide-react')) return 'vendor-lucide';
            if (id.includes('react-router-dom') || id.includes('@remix-run')) return 'vendor-router';
            if (id.includes('react-dom') || id.includes('react')) return 'vendor-react';
            if (id.includes('@tanstack') || id.includes('react-query')) return 'vendor-query';
            if (id.includes('@radix-ui') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) return 'vendor-ui';
            
            // Todo lo demás en un vendor genérico
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
