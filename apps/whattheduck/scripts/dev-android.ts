#!/usr/bin/env bun

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

const API_PORT = 3001;

async function main() {
  const scriptDir = join(import.meta.dir, '..');

  console.log('Waiting for API on port 3001...');
  execSync("pnpm -F '~api' exec wait-on -l tcp:3001", {
    cwd: join(scriptDir, '../..'),
    stdio: 'inherit',
  });

  const ip = execSync('ipconfig getifaddr en0', { encoding: 'utf-8' }).trim();
  const socketUrl = `http://${ip}:${API_PORT}`;

  console.log(`✓ Using socket URL: ${socketUrl}`);

  writeFileSync(join(scriptDir, '.env.local'), `VITE_DM_SOCKET_URL_NATIVE=${socketUrl}\n`);

  const { spawn } = await import('child_process');
  const cmd =
    'pnpm cap:update && pnpm update-android-capacitor-config && concurrently --kill-others-on-fail -n android,dev "ionic cap run android --external --target Pixel_3_API_31 --public-host=$(ipconfig getifaddr en0)" "pnpm dev:server"';
  const dev = spawn('sh', ['-c', cmd], {
    cwd: scriptDir,
    stdio: 'inherit',
  });

  dev.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error('✗', err.message);
  process.exit(1);
});
