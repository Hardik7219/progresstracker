import React, { useState, useEffect } from 'react';
import {
    getTasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    resetDailyTasks,
} from '../services/storageService';
import TaskForm from './TaskForm';
import {
    Plus,
    CheckCircle2,
    Circle,
    Edit3,
    Trash2,
    Filter,
    Search,
} from 'lucide-react';
import { format } from 'date-fns';

export default function TaskManager({ onRefresh }) {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('all');       // all | one-time | daily | weekly
    const [statusFilter, setStatusFilter] = useState('all'); // all | pending | completed
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    useEffect(() => {
        loadTasks();
    }, []);

    function loadTasks() {
        resetDailyTasks();
        const storedTasks = getTasks();
        setTasks([...storedTasks]);
        onRefresh?.();
    }

    function handleAdd(taskData) {
        addTask(taskData);
        setShowForm(false);
        loadTasks();
    }

    function handleEdit(taskData) {
        updateTask(editingTask.id, taskData);
        setEditingTask(null);
        setShowForm(false);
        loadTasks();
    }

    function handleDelete(id) {
        deleteTask(id);
        loadTasks();
    }

    function handleToggle(task) {
        if (task.completed) {
            uncompleteTask(task.id);
        } else {
            completeTask(task.id);
            // completeTask removes one-time tasks immediately — just reload
        }
        loadTasks();
    }

    function openEdit(task) {
        setEditingTask(task);
        setShowForm(true);
    }

    function openAdd() {
        setEditingTask(null);
        setShowForm(true);
    }

    const filtered = tasks
        .filter((t) => {
            // Hide completed one-time tasks — they are done and logged, no need to show them.
            // (This is a safety net; completeTask already removes them, but old data may linger.)
            if (t.type === 'one-time' && t.completed) return false;

            if (filter !== 'all' && t.type !== filter) return false;
            if (statusFilter === 'pending' && t.completed) return false;
            if (statusFilter === 'completed' && !t.completed) return false;
            if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => {
            // Pending first, then by newest created date
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return new Date(b.created_date) - new Date(a.created_date);
        });

    // For subtitle: don't count completed one-time tasks in totals (they're already gone)
    const visibleTotal     = tasks.filter((t) => !(t.type === 'one-time' && t.completed)).length;
    const visibleCompleted = tasks.filter((t) => t.completed && !(t.type === 'one-time')).length;

    return (
        <div className="task-manager">
            <div className="page-header">
                <div>
                    <h1>Tasks</h1>
                    <p className="subtitle">
                        {visibleTotal} total · {visibleCompleted} completed
                    </p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>
                    <Plus size={18} /> Add Task
                </button>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Filter size={16} />
                    {['all', 'one-time', 'daily', 'weekly'].map((f) => (
                        <button
                            key={f}
                            className={`filter-btn ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f === 'all' ? 'All Types' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
                <div className="filter-group">
                    {['all', 'pending', 'completed'].map((f) => (
                        <button
                            key={f}
                            className={`filter-btn ${statusFilter === f ? 'active' : ''}`}
                            onClick={() => setStatusFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Task List */}
            {filtered.length === 0 ? (
                <div className="empty-state-lg">
                    <span className="empty-icon">📋</span>
                    <h3>No tasks found</h3>
                    <p>
                        {tasks.length === 0
                            ? 'Create your first task to get started!'
                            : 'Try adjusting your filters.'}
                    </p>
                    {tasks.length === 0 && (
                        <button className="btn btn-primary" onClick={openAdd}>
                            <Plus size={18} /> Create Task
                        </button>
                    )}
                </div>
            ) : (
                <div className="task-list">
                    {filtered.map((task) => (
                        <div
                            key={task.id}
                            className={`task-card ${task.completed ? 'task-completed' : ''}`}
                        >
                            <button className="task-check-lg" onClick={() => handleToggle(task)}>
                                {task.completed ? (
                                    <CheckCircle2 size={24} className="check-done" />
                                ) : (
                                    <Circle size={24} className="check-pending" />
                                )}
                            </button>
                            <div className="task-content">
                                <div className="task-title-row gap-2">
                                    <span className={`task-title ${task.completed ? 'done' : ''}`}>
                                        {task.title}
                                    </span>
                                    <span className={`task-badge badge-${task.type}`}>{task.type}</span>
                                </div>
                                {task.description && (
                                    <p className="task-desc">{task.description}</p>
                                )}
                                <div className="task-meta">
                                    <span>Created {format(new Date(task.created_date), 'MMM dd, yyyy')}</span>
                                    {task.completed && task.completion_date && (
                                        <span className="task-completed-date">
                                            ✓ Completed {format(new Date(task.completion_date), 'MMM dd, yyyy')}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="task-actions">
                                {!task.completed && (
                                    <button
                                        className="btn-icon"
                                        onClick={() => openEdit(task)}
                                        title="Edit"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                )}
                                <button
                                    className="btn-icon btn-danger"
                                    onClick={() => handleDelete(task.id)}
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Task Form Modal */}
            {showForm && (
                <TaskForm
                    task={editingTask}
                    onSubmit={editingTask ? handleEdit : handleAdd}
                    onClose={() => { setShowForm(false); setEditingTask(null); }}
                />
            )}
        </div>
    );
}
