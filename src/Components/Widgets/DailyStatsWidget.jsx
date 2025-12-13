import React from 'react'
import '../../Styles/WigggleWidgets.css'

export default function DailyStatsWidget() {
    // Mock data for replication
    const metrics = [
        { label: 'Focus', val: 62, color: '#eab308' },
        { label: 'Meetings', val: 22, color: '#a855f7' },
        { label: 'Breaks', val: 10, color: '#22c55e' },
        { label: 'Others', val: 6, color: '#ef4444' }
    ]

    return (
        <div className="wigggle-card" style={{ padding: '32px' }}>
            <div className="wigggle-stats-row">
                <div>
                    <div className="wigggle-stat-title">Time</div>
                    <div className="wigggle-stat-val">6h</div>
                </div>
                <div>
                    <div className="wigggle-stat-title">Tasks</div>
                    <div className="wigggle-stat-val">55</div>
                </div>
                <div>
                    <div className="wigggle-stat-title">Work day</div>
                    <div className="wigggle-stat-val">79%</div>
                </div>
            </div>

            <div className="wigggle-circles-row">
                {metrics.map((m, i) => (
                    <div key={i} className="wigggle-circle-stat">
                        <div className="circle-progress-container">
                             <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                                <circle cx="30" cy="30" r="26" fill="none" stroke="#333" strokeWidth="4" />
                                <circle cx="30" cy="30" r="26" fill="none" stroke={m.color} strokeWidth="4" 
                                        strokeDasharray={`${(m.val/100)*(2*Math.PI*26)} ${2*Math.PI*26}`} strokeLinecap="round" />
                             </svg>
                             <span className="circle-val">{m.val}%</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{m.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
