import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tanstackRouter from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath } from "url";

const manifestIcons = [
  {
    src: "pwa-192.png",
    sizes: "192x192",
    type: "image/png",
  },
  {
    src: "pwa-512.png",
    sizes: "512x512",
    type: "image/png",
  },
];

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const dev = mode === "development";
  return {
    plugins: [
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          clientsClaim: true,
          skipWaiting: true,
        },
        manifest: {
          name: "SaveSlot",
          short_name: "SaveSlot",
          description:
            "Social platform for discovering, tracking, and reviewing video games",
          display: "standalone",
          start_url: "/",
          icons: manifestIcons,
          theme_color: "#19191B",
          background_color: "#19191B",
        },
      }),
      tailwindcss(),
      react(),
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: dev
      ? {
          host: true,
          port: 5173,
          strictPort: true,
          watch: {
            usePolling: true,
          },
        }
      : undefined,
  };
});
