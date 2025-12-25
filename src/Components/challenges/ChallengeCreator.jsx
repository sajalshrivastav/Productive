import React, { useState } from 'react'
import { useChallenge } from '../../hooks/useChallenge'

import { Trophy, ArrowRight, Plus, X, List } from 'lucide-react'

export default function ChallengeCreator() {
    const { createChallenge, activeChallenge } = useChallenge()

    // Single Step Form State
    const [title, setTitle] = useState('75 Hard')
    const [duration, setDuration] = useState(75)
    const [rules, setRules] = useState([
        'Drink 1 Gallon of water',
        'Read 10 pages',
        '45 min Indoor Workout',
        '45 min Outdoor Workout',
        'Follow a diet'
    ])
    const [newRule, setNewRule] = useState('')

    const handleStart = (e) => {
        e.preventDefault()
        if (!title) return
        createChallenge(title, duration, rules)
    }

    const addRule = () => {
        if (newRule.trim()) {
            setRules([...rules, newRule.trim()])
            setNewRule('')
        }
    }

    const removeRule = (idx) => {
        setRules(rules.filter((_, i) => i !== idx))
    }

    return (
        <div className="panel-card" style={{
            background: 'var(--bg-surface)', borderRadius: '24px', padding: '32px',
            border: '1px solid var(--border-subtle)', position: 'sticky', top: '20px'
        }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Start a Challenge</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '32px' }}>
                Commit to a better version of yourself. Consistency is key.
            </p>

            {activeChallenge ? (
                <div style={{ padding: '20px', background: 'rgba(34,197,94,0.1)', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}>
                    You already have an active challenge! Finish it first.
                </div>
            ) : (
                <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Title */}
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Challenge Name</label>
                        <input
                            value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. 75 Hard"
                            style={{
                                width: '100%', background: 'var(--bg-panel)', border: 'none',
                                color: 'white', padding: '16px', borderRadius: '12px', fontSize: '1rem', outline: 'none'
                            }}
                        />
                    </div>

                    {/* Duration Picker */}
                    {/* Duration Picker */}
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Duration (Days)</label>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {[21, 30, 75, 100].map(d => (
                                <button
                                    key={d} type="button"
                                    onClick={() => setDuration(d)}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                                        background: duration === d ? 'var(--accent-primary)' : 'var(--bg-panel)',
                                        color: duration === d ? 'black' : 'var(--text-secondary)',
                                        fontWeight: duration === d ? 700 : 500, transition: 'all 0.2s',
                                        minWidth: '60px'
                                    }}
                                >
                                    {d} Days
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setDuration('custom')}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                                    background: duration === 'custom' || (typeof duration === 'number' && ![21, 30, 75, 100].includes(duration)) ? 'var(--accent-primary)' : 'var(--bg-panel)',
                                    color: duration === 'custom' || (typeof duration === 'number' && ![21, 30, 75, 100].includes(duration)) ? 'black' : 'var(--text-secondary)',
                                    fontWeight: 700, transition: 'all 0.2s',
                                    minWidth: '60px'
                                }}
                            >
                                Custom
                            </button>
                        </div>
                        {/* Custom Input */}
                        {(duration === 'custom' || (typeof duration === 'number' && ![21, 30, 75, 100].includes(duration))) && (
                            <div style={{ marginTop: '12px' }}>
                                <input
                                    type="number"
                                    value={typeof duration === 'number' ? duration : ''}
                                    onChange={e => setDuration(Number(e.target.value))}
                                    placeholder="Enter days (e.g. 40)"
                                    style={{
                                        width: '100%', background: 'var(--bg-panel)', border: '1px solid var(--accent-primary)',
                                        color: 'white', padding: '12px', borderRadius: '12px', fontSize: '1rem', outline: 'none'
                                    }}
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>

                    {/* Rules List */}
                    <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Daily Rules</label>
                        <div style={{ background: 'var(--bg-panel)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {rules.map((rule, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                                    <div style={{ minWidth: '24px', height: '24px', background: 'var(--bg-surface)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{i + 1}</div>
                                    <span style={{ flex: 1, fontSize: '0.9rem' }}>{rule}</span>
                                    <button type="button" onClick={() => removeRule(i)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
                                </div>
                            ))}

                            {/* New Rule Input */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                                <Plus size={20} className="text-accent" />
                                <input
                                    value={newRule} onChange={e => setNewRule(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRule())}
                                    placeholder="Add a new daily rule..."
                                    style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                                />
                                <button type="button" onClick={addRule} style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', background: 'transparent', border: 'none', cursor: 'pointer' }}>ADD</button>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn-gradient-green" style={{ padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1rem', fontWeight: 700, marginTop: '8px' }}>
                        Start Challenge <ArrowRight size={20} />
                    </button>
                </form>
            )}
        </div>
    )
}
