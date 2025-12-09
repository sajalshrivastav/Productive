import React from 'react'
import { useTasks } from '../Context/TaskContext.jsx'
import Card from '../Components/UI/Card.jsx'
import SectionTitle from '../Components/UI/SectionTitle.jsx'

export default function Tasks() {
  const { tasks, toggleTask, deleteTask } = useTasks()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card>
        <SectionTitle
          title="All tasks"
          subtitle="Central view of everything you need to do."
        />
        {tasks.length === 0 && (
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-soft)',
              marginTop: 8,
            }}
          >
            No tasks yet. Add tasks from the Dashboard or other modules.
          </p>
        )}
        <div
          style={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {tasks.map((t) => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 8px',
                borderRadius: 10,
                border: '1px solid var(--border-subtle)',
                background: 'rgba(9,11,16,0.9)',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleTask(t.id)}
                />
                <div>
                  <div
                    style={{
                      textDecoration: t.done ? 'line-through' : 'none',
                      color: t.done ? 'var(--text-faint)' : 'var(--text-main)',
                    }}
                  >
                    {t.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-soft)',
                      marginTop: 1,
                    }}
                  >
                    {t.dateKey} • {t.type}
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteTask(t.id)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-soft)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
