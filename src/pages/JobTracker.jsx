// src/Pages/JobTracker.jsx
import React, { useEffect, useMemo, useState } from 'react'
import Card from '../Components/UI/Card.jsx'
import SectionTitle from '../Components/UI/SectionTitle.jsx'
import Button from '../Components/UI/Button.jsx'
import { useTasks } from '../hooks/useTasks'


const STORAGE_KEY = 'cb-jobs-sheet-v1'
const DEFAULT_STATUS = [
  'Wishlist',
  'Applied',
  'Online Assessment',
  'Interview',
  'Offer',
  'Rejected',
]

function getTodayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function newEmptyJob() {
  return {
    id: 'j' + Date.now().toString(36),
    company: '',
    role: '',
    location: '',
    status: 'Wishlist',
    source: '',
    appliedDate: '',
    notes: '',
    createdAt: new Date().toISOString(),
  }
}

export default function JobTrackerSheet() {
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [onlyWithAppliedDate, setOnlyWithAppliedDate] = useState(false)
  const [sortBy, setSortBy] = useState('createdDesc')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const { addTask } = useTasks()

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setJobs(JSON.parse(raw))
      } catch (e) {
        console.error('parse jobs', e)
      }
    } else setJobs([newEmptyJob()])
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
  }, [jobs])

  const addRow = (afterIndex = null) => {
    const j = newEmptyJob()
    setJobs((prev) => {
      if (afterIndex === null) return [...prev, j]
      const copy = [...prev]
      copy.splice(afterIndex + 1, 0, j)
      return copy
    })
  }
  const deleteRow = (id) => {
    setJobs((prev) => prev.filter((r) => r.id !== id))
    setSelectedIds((p) => {
      const c = new Set(p)
      c.delete(id)
      return c
    })
  }
  const updateCell = (id, key, value) =>
    setJobs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)),
    )
  const toggleSelect = (id) =>
    setSelectedIds((p) => {
      const c = new Set(p)
      c.has(id) ? c.delete(id) : c.add(id)
      return c
    })
  const clearSelected = () => setSelectedIds(new Set())

  const markSelectedApplied = () => {
    const today = getTodayKey()
    setJobs((prev) =>
      prev.map((r) =>
        selectedIds.has(r.id)
          ? { ...r, appliedDate: r.appliedDate || today, status: 'Applied' }
          : r,
      ),
    )
    clearSelected()
  }

  const addFollowUpsForSelected = () => {
    const selected = jobs.filter((j) => selectedIds.has(j.id))
    selected.forEach((job) => {
      addTask({
        title: `Follow up — ${job.company || 'company'} (${job.role || 'role'
          })`,
        type: 'job',
        sourceId: job.id,
        dateKey: getTodayKey(),
        notes: `Status: ${job.status} | Source: ${job.source}`,
      })
    })
    clearSelected()
    alert(`Added follow-up tasks for ${selected.length} job(s).`)
  }

  const exportCSV = () => {
    if (!jobs.length) return
    const header = [
      'company',
      'role',
      'location',
      'status',
      'source',
      'appliedDate',
      'notes',
    ]
    const rows = jobs.map((r) =>
      header
        .map((h) => `"${(r[h] || '').toString().replace(/"/g, '""')}"`)
        .join(','),
    )
    const csv = [header.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jobs-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = useMemo(() => {
    let out = jobs.slice()
    if (search.trim()) {
      const s = search.toLowerCase()
      out = out.filter((r) =>
        [r.company, r.role, r.location, r.source, r.notes].some((v) =>
          (v || '').toLowerCase().includes(s),
        ),
      )
    }
    if (statusFilter) out = out.filter((r) => r.status === statusFilter)
    if (onlyWithAppliedDate) out = out.filter((r) => !!r.appliedDate)
    out.sort((a, b) => {
      if (sortBy === 'createdDesc')
        return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'dateAsc')
        return (a.appliedDate || '').localeCompare(b.appliedDate || '')
      if (sortBy === 'dateDesc')
        return (b.appliedDate || '').localeCompare(a.appliedDate || '')
      if (sortBy === 'company')
        return (a.company || '').localeCompare(b.company || '')
      return 0
    })
    return out
  }, [jobs, search, statusFilter, onlyWithAppliedDate, sortBy])

  // summary (kept small)
  const summary = useMemo(() => {
    const total = jobs.length
    const applied = jobs.filter((j) => j.status === 'Applied').length
    const interviews = jobs.filter((j) => j.status === 'Interview').length
    const offers = jobs.filter((j) => j.status === 'Offer').length
    const noDate = jobs.filter((j) => !j.appliedDate).length
    return { total, applied, interviews, offers, noDate }
  }, [jobs])

  return (
    <div className="jobs-sheet-page jobs-sheet-layout-fix">
      {/* Top pill-style filter bar (like navbar) */}
      <div className="jobs-filter-pills">
        <div className="jobs-filter-left">
          <div className="pill-nav">
            <button
              className={`pill ${statusFilter === '' ? 'active' : ''}`}
              onClick={() => setStatusFilter('')}
            >
              All
            </button>
            {DEFAULT_STATUS.map((s) => (
              <button
                key={s}
                className={`pill ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter((prev) => (prev === s ? '' : s))}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="jobs-filter-right">
          <input
            className="job-filter-input-top"
            placeholder="Search company / role / notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="job-filter-select-top"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdDesc">Newest</option>
            <option value="company">Company A→Z</option>
            <option value="dateAsc">Applied Date ↑</option>
            <option value="dateDesc">Applied Date ↓</option>
          </select>
          <label className="jobs-filter-toggle-top">
            <input
              type="checkbox"
              checked={onlyWithAppliedDate}
              onChange={(e) => setOnlyWithAppliedDate(e.target.checked)}
            />
            <span>Has applied date</span>
          </label>
          <div className="top-actions">
            <Button variant="ghost" onClick={() => addRow()}>
              + Row
            </Button>
            <Button variant="ghost" onClick={exportCSV}>
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Full-width table card */}
      <Card className="jobs-sheet-table-card jobs-table-full">
        <div className="jobs-table-wrap">
          <table className="jobs-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input
                    type="checkbox"
                    checked={
                      filtered.length > 0 &&
                      filtered.every((r) => selectedIds.has(r.id))
                    }
                    onChange={(e) => {
                      if (e.target.checked)
                        setSelectedIds(new Set(filtered.map((r) => r.id)))
                      else clearSelected()
                    }}
                  />
                </th>
                <th>Company</th>
                <th>Role</th>
                <th>Location</th>
                <th style={{ width: 140 }}>Status</th>
                <th style={{ width: 120 }}>Source</th>
                <th style={{ width: 120 }}>Applied date</th>
                <th>Notes</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((row, idx) => (
                <tr
                  key={row.id}
                  className={selectedIds.has(row.id) ? 'row-selected' : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.company}
                      onChange={(e) =>
                        updateCell(row.id, 'company', e.target.value)
                      }
                      placeholder="Company"
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.role}
                      onChange={(e) =>
                        updateCell(row.id, 'role', e.target.value)
                      }
                      placeholder="Role"
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.location}
                      onChange={(e) =>
                        updateCell(row.id, 'location', e.target.value)
                      }
                      placeholder="Location"
                    />
                  </td>
                  <td>
                    <select
                      className="cell-select"
                      value={row.status}
                      onChange={(e) =>
                        updateCell(row.id, 'status', e.target.value)
                      }
                    >
                      {DEFAULT_STATUS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.source}
                      onChange={(e) =>
                        updateCell(row.id, 'source', e.target.value)
                      }
                      placeholder="LinkedIn"
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      type="date"
                      value={row.appliedDate}
                      onChange={(e) =>
                        updateCell(row.id, 'appliedDate', e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input"
                      value={row.notes}
                      onChange={(e) =>
                        updateCell(row.id, 'notes', e.target.value)
                      }
                      placeholder="Notes"
                    />
                  </td>
                  <td className="table-actions-cell">
                    <div
                      style={{ display: 'flex', gap: 8, alignItems: 'center' }}
                    >
                      <Button variant="ghost" onClick={() => addRow(idx)}>
                        +Row
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          addTask({
                            title: `Follow up — ${row.company || 'company'} (${row.role || 'role'
                              })`,
                            type: 'job',
                            sourceId: row.id,
                            dateKey: getTodayKey(),
                            notes: `Status: ${row.status} | Source: ${row.source}`,
                          })
                          alert('Follow-up task added for today.')
                        }}
                      >
                        Follow-up
                      </Button>
                      <button
                        className="table-delete-btn"
                        onClick={() => deleteRow(row.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: 'center',
                      padding: 18,
                      color: 'var(--text-soft)',
                    }}
                  >
                    No rows — add a new row or clear filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom compact overview -- moved under table so no right widget */}
      <div
        style={{
          marginTop: 12,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ color: 'var(--text-soft)' }}>Selected</div>
          <div style={{ fontWeight: 700 }}>{selectedIds.size}</div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant="primary"
            onClick={markSelectedApplied}
            disabled={selectedIds.size === 0}
          >
            Mark selected Applied
          </Button>
          <Button
            variant="ghost"
            onClick={addFollowUpsForSelected}
            disabled={selectedIds.size === 0}
          >
            Add follow-ups (selected)
          </Button>
          <Button
            variant="ghost"
            onClick={() => setJobs([newEmptyJob(), ...jobs])}
          >
            Insert blank row at top
          </Button>
        </div>
      </div>
    </div>
  )
}
