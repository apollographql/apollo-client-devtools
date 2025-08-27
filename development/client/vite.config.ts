import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  define: {
    "globalThis.__DEV__": JSON.stringify(true),
  },
  plugins: [react()],
  server: {
    open: true,
    port: 3000,
  },
});
