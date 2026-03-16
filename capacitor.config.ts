import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.progresstracker.app',
    appName: 'Progress Tracker',
    webDir: 'dist',
    server: {
        androidScheme: 'https',
    },
};

export default config;
