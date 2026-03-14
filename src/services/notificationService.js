
import { LocalNotifications } from '@capacitor/local-notifications';

export async function requestNotificationPermission() {
  const perm = await LocalNotifications.requestPermissions();

  if (perm.display !== 'granted') {
    alert("Notification permission denied");
  }
}

export async function scheduleTaskNotification(Noti) {

  if (!Noti.reminder_time) return;

  const [hour, minute] = Noti.reminder_time.split(":");

  const notifyTime = new Date();
  notifyTime.setHours(hour);
  notifyTime.setMinutes(minute);
  notifyTime.setSeconds(0);


if (notifyTime < new Date()) {
  notifyTime.setDate(notifyTime.getDate() + 1);
}
  await LocalNotifications.schedule({
    notifications: [
      {
        title: "Progress Tracker 🔥",
        body: Noti.title,
        id: Date.now(),
        schedule: { at: notifyTime },
      }
    ]
  });
}