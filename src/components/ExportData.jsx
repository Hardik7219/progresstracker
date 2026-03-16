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
} from '../services/storageService';
import {
    Download,
    FileJson,
    FileSpreadsheet,
    FileText,
    Archive,
    Trash2,
    AlertTriangle,
} from 'lucide-react';

export default function ExportData({ onRefresh }) {
    const [archived] = useState(getArchivedTasks());
    const [oldCount] = useState(getOldTaskCount());
    const [exportDone, setExportDone] = useState('');

    function handleExport(type) {
        try {
            if (type === 'json') exportJSON();
            else if (type === 'csv') exportCSV();
            else if (type === 'pdf') exportPDF();
            else if (type === 'archived') exportArchivedJSON();
            setExportDone(type);
            setTimeout(() => setExportDone(''), 3000);
        } catch (err) {
            console.error('Export failed:', err);
        }
    }

    function handleArchiveAndClean() {
        archiveOldTasks();
        onRefresh?.();
    }

    function handleClearArchive() {
        if (window.confirm('Delete all archived tasks? This cannot be undone.')) {
            clearArchivedTasks();
            onRefresh?.();
        }
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
                    <p>Full data export including tasks, photos, and settings</p>
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

            {/* Archive Section */}
            <div className="card archive-section">
                <div className="card-header">
                    <h2><Archive size={18} /> Data Retention</h2>
                </div>
                <div className="archive-info">
                    <p>
                        Tasks older than <strong>30 days</strong> are automatically flagged for archiving.
                        Export your data before cleaning up.
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
        </div>
    );
}
