import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function TaskForm({ task, onSubmit, onClose }) {
    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [type, setType] = useState(task?.type || 'one-time');

    function handleSubmit(e) {
        e.preventDefault();
        if (!title.trim()) return;
        onSubmit({ title: title.trim(), description: description.trim(), type });
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{task ? 'Edit Task' : 'New Task'}</h2>
                    <button className="btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="task-form">
                    <div className="form-group">
                        <label htmlFor="task-title">Title *</label>
                        <input
                            id="task-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="task-desc">Description</label>
                        <textarea
                            id="task-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add details (optional)"
                            rows={3}
                        />
                    </div>
                    <div className="form-group">
                        <label>Type</label>
                        <div className="type-selector">
                            {['one-time', 'daily', 'weekly'].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`type-btn ${type === t ? 'active' : ''} badge-${t}`}
                                    onClick={() => setType(t)}
                                >
                                    {t === 'one-time' ? '📌 One-Time' : t === 'daily' ? '🔄 Daily' : '📅 Weekly'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
                            {task ? 'Update Task' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
