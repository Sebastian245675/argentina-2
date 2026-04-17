// vite.config.ts
import { defineConfig } from "file:///C:/Users/Familia/Desktop/trabajos/tiendaonline/argentina-2/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Familia/Desktop/trabajos/tiendaonline/argentina-2/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import { ViteImageOptimizer } from "file:///C:/Users/Familia/Desktop/trabajos/tiendaonline/argentina-2/node_modules/vite-plugin-image-optimizer/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Familia\\Desktop\\trabajos\\tiendaonline\\argentina-2";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
      exclude: void 0,
      include: void 0,
      includePublic: true,
      logStats: true,
      svg: {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                cleanupNumericValues: false,
                removeViewBox: false
              }
            }
          },
          "sortAttrs",
          {
            name: "addAttributesToSVGElement",
            params: {
              attributes: [{ xmlns: "http://www.w3.org/2000/svg" }]
            }
          }
        ]
      },
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 80 },
      avif: { quality: 70 }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    cssCodeSplit: true,
    modulePreload: {
      polyfill: true
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("firebase")) return "vendor-firebase";
            if (id.includes("supabase") || id.includes("@supabase")) return "vendor-supabase";
            if (id.includes("recharts") || id.includes("d3")) return "vendor-charts";
            return "vendor-core";
          }
        }
      }
    },
    chunkSizeWarningLimit: 800,
    reportCompressedSize: false
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : []
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxGYW1pbGlhXFxcXERlc2t0b3BcXFxcdHJhYmFqb3NcXFxcdGllbmRhb25saW5lXFxcXGFyZ2VudGluYS0yXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxGYW1pbGlhXFxcXERlc2t0b3BcXFxcdHJhYmFqb3NcXFxcdGllbmRhb25saW5lXFxcXGFyZ2VudGluYS0yXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9GYW1pbGlhL0Rlc2t0b3AvdHJhYmFqb3MvdGllbmRhb25saW5lL2FyZ2VudGluYS0yL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBWaXRlSW1hZ2VPcHRpbWl6ZXIgfSBmcm9tICd2aXRlLXBsdWdpbi1pbWFnZS1vcHRpbWl6ZXInO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgVml0ZUltYWdlT3B0aW1pemVyKHtcclxuICAgICAgdGVzdDogL1xcLihqcGU/Z3xwbmd8Z2lmfHRpZmZ8d2VicHxzdmd8YXZpZikkL2ksXHJcbiAgICAgIGV4Y2x1ZGU6IHVuZGVmaW5lZCxcclxuICAgICAgaW5jbHVkZTogdW5kZWZpbmVkLFxyXG4gICAgICBpbmNsdWRlUHVibGljOiB0cnVlLFxyXG4gICAgICBsb2dTdGF0czogdHJ1ZSxcclxuICAgICAgc3ZnOiB7XHJcbiAgICAgICAgbXVsdGlwYXNzOiB0cnVlLFxyXG4gICAgICAgIHBsdWdpbnM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogJ3ByZXNldC1kZWZhdWx0JyxcclxuICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgb3ZlcnJpZGVzOiB7XHJcbiAgICAgICAgICAgICAgICBjbGVhbnVwTnVtZXJpY1ZhbHVlczogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICByZW1vdmVWaWV3Qm94OiBmYWxzZSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgICdzb3J0QXR0cnMnLFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnYWRkQXR0cmlidXRlc1RvU1ZHRWxlbWVudCcsXHJcbiAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFt7IHhtbG5zOiAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIH1dLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICBdLFxyXG4gICAgICB9LFxyXG4gICAgICBwbmc6IHsgcXVhbGl0eTogODAgfSxcclxuICAgICAganBlZzogeyBxdWFsaXR5OiA4MCB9LFxyXG4gICAgICBqcGc6IHsgcXVhbGl0eTogODAgfSxcclxuICAgICAgd2VicDogeyBxdWFsaXR5OiA4MCB9LFxyXG4gICAgICBhdmlmOiB7IHF1YWxpdHk6IDcwIH0sXHJcbiAgICB9KSxcclxuICBdLmZpbHRlcihCb29sZWFuKSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgdGFyZ2V0OiAnZXNuZXh0JyxcclxuICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxyXG4gICAgY3NzTWluaWZ5OiB0cnVlLFxyXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxyXG4gICAgbW9kdWxlUHJlbG9hZDoge1xyXG4gICAgICBwb2x5ZmlsbDogdHJ1ZSxcclxuICAgIH0sXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczogKGlkOiBzdHJpbmcpID0+IHtcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcclxuICAgICAgICAgICAgLy8gQWdydXBhciBGaXJlYmFzZSB5IFN1cGFiYXNlIHF1ZSBzb24gbG9zIG1cdTAwRTFzIHBlc2Fkb3NcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdmaXJlYmFzZScpKSByZXR1cm4gJ3ZlbmRvci1maXJlYmFzZSc7XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc3VwYWJhc2UnKSB8fCBpZC5pbmNsdWRlcygnQHN1cGFiYXNlJykpIHJldHVybiAndmVuZG9yLXN1cGFiYXNlJztcclxuXHJcbiAgICAgICAgICAgIC8vIEFncnVwYXIgZ3JcdTAwRTFmaWNvc1xyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JlY2hhcnRzJykgfHwgaWQuaW5jbHVkZXMoJ2QzJykpIHJldHVybiAndmVuZG9yLWNoYXJ0cyc7XHJcblxyXG4gICAgICAgICAgICAvLyBUb2RvIGxvIGRlbVx1MDBFMXMgKFJlYWN0LCBSYWRpeCwgTHVjaWRlLCBldGMuKSBlbiB1biBzb2xvIHZlbmRvciBjb3JlXHJcbiAgICAgICAgICAgIC8vIHBhcmEgZXZpdGFyIGVycm9yZXMgZGUgb3JkZW4gZGUgY2FyZ2EgY29tbyBlbCBkZSBjcmVhdGVDb250ZXh0XHJcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yLWNvcmUnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiA4MDAsXHJcbiAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogZmFsc2UsXHJcbiAgfSxcclxuICBlc2J1aWxkOiB7XHJcbiAgICBkcm9wOiBtb2RlID09PSAncHJvZHVjdGlvbicgPyBbJ2NvbnNvbGUnLCAnZGVidWdnZXInXSA6IFtdLFxyXG4gIH0sXHJcbn0pKTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE4VyxTQUFTLG9CQUFvQjtBQUMzWSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsMEJBQTBCO0FBSG5DLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLG1CQUFtQjtBQUFBLE1BQ2pCLE1BQU07QUFBQSxNQUNOLFNBQVM7QUFBQSxNQUNULFNBQVM7QUFBQSxNQUNULGVBQWU7QUFBQSxNQUNmLFVBQVU7QUFBQSxNQUNWLEtBQUs7QUFBQSxRQUNILFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxVQUNQO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixRQUFRO0FBQUEsY0FDTixXQUFXO0FBQUEsZ0JBQ1Qsc0JBQXNCO0FBQUEsZ0JBQ3RCLGVBQWU7QUFBQSxjQUNqQjtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxZQUNFLE1BQU07QUFBQSxZQUNOLFFBQVE7QUFBQSxjQUNOLFlBQVksQ0FBQyxFQUFFLE9BQU8sNkJBQTZCLENBQUM7QUFBQSxZQUN0RDtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0EsS0FBSyxFQUFFLFNBQVMsR0FBRztBQUFBLE1BQ25CLE1BQU0sRUFBRSxTQUFTLEdBQUc7QUFBQSxNQUNwQixLQUFLLEVBQUUsU0FBUyxHQUFHO0FBQUEsTUFDbkIsTUFBTSxFQUFFLFNBQVMsR0FBRztBQUFBLE1BQ3BCLE1BQU0sRUFBRSxTQUFTLEdBQUc7QUFBQSxJQUN0QixDQUFDO0FBQUEsRUFDSCxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLGNBQWM7QUFBQSxJQUNkLGVBQWU7QUFBQSxNQUNiLFVBQVU7QUFBQSxJQUNaO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjLENBQUMsT0FBZTtBQUM1QixjQUFJLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFFL0IsZ0JBQUksR0FBRyxTQUFTLFVBQVUsRUFBRyxRQUFPO0FBQ3BDLGdCQUFJLEdBQUcsU0FBUyxVQUFVLEtBQUssR0FBRyxTQUFTLFdBQVcsRUFBRyxRQUFPO0FBR2hFLGdCQUFJLEdBQUcsU0FBUyxVQUFVLEtBQUssR0FBRyxTQUFTLElBQUksRUFBRyxRQUFPO0FBSXpELG1CQUFPO0FBQUEsVUFDVDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsdUJBQXVCO0FBQUEsSUFDdkIsc0JBQXNCO0FBQUEsRUFDeEI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU0sU0FBUyxlQUFlLENBQUMsV0FBVyxVQUFVLElBQUksQ0FBQztBQUFBLEVBQzNEO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
