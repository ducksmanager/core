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
  // Only set server URL in development mode (so cap sync copies it to android)
  ...(isDev && {
    server: {
      url: `http://${getLocalIP()}:8008`,
      cleartext: true,
      androidScheme: 'http',
    },
  }),
  android: {
    buildOptions: {
      keystorePath: '~/Documents/whattheduck.keystore',
      keystoreAlias: 'whattheduck',
    },
    webContentsDebuggingEnabled: true,
    ...(isDev && { allowMixedContent: true }),
  },
  ios: {
    scheme: 'What The Duck',
  },
  plugins: {
    // Inert until @capacitor/splash-screen is installed; kept so the intent is not lost.
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      androidScaleType: 'CENTER_INSIDE',
      splashFullScreen: false,
      splashImmersive: false,
      backgroundColor: '#1C3461',
      androidSplashResourceName: 'splash',
    },
    CapacitorUpdater: {
      updateUrl: 'https://api.ducksmanager.net/app/updates',
      statsUrl: '',
    },
  },
};

export default config;
