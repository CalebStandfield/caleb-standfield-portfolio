import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Peel the big, rarely-changing vendors into their own chunks so they
        // cache independently and the app chunk stays small. Match on the path
        // so subpaths (react-dom/client, motion/react) group with their package.
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/scheduler"))
            return "react";
          if (id.includes("node_modules/motion") || id.includes("node_modules/framer-motion"))
            return "motion";
        },
      },
    },
  },
});
