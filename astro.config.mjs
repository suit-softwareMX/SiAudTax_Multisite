import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://auditaxes.com",
  output: "static",
  integrations: [sitemap()],
  vite: {
    server: {
      host: true,
      allowedHosts: [
        "auditaxes.suitmx.com",
        "mexico-auditaxes.suitmx.com",
        "elsalvador-auditaxes.suitmx.com",
      ],
      fs: {
        allow: [".."],
      },
    },
  },
});
