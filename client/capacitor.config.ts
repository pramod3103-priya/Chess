import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.theproxi.chess',
  appName: 'THE PROXI CHESS',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#111827'
    },
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#111827'
    }
  }
};

export default config;
