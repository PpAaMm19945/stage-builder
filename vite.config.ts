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
        manualChunks: {
          // Heavy PDF library - only load when generating PDFs
          'pdf-renderer': ['@react-pdf/renderer'],
          // Charts - only needed on dashboard/reports
          'charts': ['recharts'],
          // Markdown rendering - only for chat and book content
          'markdown': ['react-markdown'],
        },
      },
    },
  },
}));

