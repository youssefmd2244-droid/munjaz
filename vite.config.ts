/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// This file was missing from the project. Without it, Vite never loaded the
// Tailwind v4 plugin, so every Tailwind utility class in the app (the entire
// theme) was silently dropped — the deployed site rendered as unstyled HTML.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  server: {
    host: true,
  },
  build: {
    outDir: "dist",
  },
});
