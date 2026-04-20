/**
 * Storage Service — localStorage-based CRUD for tasks, photos, settings.
 *
 * KEY DESIGN:
 * - pt_tasks           → active tasks (daily/weekly reset each day, one-time until archived)
 * - pt_archived_tasks  → tasks moved after 30 days (stamped with archived_date)
 * - pt_completion_log  → permanent log of every completion event (task_id, task_title,
 *                         task_type, completed_on). Never deleted automatically.
 *                         This is the source of truth for all analytics history.
 * - pt_photos          → photo journal entries
 * - pt_settings        → user preferences
 */

const KEYS = {
    TASKS:          'pt_tasks',
    PHOTOS:         'pt_photos',
    ARCHIVED_TASKS: 'pt_archived_tasks',
    COMPLETION_LOG: 'pt_completion_log',
    SETTINGS:       'pt_settings',
};

// ─── Helpers ────────────────────────────────────────────────

function read(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

// ─── Completion Log ─────────────────────────────────────────
// A permanent append-only log of every completion event.
// Each entry: { id, task_id, task_title, task_type, completed_on }
// This survives task archiving, resets, and deletion.

export function getCompletionLog() {
    return read(KEYS.COMPLETION_LOG) || [];
}

function appendCompletionLog(task) {
    const log = getCompletionLog();
    // Avoid duplicate entries for the same task on the same day
    const today = new Date().toISOString().split('T')[0];
    const alreadyLogged = log.some(
        (e) => e.task_id === task.id && e.completed_on.startsWith(today)
    );
    if (alreadyLogged) return;

    log.push({
        id: generateId(),
        task_id:    task.id,
        task_title: task.title,
        task_type:  task.type,
        completed_on: new Date().toISOString(),
    });
    write(KEYS.COMPLETION_LOG, log);
}

// ─── Tasks ──────────────────────────────────────────────────

export function getTasks() {
    return read(KEYS.TASKS) || [];
}

export function getTask(id) {
    return getTasks().find((t) => t.id === id) || null;
}

export function addTask(task) {
    const tasks = getTasks();
    const newTask = {
        id: generateId(),
        title:       task.title,
        description: task.description || '',
        type:        task.type || 'one-time',
        created_date:    new Date().toISOString(),
        completed:       false,
        completion_date: null,
    };
    tasks.push(newTask);
    write(KEYS.TASKS, tasks);
    return newTask;
}

export function updateTask(id, updates) {
    const tasks = getTasks();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    tasks[idx] = { ...tasks[idx], ...updates };
    write(KEYS.TASKS, tasks);
    return tasks[idx];
}

export function deleteTask(id) {
    const tasks = getTasks().filter((t) => t.id !== id);
    write(KEYS.TASKS, tasks);
}

export function completeTask(id) {
    const task = getTask(id);
    if (!task) return null;

    const completedTask = {
        ...task,
        completed:       true,
        completion_date: new Date().toISOString(),
    };

    // Always write to completion log — preserves history even after removal
    appendCompletionLog(completedTask);

    // daily / weekly stay in the list so they can reset tomorrow
    return updateTask(id, {
        completed:       true,
        completion_date: completedTask.completion_date,
    });
}

export function uncompleteTask(id) {
    return updateTask(id, {
        completed:       false,
        completion_date: null,
    });
}

/**
 * Resets daily tasks that were completed yesterday back to pending.
 * Resets weekly tasks completed in a previous week.
 * Logs completions before resetting so history is never lost.
 */
export function resetDailyTasks() {
    const tasks = getTasks();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const updated = tasks
        .filter((task) => {
            if (task.type === 'one-time' && task.completed) {
                const cd = new Date(task.completion_date);
                cd.setHours(0, 0, 0, 0);
                return cd.getTime() === today.getTime(); // keep only if completed today
            }
            return true;
        })
        .map((task) => {
            if (!task.completed || !task.completion_date) return task;

            const cd = new Date(task.completion_date);
            cd.setHours(0, 0, 0, 0);

            if (task.type === 'daily' && cd.getTime() <= yesterday.getTime()) {
                appendCompletionLog({ ...task });
                return { ...task, completed: false, completion_date: null };
            }

            if (task.type === 'weekly') {
                const completedWeekStart = new Date(cd);
                completedWeekStart.setDate(cd.getDate() - cd.getDay());

                const currentWeekStart = new Date(today);
                currentWeekStart.setDate(today.getDate() - today.getDay());

                if (completedWeekStart < currentWeekStart) {
                    appendCompletionLog({ ...task });
                    return { ...task, completed: false, completion_date: null };
                }
            }

            return task;
        });

    write(KEYS.TASKS, updated);
}

// ─── Task Filtering ─────────────────────────────────────────

export function getTasksByType(type) {
    return getTasks().filter((t) => t.type === type);
}

export function getCompletedTasks() {
    return getTasks().filter((t) => t.completed);
}

export function getPendingTasks() {
    return getTasks().filter((t) => !t.completed);
}

// ─── 30-Day Archive ─────────────────────────────────────────

export function getArchivedTasks() {
    return read(KEYS.ARCHIVED_TASKS) || [];
}

export function archiveOldTasks() {
    const tasks = getTasks();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const toArchive = tasks.filter((t) => new Date(t.created_date) < thirtyDaysAgo);
    const toKeep    = tasks.filter((t) => new Date(t.created_date) >= thirtyDaysAgo);

    if (toArchive.length > 0) {
        const archived = getArchivedTasks();
        write(KEYS.ARCHIVED_TASKS, [
            ...archived,
            ...toArchive.map((t) => ({ ...t, archived_date: new Date().toISOString() })),
        ]);
        write(KEYS.TASKS, toKeep);
    }

    return toArchive;
}

export function clearArchivedTasks() {
    write(KEYS.ARCHIVED_TASKS, []);
    // Note: completion log is NOT cleared here — history is preserved
}

export function getOldTaskCount() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return getTasks().filter((t) => new Date(t.created_date) < thirtyDaysAgo).length;
}

