import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ros.controlhub',
  appName: 'ROS Control Hub',
  webDir: 'www',
  server: {
    // Set hostname to allow live-reloading on physical devices.
    // Use your computer's IP address on your local network.
    // hostname: '192.168.50.71',
    androidScheme: 'https'
  }
};

export default config;
