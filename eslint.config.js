import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.git/**",
      "**/coverage/**",
      "**/.firebase/**",
      "**/.turbo/**",
      // Kivo's www/assets might need ignoring if they contain 3rd party stuff, but generally script.js is there.
      // Ignoring minified files if any.
      "**/*.min.js",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierRecommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      "no-unused-vars": "off", // Handled by typescript-eslint
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error", "info"] }], // Discourage plain console.log
      "@typescript-eslint/no-explicit-any": "error", // Strict mode
      eqeqeq: "error", // Enforce type-safe equality
      "no-var": "error",
      "prefer-const": "error",
      "prettier/prettier": "error",
    },
  },
  {
    files: ["apps/frontend/**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  {
    files: [
      "apps/api/**/*.js",
      "apps/kivo-brain-api/**/*.js",
      "packages/**/*.js",
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-var-requires": "off", // Allow require in CommonJS backend/packages
      "no-undef": "off", // TypeScript handles this mostly, but good for JS
    },
  }
);
