import React, { useState } from 'react';
import {
    exportJSON,
    exportCSV,
    exportPDF,
    exportArchivedJSON,
} from '../services/exportService';
import {
    getArchivedTasks,
    clearArchivedTasks,
    archiveOldTasks,
    getOldTaskCount,
    getCompletionLog,
} from '../services/storageService';
import {
    Download,
    FileJson,
    FileSpreadsheet,
    FileText,
    Archive,
    Trash2,
    AlertTriangle,
    Info,
} from 'lucide-react';

export default function ExportData({ onRefresh }) {
    const [archived, setArchived]   = useState(getArchivedTasks());
    const [oldCount, setOldCount]   = useState(getOldTaskCount());
    const [logCount]                = useState(getCompletionLog().length);
    const [exportDone, setExportDone] = useState('');
    const [showClearWarning, setShowClearWarning] = useState(false);

    function handleExport(type) {
        try {
            if (type === 'json')     exportJSON();
            else if (type === 'csv')      exportCSV();
            else if (type === 'pdf')      exportPDF();
            else if (type === 'archived') exportArchivedJSON();
            setExportDone(type);
            setTimeout(() => setExportDone(''), 3000);
        } catch (err) {
            console.error('Export failed:', err);
        }
    }

    function handleArchiveAndClean() {
        archiveOldTasks();
        setArchived(getArchivedTasks());
        setOldCount(getOldTaskCount());
        onRefresh?.();
    }

    function handleClearArchive() {
        // Show warning first — deleting archive removes task details but NOT completion log
        setShowClearWarning(true);
    }

    function confirmClearArchive() {
        clearArchivedTasks();
        setArchived([]);
        setShowClearWarning(false);
        onRefresh?.();
    }

    return (
        <div className="export-page">
            <div className="page-header">
                <div>
                    <h1>Export Data</h1>
                    <p className="subtitle">Download your data in various formats</p>
                </div>
            </div>

            {/* Export Options */}
            <div className="export-grid">
                <div className="export-card" onClick={() => handleExport('json')}>
                    <div className="export-icon export-icon--json">
                        <FileJson size={32} />
                    </div>
                    <h3>Export JSON</h3>
                    <p>Full data export including tasks, completion log, photos, and settings</p>
                    {exportDone === 'json' && <span className="export-success">✓ Downloaded!</span>}
                </div>

                <div className="export-card" onClick={() => handleExport('csv')}>
                    <div className="export-icon export-icon--csv">
                        <FileSpreadsheet size={32} />
                    </div>
                    <h3>Export CSV</h3>
                    <p>Spreadsheet-compatible format for task data</p>
                    {exportDone === 'csv' && <span className="export-success">✓ Downloaded!</span>}
                </div>

                <div className="export-card" onClick={() => handleExport('pdf')}>
                    <div className="export-icon export-icon--pdf">
                        <FileText size={32} />
                    </div>
                    <h3>PDF Report</h3>
                    <p>Professional progress report with analytics summary</p>
                    {exportDone === 'pdf' && <span className="export-success">✓ Downloaded!</span>}
                </div>
            </div>

            {/* Completion Log Info */}
            <div className="card archive-section">
                <div className="card-header">
                    <h2><Info size={18} /> Completion History</h2>
                </div>
                <div className="archive-info">
                    <p>
                        Your app keeps a <strong>permanent completion log</strong> of every task you've
                        completed — including daily and weekly tasks that reset each day.
                        This log is what powers your analytics charts and streaks.
                        It is <strong>never automatically deleted</strong>.
                    </p>
                    <div className="archive-clean">
                        <span>📋</span>
                        <p><strong>{logCount}</strong> completion events logged across all time.</p>
                    </div>
                </div>
            </div>

            {/* Archive Section */}
            <div className="card archive-section">
                <div className="card-header">
                    <h2><Archive size={18} /> Data Retention</h2>
                </div>
                <div className="archive-info">
                    <p>
                        Tasks older than <strong>30 days</strong> are automatically flagged for archiving.
                        Archiving removes them from your active task list but <strong>does not affect your
                        analytics</strong> — completion history is always preserved in the log above.
                    </p>

                    {oldCount > 0 && (
                        <div className="archive-alert">
                            <AlertTriangle size={18} />
                            <span>
                                <strong>{oldCount}</strong> tasks are older than 30 days and ready to archive.
                            </span>
                            <button className="btn btn-primary btn-sm" onClick={handleArchiveAndClean}>
                                Archive Now
                            </button>
                        </div>
                    )}

                    {archived.length > 0 && (
                        <div className="archive-actions">
                            <p>
                                📦 <strong>{archived.length}</strong> archived tasks in storage.
                            </p>
                            <div className="archive-btns">
                                <button className="btn btn-outline" onClick={() => handleExport('archived')}>
                                    <Download size={16} /> Export Archived
                                </button>
                                <button className="btn btn-danger-outline" onClick={handleClearArchive}>
                                    <Trash2 size={16} /> Delete Archived
                                </button>
                            </div>
                            {exportDone === 'archived' && <span className="export-success">✓ Archived data downloaded!</span>}
                        </div>
                    )}

                    {oldCount === 0 && archived.length === 0 && (
                        <div className="archive-clean">
                            <span>✨</span>
                            <p>All clean! No old tasks to archive.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Clear Archive Warning Modal */}
            {showClearWarning && (
                <div className="modal-overlay" onClick={() => setShowClearWarning(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>⚠️ Delete Archived Tasks?</h2>
                        </div>
                        <div style={{ padding: '1rem 1.5rem' }}>
                            <p style={{ marginBottom: '0.75rem' }}>
                                This will permanently delete <strong>{archived.length} archived task(s)</strong> from storage.
                            </p>
                            <p style={{ marginBottom: '0.75rem', color: 'var(--color-success)' }}>
                                ✅ <strong>Your analytics and streaks are safe.</strong> Completion history
                                is stored in the permanent completion log and will not be affected.
                            </p>
                            <p style={{ color: 'var(--color-warning)' }}>
                                ⚠️ Task titles and details in the archive will be lost. Export first if you need them.
                            </p>
                        </div>
                        <div className="form-actions" style={{ padding: '0 1.5rem 1.5rem' }}>
                            <button className="btn btn-ghost" onClick={() => setShowClearWarning(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-outline" onClick={() => handleExport('archived')}
                                style={{ marginRight: 'auto' }}>
                                <Download size={16} /> Export First
                            </button>
                            <button className="btn btn-danger-outline" onClick={confirmClearArchive}>
                                <Trash2 size={16} /> Delete Anyway
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
