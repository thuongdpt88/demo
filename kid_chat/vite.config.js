import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  envDir: '..',
  base: './',
  server: {
    port: 5176,
    host: true
  },
  build: {
    outDir: 'dist',
  }
});
