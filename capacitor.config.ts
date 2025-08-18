import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ros.controlhub',
  appName: 'ROS Control Hub',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
