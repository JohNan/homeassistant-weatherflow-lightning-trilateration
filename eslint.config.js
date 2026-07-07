import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      "**/dist/*",
      "node_modules/*",
      ".venv/*"
    ]
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        THREE: "readonly"
      }
    },
    rules: {
      // The base rule is off in favor of the TypeScript-aware version below
      // (standard typescript-eslint guidance — the base rule misreports on
      // TS-only constructs like type-only imports and overloads).
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "no-console": "off"
    }
  }
);
