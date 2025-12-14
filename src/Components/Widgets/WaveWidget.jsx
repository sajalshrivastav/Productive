import { useMemo } from 'react'
import '../../Styles/WigggleWidgets.css'

export default function WaveWidget() {
    // Mock data for the last 6 months
    const data = [
        { label: 'Jan', value: 45 },
        { label: 'Feb', value: 75 },
        { label: 'Mar', value: 55 },
        { label: 'Apr', value: 35 },
        { label: 'May', value: 65 },
        { label: 'Jun', value: 55 },
    ]

    // Calculate SVG path for a smooth curve
    const pathData = useMemo(() => {
        // Canvas dimensions -> matches CSS aspect ratio roughly
        const width = 300
        const height = 100
        const maxVal = 100

        // Normalize points
        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * width
            const y = height - (d.value / maxVal) * height
            return { x, y }
        })

        // Generate smooth bezier curve
        let path = `M ${points[0].x} ${points[0].y}`

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i]
            const p1 = points[i + 1]

            // Control points
            const cp1x = p0.x + (p1.x - p0.x) * 0.5
            const cp1y = p0.y
            const cp2x = p1.x - (p1.x - p0.x) * 0.5
            const cp2y = p1.y

            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`
        }

        // Close the path for the gradient fill
        const fillPath = `${path} L ${width} ${height} L 0 ${height} Z`

        return { stroke: path, fill: fillPath }
    }, [])

    return (
        <div className="wave-widget">
            <div className="widget-header">
                <div>
                    <h3 className="widget-title">Productivity Flow</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>85%</div>
                    <div style={{ fontSize: '0.8rem', color: '#22c55e', marginTop: '4px' }}>+12% vs last month</div>
                </div>

                {/* Simple year implementation for now */}
                <div style={{ background: '#27272a', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', color: '#a1a1aa' }}>
                    2025
                </div>
            </div>

            <div className="wave-chart-container">
                <svg viewBox="0 0 300 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                    <defs>
                        <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={pathData.fill} fill="url(#waveGradient)" />
                    <path d={pathData.stroke} fill="none" stroke="#22c55e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            <div className="wave-labels">
                {data.map((d, i) => (
                    <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', color: '#71717a' }}>{d.label}</span>
                ))}
            </div>
        </div>
    )
}
