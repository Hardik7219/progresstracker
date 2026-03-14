/**
 * Notification Service
 * Works on browser (Web Notification API) and Android (Capacitor LocalNotifications).
 */
import { Capacitor } from '@capacitor/core';

async function getPlugin() {
    if (Capacitor.isNativePlatform()) {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        return LocalNotifications;
    }
    return null;
}

export async function requestPermission() {
    const plugin = await getPlugin();
    if (plugin) {
        const { display } = await plugin.requestPermissions();
        return display === 'granted';
    }
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
}

export async function hasPermission() {
    const plugin = await getPlugin();
    if (plugin) {
        const { display } = await plugin.checkPermissions();
        return display === 'granted';
    }
    return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Schedule a one-time notification at a specific Date.
 * @param {{ id: number, title: string, body: string, at: Date }} options
 */
export async function scheduleAt({ id, title, body, at }) {
    const plugin = await getPlugin();
    if (plugin) {
        await plugin.schedule({
            notifications: [{
                id,
                title,
                body,
                schedule: { at, allowWhileIdle: true },
                sound: 'default',
                actionTypeId: '',
                extra: null,
            }],
        });
        return true;
    }
    // Browser fallback: setTimeout
    const delay = at.getTime() - Date.now();
    if (delay > 0) {
        setTimeout(() => {
            if (Notification.permission === 'granted') {
                new Notification(title, { body });
            }
        }, delay);
    }
    return true;
}

/**
 * Cancel a scheduled notification by id.
 */
export async function cancelNotification(id) {
    const plugin = await getPlugin();
    if (plugin) {
        await plugin.cancel({ notifications: [{ id }] });
    }
}