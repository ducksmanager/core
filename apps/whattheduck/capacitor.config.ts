import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.ducksmanager.whattheduck',
  appName: 'What The Duck',
  webDir: 'dist',
  server: {
    url: 'http://192.168.1.145:8003',
    cleartext: true,
  },
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
