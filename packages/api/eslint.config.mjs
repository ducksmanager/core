import eslint from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettierConfig,
  {
    ignores: ["**/node_modules", "**/dist", "**/bundle.mjs", "**/*.d.ts"],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "eslint-comments/no-unused-disable": "off",

      "@typescript-eslint/no-unnecessary-type-assertion": "error",

      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-non-null-assertion": "off",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.ts"],
  },
);
