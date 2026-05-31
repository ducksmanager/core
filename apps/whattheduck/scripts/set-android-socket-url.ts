#!/usr/bin/env bun

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

function getFallbackUrl(): string {
  const ip = execSync('ipconfig getifaddr en0', { encoding: 'utf-8' }).trim();
  return `http://${ip}:3001`;
}

async function main() {
  const socketUrl = process.env.DM_SOCKET_URL_NATIVE_HTTPS ?? getFallbackUrl();

  const envLocalPath = join(import.meta.dir, '../.env.local');
  writeFileSync(envLocalPath, `VITE_DM_SOCKET_URL_NATIVE=${socketUrl}\n`);
}

main().catch((err) => {
  console.error('✗', err.message);
  process.exit(1);
});
