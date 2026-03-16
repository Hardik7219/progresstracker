/**
 * Analytics Service — Progress score, trends, and insights.
 */
import { getTasks } from './storageService';
import { getTaskStreak } from './streakService';
import {
    startOfDay,
    subDays,
    format,
    startOfWeek,
    differenceInCalendarDays,
} from 'date-fns';

// ─── Basic Stats ────────────────────────────────────────────

export function getBasicStats() {
    const tasks = getTasks();
    const completed = tasks.filter((t) => t.completed);
    const total = tasks.length;
    const completedCount = completed.length;
    const completionPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return {
        total,
        completed: completedCount,
        pending: total - completedCount,
        completionPercentage,
    };
}

// ─── Consistency Rate ───────────────────────────────────────

function getConsistencyRate() {
    const tasks = getTasks();
    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter((t) => t.completed && t.completion_date);
    if (completedTasks.length === 0) return 0;

    // Find earliest task creation date
    const dates = tasks.map((t) => new Date(t.created_date));
    const earliest = new Date(Math.min(...dates));
    const today = startOfDay(new Date());
    const totalDays = Math.max(differenceInCalendarDays(today, startOfDay(earliest)) + 1, 1);

    // Count unique active days
    const activeDays = new Set();
    completedTasks.forEach((t) => {
        activeDays.add(format(new Date(t.completion_date), 'yyyy-MM-dd'));
    });

    return Math.min(activeDays.size / totalDays, 1);
}

// ─── Progress Score ─────────────────────────────────────────

export function getProgressScore() {
    const stats = getBasicStats();
    const streak = getTaskStreak();
    const consistencyRate = getConsistencyRate();

    const completionComponent = stats.total > 0
        ? (stats.completed / stats.total) * 50
        : 0;
    const streakComponent = Math.min(streak.current * 5, 25); // cap at 25
    const consistencyComponent = consistencyRate * 45;

    const score = Math.round(
        Math.min(completionComponent + streakComponent + consistencyComponent, 100)
    );

    return {
        score,
        completionComponent: Math.round(completionComponent),
        streakComponent: Math.round(streakComponent),
        consistencyComponent: Math.round(consistencyComponent),
        consistencyRate: Math.round(consistencyRate * 100),
    };
}

// ─── Daily Completion Trends (last 14 days) ─────────────────

export function getDailyTrends(numDays = 14) {
    const tasks = getTasks().filter((t) => t.completed && t.completion_date);
    const trends = [];

    for (let i = numDays - 1; i >= 0; i--) {
        const day = startOfDay(subDays(new Date(), i));
        const dayStr = format(day, 'yyyy-MM-dd');
        const label = format(day, 'MMM dd');
        const count = tasks.filter(
            (t) => format(new Date(t.completion_date), 'yyyy-MM-dd') === dayStr
        ).length;
        trends.push({ date: dayStr, label, count });
    }

    return trends;
}

// ─── Weekly Completion Trends (last 8 weeks) ────────────────

export function getWeeklyTrends(numWeeks = 8) {
    const tasks = getTasks().filter((t) => t.completed && t.completion_date);
    const trends = [];

    for (let i = numWeeks - 1; i >= 0; i--) {
        const weekStart = startOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 });
        const weekEnd = subDays(
            startOfWeek(subDays(new Date(), (i - 1) * 7), { weekStartsOn: 1 }),
            1
        );
        const label = format(weekStart, 'MMM dd');
        const count = tasks.filter((t) => {
            const d = new Date(t.completion_date);
            return d >= weekStart && d <= weekEnd;
        }).length;
        trends.push({ weekStart: format(weekStart, 'yyyy-MM-dd'), label, count });
    }

    return trends;
}

// ─── Improvement Trend ──────────────────────────────────────

export function getImprovementTrend() {
    const daily = getDailyTrends(14);
    if (daily.length < 4) return { trend: 'neutral', message: 'Not enough data yet' };

    const firstHalf = daily.slice(0, 7);
    const secondHalf = daily.slice(7);

    const firstAvg = firstHalf.reduce((s, d) => s + d.count, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, d) => s + d.count, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;

    if (diff > 0.5) {
        return {
            trend: 'improving',
            message: `You're completing ${diff.toFixed(1)} more tasks/day than last week!`,
            icon: '📈',
        };
    } else if (diff < -0.5) {
        return {
            trend: 'declining',
            message: `Your completion rate dropped by ${Math.abs(diff).toFixed(1)} tasks/day. Stay motivated!`,
            icon: '📉',
        };
    }
    return {
        trend: 'stable',
        message: 'Your productivity is consistent. Keep it up!',
        icon: '📊',
    };
}

// ─── Productivity Insights ──────────────────────────────────

export function getInsights() {
    const stats = getBasicStats();
    const streak = getTaskStreak();
    const progress = getProgressScore();
    const trend = getImprovementTrend();
    const insights = [];

    if (stats.total === 0) {
        insights.push({
            icon: '🚀',
            text: 'Create your first task to get started!',
            type: 'info',
        });
        return insights;
    }

    // Score-based
    if (progress.score >= 80) {
        insights.push({ icon: '🏆', text: 'Outstanding productivity! You\'re in the top tier.', type: 'success' });
    } else if (progress.score >= 50) {
        insights.push({ icon: '💪', text: 'Good progress! Keep pushing to reach 80+.', type: 'info' });
    } else {
        insights.push({ icon: '🌱', text: 'Room for growth. Try completing more tasks daily.', type: 'warning' });
    }

    // Streak-based
    if (streak.current >= 7) {
        insights.push({ icon: '🔥', text: `Amazing ${streak.current}-day streak! You're on fire!`, type: 'success' });
    } else if (streak.current >= 3) {
        insights.push({ icon: '⚡', text: `${streak.current}-day streak! Build momentum.`, type: 'info' });
    } else if (streak.current === 0) {
        insights.push({ icon: '💡', text: 'Complete a task today to start a new streak!', type: 'warning' });
    }

    // Trend
    insights.push({ icon: trend.icon, text: trend.message, type: trend.trend === 'improving' ? 'success' : 'info' });

    // Completion rate
    if (stats.completionPercentage < 30 && stats.total > 5) {
        insights.push({ icon: '📋', text: 'Many pending tasks. Consider prioritizing or removing outdated ones.', type: 'warning' });
    }

    return insights;
}
