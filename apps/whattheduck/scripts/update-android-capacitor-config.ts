#!/usr/bin/env bun

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

declare global {
  interface ImportMeta {
    dir: string;
  }
}

const getLocalIP = () => {
  try {
    return execSync('ipconfig getifaddr en0', { encoding: 'utf-8' }).trim();
  } catch {
    throw new Error('Could not get local IP address. Make sure you are on macOS with en0 interface.');
  }
};

const localIP = getLocalIP();
const serverUrl = `http://${localIP}:8008`;

const androidConfigPath = join(import.meta.dir, '../android/app/src/main/assets/capacitor.config.json');

console.log(`Updating Android capacitor config to use: ${serverUrl}`);

try {
  const config = JSON.parse(readFileSync(androidConfigPath, 'utf-8'));
  config.server = {
    url: serverUrl,
  };
  writeFileSync(androidConfigPath, JSON.stringify(config, null, '\t') + '\n');
  console.log('✓ Android capacitor.config.json updated successfully');
} catch (error) {
  console.error('✗ Failed to update Android capacitor.config.json:', error);
  process.exit(1);
}
