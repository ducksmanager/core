import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  eslintPluginPrettier,
  {
    ignores: ["**/node_modules", "**/dist", "prisma/client_*", "eslint.config.mjs"],
  },
  {
    rules: {
      // ESLint 10 new recommended rules - disable for gradual migration
      "preserve-caught-error": "off",
      "no-useless-assignment": "off",
      "no-unassigned-vars": "off",

      "@typescript-eslint/no-non-null-assertion": "off",
      "object-shorthand": ["error", "always"],

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
);
