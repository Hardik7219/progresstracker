import React, { useState, useEffect } from 'react';
import {
    getTasks,
    completeTask,
    uncompleteTask,
    getOldTaskCount,
    archiveOldTasks,
} from '../services/storageService';
import { getDashboardStats, getDashboardScore, getDashboardInsights } from '../services/analyticsService';
import { getTaskStreak, getPhotoStreak } from '../services/streakService';
import StreakCounter from './StreakCounter';
import { CheckCircle2, Circle, Clock, TrendingUp, Camera, AlertTriangle } from 'lucide-react';
import { format, isToday } from 'date-fns';

export default function Dashboard({ onNavigate, refreshKey }) {
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, completionPercentage: 0, todayCompleted: 0 });
    const [progress, setProgress] = useState({ score: 0 });
    const [taskStreak, setTaskStreak] = useState({ current: 0, longest: 0 });
    const [photoStreak, setPhotoStreak] = useState({ current: 0, longest: 0 });
    const [todayTasks, setTodayTasks] = useState([]);
    const [insights, setInsights] = useState([]);
    const [oldTaskCount, setOldTaskCount] = useState(0);
    const [showArchivePrompt, setShowArchivePrompt] = useState(false);

    useEffect(() => {
        refresh();
    }, [refreshKey]);

    function refresh() {
        // Dashboard uses active-only stats and score
        setStats(getDashboardStats());
        setProgress(getDashboardScore());
        setTaskStreak(getTaskStreak());
        setPhotoStreak(getPhotoStreak());
        setInsights(getDashboardInsights());

        // Today's tasks: active, not completed, relevant to today
        const tasks = getTasks();
        const today = tasks.filter(
            (t) =>
                !t.completed &&
                (t.type === 'daily' ||
                    t.type === 'weekly' ||
                    isToday(new Date(t.created_date)))
        );
        setTodayTasks(today.slice(0, 8));

        const oldCount = getOldTaskCount();
        setOldTaskCount(oldCount);
        if (oldCount > 0) setShowArchivePrompt(true);
    }

    function handleToggle(task) {
        if (task.completed) {
            uncompleteTask(task.id);
        } else {
            completeTask(task.id);
        }
        refresh();
    }

    function handleArchive() {
        archiveOldTasks();
        setShowArchivePrompt(false);
        refresh();
    }

    return (
        <div className="dashboard">
            {showArchivePrompt && (
                <div className="archive-banner">
                    <AlertTriangle size={18} />
                    <span>
                        You have <strong>{oldTaskCount}</strong> tasks older than 30 days.
                    </span>
                    <button onClick={() => onNavigate('export')} className="btn-sm btn-outline">
                        Export First
                    </button>
                    <button onClick={handleArchive} className="btn-sm btn-primary">
                        Archive Now
                    </button>
                    <button onClick={() => setShowArchivePrompt(false)} className="btn-sm btn-ghost">
                        Dismiss
                    </button>
                </div>
            )}

            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="subtitle">{format(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card stat-card--score" onClick={() => onNavigate('analytics')}>
                    <div className="stat-icon"><TrendingUp size={22} /></div>
                    <div className="stat-value">{progress.score}</div>
                    <div className="stat-label">Progress Score</div>
                    <div className="stat-bar">
                        <div className="stat-bar-fill" style={{ width: `${progress.score}%` }}></div>
                    </div>
                </div>
                <div className="stat-card" onClick={() => onNavigate('tasks')}>
                    <div className="stat-icon"><CheckCircle2 size={22} /></div>
                    <div className="stat-value">{stats.completed}<span className="stat-total">/{stats.total}</span></div>
                    <div className="stat-label">Tasks Completed</div>
                    <div className="stat-bar">
                        <div className="stat-bar-fill" style={{ width: `${stats.completionPercentage}%` }}></div>
                    </div>
                </div>
                <div className="stat-card">
                    <StreakCounter value={taskStreak.current} label="Task Streak" best={taskStreak.longest} />
                </div>
                <div className="stat-card" onClick={() => onNavigate('photos')}>
                    <StreakCounter value={photoStreak.current} label="Photo Streak" best={photoStreak.longest} icon="📸" />
                </div>
            </div>

            {/* Main Content Row */}
            <div className="dashboard-content">
                {/* Today's Tasks */}
                <div className="card today-tasks">
                    <div className="card-header">
                        <h2><Clock size={18} /> Today's Tasks</h2>
                        <button className="btn-sm btn-ghost" onClick={() => onNavigate('tasks')}>View All</button>
                    </div>
                    {todayTasks.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">✅</span>
                            <p>All caught up for today!</p>
                        </div>
                    ) : (
                        <ul className="task-list">
                            {todayTasks.map((task) => (
                                <li key={task.id} className={`task-item ${task.completed ? 'task-item--done' : ''}`}>
                                    <button className="task-toggle" onClick={() => handleToggle(task)}>
                                        {task.completed
                                            ? <CheckCircle2 size={18} className="icon-done" />
                                            : <Circle size={18} />}
                                    </button>
                                    <span className="task-title">{task.title}</span>
                                    <span className={`task-type-badge task-type-badge--${task.type}`}>{" "+task.type}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Insights */}
                <div className="card insights-card">
                    <div className="card-header">
                        <h2>💡 Insights</h2>
                    </div>
                    <ul className="insights-list">
                        {insights.map((insight, i) => (
                            <li key={i} className={`insight-item insight-item--${insight.type}`}>
                                <span className="insight-icon">{insight.icon}</span>
                                <span className="insight-text">{insight.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
