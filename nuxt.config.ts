import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

const theme = process.env.ATOM_THEME || "dusk";

if (!["atom", "dusk"].includes(theme)) {
  throw new Error(`Unknown ATOM_THEME "${theme}". Choose atom or dusk.`);
}

export default defineNuxtConfig({
  compatibilityDate: "2026-09-09",
  extends: [`./themes/${theme}`],
  experimental: { localLayerAliases: false },
  appConfig: {
    theme: { name: theme, defaultMode: theme === "atom" ? "light" : "dark" },
  },
  nitro: {
    alias: { "node-fetch": fileURLToPath(import.meta.resolve("node-fetch")) },
  },
  devtools: { enabled: false },
  vite: { plugins: [tailwindcss()] },
  css: [
    fileURLToPath(new URL("./app/assets/css/base.css", import.meta.url)),
    fileURLToPath(
      new URL(`./themes/${theme}/app/assets/css/theme.css`, import.meta.url),
    ),
  ],
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
