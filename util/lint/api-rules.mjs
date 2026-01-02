export default {
  "eslint-comments/no-unused-disable": "off",

  "@typescript-eslint/no-inferrable-types": "error",

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
};