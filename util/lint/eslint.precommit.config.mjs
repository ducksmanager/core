import config from "./eslint.config.mjs";

export default config.map((entry) => {
  // Only add the rule to entries that are specifically for TypeScript files
  if (entry.rules && entry.files?.[0] === "**/*.ts") {
    return {
      ...entry,
      rules: {
        ...entry.rules,
        "@typescript-eslint/no-unnecessary-type-assertion": "error",
      },
    };
  }
  return entry;
});
