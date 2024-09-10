import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.ducksmanager.whattheduck',
  appName: 'What The Duck',
  webDir: 'dist',
  android: {
    buildOptions: {
      keystorePath: '~/Documents/whattheduck.keystore',
      keystoreAlias: 'whattheduck',
    },
  },
  ios: {
    scheme: 'What The Duck',
  },
};

export default config;
