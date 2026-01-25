import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const rootDir = process.cwd();

// Step 1: Build
console.log("Building...");
execSync("pnpm build", { stdio: "inherit", cwd: rootDir });

// Step 2: Patch version
console.log("Patching version...");
execSync("pnpm version patch", { stdio: "inherit", cwd: rootDir });

// Step 3: Update manifest.json version
console.log("Updating manifest.json version...");
const pkg = JSON.parse(readFileSync(join(rootDir, "package.json"), "utf-8"));
const manifest = JSON.parse(
  readFileSync(join(rootDir, "manifest.json"), "utf-8"),
);

manifest.version = pkg.version;
writeFileSync(
  join(rootDir, "manifest.json"),
  JSON.stringify(manifest, null, 4) + "\n",
);

// Step 4: Create extension.zip
console.log("Creating extension.zip...");
execSync(
  "cd dist && rm -f ../extension.zip && zip ../extension.zip content.* manifest.json",
  { stdio: "inherit", cwd: rootDir },
);

// Step 5: Create extension-sources.zip
console.log("Creating extension-sources.zip...");
execSync("cp ../src/components/TextEditor.vue src/components/", {
  stdio: "inherit",
  cwd: rootDir,
});
execSync("zip -r extension-sources.zip *.json src", {
  stdio: "inherit",
  cwd: rootDir,
});
execSync("rm src/components/TextEditor.vue", {
  stdio: "inherit",
  cwd: rootDir,
});

console.log("Build and publish completed successfully!");
