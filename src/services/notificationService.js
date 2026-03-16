
import { Capacitor } from '@capacitor/core';
import {LocalNotifications} from '@capacitor/local-notifications'

export async function requestPermission() {
  const permission = await LocalNotifications.requestPermissions();
  return permission.display === 'granted';
}

export async function createChannel() {
    await LocalNotifications.createChannel({
        id: "progress_reminders_v2",
        name: "Progress Reminders",
        description: "Task reminder notifications",
        importance: 4,
        sound: "notify_sound.wav"
    });
}
export async function scheduleAt({ id, title, body, at }) {
    const fireAt = at instanceof Date ? at : new Date(at);
    console.log(title)
        await LocalNotifications.schedule({
            notifications: [{
                id: Math.abs(Math.round(id)),
                title: String(title),
                body: String(body || title),
                schedule: { at: fireAt },
                channelId: "progress_reminders_v2",
                sound: "notify_sound.wav",
                actionTypeId: '',
                extra: null,
            }],
        });
    const delay = fireAt.getTime() - Date.now();
    if (delay <= 0) throw new Error('Time is in the past.');
    setTimeout(() => {
        if (Notification.permission === 'granted') {
            new Notification(title, { body: body || title });
        }
    }, delay);
      if (Capacitor.getPlatform() === "web") {
    const delay = fireAt.getTime() - Date.now();
    if (delay > 0 && Notification.permission === 'granted') {
      setTimeout(() => {
        new Notification(title, { body: body || title });
      }, delay);
    }
  }
}

export async function cancelNotification(id) {
        await LocalNotifications.cancel({ notifications: [{ id: Math.abs(Math.round(id)) }] });
}