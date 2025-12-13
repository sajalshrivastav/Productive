import React from 'react'
import { useChallenge } from '../Context/ChallengeContext.jsx'
import ChallengeCreator from '../Components/Challenges/ChallengeCreator.jsx'
import { Trophy, CheckCircle, Calendar, Flame, Edit2, Save, X } from 'lucide-react'
import { useState } from 'react'
// ... (keep helper)

export default function Challenges() {
  const { activeChallenge, activeDay, completedDays, giveUp, updateChallenge } = useChallenge()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')

  const startEdit = () => {
      setEditTitle(activeChallenge.title)
      setIsEditing(true)
  }
  
  const saveEdit = () => {
      if(!editTitle.trim()) return
      updateChallenge(activeChallenge._id || activeChallenge.id, { title: editTitle })
      setIsEditing(false)
  }

  return (
    <div className="animate-fade-in" style={{ 
        display: 'grid', gridTemplateColumns: 'minmax(450px, 1.4fr) 1fr', gap: '40px', alignItems: 'start',
        paddingBottom: '40px'
    }}>
        
        {/* LEFT COLUMN: CREATOR FORM */}
        <div>
           <ChallengeCreator />
        </div>

        {/* RIGHT COLUMN: ONGOING / UPCOMING */}
        <div className="panel-card" style={{ 
            background: 'var(--bg-surface)', borderRadius: '24px', padding: '32px',
            border: '1px solid var(--border-subtle)', minHeight: '400px'
        }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy className="text-accent" /> Ongoing Challenge
            </h2>

            {!activeChallenge ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', border: '2px dashed var(--border-subtle)', borderRadius: '16px' }}>
                    <Flame size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                    <p>No active challenge.</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Start one on the left to transform yourself.</p>
                </div>
            ) : (
                <div className="animate-fade-in">
                    {/* Header Card */}
                    <div style={{ 
                        background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(0,0,0,0))', 
                        padding: '24px', borderRadius: '16px', marginBottom: '24px',
                        border: '1px solid rgba(34,197,94,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            {isEditing ? (
                                <div style={{ display: 'flex', gap: '8px', flex: 1, marginBottom: '8px' }}>
                                    <input 
                                       value={editTitle}
                                       onChange={e => setEditTitle(e.target.value)}
                                       style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--accent-primary)', background: 'var(--bg-surface)', color: 'white', fontWeight: 800, fontSize: '1.2rem' }}
                                    />
                                    <button onClick={saveEdit} style={{ background: 'var(--accent-primary)', border: 'none', borderRadius: '8px', padding: '0 12px', color: 'black' }}><Save size={18}/></button>
                                    <button onClick={() => setIsEditing(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '0 12px', color: 'white' }}><X size={18}/></button>
                                </div>
                            ) : (
                                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>{activeChallenge.title}</h3>
                            )}

                            {!isEditing && (
                                <button onClick={startEdit} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>
                                    <Edit2 size={18} />
                                </button>
                            )}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14}/> Day {activeDay} / {activeChallenge.durationDays}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={14}/> {Math.round((completedDays.length / activeChallenge.durationDays) * 100)}% Complete</span>
                        </div>
                    </div>

                    {/* Stats or Rules Summary */}
                    <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>Daily Rules</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {activeChallenge.dailyActions.map((rule, i) => (
                                <div key={i} style={{ 
                                    padding: '12px 16px', background: 'var(--bg-panel)', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', gap: '12px'
                                }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>{i+1}</div>
                                    <span>{rule.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                         onClick={giveUp}
                         style={{ 
                             width: '100%', padding: '16px', borderRadius: '12px', 
                             background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                             border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 600, cursor: 'pointer'
                         }}
                    >
                        Give Up Challenge
                    </button>
                </div>
            )}

            {/* Upcoming Placeholder */}
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
                 <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', opacity: 0.7 }}>Upcoming</h3>
                 <div style={{ padding: '16px', background: 'var(--bg-panel)', borderRadius: '12px', opacity: 0.5 }}>
                    <span style={{ fontSize: '0.9rem' }}>No upcoming challenges scheduled.</span>
                 </div>
            </div>
        </div>
    </div>
  )
}
