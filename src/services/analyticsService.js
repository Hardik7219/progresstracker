/**
 * Analytics Service — Progress score, trends, and insights.
 *
 * TWO DATA SCOPES:
 *
 * 1. DASHBOARD SCOPE  → getTasks() only (active tasks, today-focused)
 *    Functions: getDashboardStats(), getDashboardScore(), getDashboardInsights()
 *
 * 2. ANALYTICS SCOPE  → getAllTasksForAnalytics() (completion log + active + archived)
 *    This is permanent history — never resets, never drops off after 30/60 days.
 *    Functions: getBasicStats(), getProgressScore(), getDailyTrends(),
 *               getWeeklyTrends(), getImprovementTrend(), getInsights()
 */
import { getTasks, getAllTasksForAnalytics } from './storageService';
import { getTaskStreak } from './streakService';
import {
    startOfDay,
    subDays,
    format,
    startOfWeek,
    isToday,
    differenceInCalendarDays,
} from 'date-fns';

// ═══════════════════════════════════════════════════════════
//  DASHBOARD SCOPE — active tasks only, today-focused
// ═══════════════════════════════════════════════════════════

export function getDashboardStats() {
    const tasks = getTasks();
    const total = tasks.length;
    const completedCount = tasks.filter((t) => t.completed).length;
    const completionPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    const todayCompleted = tasks.filter(
        (t) => t.completed && t.completion_date && isToday(new Date(t.completion_date))
    ).length;

    return { total, completed: completedCount, pending: total - completedCount, completionPercentage, todayCompleted };
}
function generateHash(data) {
    return JSON.stringify(data);
}
export async function sendData(id) {
    const basicStats = getBasicStats();
    const progressScore = getProgressScore();
    const dailyTreads = getDailyTrends();
    const weeklyTreads = getWeeklyTrends();
    const improveTread = getImprovementTrend();

    const formData = {
        user: id,
        basicStats,
        progressScore,
        dailyTreads,
        weeklyTreads,
        improveTread
    };

    const newHash = generateHash(formData);
    const oldHash = localStorage.getItem('lastAnalyticsHash');

    if (newHash === oldHash) {
        console.log(" No changes, skipping sync");
        return;
    }

    try {
        const res =  await fetch(`${import.meta.env.VITE_API_URL}/analys`, {
            method: 'POST',
            credentials: 'include', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (!res.ok) throw new Error("Failed");

        localStorage.setItem('lastAnalyticsHash', newHash); 

        console.log(" Synced successfully");

    } catch (err) {
        console.error(" Sync failed:", err);
    }
}
export function getDashboardScore() {
    const stats = getDashboardStats();
    const streak = getTaskStreak();

    const completionComponent = stats.total > 0 ? (stats.completed / stats.total) * 50 : 0;
    const streakComponent = Math.min(streak.current * 5, 25);

    // Consistency: days with at least one completion in last 7 days (active tasks only)
    const tasks = getTasks().filter((t) => t.completed && t.completion_date);
    const activeDays = new Set();
    for (let i = 0; i < 7; i++) {
        const dayStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
        if (tasks.some((t) => format(new Date(t.completion_date), 'yyyy-MM-dd') === dayStr)) {
            activeDays.add(dayStr);
        }
    }
    const consistencyComponent = (activeDays.size / 7) * 25;

    return {
        score: Math.round(Math.min(completionComponent + streakComponent + consistencyComponent, 100)),
    };
}

export function getDashboardInsights() {
    const stats = getDashboardStats();
    const streak = getTaskStreak();
    const { score } = getDashboardScore();
    const insights = [];

    if (stats.total === 0) {
        insights.push({ icon: '🚀', text: 'Create your first task to get started!', type: 'info' });
        return insights;
    }

    if (score >= 80) {
        insights.push({ icon: '🏆', text: "Outstanding productivity! You're in the top tier.", type: 'success' });
    } else if (score >= 50) {
        insights.push({ icon: '💪', text: 'Good progress! Keep pushing to reach 80+.', type: 'info' });
    } else {
        insights.push({ icon: '🌱', text: 'Room for growth. Try completing more tasks daily.', type: 'warning' });
    }

    if (streak.current >= 7) {
        insights.push({ icon: '🔥', text: `Amazing ${streak.current}-day streak! You're on fire!`, type: 'success' });
    } else if (streak.current >= 3) {
        insights.push({ icon: '⚡', text: `${streak.current}-day streak! Build momentum.`, type: 'info' });
    } else if (streak.current === 0) {
        insights.push({ icon: '💡', text: 'Complete a task today to start a new streak!', type: 'warning' });
    }

    if (stats.completionPercentage < 30 && stats.total > 5) {
        insights.push({ icon: '📋', text: 'Many pending tasks. Consider prioritizing or removing outdated ones.', type: 'warning' });
    }

    return insights;
}


// ═══════════════════════════════════════════════════════════
//  ANALYTICS SCOPE — permanent history via completion log
//  Data here NEVER resets — not on daily reset, not on archive,
//  not after 30/60 days. The completion log is the source of truth.
// ═══════════════════════════════════════════════════════════

export function getBasicStats() {
    const tasks = getAllTasksForAnalytics();
    const total = tasks.length;
    const completedCount = tasks.filter((t) => t.completed).length;
    const completionPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return { total, completed: completedCount, pending: total - completedCount, completionPercentage };
}

function getConsistencyRate() {
    const tasks = getAllTasksForAnalytics();
    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter((t) => t.completed && t.completion_date);
    if (completedTasks.length === 0) return 0;

    const dates = tasks.map((t) => new Date(t.created_date));
    const earliest = new Date(Math.min(...dates));
    const today = startOfDay(new Date());
    const totalDays = Math.max(differenceInCalendarDays(today, startOfDay(earliest)) + 1, 1);

    const activeDays = new Set();
    completedTasks.forEach((t) => {
        activeDays.add(format(new Date(t.completion_date), 'yyyy-MM-dd'));
    });

    return Math.min(activeDays.size / totalDays, 1);
}

export function getProgressScore() {
    const stats = getBasicStats();
    const streak = getTaskStreak();
    const consistencyRate = getConsistencyRate();

    const completionComponent  = stats.total > 0 ? (stats.completed / stats.total) * 50 : 0;
    const streakComponent      = Math.min(streak.current * 5, 25);
    const consistencyComponent = consistencyRate * 45;

    const score = Math.round(
        Math.min(completionComponent + streakComponent + consistencyComponent, 100)
    );

    return {
        score,
        completionComponent:  Math.round(completionComponent),
        streakComponent:      Math.round(streakComponent),
        consistencyComponent: Math.round(consistencyComponent),
        consistencyRate:      Math.round(consistencyRate * 100),
    };
}

export function getDailyTrends(numDays = 14) {
    const tasks = getAllTasksForAnalytics().filter((t) => t.completed && t.completion_date);
    const trends = [];

    for (let i = numDays - 1; i >= 0; i--) {
        const day    = startOfDay(subDays(new Date(), i));
        const dayStr = format(day, 'yyyy-MM-dd');
        const label  = format(day, 'MMM dd');
        const count  = tasks.filter(
            (t) => format(new Date(t.completion_date), 'yyyy-MM-dd') === dayStr
        ).length;
        trends.push({ date: dayStr, label, count });
    }

    return trends;
}

export function getWeeklyTrends(numWeeks = 8) {
    const tasks = getAllTasksForAnalytics().filter((t) => t.completed && t.completion_date);
    const trends = [];

    for (let i = numWeeks - 1; i >= 0; i--) {
        const weekStart = startOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 });
        const weekEnd   = subDays(
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

export function getImprovementTrend() {
    const daily = getDailyTrends(14);
    if (daily.length < 4) return { trend: 'neutral', message: 'Not enough data yet', icon: '📊' };

    const firstHalf  = daily.slice(0, 7);
    const secondHalf = daily.slice(7);

    const firstAvg  = firstHalf.reduce((s, d) => s + d.count, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, d) => s + d.count, 0) / secondHalf.length;
    const diff = secondAvg - firstAvg;

    if (diff > 0.5) {
        return { trend: 'improving', message: `You're completing ${diff.toFixed(1)} more tasks/day than last week!`, icon: '📈' };
    } else if (diff < -0.5) {
        return { trend: 'declining', message: `Your completion rate dropped by ${Math.abs(diff).toFixed(1)} tasks/day. Stay motivated!`, icon: '📉' };
    }
    return { trend: 'stable', message: 'Your productivity is consistent. Keep it up!', icon: '📊' };
}

export function getInsights() {
    const stats    = getBasicStats();
    const streak   = getTaskStreak();
    const progress = getProgressScore();
    const trend    = getImprovementTrend();
    const insights = [];

    if (stats.total === 0) {
        insights.push({ icon: '🚀', text: 'Create your first task to get started!', type: 'info' });
        return insights;
    }

    if (progress.score >= 80) {
        insights.push({ icon: '🏆', text: "Outstanding productivity! You're in the top tier.", type: 'success' });
    } else if (progress.score >= 50) {
        insights.push({ icon: '💪', text: 'Good progress! Keep pushing to reach 80+.', type: 'info' });
    } else {
        insights.push({ icon: '🌱', text: 'Room for growth. Try completing more tasks daily.', type: 'warning' });
    }

    if (streak.current >= 7) {
        insights.push({ icon: '🔥', text: `Amazing ${streak.current}-day streak! You're on fire!`, type: 'success' });
    } else if (streak.current >= 3) {
        insights.push({ icon: '⚡', text: `${streak.current}-day streak! Build momentum.`, type: 'info' });
    } else if (streak.current === 0) {
        insights.push({ icon: '💡', text: 'Complete a task today to start a new streak!', type: 'warning' });
    }

    insights.push({ icon: trend.icon, text: trend.message, type: trend.trend === 'improving' ? 'success' : 'info' });

    if (stats.completionPercentage < 30 && stats.total > 5) {
        insights.push({ icon: '📋', text: 'Many pending tasks. Consider prioritizing or removing outdated ones.', type: 'warning' });
    }

    return insights;
}