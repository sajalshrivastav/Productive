import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const TaskContext = createContext(null)
const STORAGE_KEY = 'cb-tasks-v1'

function getTodayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([])

  // Load from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        setTasks(parsed)
      } catch (e) {
        console.error('Failed to parse tasks from storage', e)
      }
    }
  }, [])

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const addTask = ({
    title,
    dateKey = getTodayKey(),
    type = 'manual', // manual | habit | challenge | job | other
    sourceId = null,
    priority = 'P2',
    notes = '',
  }) => {
    if (!title.trim()) return
    const newTask = {
      id: 't' + Date.now(),
      title: title.trim(),
      dateKey,
      type,
      sourceId,
      priority,
      notes,
      done: false,
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
  }

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    )
  }

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const clearDoneForDate = (dateKey) => {
    setTasks((prev) => prev.filter((t) => !(t.dateKey === dateKey && t.done)))
  }

  const getTasksForDate = (dateKey) =>
    tasks.filter((t) => t.dateKey === dateKey)

  const todayKey = getTodayKey()
  const todayTasks = useMemo(() => getTasksForDate(todayKey), [tasks, todayKey])

  const completedCount = todayTasks.filter((t) => t.done).length
  const totalCount = todayTasks.length

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        clearDoneForDate,
        getTasksForDate,
        todayKey,
        todayTasks,
        todayCounts: {
          completed: completedCount,
          total: totalCount,
        },
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const ctx = useContext(TaskContext)
  if (!ctx) {
    throw new Error('useTasks must be used within a TaskProvider')
  }
  return ctx
}
