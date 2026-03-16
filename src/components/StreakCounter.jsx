import React, { useEffect, useState } from 'react';

export default function StreakCounter({ value, label, best, icon = '🔥' }) {
    const [display, setDisplay] = useState(0);

    // Animate count-up
    useEffect(() => {
        if (value === 0) {
            setDisplay(0);
            return;
        }
        let start = 0;
        const step = Math.max(1, Math.floor(value / 20));
        const timer = setInterval(() => {
            start += step;
            if (start >= value) {
                setDisplay(value);
                clearInterval(timer);
            } else {
                setDisplay(start);
            }
        }, 40);
        return () => clearInterval(timer);
    }, [value]);

    return (
        <div className="streak-counter">
            <div className={`streak-flame ${value > 0 ? 'streak-active' : 'streak-inactive'}`}>
                <span className="streak-icon">{icon}</span>
            </div>
            <div className="streak-value">{display}</div>
            <div className="streak-label">{label}</div>
            {best !== undefined && (
                <div className="streak-best">Best: {best} days</div>
            )}
        </div>
    );
}
