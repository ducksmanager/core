import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.ducksmanager.whattheduck2',
  appName: 'What The Duck',
  webDir: 'dist',
  server: {
    url: 'http://192.168.1.209:8005',
  },
};

export default config;
