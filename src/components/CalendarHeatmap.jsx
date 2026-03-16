import React, { useMemo } from 'react';
import { getActivityMap } from '../services/streakService';
import { format, subDays, startOfWeek, getDay } from 'date-fns';

export default function CalendarHeatmap({ days = 140 }) {
    const activityMap = useMemo(() => getActivityMap(days), [days]);

    // Build week-based grid (columns = weeks, rows = days of week)
    const today = new Date();
    const cells = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = subDays(today, i);
        const key = format(date, 'yyyy-MM-dd');
        const count = activityMap[key] || 0;
        const dayOfWeek = getDay(date); // 0 = Sunday
        cells.push({ date, key, count, dayOfWeek });
    }

    // Group into weeks
    const weeks = [];
    let currentWeek = [];
    cells.forEach((cell, idx) => {
        if (idx === 0) {
            // Pad the first week
            for (let p = 0; p < cell.dayOfWeek; p++) {
                currentWeek.push(null);
            }
        }
        currentWeek.push(cell);
        if (cell.dayOfWeek === 6 || idx === cells.length - 1) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    function getLevel(count) {
        if (count === 0) return 0;
        if (count <= 1) return 1;
        if (count <= 3) return 2;
        if (count <= 5) return 3;
        return 4;
    }

    // Month labels
    const monthLabels = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
        const validCell = week.find((c) => c !== null);
        if (validCell) {
            const month = validCell.date.getMonth();
            if (month !== lastMonth) {
                monthLabels.push({ index: wi, label: format(validCell.date, 'MMM') });
                lastMonth = month;
            }
        }
    });

    return (
        <div className="heatmap-container">
            <div className="heatmap-months">
                {monthLabels.map((m) => (
                    <span
                        key={m.index}
                        className="heatmap-month-label"
                        style={{ gridColumnStart: m.index + 2 }}
                    >
                        {m.label}
                    </span>
                ))}
            </div>
            <div className="heatmap-grid">
                <div className="heatmap-day-labels">
                    {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
                        <span key={i} className="heatmap-day-label">{d}</span>
                    ))}
                </div>
                <div className="heatmap-weeks">
                    {weeks.map((week, wi) => (
                        <div key={wi} className="heatmap-week">
                            {week.map((cell, ci) =>
                                cell === null ? (
                                    <div key={ci} className="heatmap-cell heatmap-cell--empty"></div>
                                ) : (
                                    <div
                                        key={cell.key}
                                        className={`heatmap-cell heatmap-level-${getLevel(cell.count)}`}
                                        title={`${cell.key}: ${cell.count} task(s)`}
                                    ></div>
                                )
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="heatmap-legend">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((l) => (
                    <div key={l} className={`heatmap-cell heatmap-level-${l}`}></div>
                ))}
                <span>More</span>
            </div>
        </div>
    );
}
