import React, { useState, useEffect, useMemo } from 'react';
import { getPhotos, addPhoto, deletePhoto, updatePhoto } from '../services/storageService';
import { getPhotoStreak } from '../services/streakService';
import StreakCounter from './StreakCounter';
import { Camera, Trash2, Calendar, Upload, Image as ImageIcon } from 'lucide-react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isSameMonth,
    addMonths,
    subMonths,
    getDay,
} from 'date-fns';

export default function PhotoJournal({ onRefresh, refreshKey }) {
    const [photos, setPhotos] = useState([]);
    const [streak, setStreak] = useState({ current: 0, longest: 0 });
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedPhotos, setSelectedPhotos] = useState([]);
    useEffect(() => {
        loadPhotos();
    }, [refreshKey]);

    function loadPhotos() {
        setPhotos(getPhotos());
        setStreak(getPhotoStreak());
        onRefresh?.();
    }
    function openDayPhotos(dayKey) {
    const dayPhotos = photoMap[dayKey] || [];
    setSelectedPhotos(dayPhotos);
}
    function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        addPhoto(reader.result); // store base64 image
        loadPhotos();
    };

    reader.readAsDataURL(file);

    e.target.value = '';
}
    function handleUpdatePhoto(id, e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            updatePhoto(id, reader.result); // replace image
            loadPhotos();
        };

        reader.readAsDataURL(file);
    }
    function handleDelete(id) {
        deletePhoto(id);
        loadPhotos();
    }

    // Calendar logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startPadding = getDay(monthStart); // 0 = Sunday

const photoMap = useMemo(() => {
    const map = {};
    photos.forEach((p) => {
        const dayKey = format(new Date(p.date_uploaded), 'yyyy-MM-dd');
        if (!map[dayKey]) map[dayKey] = [];
        map[dayKey].push(p);
    });
    return map;
}, [photos]);

    return (
        <div className="photo-journal">
            <div className="page-header">
                <div>
                    <h1>Photo Journal</h1>
                    <p className="subtitle">Document your journey with daily photos</p>
                </div>
                <label className="btn btn-primary upload-btn">
                    <Upload size={18} /> Upload Photo
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        hidden
                    />
                </label>
            </div>

            {/* Streak Cards */}
            <div className="photo-streak-row">
                <div className="stat-card">
                    <StreakCounter
                        value={streak.current}
                        label="Photo Streak"
                        best={streak.longest}
                        icon="📸"
                    />
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><ImageIcon size={22} /></div>
                    <div className="stat-value">{photos.length}</div>
                    <div className="stat-label">Total Photos</div>
                </div>
            </div>

            {/* Calendar View */}
            <div className="card calendar-card ">
                <div className="card-header justify-between">
                    <h2><Calendar size={18} /> Upload Calendar</h2>
                    <div className="calendar-nav">
                        <button className="btn-icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        ←
                        </button>
                        <span className="calendar-month">{format(currentMonth, 'MMMM yyyy')}</span>
                        <button className="btn-icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                            →
                        </button>
                    </div>
                </div>
                <div className="calendar-grid">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                        <div key={d} className="calendar-header-cell">
                            {d}
                        </div>
                    ))}
                    {Array.from({ length: startPadding }).map((_, i) => (
                        <div key={`pad-${i}`} className="calendar-cell empty"></div>
                    ))}
                    {daysInMonth.map((day) => {
                        const dayKey = format(day, 'yyyy-MM-dd');
                        const hasPhoto = !!photoMap[dayKey];
                        const isToday = isSameDay(day, new Date());
                        return (
                            <div
                                key={dayKey}
                                className={`calendar-cell ${hasPhoto ? 'has-photo' : ''} ${isToday ? 'today' : ''}`}
                                onClick={() => openDayPhotos(dayKey)}
                                title={hasPhoto ? `${photoMap[dayKey].length} photo(s)` : ''}
                            >
                                <span className="calendar-day">{format(day, 'd')}</span>
                                {hasPhoto && <span className="calendar-dot">📸</span>}
                            </div>
                        );
                    })}
                </div>
            </div>
                    {selectedPhotos.length > 0 && (
                    <div className="photo-viewer">

                    <button
                        className="close-viewer"
                        onClick={() => setSelectedPhotos([])}
                    >
                    Close
                    </button>

                        {selectedPhotos.map((p) => (
                        <div key={p.id} className="photo-preview-card">

                        <img
                            src={p.image_path}
                            alt="journal"
                            className="photo-preview h-100 w-100"
                        />

                        <div className="photo-actions">

                        <button
                            className="btn-icon btn-danger"
                            onClick={() => {
                                handleDelete(p.id);
                                setSelectedPhotos([]);
                            }}
                        >
                        <Trash2 size={18} />
                        </button>

                        <label className="btn-icon btn-update">
                        Update
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => handleUpdatePhoto(p.id, e)}
                        />
                        </label>

                        </div>

                        </div>
                        ))}

                        </div>
                        )}
            {/* Recent Photos */}
            <div className="card">
                <div className="card-header">
                    <h2><Camera size={18} /> Recent Entries</h2>
                </div>
                {photos.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📷</span>
                        <p>No photos yet! Upload your first daily photo.</p>
                    </div>
                ) : (
                    <div className="photo-list">
                        {[...photos]
                            .sort((a, b) => new Date(b.date_uploaded) - new Date(a.date_uploaded))
                            .slice(0, 20)
                            .map((photo) => (
                                <div key={photo.id} className="photo-entry">
                                    <div className="photo-icon">📷</div>
                                    <div className="photo-info">
                                        <span className="photo-name">photo</span>
                                        <span className="photo-date">
                                            {format(new Date(photo.date_uploaded), 'MMM dd, yyyy · h:mm a')}
                                        </span>
                                    </div>
                                    <button
                                        className="btn-icon btn-danger"
                                        onClick={() => handleDelete(photo.id)}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}
