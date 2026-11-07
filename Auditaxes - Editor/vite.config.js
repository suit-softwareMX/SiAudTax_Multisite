import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: ["adminauditaxes.suitmx.com"],
    proxy: {
      "/api": "http://127.0.0.1:4100",
      "/site-preview": { target: "http://127.0.0.1:4321", rewrite: path => path.replace(/^\/site-preview/, "") || "/" },
      "/_next": "http://127.0.0.1:4321",
      "/images": "http://127.0.0.1:4321",
      "/world-map.svg": "http://127.0.0.1:4321",
    },
  },
});
