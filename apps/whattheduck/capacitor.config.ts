import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.ducksmanager.whattheduck2',
  appName: 'What The Duck',
  webDir: 'dist',
  server: {
    url: 'http://localhost:5174',
  },
};

export default config;
