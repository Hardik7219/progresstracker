/**
 * Storage Service — localStorage-based CRUD for tasks, photos, settings.
 * Handles 30-day auto-archive logic.
 */

const KEYS = {
    TASKS: 'pt_tasks',
    PHOTOS: 'pt_photos',
    ARCHIVED_TASKS: 'pt_archived_tasks',
    SETTINGS: 'pt_settings',
    STREAKS: 'pt_streaks',
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
        title: task.title,
        description: task.description || '',
        type: task.type || 'one-time', // one-time | daily | weekly
        created_date: new Date().toISOString(),
        completed: false,
        completion_date: null,
    };
    tasks.push(newTask);
    write(KEYS.TASKS, tasks);
    return newTask;
}
export function updatePhoto(id, newImage) {
    const photos = getPhotos();

    const updated = photos.map((p) =>
        p.id === id ? { ...p, image_path: newImage } : p
    );

    localStorage.setItem("photos", JSON.stringify(updated));
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
    return updateTask(id, {
        completed: true,
        completion_date: new Date().toISOString(),
    });
}
export function resetDailyTasks() {
    const tasks = getTasks();

    const today = new Date();
    today.setHours(0,0,0,0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const archived = getArchivedTasks();

    const updated = tasks.filter(task => {

        if (task.type !== "daily") return true;

        const created = new Date(task.created_date);
        created.setHours(0,0,0,0);

        const completed_date = task.completion_date 
            ? new Date(task.completion_date) 
            : null;

        if (completed_date) {
            completed_date.setHours(0,0,0,0);
        }

        console.log(completed_date, "vs", yesterday);

        // reset if completed yesterday
        if (
            completed_date &&
            completed_date.getTime() === yesterday.getTime() &&
            task.type !== "one-time" &&
            task.completed
        ) {
            task.completion_date = null;
            task.completed = false;
        }
        if(completed_date && completed_date.getTime() === yesterday.getTime() && task.type == "one-time" && task.completed)
        {
            console.log(task)
            write(KEYS.ARCHIVED_TASKS, [...archived, ...task]);
        }
        return true;
    });

    write(KEYS.TASKS, updated);
}
export function uncompleteTask(id) {
    return updateTask(id, {
        completed: false,
        completion_date: null,
    });
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

    const toArchive = tasks.filter(
        (t) => new Date(t.created_date) < thirtyDaysAgo
    );
    const toKeep = tasks.filter(
        (t) => new Date(t.created_date) >= thirtyDaysAgo
    );

    if (toArchive.length > 0) {
        const archived = getArchivedTasks();
        write(KEYS.ARCHIVED_TASKS, [...archived, ...toArchive]);
        write(KEYS.TASKS, toKeep);
    }

    return toArchive;
}

export function clearArchivedTasks() {
    write(KEYS.ARCHIVED_TASKS, []);
}

export function getOldTaskCount() {
    const tasks = getTasks();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return tasks.filter((t) => new Date(t.created_date) < thirtyDaysAgo).length;
}

// ─── Photos ─────────────────────────────────────────────────

export function getPhotos() {
    return read(KEYS.PHOTOS) || [];
}

export function addPhoto(imagePath) {
    const photos = getPhotos();
    const newPhoto = {
        id: generateId(),
        image_path: imagePath,
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
        tasks: getTasks(),
        archivedTasks: getArchivedTasks(),
        photos: getPhotos(),
        settings: getSettings(),
        exportDate: new Date().toISOString(),
    };
}
