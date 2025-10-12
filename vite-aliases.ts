import * as path from "path";

export default (
  baseDir: string,
  appSpecificAliases: Record<string, string> = {},
) => {
  const commonAliases = {
    "~dm-services": path.resolve(baseDir, "packages/api/services"),
    "~dm-types": path.resolve(baseDir, "packages/types"),
    "~group-by": path.resolve(baseDir, "util/group-by"),
    "~prisma-schemas": path.resolve(baseDir, "packages/prisma-schemas"),
  };
  return { ...commonAliases, ...appSpecificAliases };
};
