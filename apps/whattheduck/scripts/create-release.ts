#!/usr/bin/env bun

import { $ } from 'bun';
import fs from 'fs';
import { glob } from 'glob';
import os from 'os';
import path from 'path';

const FLAT_SEPARATOR = '__';

const { DATE, BUNDLE_FILE } = process.env;
if (!DATE || !BUNDLE_FILE) {
  throw new Error('DATE and BUNDLE_FILE env vars are required');
}

if (!fs.existsSync('dist')) {
  throw new Error('dist/ does not exist — run `pnpm build` first');
}
if (!fs.existsSync(BUNDLE_FILE)) {
  throw new Error(`${BUNDLE_FILE} does not exist — run \`pnpm bundle-capgo\` first`);
}

// Stage flattened copies of dist/** so each file becomes a top-level release asset.
// GitHub release assets are flat (no directory structure), so `assets/foo.js` is
// uploaded as `assets__foo.js`. The client reverses this when building the manifest.
const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'wtd-release-'));
const distFiles = await glob('**/*', { cwd: 'dist', nodir: true });

for (const rel of distFiles) {
  const flat = rel.split(path.sep).join(FLAT_SEPARATOR);
  fs.copyFileSync(path.join('dist', rel), path.join(stage, flat));
}

console.log(`Staged ${distFiles.length} flattened asset(s) in ${stage}`);

const stagedAssets = fs.readdirSync(stage).map((name) => path.join(stage, name));

await $`gh release create --title ${`WhatTheDuck bundle ${DATE}`} --generate-notes ${`whattheduck-${DATE}`} ${BUNDLE_FILE} ${stagedAssets}`;

fs.rmSync(stage, { recursive: true, force: true });
