module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    "prettier",
    "plugin:@typescript-eslint/recommended"
  ],
  parserOptions: { parser: "@typescript-eslint/parser" },
  overrides: [
    {
      files: ["*.ts"]
    }
  ],
  root: true,
  plugins: ["simple-import-sort", "@typescript-eslint", "unused-imports"],
  ignorePatterns: ["**/node_modules", "**/dist"]
};
