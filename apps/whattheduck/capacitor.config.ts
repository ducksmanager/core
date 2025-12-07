import type { CapacitorConfig } from '@capacitor/cli';
import { execSync } from 'child_process';

// Get local IP address dynamically
function getLocalIP(): string {
  try {
    return execSync('ipconfig getifaddr en0', { encoding: 'utf-8' }).trim();
  } catch {
    // Fallback to localhost if en0 is not available
    return 'localhost';
  }
}

const isDev = process.env.NODE_ENV !== 'production';

const config: CapacitorConfig = {
  appId: 'net.ducksmanager.whattheduck',
  appName: 'What The Duck',
  webDir: 'dist',
  // Only set server URL in development mode
  ...(isDev && {
    server: {
      url: `http://${getLocalIP()}:8008`,
      cleartext: true,
    },
  }),
  android: {
    buildOptions: {
      keystorePath: '~/Documents/whattheduck.keystore',
      keystoreAlias: 'whattheduck',
    },
    webContentsDebuggingEnabled: true,
  },
  ios: {
    scheme: 'What The Duck',
  },
};

export default config;
