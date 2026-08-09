import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://auditaxes.com",
  output: "static",
  integrations: [sitemap()],
  vite: {
    server: {
      fs: {
        allow: [".."],
      },
    },
  },
});
