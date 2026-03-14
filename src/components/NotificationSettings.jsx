import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
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
    return Math.floor(Math.random() * 2000000) + 1;
}

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [title, setTitle] = useState('');
    const [datetime, setDatetime] = useState('');
    const [permGranted, setPermGranted] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load all saved notifications (don't filter — show them all, split in render)
        const saved = loadNotifications();
        setNotifications(saved);

        // Check permission
        hasPermission().then(setPermGranted);
    }, []);

    async function handleRequestPermission() {
        setError('');
        const granted = await requestPermission();
        setPermGranted(granted);
        if (!granted) {
            setError('Permission denied. Please enable notifications in your device settings.');
        }
    }

    async function handleSchedule(e) {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!title.trim()) {
            setError('Please enter a title.');
            return;
        }
        if (!datetime) {
            setError('Please pick a date and time.');
            return;
        }

        const at = new Date(datetime);
        if (at <= new Date()) {
            setError('Please pick a future date and time.');
            return;
        }

        // Request permission if not granted yet
        if (!permGranted) {
            const granted = await requestPermission();
            setPermGranted(granted);
            if (!granted) {
                setError('Notification permission is required.');
                return;
            }
        }

        setLoading(true);
        try {
            const id = generateId();

            // Schedule the actual notification
            await scheduleAt({
                id,
                title: title.trim(),
                body: title.trim(), // use title as body too — some Android versions need non-empty body
                at,
            });

            // Save to list
            const newNotif = {
                id,
                title: title.trim(),
                at: at.toISOString(),
            };

            const updated = [...notifications, newNotif].sort(
                (a, b) => new Date(a.at) - new Date(b.at)
            );
            setNotifications(updated);
            saveNotifications(updated);

            setTitle('');
            setDatetime('');
            setSuccess(`✅ Scheduled for ${format(at, 'MMM dd, yyyy · hh:mm a')}`);
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            console.error('Schedule error:', err);
            setError(`Failed to schedule: ${err?.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(notif) {
        try {
            await cancelNotification(notif.id);
        } catch (err) {
            console.warn('Cancel error (may already be fired):', err);
        }
        const updated = notifications.filter(n => n.id !== notif.id);
        setNotifications(updated);
        saveNotifications(updated);
    }

    function handleClearPast() {
        const now = Date.now();
        const upcoming = notifications.filter(n => new Date(n.at).getTime() > now);
        setNotifications(upcoming);
        saveNotifications(upcoming);
    }

    const now = new Date();
    const upcoming = notifications.filter(n => new Date(n.at) > now);
    const past = notifications.filter(n => new Date(n.at) <= now);

    // Min value for datetime-local input = current time (browser local)
    const pad = v => String(v).padStart(2, '0');
    const localNow = new Date();
    const minDatetime = `${localNow.getFullYear()}-${pad(localNow.getMonth() + 1)}-${pad(localNow.getDate())}T${pad(localNow.getHours())}:${pad(localNow.getMinutes())}`;

    return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="page-header">
                <div>
                    <h1>Notifications</h1>
                    <p className="subtitle">Schedule reminders by title and time</p>
                </div>
            </div>

            {/* Permission banner */}
            {!permGranted && (
                <div className="archive-banner" style={{ marginBottom: '1.5rem' }}>
                    <AlertTriangle size={18} />
                    <span>Notification permission needed to send alerts.</span>
                    <button className="btn-sm btn-primary" onClick={handleRequestPermission}>
                        Allow
                    </button>
                </div>
            )}

            {/* Schedule form */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                    <h2><Plus size={18} /> Schedule Notification</h2>
                </div>
                <form onSubmit={handleSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    <div className="form-group">
                        <label htmlFor="notif-title">Title *</label>
                        <input
                            id="notif-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Take a break, Review tasks..."
                            maxLength={80}
                            autoComplete="off"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="notif-time">Date &amp; Time *</label>
                        <input
                            id="notif-time"
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
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    {error && (
                        <p style={{ color: 'var(--color-amber)', fontSize: '0.85rem', margin: 0 }}>
                            ⚠️ {error}
                        </p>
                    )}
                    {success && (
                        <p style={{ color: 'var(--color-emerald)', fontSize: '0.85rem', margin: 0 }}>
                            {success}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ alignSelf: 'flex-start' }}
                    >
                        <Bell size={16} />
                        {loading ? 'Scheduling...' : 'Schedule'}
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
                        <p>No upcoming notifications.</p>
                    </div>
                ) : (
                    <div className="task-list" style={{ padding: '0.25rem 0' }}>
                        {upcoming.map(n => (
                            <div key={n.id} className="task-card" style={{ alignItems: 'center' }}>
                                <Bell size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                                <div className="task-content">
                                    <div className="task-title" style={{ fontWeight: 600 }}>{n.title}</div>
                                    <div className="task-meta" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <Clock size={12} />
                                        {format(new Date(n.at), 'MMM dd, yyyy · hh:mm a')}
                                    </div>
                                </div>
                                <button
                                    className="btn-icon btn-danger"
                                    onClick={() => handleDelete(n)}
                                    title="Cancel"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Past */}
            {past.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h2><CheckCircle2 size={18} /> Sent ({past.length})</h2>
                        <button className="btn-sm btn-ghost" onClick={handleClearPast}>
                            Clear
                        </button>
                    </div>
                    <div className="task-list" style={{ padding: '0.25rem 0' }}>
                        {past.map(n => (
                            <div key={n.id} className="task-card task-completed" style={{ alignItems: 'center' }}>
                                <CheckCircle2 size={20} style={{ color: 'var(--color-emerald)', flexShrink: 0 }} />
                                <div className="task-content">
                                    <div className="task-title done">{n.title}</div>
                                    <div className="task-meta">
                                        {format(new Date(n.at), 'MMM dd, yyyy · hh:mm a')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}