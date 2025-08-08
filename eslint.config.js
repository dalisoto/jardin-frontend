// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import vitest from "eslint-plugin-vitest"; // <— DESCOMENTADO

export default defineConfig([
  // ✅ Reglas/entorno para archivos de test
  {
    files: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
    ...vitest.configs.recommended,   // <— añade las globals (describe, it, expect, etc.)
  },

  globalIgnores(["dist"]),

  // ✅ Reglas para tu código de app
  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
    },
  },
]);
