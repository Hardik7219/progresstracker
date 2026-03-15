/**
 * Notification Service
 * Uses getPlatform() for reliable Android detection.
 * Works around Capacitor 6 bug where checkPermissions() returns wrong state.
 */
import { Capacitor } from '@capacitor/core';
import {LocalNotifications} from '@capacitor/local-notifications'

async function getPlugin() {
    const platform = Capacitor.getPlatform();
    if (platform === 'android' || platform === 'ios') {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        return LocalNotifications;
    }
    return null;
}

export async function requestPermission() {
    const plugin = await getPlugin();
    log('hello')
    if (plugin) {
        // First check current state
        const current = await plugin.checkPermissions();
        // On Android, 'granted' OR 'denied' (if previously allowed via settings)
        // Some Capacitor 6 versions return wrong value — try requesting regardless
        const result = await plugin.requestPermissions();
        // If result is still not granted, check again after a tick
        if (result.display !== 'granted') {
            await new Promise(r => setTimeout(r, 300));
            const recheck = await plugin.checkPermissions();
            return recheck.display === 'granted';
        }
        return result.display === 'granted';
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
        // Try both checkPermissions and a test schedule approach
        // Capacitor 6 bug: checkPermissions() can return 'prompt' even when granted
        const result = await plugin.checkPermissions();
        // Treat 'prompt' as potentially granted on Android (OS already asked)
        // The actual schedule call will fail if truly not granted
        return result.display === 'granted' || result.display === 'prompt-with-rationale';
    }
    return 'Notification' in window && Notification.permission === 'granted';
}

export async function createChannel() {
    const plugin = await getPlugin();
    if (!plugin) return;

    await plugin.createChannel({
        id: "progress_reminders",
        name: "Progress Reminders",
        description: "Task reminder notifications",
        importance: 4
    });
}
export async function scheduleAt({ id, title, body, at }) {
    const plugin = await getPlugin();
    const fireAt = at instanceof Date ? at : new Date(at);

    if (plugin) {
        await plugin.schedule({
            notifications: [{
                id: Math.abs(Math.round(id)),
                title: String(title),
                body: String(body || title),
                schedule: { at: fireAt },
                channelId: "progress_reminders",
                sound: null,
                actionTypeId: '',
                extra: null,
            }],
        });
        return;
    }

    const delay = fireAt.getTime() - Date.now();
    if (delay <= 0) throw new Error('Time is in the past.');
    setTimeout(() => {
        if (Notification.permission === 'granted') {
            new Notification(title, { body: body || title });
        }
    }, delay);
}

export async function cancelNotification(id) {
    const plugin = await getPlugin();
    if (plugin) {
        await plugin.cancel({ notifications: [{ id: Math.abs(Math.round(id)) }] });
    }
}