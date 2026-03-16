/**
 * Streak Service — Calculates task and photo streaks.
 */
import { getTasks, getPhotos } from './storageService';
import { startOfDay, subDays, isSameDay, differenceInCalendarDays } from 'date-fns';

// ─── Task Streak ────────────────────────────────────────────

/**
 * Get dates on which at least one task was completed.
 */
function getTaskCompletionDates() {
    const tasks = getTasks().filter((t) => t.completed && t.completion_date);
    const dateSet = new Set();
    tasks.forEach((t) => {
        const day = startOfDay(new Date(t.completion_date)).toISOString();
        dateSet.add(day);
    });
    return Array.from(dateSet)
        .map((d) => new Date(d))
        .sort((a, b) => b - a); // newest first
}

/**
 * Calculate current streak (consecutive days with completions up to today).
 */
export function getTaskStreak() {
    const dates = getTaskCompletionDates();
    if (dates.length === 0) return { current: 0, longest: 0 };

    const today = startOfDay(new Date());
    let current = 0;
    let longest = 0;
    let tempStreak = 0;

    // Sort oldest first for longest streak calculation
    const sortedAsc = [...dates].sort((a, b) => a - b);

    // Calculate longest streak
    for (let i = 0; i < sortedAsc.length; i++) {
        if (i === 0) {
            tempStreak = 1;
        } else {
            const diff = differenceInCalendarDays(sortedAsc[i], sortedAsc[i - 1]);
            if (diff === 1) {
                tempStreak++;
            } else if (diff > 1) {
                tempStreak = 1;
            }
            // diff === 0 means same day, skip
        }
        longest = Math.max(longest, tempStreak);
    }

    // Calculate current streak (working backward from today)
    const hasToday = dates.some((d) => isSameDay(d, today));
    const hasYesterday = dates.some((d) => isSameDay(d, subDays(today, 1)));

    if (hasToday || hasYesterday) {
        let checkDay = hasToday ? today : subDays(today, 1);
        current = 0;
        while (dates.some((d) => isSameDay(d, checkDay))) {
            current++;
            checkDay = subDays(checkDay, 1);
        }
    }

    return { current, longest: Math.max(longest, current) };
}

// ─── Photo Streak ───────────────────────────────────────────

function getPhotoUploadDates() {
    const photos = getPhotos();
    const dateSet = new Set();
    photos.forEach((p) => {
        const day = startOfDay(new Date(p.date_uploaded)).toISOString();
        dateSet.add(day);
    });
    return Array.from(dateSet)
        .map((d) => new Date(d))
        .sort((a, b) => b - a);
}

export function getPhotoStreak() {
    const dates = getPhotoUploadDates();
    if (dates.length === 0) return { current: 0, longest: 0 };

    const today = startOfDay(new Date());
    let current = 0;
    let longest = 0;
    let tempStreak = 0;

    const sortedAsc = [...dates].sort((a, b) => a - b);

    for (let i = 0; i < sortedAsc.length; i++) {
        if (i === 0) {
            tempStreak = 1;
        } else {
            const diff = differenceInCalendarDays(sortedAsc[i], sortedAsc[i - 1]);
            if (diff === 1) {
                tempStreak++;
            } else if (diff > 1) {
                tempStreak = 1;
            }
        }
        longest = Math.max(longest, tempStreak);
    }

    const hasToday = dates.some((d) => isSameDay(d, today));
    const hasYesterday = dates.some((d) => isSameDay(d, subDays(today, 1)));

    if (hasToday || hasYesterday) {
        let checkDay = hasToday ? today : subDays(today, 1);
        current = 0;
        while (dates.some((d) => isSameDay(d, checkDay))) {
            current++;
            checkDay = subDays(checkDay, 1);
        }
    }

    return { current, longest: Math.max(longest, current) };
}

// ─── Activity Map (for heatmap) ─────────────────────────────

export function getActivityMap(days = 365) {
    const tasks = getTasks().filter((t) => t.completed && t.completion_date);
    const map = {};

    for (let i = 0; i < days; i++) {
        const day = startOfDay(subDays(new Date(), i)).toISOString().split('T')[0];
        map[day] = 0;
    }

    tasks.forEach((t) => {
        const day = startOfDay(new Date(t.completion_date))
            .toISOString()
            .split('T')[0];
        if (map[day] !== undefined) {
            map[day]++;
        }
    });

    return map;
}
