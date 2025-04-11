
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4b5f8e59cea442a08eac87e6b5d8e6ba',
  appName: 'sonic-flow-android-beats',
  webDir: 'dist',
  server: {
    url: 'https://4b5f8e59-cea4-42a0-8eac-87e6b5d8e6ba.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    // Here we would configure native plugins
    // For example, for file access permissions:
    // Permissions: {
    //   permissions: ['storage']
    // }
  }
};

export default config;
