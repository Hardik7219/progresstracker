import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { requestPermission, hasPermission, scheduleAt, cancelNotification } from '../services/notificationService';
import { format } from 'date-fns';

const STORAGE_KEY = 'pt_scheduled_notifications';

function loadNotifications() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveNotifications(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function generateId() {
    // Capacitor notification ids must be integers
    return Math.floor(Math.random() * 2000000) + 1;
}

export default function Notifications() {
    const [notifications, setNotifications] = useState(loadNotifications);
    const [title, setTitle] = useState('');
    const [datetime, setDatetime] = useState('');
    const [permGranted, setPermGranted] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        hasPermission().then(setPermGranted);
        // Clean up past notifications from the list on load
        const now = Date.now();
        const filtered = loadNotifications().filter(n => new Date(n.at).getTime() > now);
        setNotifications(filtered);
        saveNotifications(filtered);
    }, []);

    async function handleRequestPermission() {
        const granted = await requestPermission();
        setPermGranted(granted);
        if (!granted) setError('Permission denied. Please enable notifications in your device settings.');
    }

    async function handleSchedule(e) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!title.trim()) { setError('Please enter a title.'); return; }
        if (!datetime) { setError('Please pick a date and time.'); return; }

        const at = new Date(datetime);
        if (at <= new Date()) { setError('Please pick a future date and time.'); return; }

        if (!permGranted) {
            const granted = await requestPermission();
            setPermGranted(granted);
            if (!granted) { setError('Notification permission denied.'); return; }
        }

        const id = generateId();
        await scheduleAt({ id, title: title.trim(), body: '', at });

        const newNotif = { id, title: title.trim(), at: at.toISOString() };
        const updated = [...notifications, newNotif].sort((a, b) => new Date(a.at) - new Date(b.at));
        setNotifications(updated);
        saveNotifications(updated);

        setTitle('');
        setDatetime('');
        setSuccess(`Notification scheduled for ${format(at, 'MMM dd, yyyy · hh:mm a')}`);
        setTimeout(() => setSuccess(''), 4000);
    }

    async function handleDelete(notif) {
        await cancelNotification(notif.id);
        const updated = notifications.filter(n => n.id !== notif.id);
        setNotifications(updated);
        saveNotifications(updated);
    }

    const now = new Date();
    const upcoming = notifications.filter(n => new Date(n.at) > now);
    const past     = notifications.filter(n => new Date(n.at) <= now);

    // Min datetime for the picker = now (rounded to next minute)
    const minDatetime = new Date(Math.ceil(Date.now() / 60000) * 60000)
        .toISOString().slice(0, 16);

    return (
        <div className="notifications-page" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="page-header">
                <div>
                    <h1>Notifications</h1>
                    <p className="subtitle">Schedule reminders with a custom title and time</p>
                </div>
            </div>

            {/* Permission banner */}
            {!permGranted && (
                <div className="archive-banner" style={{ marginBottom: '1.5rem' }}>
                    <Bell size={18} />
                    <span>Notification permission is required to send alerts.</span>
                    <button className="btn-sm btn-primary" onClick={handleRequestPermission}>
                        Allow Notifications
                    </button>
                </div>
            )}

            {/* Schedule form */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                    <h2><Plus size={18} /> New Notification</h2>
                </div>
                <form onSubmit={handleSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 0 0.5rem' }}>
                    <div className="form-group">
                        <label htmlFor="notif-title">Title</label>
                        <input
                            id="notif-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Take a break, Review tasks..."
                            maxLength={80}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="notif-datetime">Date &amp; Time</label>
                        <input
                            id="notif-datetime"
                            type="datetime-local"
                            value={datetime}
                            min={minDatetime}
                            onChange={e => setDatetime(e.target.value)}
                            style={{
                                background: 'var(--color-bg-input)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--color-text)',
                                padding: '8px 12px',
                                fontSize: '0.95rem',
                                width: '100%',
                            }}
                        />
                    </div>

                    {error && (
                        <p style={{ color: 'var(--color-amber)', fontSize: '0.85rem', margin: 0 }}>⚠️ {error}</p>
                    )}
                    {success && (
                        <p style={{ color: 'var(--color-emerald)', fontSize: '0.85rem', margin: 0 }}>✅ {success}</p>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                        <Bell size={16} /> Schedule Notification
                    </button>
                </form>
            </div>

            {/* Upcoming */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                    <h2><Clock size={18} /> Upcoming ({upcoming.length})</h2>
                </div>
                {upcoming.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">🔔</span>
                        <p>No upcoming notifications. Schedule one above!</p>
                    </div>
                ) : (
                    <ul className="task-list" style={{ padding: '0.25rem 0' }}>
                        {upcoming.map(n => (
                            <li key={n.id} className="task-card" style={{ alignItems: 'center' }}>
                                <Bell size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                                <div className="task-content">
                                    <div className="task-title" style={{ fontWeight: 600 }}>{n.title}</div>
                                    <div className="task-meta">
                                        <Clock size={12} />
                                        {format(new Date(n.at), 'MMM dd, yyyy · hh:mm a')}
                                    </div>
                                </div>
                                <button
                                    className="btn-icon btn-danger"
                                    onClick={() => handleDelete(n)}
                                    title="Cancel notification"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Past (shown only if any) */}
            {past.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h2><CheckCircle2 size={18} /> Sent ({past.length})</h2>
                        <button
                            className="btn-sm btn-ghost"
                            onClick={() => {
                                saveNotifications(upcoming);
                                setNotifications(upcoming);
                            }}
                        >
                            Clear
                        </button>
                    </div>
                    <ul className="task-list" style={{ padding: '0.25rem 0' }}>
                        {past.map(n => (
                            <li key={n.id} className="task-card task-completed" style={{ alignItems: 'center' }}>
                                <CheckCircle2 size={20} style={{ color: 'var(--color-emerald)', flexShrink: 0 }} />
                                <div className="task-content">
                                    <div className="task-title done">{n.title}</div>
                                    <div className="task-meta">
                                        {format(new Date(n.at), 'MMM dd, yyyy · hh:mm a')}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}