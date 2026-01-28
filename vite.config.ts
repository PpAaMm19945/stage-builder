import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@domains": path.resolve(__dirname, "./src/domains"),
      "@config": path.resolve(__dirname, "./src/config"),
    },
  },
  optimizeDeps: {
    include: ['@react-pdf/renderer'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions: {
      output: {
        // Use function-based manualChunks to prevent React duplication
        manualChunks(id) {
          // CRITICAL: Never split React - it must stay in main bundle
          if (id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')) {
            return; // Let Rollup handle these naturally (main bundle)
          }

          // Heavy PDF library - lazy load only when generating PDFs
          if (id.includes('@react-pdf/renderer') || id.includes('@react-pdf/')) {
            return 'pdf-renderer';
          }

          // Charts - only needed on dashboard/reports
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'charts';
          }

          // Markdown rendering - for chat and book content
          if (id.includes('react-markdown') ||
            id.includes('remark-') ||
            id.includes('unified') ||
            id.includes('hast-') ||
            id.includes('mdast-')) {
            return 'markdown';
          }
        },
      },
    },
  },
}));


