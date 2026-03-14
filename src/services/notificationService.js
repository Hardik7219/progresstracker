/**
 * Notification Service
 * - Android (Capacitor): @capacitor/local-notifications — real OS notifications
 * - Browser: Web Notification API with setTimeout fallback
 *
 * Uses INEXACT alarms by default — no SCHEDULE_EXACT_ALARM permission needed.
 * Fires within a few minutes of the scheduled time on Android 12+.
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
 * Uses inexact scheduling — no special Android 12+ permission required.
 * Notification fires within a few minutes of the target time.
 *
 * @param {{ id: number, title: string, body: string, at: Date }} options
 */
export async function scheduleAt({ id, title, body, at }) {
    const plugin = await getPlugin();

    if (plugin) {
        const fireAt = at instanceof Date ? at : new Date(at);

        await plugin.schedule({
            notifications: [
                {
                    id: Math.abs(Math.round(id)),
                    title: String(title),
                    body: String(body || title),
                    schedule: {
                        at: fireAt,
                        // No allowWhileIdle — avoids SCHEDULE_EXACT_ALARM requirement on Android 12+
                    },
                    sound: 'default',
                    actionTypeId: '',
                    extra: null,
                },
            ],
        });
        return;
    }

    // Browser fallback — setTimeout
    if (!('Notification' in window)) {
        throw new Error('Notifications not supported in this browser.');
    }
    const delay = (at instanceof Date ? at : new Date(at)).getTime() - Date.now();
    if (delay <= 0) {
        throw new Error('Scheduled time is in the past.');
    }
    setTimeout(() => {
        if (Notification.permission === 'granted') {
            new Notification(title, { body: body || title });
        }
    }, delay);
}

/**
 * Cancel a scheduled notification by id.
 */
export async function cancelNotification(id) {
    const plugin = await getPlugin();
    if (plugin) {
        await plugin.cancel({ notifications: [{ id: Math.abs(Math.round(id)) }] });
    }
}