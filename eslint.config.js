import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.ts"],
    ignores: ["**/node_modules/**", "client/dist/**"],

    languageOptions: {
      parserOptions: {
        project: [
          "./client/tsconfig.json",
          // optional if you add one later:
          // "./packages/game/tsconfig.json"
        ],
      },
    },

    rules: {
      // 🚫 avoid loose typing
      "@typescript-eslint/no-explicit-any": "warn",

      // 🧠 great for your actor switch statements
      "@typescript-eslint/switch-exhaustiveness-check": "error",

      // 👀 general hygiene
      "@typescript-eslint/no-unused-vars": ["warn"],
    },
  },
];