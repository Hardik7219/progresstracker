/**
 * Export Service — JSON, CSV, PDF export for tasks and analytics.
 */
import { getAllData, getTasks, getArchivedTasks } from './storageService';
import { getBasicStats, getProgressScore, getDailyTrends } from './analyticsService';
import { getTaskStreak, getPhotoStreak } from './streakService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
async function saveFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const arrayBuffer = await blob.arrayBuffer();

    const result = await window.electronAPI.saveFile({
        buffer: arrayBuffer,
        filename
    });

    if (!result.success) {
        alert("Save cancelled");
    }
}
// ─── JSON Export ────────────────────────────────────────────

export function exportJSON() {
    const data = getAllData();
    const json = JSON.stringify(data, null, 2);
    const date = format(new Date(), 'yyyy-MM-dd');
    downloadFile(json, `progress-tracker-${date}.json`, 'application/json');
}

// ─── CSV Export ─────────────────────────────────────────────

export function exportCSV() {
    const tasks = [...getTasks(), ...getArchivedTasks()];
    const headers = ['ID', 'Title', 'Description', 'Type', 'Created', 'Completed', 'Completion Date'];
    const rows = tasks.map((t) => [
        t.id,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.type,
        t.created_date ? format(new Date(t.created_date), 'yyyy-MM-dd HH:mm') : '',
        t.completed ? 'Yes' : 'No',
        t.completion_date ? format(new Date(t.completion_date), 'yyyy-MM-dd HH:mm') : '',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const date = format(new Date(), 'yyyy-MM-dd');
    downloadFile(csv, `progress-tracker-${date}.csv`, 'text/csv');
}

// ─── PDF Export ─────────────────────────────────────────────

export function exportPDF() {
    const doc = new jsPDF();
    const stats = getBasicStats();
    const progress = getProgressScore();
    const taskStreak = getTaskStreak();
    const photoStreak = getPhotoStreak();
    const tasks = getTasks();
    const date = format(new Date(), 'MMMM dd, yyyy');

    // Header
    doc.setFontSize(22);
    doc.setTextColor(99, 102, 241); // indigo
    doc.text('Progress Tracker Report', 14, 25);
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated on ${date}`, 14, 33);

    // Summary
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Summary', 14, 48);

    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    const summaryData = [
        ['Progress Score', `${progress.score}/100`],
        ['Total Tasks', stats.total.toString()],
        ['Completed', stats.completed.toString()],
        ['Completion Rate', `${stats.completionPercentage}%`],
        ['Current Task Streak', `${taskStreak.current} days`],
        ['Longest Task Streak', `${taskStreak.longest} days`],
        ['Current Photo Streak', `${photoStreak.current} days`],
        ['Consistency Rate', `${progress.consistencyRate}%`],
    ];

    doc.autoTable({
        startY: 53,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 10 },
    });

    // Tasks Table
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Tasks', 14, finalY);

    const taskRows = tasks.slice(0, 30).map((t) => [
        t.title,
        t.type,
        t.completed ? 'Done' : 'Pending',
        t.created_date ? format(new Date(t.created_date), 'MMM dd, yyyy') : '',
        t.completion_date ? format(new Date(t.completion_date), 'MMM dd, yyyy') : '-',
    ]);

    doc.autoTable({
        startY: finalY + 5,
        head: [['Title', 'Type', 'Status', 'Created', 'Completed']],
        body: taskRows,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 9 },
        columnStyles: { 0: { cellWidth: 50 } },
    });

    const dateStr = format(new Date(), 'yyyy-MM-dd');
     const doc = new jsPDF();

    // ... your existing code stays SAME ...

    const dateStr = format(new Date(), 'yyyy-MM-dd');

    const blob = doc.output('blob');
    const arrayBuffer = await blob.arrayBuffer();

    const result = await window.electronAPI.saveFile({
        buffer: arrayBuffer,
        filename: `progress-report-${dateStr}.pdf`
    });

    if (!result.success) {
        alert("Save cancelled");
    }
}

// ─── Export Archived Data ───────────────────────────────────

export function exportArchivedJSON() {
    const archived = getArchivedTasks();
    const json = JSON.stringify({ archivedTasks: archived, exportDate: new Date().toISOString() }, null, 2);
    const date = format(new Date(), 'yyyy-MM-dd');
    downloadFile(json, `archived-tasks-${date}.json`, 'application/json');
}
