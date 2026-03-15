import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { requestPermission, scheduleAt, cancelNotification ,createChannel } from '../services/notificationService';
import { format } from 'date-fns';

const STORAGE_KEY = 'pt_scheduled_notifications';

function loadNotifications() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
}
function saveNotifications(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
function generateId() {
    return Math.floor(Math.random() * 2000000) + 1;
}

// Check permission directly from plugin, handling Capacitor 6 bug
async function checkNativePermission() {
    const platform = Capacitor.getPlatform();
    if (platform === 'android' || platform === 'ios') {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const result = await LocalNotifications.checkPermissions();
        // Capacitor 6 bug: returns 'prompt' even when OS shows it as granted
        // Consider both 'granted' and absence of 'denied' as potentially OK
        return result.display !== 'denied';
    }
    return 'Notification' in window && Notification.permission === 'granted';
}

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [title, setTitle] = useState('');
    const [datetime, setDatetime] = useState('');
    const [permGranted, setPermGranted] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [debugLog, setDebugLog] = useState([]);

    function log(msg) {
        console.log('[Notif]', msg);
        setDebugLog(prev => [`${new Date().toLocaleTimeString()}: ${msg}`, ...prev].slice(0, 6));
    }

    useEffect(() => {
        setNotifications(loadNotifications());

        async function init() {
            await createChannel();   // ensure channel exists
            const granted = await checkNativePermission();
            setPermGranted(granted);
            log(`Platform: ${Capacitor.getPlatform()} | Permission check: ${granted}`);
        }

        init();
    }, []);

    async function handleRequestPermission() {
        setError('');
        log('Requesting permission...');
        try {
            const granted = await requestPermission();
            // Also recheck native state
            const nativeGranted = await checkNativePermission();
            const finalGranted = granted || nativeGranted;
            setPermGranted(finalGranted);
            log(`Result: granted=${granted} nativeCheck=${nativeGranted}`);
            if (!finalGranted) {
                setError('Still denied. Go to: Settings → Apps → Progress Tracker → Notifications → Allow');
            }
        } catch (err) {
            log(`Error: ${err?.message}`);
            setError(`Error: ${err?.message}`);
        }
    }

    async function handleTestNow() {
        setError(''); setSuccess('');
        log('Scheduling test in 5 seconds...');
        try {
            // Try to schedule directly — if permission is really denied it will throw
            const fireAt = new Date(Date.now() + 5000);
            await scheduleAt({ id: 9999999, title: '🔔 Test Notification', body: 'It works!', at: fireAt });
            setPermGranted(true); // if schedule succeeded, permission is clearly granted
            log('Test scheduled ✓ — lock your screen!');
            setSuccess('✅ Test fires in 5 seconds. Lock your screen to see it!');
            setTimeout(() => setSuccess(''), 10000);
        } catch (err) {
            log(`Failed: ${err?.message}`);
            setError(`Test failed: ${err?.message}`);
        }
    }

    async function handleSchedule(e) {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!title.trim()) { setError('Please enter a title.'); return; }
        if (!datetime) { setError('Please pick a date and time.'); return; }
        const at = new Date(datetime);
        if (at <= new Date()) { setError('Please pick a future date and time.'); return; }

        setLoading(true);
        try {
            const id = generateId();
            log(`Scheduling "${title}" at ${at.toLocaleString()}`);
            await scheduleAt({ id, title: title.trim(), body: title.trim(), at });
            setPermGranted(true);
            log('Scheduled ✓');

            const newNotif = { id, title: title.trim(), at: at.toISOString() };
            const updated = [...notifications, newNotif].sort((a, b) => new Date(a.at) - new Date(b.at));
            setNotifications(updated);
            saveNotifications(updated);
            setTitle('');
            setDatetime('');
            setSuccess(`✅ Scheduled for ${format(at, 'MMM dd, yyyy · hh:mm a')}`);
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            log(`Error: ${err?.message}`);
            // If error mentions permission, update state
            if (err?.message?.toLowerCase().includes('permission')) {
                setPermGranted(false);
            }
            setError(`Failed: ${err?.message || JSON.stringify(err)}`);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(notif) {
        try { await cancelNotification(notif.id); } catch (e) {}
        const updated = notifications.filter(n => n.id !== notif.id);
        setNotifications(updated);
        saveNotifications(updated);
    }

    function handleClearPast() {
        const upcoming = notifications.filter(n => new Date(n.at) > new Date());
        setNotifications(upcoming);
        saveNotifications(upcoming);
    }

    const now = new Date();
    const upcoming = notifications.filter(n => new Date(n.at) > now);
    const past = notifications.filter(n => new Date(n.at) <= now);

    const pad = v => String(v).padStart(2, '0');
    const localNow = new Date();
    const minDatetime = `${localNow.getFullYear()}-${pad(localNow.getMonth()+1)}-${pad(localNow.getDate())}T${pad(localNow.getHours())}:${pad(localNow.getMinutes())}`;

    return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="page-header">
                <div>
                    <h1>Notifications</h1>
                    <p className="subtitle">Schedule reminders by title and time</p>
                </div>
            </div>

            {/* Permission banner — only show if definitively denied */}
            {!permGranted && (
                <div className="archive-banner" style={{ marginBottom: '1rem' }}>
                    <AlertTriangle size={18} />
                    <span>Tap Allow or enable in device Settings.</span>
                    <button className="btn-sm btn-primary" onClick={handleRequestPermission}>Allow</button>
                </div>
            )}

            {/* Test button — always visible */}
            <div className="card" style={{ marginBottom: '1rem', padding: '1rem 1.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.5rem', flexWrap:'wrap' }}>
                    <div>
                        <div style={{ fontWeight:600 }}>🧪 Test (5 seconds)</div>
                        <div style={{ fontSize:'0.8rem', color:'var(--color-text-muted)' }}>
                            Tap then lock your screen — notification appears there
                        </div>
                    </div>
                    <button className="btn btn-outline" onClick={handleTestNow}>Send Test</button>
                </div>
            </div>

            {/* Debug log */}
            {debugLog.length > 0 && (
                <div style={{ background:'var(--color-bg-input)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', padding:'0.75rem 1rem', marginBottom:'1rem', fontFamily:'monospace', fontSize:'0.75rem', color:'var(--color-text-muted)' }}>
                    {debugLog.map((l,i) => <div key={i}>{l}</div>)}
                </div>
            )}

            {/* Schedule form */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header">
                    <h2><Plus size={18} /> Schedule Notification</h2>
                </div>
                <form onSubmit={handleSchedule} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                    <div className="form-group">
                        <label htmlFor="notif-title">Title *</label>
                        <input id="notif-title" type="text" value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Take a break..." maxLength={80} autoComplete="off" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="notif-time">Date &amp; Time *</label>
                        <input id="notif-time" type="datetime-local" value={datetime} min={minDatetime}
                            onChange={e => setDatetime(e.target.value)}
                            style={{ background:'var(--color-bg-input)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-sm)', color:'var(--color-text)', padding:'8px 12px', fontSize:'0.95rem', width:'100%', boxSizing:'border-box' }} />
                    </div>
                    {error && <p style={{ color:'var(--color-amber)', fontSize:'0.85rem', margin:0 }}>⚠️ {error}</p>}
                    {success && <p style={{ color:'var(--color-emerald)', fontSize:'0.85rem', margin:0 }}>{success}</p>}
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf:'flex-start' }}>
                        <Bell size={16} />{loading ? 'Scheduling...' : 'Schedule'}
                    </button>
                </form>
            </div>

            {/* Upcoming */}
            <div className="card" style={{ marginBottom:'1.5rem' }}>
                <div className="card-header">
                    <h2><Clock size={18} /> Upcoming ({upcoming.length})</h2>
                </div>
                {upcoming.length === 0 ? (
                    <div className="empty-state"><span className="empty-icon">🔔</span><p>No upcoming notifications.</p></div>
                ) : (
                    <div className="task-list" style={{ padding:'0.25rem 0' }}>
                        {upcoming.map(n => (
                            <div key={n.id} className="task-card" style={{ alignItems:'center' }}>
                                <Bell size={20} style={{ color:'var(--color-primary)', flexShrink:0 }} />
                                <div className="task-content">
                                    <div className="task-title" style={{ fontWeight:600 }}>{n.title}</div>
                                    <div className="task-meta" style={{ display:'flex', alignItems:'center', gap:4 }}>
                                        <Clock size={12} />{format(new Date(n.at), 'MMM dd, yyyy · hh:mm a')}
                                    </div>
                                </div>
                                <button className="btn-icon btn-danger" onClick={() => handleDelete(n)}><Trash2 size={16} /></button>
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
                        <button className="btn-sm btn-ghost" onClick={handleClearPast}>Clear</button>
                    </div>
                    <div className="task-list" style={{ padding:'0.25rem 0' }}>
                        {past.map(n => (
                            <div key={n.id} className="task-card task-completed" style={{ alignItems:'center' }}>
                                <CheckCircle2 size={20} style={{ color:'var(--color-emerald)', flexShrink:0 }} />
                                <div className="task-content">
                                    <div className="task-title done">{n.title}</div>
                                    <div className="task-meta">{format(new Date(n.at), 'MMM dd, yyyy · hh:mm a')}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}