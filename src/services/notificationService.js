import { Capacitor } from '@capacitor/core';

// ✅ Remove the top-level LocalNotifications import — it conflicts with dynamic import

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
    // ✅ Removed undefined log('hello') call
    if (plugin) {
        const result = await plugin.requestPermissions();
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
        const result = await plugin.checkPermissions();
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
        importance: 5  // ✅ Changed from 4 to 5 (IMPORTANCE_HIGH) — shows as heads-up
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
                schedule: { at: fireAt, allowWhileIdle: true }, // ✅ Added allowWhileIdle
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