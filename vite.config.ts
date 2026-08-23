import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Three.js is isolated behind a WebGL-only dynamic import. Its lazy chunk
    // is intentionally larger than the default warning threshold.
    chunkSizeWarningLimit: 1800,
  },
  server: {
    host: "127.0.0.1",
    port: 4173,
  },
});
