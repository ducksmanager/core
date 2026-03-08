#!/usr/bin/env bun

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
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

const mainConfigPath = join(import.meta.dir, '../android/app/src/main/assets/capacitor.config.json');
const debugConfigPath = join(import.meta.dir, '../android/app/src/debug/assets/capacitor.config.json');

console.log(`Updating Android capacitor config to use: ${serverUrl}`);

const updateConfig = (path: string, appId?: string) => {
  const config = JSON.parse(readFileSync(path, 'utf-8'));
  config.server = {
    url: serverUrl,
    cleartext: true,
    androidScheme: 'http',
  };
  config.android = { ...config.android, allowMixedContent: true };
  if (appId) config.appId = appId;
  writeFileSync(path, JSON.stringify(config, null, '\t') + '\n');
};

try {
  updateConfig(mainConfigPath);
  const debugAssetsDir = join(import.meta.dir, '../android/app/src/debug/assets');
  if (!existsSync(debugAssetsDir)) mkdirSync(debugAssetsDir, { recursive: true });
  if (!existsSync(debugConfigPath)) {
    const mainConfig = JSON.parse(readFileSync(mainConfigPath, 'utf-8'));
    mainConfig.appId = 'net.ducksmanager.whattheduck.debug';
    writeFileSync(debugConfigPath, JSON.stringify(mainConfig, null, '\t') + '\n');
  } else {
    updateConfig(debugConfigPath, 'net.ducksmanager.whattheduck.debug');
  }
  console.log('✓ Android capacitor.config.json (main + debug) updated successfully');
} catch (error) {
  console.error('✗ Failed to update Android capacitor.config.json:', error);
  process.exit(1);
}
