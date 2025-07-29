import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ["@sigmacomputing/plugin"],
  },
  plugins: [react(), svgr()],
  base: '/dma_map_box_backup/',  // Updated for GitHub Pages
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      "509dde64331c.ngrok-free.app"
    ]
  },
});