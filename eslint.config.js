import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts"],
    ignores: ["**/node_modules/**", "client/dist/**", "client/vite.config.ts", "**/*.test.ts"],

    languageOptions: {
      parserOptions: {
        project: [
          "./client/tsconfig.json",
          "./server/tsconfig.json",
          "./packages/game/tsconfig.json",
        ],
      },
    },

    rules: {
      // 🚫 avoid loose typing
      "@typescript-eslint/no-explicit-any": "warn",

      "@typescript-eslint/switch-exhaustiveness-check": "error",

      // 👀 general hygiene
      "@typescript-eslint/no-unused-vars": ["warn"],
    },
  },
];