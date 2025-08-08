import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true, // Para usar describe, it, expect sin imports
    environment: "jsdom", // Simula el navegador
    setupFiles: "./src/setupTests.js", // Configuración global
  },
});
