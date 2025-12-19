import React from 'react'
import { Search } from 'lucide-react'

export default function ProjectFilterBar({
    searchQuery, setSearchQuery,
    filterStatus, setFilterStatus,
    viewMode, setViewMode
}) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)' }} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: '8px 12px 8px 36px',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)',
                            background: 'var(--bg-surface)',
                            color: 'var(--text-main)',
                            fontSize: '0.9rem',
                            width: '200px'
                        }}
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem'
                    }}
                >
                    <option value="all">All Status</option>
                    <option value="backlog">Backlog</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={() => setViewMode('kanban')}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        background: viewMode === 'kanban' ? 'var(--bg-surface)' : 'transparent',
                        color: viewMode === 'kanban' ? 'var(--text-main)' : 'var(--text-soft)',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                    }}
                >
                    Kanban
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        background: viewMode === 'list' ? 'var(--bg-surface)' : 'transparent',
                        color: viewMode === 'list' ? 'var(--text-main)' : 'var(--text-soft)',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                    }}
                >
                    List
                </button>
            </div>
        </div>
    )
}
