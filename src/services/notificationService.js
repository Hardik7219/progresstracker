/**
 * Notification Service
 *
 * Works on BOTH browser and Android:
 * - Android (Capacitor): uses @capacitor/local-notifications — real OS notifications
 *   that appear even when the app is in the background.
 * - Browser: falls back to the Web Notification API (requires tab open).
 *
 * Usage:
 *   import { requestPermission, scheduleNotification, scheduleDailyReminder, cancelAll } from './notificationService';
 *
 *   await requestPermission();
 *   await scheduleDailyReminder({ hour: 9, minute: 0, title: 'Daily Tasks', body: 'Time to check your tasks!' });
 */

import { Capacitor } from '@capacitor/core';

// Lazily import the Capacitor plugin only when running on native
// (avoids errors on browser where the plugin is unavailable)
async function getPlugin() {
    if (Capacitor.isNativePlatform()) {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        return LocalNotifications;
    }
    return null;
}

// ─── Permission ─────────────────────────────────────────────

/**
 * Request notification permission.
 * Returns true if granted, false if denied.
 */
export async function requestPermission() {
    const plugin = await getPlugin();

    if (plugin) {
        // Native Android / iOS
        const { display } = await plugin.requestPermissions();
        return display === 'granted';
    }

    // Browser fallback
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
}

/**
 * Check if notification permission is already granted (without prompting).
 */
export async function hasPermission() {
    const plugin = await getPlugin();

    if (plugin) {
        const { display } = await plugin.checkPermissions();
        return display === 'granted';
    }

    return 'Notification' in window && Notification.permission === 'granted';
}

// ─── Send an immediate notification ─────────────────────────

/**
 * Fire an immediate notification right now.
 * @param {{ title: string, body: string, id?: number }} options
 */
export async function sendNotification({ title, body, id = Date.now() % 2147483647 }) {
    const plugin = await getPlugin();

    if (plugin) {
        await plugin.schedule({
            notifications: [
                {
                    id,
                    title,
                    body,
                    schedule: { at: new Date(Date.now() + 1000) }, // 1 second from now
                    sound: null,
                    actionTypeId: '',
                    extra: null,
                },
            ],
        });
        return;
    }

    // Browser fallback
    if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/icons/icon-192.png' });
    }
}

// ─── Schedule a daily repeating reminder ────────────────────

/**
 * Schedule a notification that fires every day at a specific time.
 * Cancels any existing reminder with the same id first.
 *
 * @param {{ hour: number, minute: number, title: string, body: string, id?: number }} options
 */
export async function scheduleDailyReminder({ hour, minute, title, body, id = 1001 }) {
    const plugin = await getPlugin();

    if (plugin) {
        // Cancel the previous one with this id before re-scheduling
        await plugin.cancel({ notifications: [{ id }] }).catch(() => {});

        await plugin.schedule({
            notifications: [
                {
                    id,
                    title,
                    body,
                    schedule: {
                        on: { hour, minute },  // fires every day at this time
                        repeats: true,
                        allowWhileIdle: true,  // fires even in Doze mode
                    },
                    sound: 'default',
                    actionTypeId: '',
                    extra: null,
                },
            ],
        });
        return true;
    }

    // Browser: can't schedule future repeating notifications natively,
    // so we use setInterval as a best-effort in-tab reminder.
    console.warn('[Notifications] Running in browser — daily reminders only work while the tab is open.');
    scheduleInTabReminder({ hour, minute, title, body });
    return false;
}

/**
 * Schedule a one-time notification at a specific future date/time.
 * @param {{ at: Date, title: string, body: string, id?: number }} options
 */
export async function scheduleAt({ at, title, body, id = Date.now() % 2147483647 }) {
    const plugin = await getPlugin();

    if (plugin) {
        await plugin.schedule({
            notifications: [
                {
                    id,
                    title,
                    body,
                    schedule: { at, allowWhileIdle: true },
                    sound: 'default',
                    actionTypeId: '',
                    extra: null,
                },
            ],
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
    return false;
}

// ─── Cancel ─────────────────────────────────────────────────

/**
 * Cancel a specific scheduled notification by id.
 */
export async function cancelNotification(id) {
    const plugin = await getPlugin();
    if (plugin) {
        await plugin.cancel({ notifications: [{ id }] });
    }
}

/**
 * Cancel ALL pending scheduled notifications.
 */
export async function cancelAll() {
    const plugin = await getPlugin();
    if (plugin) {
        const pending = await plugin.getPending();
        if (pending.notifications.length > 0) {
            await plugin.cancel({ notifications: pending.notifications });
        }
    }
}

// ─── List pending (debug helper) ────────────────────────────

export async function getPendingNotifications() {
    const plugin = await getPlugin();
    if (plugin) {
        const { notifications } = await plugin.getPending();
        return notifications;
    }
    return [];
}

// ─── Browser-only in-tab reminder (fallback) ────────────────

const _inTabTimers = {};

function scheduleInTabReminder({ hour, minute, title, body }) {
    // Clear previous
    const key = `${hour}:${minute}`;
    if (_inTabTimers[key]) clearTimeout(_inTabTimers[key]);

    function msUntilNext() {
        const now = new Date();
        const target = new Date();
        target.setHours(hour, minute, 0, 0);
        if (target <= now) target.setDate(target.getDate() + 1);
        return target.getTime() - now.getTime();
    }

    function fire() {
        new Notification(title, { body });
        // Schedule again for tomorrow
        _inTabTimers[key] = setTimeout(fire, msUntilNext());
    }

    _inTabTimers[key] = setTimeout(fire, msUntilNext());
}