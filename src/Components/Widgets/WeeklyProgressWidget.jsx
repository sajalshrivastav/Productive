import React from 'react'
import '../../Styles/WigggleWidgets.css'
import { BarChart3 } from 'lucide-react'

export default function WeeklyProgressWidget() {
    // Hardcoded data for visual replication as we don't have this granular data yet
    const stats = [
        { label: 'Design Mockups Completed', val: 55, max: 100, color: '#22c55e' },
        { label: 'Features Developed', val: 70, max: 100, color: '#eab308' },
        { label: 'Test Cases Passed', val: 85, max: 100, color: '#ef4444' }
    ]

    return (
        <div className="wigggle-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <BarChart3 size={24} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Weekly Progress</h3>
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                {/* Concentric Circles SVG */}
                <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                     <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                        {/* Circle 1 - Outer (Red) */}
                        <circle cx="70" cy="70" r="60" fill="none" stroke="#333" strokeWidth="10" />
                        <circle cx="70" cy="70" r="60" fill="none" stroke="#ef4444" strokeWidth="10" 
                                strokeDasharray={`${(85/100)*(2*Math.PI*60)} ${2*Math.PI*60}`} strokeLinecap="round" />
                        
                        {/* Circle 2 - Middle (Yellow) */}
                        <circle cx="70" cy="70" r="45" fill="none" stroke="#333" strokeWidth="10" />
                        <circle cx="70" cy="70" r="45" fill="none" stroke="#eab308" strokeWidth="10" 
                                strokeDasharray={`${(70/100)*(2*Math.PI*45)} ${2*Math.PI*45}`} strokeLinecap="round" />

                        {/* Circle 3 - Inner (Green) */}
                        <circle cx="70" cy="70" r="30" fill="none" stroke="#333" strokeWidth="10" />
                        <circle cx="70" cy="70" r="30" fill="none" stroke="#22c55e" strokeWidth="10" 
                                strokeDasharray={`${(55/100)*(2*Math.PI*30)} ${2*Math.PI*30}`} strokeLinecap="round" />
                     </svg>
                </div>

                <div className="wigggle-weekly-legend">
                    {stats.map((s, i) => (
                        <div key={i} className="wigggle-legend-item">
                            <div className="wigggle-legend-box" style={{ background: s.color }}></div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.val}/{s.max}</div>
                                <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
