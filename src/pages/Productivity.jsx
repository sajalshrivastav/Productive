import React, { useEffect, useMemo, useState } from 'react'
import Card from '../Components/UI/Card.jsx'
import SectionTitle from '../Components/UI/SectionTitle.jsx'
import { useTasks } from '../Context/TaskContext.jsx'
import CustomSelect from '../Components/UI/CustomSelect.jsx'

const STORAGE_KEY = 'cb-planner-v1'

const BASE_BLOCKS = [
  { id: 'b1', label: '06:00 – 08:00' },
  { id: 'b2', label: '08:00 – 10:00' },
  { id: 'b3', label: '10:00 – 12:00' },
  { id: 'b4', label: '12:00 – 14:00' },
  { id: 'b5', label: '14:00 – 16:00' },
  { id: 'b6', label: '16:00 – 18:00' },
  { id: 'b7', label: '18:00 – 20:00' },
  { id: 'b8', label: '20:00 – 22:00' },
]

function getTodayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function Productivity() {
  const { todayTasks, todayKey = getTodayKey() } = useTasks()
  const [planner, setPlanner] = useState({}) // { dateKey: { blockId: taskId } }

  // load planner from storage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setPlanner(JSON.parse(raw))
      } catch (e) {
        console.error('Failed to parse planner', e)
      }
    }
  }, [])

  // save planner when it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(planner))
  }, [planner])

  const dayPlan = planner[todayKey] || {}

  const handleAssignTask = (blockId, taskId) => {
    setPlanner((prev) => {
      const copy = { ...prev }
      const day = { ...(copy[todayKey] || {}) }

      if (!taskId) {
        delete day[blockId]
      } else {
        day[blockId] = taskId
      }

      copy[todayKey] = day
      return copy
    })
  }

  const blocksWithTasks = useMemo(
    () =>
      BASE_BLOCKS.map((b) => {
        const taskId = dayPlan[b.id]
        const task = todayTasks.find((t) => t.id === taskId) || null
        return { ...b, task }
      }),
    [dayPlan, todayTasks],
  )

  const assignedTaskIds = new Set(
    blocksWithTasks.map((b) => (b.task ? b.task.id : null)).filter(Boolean),
  )

  const unassignedTasks = todayTasks.filter((t) => !assignedTaskIds.has(t.id))

  const todayLabel = useMemo(() => {
    const d = new Date()
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
  }, [])

  const taskOptions = [
      { value: '', label: 'No task assigned' },
      ...todayTasks.map(t => ({ value: t.id, label: t.title }))
  ]

  return (
    <div className="productivity-page">
      {/* Left: Time blocks */}
      <Card>
        <SectionTitle
          title="Time-block planner"
          subtitle={`Plan your focus blocks for ${todayLabel}.`}
        />
        <div className="planner-table">
          {blocksWithTasks.map((block) => (
            <div key={block.id} className="planner-row">
              <div className="planner-time">{block.label}</div>
              <div className="planner-select-wrap">
                  <CustomSelect
                      value={block.task ? block.task.id : ''}
                      onChange={(val) => handleAssignTask(block.id, val || null)}
                      options={taskOptions}
                      placeholder="Assign task..."
                      width="100%"
                  />
              </div>
              <div className="planner-task-preview">
                {block.task ? (
                  <>
                    <div className="planner-task-title">{block.task.title}</div>
                    <div className="planner-task-meta">{block.task.type}</div>
                  </>
                ) : (
                  <span className="planner-empty">Empty block</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Right: Summary + unassigned tasks */}
      <Card>
        <SectionTitle
          title="Today focus summary"
          subtitle="See which tasks are scheduled vs unscheduled."
        />
        <div className="planner-summary">
          <div className="planner-summary-line">
            <span>Blocks with tasks</span>
            <span>
              {blocksWithTasks.filter((b) => b.task !== null).length} /{' '}
              {blocksWithTasks.length}
            </span>
          </div>
          <div className="planner-summary-line">
            <span>Unscheduled tasks</span>
            <span>{unassignedTasks.length}</span>
          </div>
        </div>

        <div className="planner-unassigned">
          <div className="planner-unassigned-title">
            Unscheduled tasks (today)
          </div>
          {unassignedTasks.length === 0 && (
            <p className="planner-unassigned-empty">
              All today&apos;s tasks are assigned to blocks. Nice.
            </p>
          )}
          {unassignedTasks.map((t) => (
            <div key={t.id} className="planner-unassigned-row">
              <span
                style={{
                  textDecoration: t.done ? 'line-through' : 'none',
                }}
              >
                {t.title}
              </span>
              <span className="planner-pill">{t.type}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
