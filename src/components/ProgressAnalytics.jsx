import React, { useState, useEffect } from 'react';
import {
    getBasicStats,
    getProgressScore,
    getDailyTrends,
    getWeeklyTrends,
    getImprovementTrend,
    getInsights,
} from '../services/analyticsService';
import { getTaskStreak } from '../services/streakService';
import CalendarHeatmap from './CalendarHeatmap';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { TrendingUp, Award, Target, Zap } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

export default function ProgressAnalytics({ refreshKey }) {
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, completionPercentage: 0 });
    const [progress, setProgress] = useState({ score: 0, completionComponent: 0, streakComponent: 0, consistencyComponent: 0, consistencyRate: 0 });
    const [daily, setDaily] = useState([]);
    const [weekly, setWeekly] = useState([]);
    const [streak, setStreak] = useState({ current: 0, longest: 0 });
    const [trend, setTrend] = useState({ trend: 'neutral', message: '', icon: '' });
    const [insights, setInsights] = useState([]);
    const [chartView, setChartView] = useState('daily');

    useEffect(() => {
        setStats(getBasicStats());
        setProgress(getProgressScore());
        setDaily(getDailyTrends());
        setWeekly(getWeeklyTrends());
        setStreak(getTaskStreak());
        setTrend(getImprovementTrend());
        setInsights(getInsights());

        // const sendData = new FormData();
        // sendData.append(stats)
        // sendData.append(progress)
        // sendData.append(daily)
        // sendData.append(weekly)
        // sendData.append(streak)
        // sendData.append(trend)
        // sendData.append(insights)
    }, [refreshKey]);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const textColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';

    const dailyChartData = {
        labels: daily.map((d) => d.label),
        datasets: [
            {
                label: 'Completed Tasks',
                data: daily.map((d) => d.count),
                backgroundColor: 'rgba(99, 102, 241, 0.3)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                pointRadius: 4,
            },
        ],
    };

    const weeklyChartData = {
        labels: weekly.map((w) => w.label),
        datasets: [
            {
                label: 'Completed Tasks',
                data: weekly.map((w) => w.count),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1, color: textColor },
                grid: { color: gridColor },
            },
            x: {
                ticks: { color: textColor, maxRotation: 45 },
                grid: { display: false },
            },
        },
    };

    const doughnutData = {
        labels: ['Completion', 'Streak', 'Consistency'],
        datasets: [
            {
                data: [
                    progress.completionComponent,
                    progress.streakComponent,
                    progress.consistencyComponent,
                ],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                ],
                borderWidth: 0,
            },
        ],
    };

    return (
        <div className="analytics-page">
            <div className="page-header">
                <div>
                    <h1>Progress Analytics</h1>
                    <p className="subtitle">Track your productivity over time</p>
                </div>
            </div>

            {/* Score Overview */}
            <div className="analytics-score-section">
                <div className="score-circle-container">
                    <div className="score-circle">
                        <svg viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-border)" strokeWidth="8" />
                            <circle
                                cx="60"
                                cy="60"
                                r="54"
                                fill="none"
                                stroke="var(--color-primary)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${(progress.score / 100) * 339.3} 339.3`}
                                transform="rotate(-90 60 60)"
                                className="score-ring"
                            />
                        </svg>
                        <div className="score-value">
                            <span className="score-num">{progress.score}</span>
                            <span className="score-label">Score</span>
                        </div>
                    </div>
                </div>

                <div className="score-breakdown">
                    <h3>Score Breakdown</h3>
                    <div className="breakdown-item">
                        <div className="breakdown-header">
                            <Target size={16} />
                            <span>Task Completion</span>
                            <span className="breakdown-value">{progress.completionComponent}/50</span>
                        </div>
                        <div className="breakdown-bar">
                            <div className="breakdown-fill fill-primary" style={{ width: `${(progress.completionComponent / 50) * 100}%` }}></div>
                        </div>
                    </div>
                    <div className="breakdown-item">
                        <div className="breakdown-header">
                            <Zap size={16} />
                            <span>Streak Bonus</span>
                            <span className="breakdown-value">{progress.streakComponent}/25</span>
                        </div>
                        <div className="breakdown-bar">
                            <div className="breakdown-fill fill-amber" style={{ width: `${(progress.streakComponent / 25) * 100}%` }}></div>
                        </div>
                    </div>
                    <div className="breakdown-item">
                        <div className="breakdown-header">
                            <Award size={16} />
                            <span>Consistency</span>
                            <span className="breakdown-value">{progress.consistencyComponent}/45</span>
                        </div>
                        <div className="breakdown-bar">
                            <div className="breakdown-fill fill-emerald" style={{ width: `${(progress.consistencyComponent / 45) * 100}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="score-doughnut">
                    <Doughnut
                        data={doughnutData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: true,
                            cutout: '65%',
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: { color: textColor, padding: 12, usePointStyle: true },
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {/* Stats Row */}
            <div className="analytics-stats">
                <div className="mini-stat">
                    <span className="mini-stat-value">{stats.total}</span>
                    <span className="mini-stat-label">Total Tasks</span>
                </div>
                <div className="mini-stat">
                    <span className="mini-stat-value">{stats.completed}</span>
                    <span className="mini-stat-label">Completed</span>
                </div>
                <div className="mini-stat">
                    <span className="mini-stat-value">{stats.completionPercentage}%</span>
                    <span className="mini-stat-label">Completion Rate</span>
                </div>
                <div className="mini-stat">
                    <span className="mini-stat-value">{streak.current}</span>
                    <span className="mini-stat-label">Current Streak</span>
                </div>
                <div className="mini-stat">
                    <span className="mini-stat-value">{progress.consistencyRate}%</span>
                    <span className="mini-stat-label">Consistency</span>
                </div>
            </div>

            {/* Trend Insight */}
            <div className={`trend-card trend-${trend.trend}`}>
                <span className="trend-icon">{trend.icon}</span>
                <span className="trend-text">{trend.message}</span>
            </div>

            {/* Charts */}
            <div className="card chart-card">
                <div className="card-header">
                    <h2><TrendingUp size={18} /> Completion Trends</h2>
                    <div className="chart-toggle">
                        <button
                            className={`filter-btn ${chartView === 'daily' ? 'active' : ''}`}
                            onClick={() => setChartView('daily')}
                        >
                            Daily
                        </button>
                        <button
                            className={`filter-btn ${chartView === 'weekly' ? 'active' : ''}`}
                            onClick={() => setChartView('weekly')}
                        >
                            Weekly
                        </button>
                    </div>
                </div>
                <div className="chart-container">
                    {chartView === 'daily' ? (
                        <Line data={dailyChartData} options={chartOptions} />
                    ) : (
                        <Bar data={weeklyChartData} options={chartOptions} />
                    )}
                </div>
            </div>

            {/* Calendar Heatmap */}
            <div className="card">
                <div className="card-header">
                    <h2>📅 Activity Heatmap</h2>
                </div>
                <CalendarHeatmap />
            </div>

            {/* Insights */}
            {insights.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h2>💡 Insights</h2>
                    </div>
                    <ul className="insights-list">
                        {insights.map((ins, i) => (
                            <li key={i} className={`insight-item insight-${ins.type}`}>
                                <span className="insight-icon">{ins.icon}</span>
                                <span className="insight-text">{ins.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
