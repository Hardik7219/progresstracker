/**
 * NotificationSettings.jsx
 *
 * Drop this anywhere in your settings UI.
 * Shows a toggle to enable/disable daily reminders and a time picker.
 * Works on both browser and Android via notificationService.
 */
import React, { useState, useEffect } from 'react';
import {
    requestPermission,
    hasPermission,
    scheduleDailyReminder,
    cancelNotification,
} from '../services/notificationService';
import { getSettings, updateSettings } from '../services/storageService';
import { Bell, BellOff } from 'lucide-react';

const REMINDER_ID = 1001; // stable id for the daily reminder

export default function NotificationSettings() {
    const settings = getSettings();
    const [enabled, setEnabled]   = useState(settings.notificationsEnabled ?? false);
    const [time, setTime]         = useState(settings.reminderTime ?? '09:00');
    const [status, setStatus]     = useState(''); // 'saved' | 'denied' | ''

    useEffect(() => {
        // Sync toggle with actual OS permission on mount
        hasPermission().then((granted) => {
            if (!granted) setEnabled(false);
        });
    }, []);

    async function handleToggle() {
        if (!enabled) {
            // Turning ON — request permission first
            const granted = await requestPermission();
            if (!granted) {
                setStatus('denied');
                setTimeout(() => setStatus(''), 3000);
                return;
            }
            const [hour, minute] = time.split(':').map(Number);
            await scheduleDailyReminder({
                id:     REMINDER_ID,
                hour,
                minute,
                title:  '📋 Progress Tracker',
                body:   "Don't forget to check your tasks and keep your streak alive!",
            });
            setEnabled(true);
            updateSettings({ notificationsEnabled: true, reminderTime: time });
            setStatus('saved');
        } else {
            // Turning OFF — cancel the scheduled notification
            await cancelNotification(REMINDER_ID);
            setEnabled(false);
            updateSettings({ notificationsEnabled: false });
            setStatus('');
        }
        setTimeout(() => setStatus(''), 3000);
    }

    async function handleTimeChange(e) {
        const newTime = e.target.value;
        setTime(newTime);
        updateSettings({ reminderTime: newTime });

        if (enabled) {
            // Re-schedule at the new time immediately
            const [hour, minute] = newTime.split(':').map(Number);
            await scheduleDailyReminder({
                id:     REMINDER_ID,
                hour,
                minute,
                title:  '📋 Progress Tracker',
                body:   "Don't forget to check your tasks and keep your streak alive!",
            });
            setStatus('saved');
            setTimeout(() => setStatus(''), 2000);
        }
    }

    return (
        <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <div className="card-header">
                <h2>{enabled ? <Bell size={18} /> : <BellOff size={18} />} Daily Reminder</h2>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                Get a daily nudge to check your tasks and keep your streak going.
                Works on Android even when the app is closed.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Toggle */}
                <button
                    className={`btn ${enabled ? 'btn-primary' : 'btn-outline'}`}
                    onClick={handleToggle}
                >
                    {enabled ? '🔔 Reminder On' : '🔕 Reminder Off'}
                </button>

                {/* Time picker — only visible when enabled */}
                {enabled && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                            Remind me at:
                        </label>
                        <input
                            type="time"
                            value={time}
                            onChange={handleTimeChange}
                            style={{
                                background: 'var(--color-bg-input)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--color-text)',
                                padding: '4px 8px',
                                fontSize: '0.9rem',
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Status messages */}
            {status === 'saved' && (
                <p style={{ marginTop: '0.75rem', color: 'var(--color-emerald)', fontSize: '0.85rem' }}>
                    ✓ Reminder saved!
                </p>
            )}
            {status === 'denied' && (
                <p style={{ marginTop: '0.75rem', color: 'var(--color-amber)', fontSize: '0.85rem' }}>
                    ⚠️ Notification permission denied. Please enable it in your device settings.
                </p>
            )}
        </div>
    );
}