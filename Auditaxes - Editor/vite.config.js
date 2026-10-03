import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: ["adminauditaxes.suitmx.com"],
    proxy: { "/api": "http://127.0.0.1:4100" },
  },
});