// ─── getAllTasksForAnalytics ─────────────────────────────────
/**
 * Returns a unified list of "completion events" for the analytics layer.
 *
 * Sources (in priority order, deduplicated by task_id + date):
 *  1. Completion log  — permanent, covers daily/weekly history + archived one-time tasks
 *  2. Active tasks    — currently completed tasks not yet in the log
 *  3. Archived tasks  — completed one-time tasks moved to archive
 *
 * Each item is shaped like a task so analyticsService can use it directly.
 * Items older than 60 days are excluded (enough for 30-day charts + buffer).
 */
export function getAllTasksForAnalytics() {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // 1. Build synthetic task objects from the completion log
    const log = getCompletionLog();
    const logTasks = log
        .filter((e) => new Date(e.completed_on) >= sixtyDaysAgo)
        .map((e) => ({
            id:              e.task_id + '_log_' + e.id,
            title:           e.task_title,
            type:            e.task_type,
            completed:       true,
            completion_date: e.completed_on,
            created_date:    e.completed_on,
            _from_log:       true,
        }));

    // 2. Active tasks that are currently completed (may not be in log yet)
    const activeTasks = getTasks();

    // 3. Archived tasks (completed one-time tasks)
    const archivedTasks = getArchivedTasks()
        .filter((t) => {
            const ref = t.archived_date || t.created_date;
            return new Date(ref) >= sixtyDaysAgo;
        });

    // Merge: use log as primary, supplement with active/archived
    // Deduplicate: if a task_id + completion_date combo is already in log, skip it
    const loggedKeys = new Set(
        log.map((e) => e.task_id + '_' + e.completed_on.split('T')[0])
    );

    const supplemental = [...activeTasks, ...archivedTasks].filter((t) => {
        if (!t.completed || !t.completion_date) return false;
        const key = t.id + '_' + t.completion_date.split('T')[0];
        return !loggedKeys.has(key);
    });

    return [...logTasks, ...supplemental];
}

// ─── Photos ─────────────────────────────────────────────────

export function getPhotos() {
    return read(KEYS.PHOTOS) || [];
}

export function addPhoto(imagePath) {
    const photos = getPhotos();
    const newPhoto = {
        id:            generateId(),
        image_path:    imagePath,
        date_uploaded: new Date().toISOString(),
    };
    photos.push(newPhoto);
    write(KEYS.PHOTOS, photos);
    return newPhoto;
}

export function deletePhoto(id) {
    const photos = getPhotos().filter((p) => p.id !== id);
    write(KEYS.PHOTOS, photos);
}

export function updatePhoto(id, newImage) {
    const photos = getPhotos();
    const updated = photos.map((p) =>
        p.id === id ? { ...p, image_path: newImage } : p
    );
    // BUG FIX: was localStorage.setItem("photos", ...) — wrong key
    write(KEYS.PHOTOS, updated);
}

// ─── Settings ───────────────────────────────────────────────

export function getSettings() {
    return read(KEYS.SETTINGS) || { theme: 'dark' };
}

export function updateSettings(updates) {
    const settings = getSettings();
    write(KEYS.SETTINGS, { ...settings, ...updates });
}

// ─── Get All Data (for export) ──────────────────────────────

export function getAllData() {
    return {
        tasks:          getTasks(),
        archivedTasks:  getArchivedTasks(),
        completionLog:  getCompletionLog(),
        photos:         getPhotos(),
        settings:       getSettings(),
        exportDate:     new Date().toISOString(),
    };
}