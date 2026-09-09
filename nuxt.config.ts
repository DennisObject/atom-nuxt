import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2026-09-09",
  nitro: {
    alias: { "node-fetch": fileURLToPath(import.meta.resolve("node-fetch")) },
  },
  devtools: { enabled: false },
  vite: { plugins: [tailwindcss()] },
  css: ["~/assets/css/dusk.css"],
  runtimeConfig: {
    backendUrl: "http://127.0.0.1:8000",
  },
  app: {
    head: {
      title: "Atom Hotel",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },
  routeRules: {
    "/**": { headers: { "cache-control": "private, no-store" } },
    "/game/**": { ssr: false },
    "/draw-badge": { ssr: false },
  },
  typescript: { strict: true },
});
