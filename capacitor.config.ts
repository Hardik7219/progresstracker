import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.progresstracker.app',
    appName: 'Progress Tracker',
    webDir: 'dist',
    server: {
        androidScheme: 'https',
    },
    plugins: {
    LocalNotifications: {
        smallIcon: "ic_stat_notify",
        iconColor: "#488AFF",
        sound : 'notify_sound.wav',
    }
    },
};

export default config;
