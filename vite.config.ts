import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    // Three.js is isolated behind a WebGL-only dynamic import. Its exact gzip
    // budget is enforced by scripts/check-performance.mjs.
    chunkSizeWarningLimit: 1900,
  },
  server: {
    host: "127.0.0.1",
    port: 4173,
  },
  test: {
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
  },
});
