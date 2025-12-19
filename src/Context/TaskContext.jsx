import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import api from '../api/axios' // Import API
import { useAuth } from './AuthContext' // Import Auth

const TaskContext = createContext(null)
const STORAGE_KEY_TASKS = 'cb-tasks-v2'
const STORAGE_KEY_RECURRING = 'cb-recurring-v1'

function getTodayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [recurring, setRecurring] = useState([])
  const { user } = useAuth() // Get user

  // Load Initial Data
  useEffect(() => {
    const fetchTasks = async () => {
      if (user) {
        try {
          const { data } = await api.get('/tasks')
          // Transform: Ensure done is synced with status
          const mappedData = data.map(t => ({
            ...t,
            done: t.status === 'done'
          }))
          setTasks(mappedData)
        } catch (error) {
          console.error("Failed to fetch tasks", error)
        }
      } else {
        // Fallback to local storage
        try {
          const rawTasks = localStorage.getItem(STORAGE_KEY_TASKS)
          const rawRecur = localStorage.getItem(STORAGE_KEY_RECURRING)
          if (rawTasks) setTasks(JSON.parse(rawTasks))
          if (rawRecur) setRecurring(JSON.parse(rawRecur))
        } catch (e) {
          console.error('Failed to parse storage', e)
        }
      }
    }
    fetchTasks()
  }, [user])

  // Save to localStorage (Only if NOT authenticated or maybe sync backup?)
  // For now, let's disable local storage sync if user is logged in to avoid conflicts
  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks))
    }
  }, [tasks, user])

  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY_RECURRING, JSON.stringify(recurring))
    }
  }, [recurring, user])

  // --- RECURRING LOGIC ---
  // (Keeping existing recurring logic for now, though it should ideally be backend side)
  // we will just run it client side for now even if logged in, but saving generated tasks will go to API
  useEffect(() => {
    if (recurring.length === 0) return

    const today = getTodayKey()
    const newInstances = []

    recurring.forEach((rule) => {
      const ruleDate = new Date(rule.createdAt)
      const d = new Date() // Today

      let shouldSpawn = false

      if (rule.frequency === 'daily') {
        shouldSpawn = true
      } else if (rule.frequency === 'weekly') {
        // Same day of week (0-6)
        shouldSpawn = d.getDay() === ruleDate.getDay()
      } else if (rule.frequency === 'monthly') {
        // Same day of month (1-31)
        shouldSpawn = d.getDate() === ruleDate.getDate()
      } else if (rule.frequency === 'yearly') {
        // Same month and day
        shouldSpawn = d.getMonth() === ruleDate.getMonth() && d.getDate() === ruleDate.getDate()
      }

      if (shouldSpawn) {
        // Use functional update to get current tasks state
        setTasks((currentTasks) => {
          const alreadyExists = currentTasks.some(
            (t) => t.dateKey === today && t.sourceRecurringId === rule.id
          )

          if (!alreadyExists) {
            const newInstance = {
              id: 'dist-' + Date.now() + Math.random(), // Temporary ID
              title: rule.title,
              dateKey: today,
              type: 'recurring-instance',
              sourceRecurringId: rule.id,
              category: rule.category || 'General',
              priority: rule.priority || 'P2',
              status: 'todo',
              done: false,
              createdAt: new Date().toISOString(),
            }

            if (user) {
              // For authenticated users, create via API
              createTaskAPI(newInstance)
              return currentTasks // Don't add to state here, API will handle it
            } else {
              // For local users, add to state
              return [...currentTasks, newInstance]
            }
          }

          return currentTasks // No changes needed
        })
      }
    })
  }, [recurring, user]) // Removed 'tasks' from dependency to prevent infinite loop 

  const createTaskAPI = async (taskData) => {
    try {
      // backend expects "subtasks", "isArchived" etc.
      // formatting to match schema
      const payload = {
        title: taskData.title,
        dateKey: taskData.dateKey,
        type: taskData.type,
        priority: taskData.priority,
        category: taskData.category,
        status: taskData.status,
        sourceRecurringId: taskData.sourceRecurringId,
        project: taskData.project, // Add project support
        description: taskData.description, // Add description support
        dueDate: taskData.dueDate, // Add due date support
        assignee: taskData.assignee, // Add assignee support
        // subtasks default []
      }
      const { data } = await api.post('/tasks', payload)
      // Ensure 'done' property is consistent with status
      const newTask = { ...data, done: data.status === 'done' }
      setTasks(prev => [...prev, newTask]) // Use real ID from backend
    } catch (err) {
      console.error("Failed to create task", err)
    }
  }

  const updateTaskAPI = async (id, updates) => {
    // optimistic
    setTasks(prev => prev.map(t => {
      const taskId = t.id || t._id
      return taskId === id ? { ...t, ...updates } : t
    }))
    try {
      await api.put(`/tasks/${id}`, updates)
    } catch (err) {
      console.error("Update failed", err)
      // Revert?
    }
  }

  const deleteTaskAPI = async (id) => {
    // optimistic
    setTasks(prev => prev.filter(t => {
      const taskId = t.id || t._id
      return taskId !== id
    }))
    try {
      await api.delete(`/tasks/${id}`)
    } catch (err) {
      console.error("Delete failed", err)
    }
  }

  const addTask = (taskDetails) => {
    const {
      title,
      description,
      project,
      assignee,
      dueDate,
      dateKey = getTodayKey(),
      type = 'manual',
      recurrence = 'none',
      priority = 'P2',
      category = 'General',
      status = 'todo'
    } = taskDetails

    if (!title.trim()) return

    if (recurrence !== 'none') {
      // Recurring logic - keeping local for now or need Model update
      // We didn't enable Recurring on Backend yet. 
      // Let's just keep recurring in local state (or duplicate logic) for now and only sync "instances"
      // OR better: handle recurring locally and post instances.
      const newRule = {
        id: 'rec-' + Date.now(),
        title: title.trim(),
        frequency: recurrence,
        priority,
        category,
        createdAt: new Date().toISOString()
      }
      setRecurring(prev => [...prev, newRule])
      if (recurrence === 'daily') {
        // let effect handle it
      }
      return // End here for recurring
    }

    // Normal Task
    if (user) {
      createTaskAPI({
        title: title.trim(),
        description,
        project,
        assignee,
        dueDate,
        dateKey,
        type,
        priority,
        category,
        status
      })
    } else {
      const newTask = {
        id: 't' + Date.now(),
        title: title.trim(),
        description,
        project,
        assignee,
        dueDate,
        dateKey,
        type,
        priority,
        category,
        status,
        done: status === 'done',
        createdAt: new Date().toISOString(),
      }
      setTasks((prev) => [...prev, newTask])
    }
  }

  const toggleTask = (id) => {
    const task = tasks.find(t => {
      const taskId = t.id || t._id
      return taskId === id
    })
    if (!task) return

    const newDone = !task.done
    const newStatus = newDone ? 'done' : 'todo'

    if (user) {
      updateTaskAPI(id, { done: newDone, status: newStatus })
    } else {
      setTasks((prev) =>
        prev.map((t) => {
          const taskId = t.id || t._id
          if (taskId !== id) return t
          return { ...t, done: newDone, status: newStatus }
        }),
      )
    }
  }

  const updateTaskStatus = (id, newStatus) => {
    if (user) {
      updateTaskAPI(id, { status: newStatus, done: newStatus === 'done' })
    } else {
      setTasks(prev => prev.map(t => {
        const taskId = t.id || t._id
        if (taskId !== id) return t
        return {
          ...t,
          status: newStatus,
          done: newStatus === 'done'
        }
      }))
    }
  }

  // --- DRAG & DROP ---
  const moveTask = (dragId, hoverId) => {
    // Optimistic only for now, no order persistence in backend yet
    setTasks((prev) => {
      const dragIndex = prev.findIndex((t) => (t.id || t._id) === dragId)
      const hoverIndex = prev.findIndex((t) => (t.id || t._id) === hoverId)
      if (dragIndex < 0 || hoverIndex < 0) return prev

      const newTasks = [...prev]
      const [movedItem] = newTasks.splice(dragIndex, 1)
      newTasks.splice(hoverIndex, 0, movedItem)
      return newTasks
    })
  }

  // --- SUBTASKS ---
  const addSubtask = (taskId, title) => {
    if (!title.trim()) return
    // Assuming backend support later, for now optimistic
    const task = tasks.find(t => {
      const currentTaskId = t.id || t._id
      return currentTaskId === taskId
    })
    if (task && user) {
      const newSub = { title: title.trim(), done: false } // No ID generated by subtask schema yet unless updated
      const newSubtasks = [...(task.subtasks || []), newSub]
      updateTaskAPI(taskId, { subtasks: newSubtasks })
    } else {
      setTasks(prev => prev.map(t => {
        const currentTaskId = t.id || t._id
        if (currentTaskId !== taskId) return t
        const sub = {
          id: 's' + Date.now(),
          title: title.trim(),
          done: false
        }
        return { ...t, subtasks: [...(t.subtasks || []), sub] }
      }))
    }
  }

  const toggleSubtask = (taskId, subTaskId) => {
    const task = tasks.find(t => {
      const currentTaskId = t.id || t._id
      return currentTaskId === taskId
    })
    if (task && user) {
      // find index or match logic depends on if subTaskId is from Mongo ( _id) or local
      // Backend subtasks have _id. 
      const newSubtasks = (task.subtasks || []).map(s => {
        // Robust check for ID
        const currentSubId = s._id || s.id
        if (currentSubId === subTaskId) return { ...s, done: !s.done }
        return s
      })
      updateTaskAPI(taskId, { subtasks: newSubtasks })
    } else {
      setTasks(prev => prev.map(t => {
        const currentTaskId = t.id || t._id
        if (currentTaskId !== taskId) return t
        return {
          ...t,
          subtasks: (t.subtasks || []).map(s => {
            const currentSubId = s._id || s.id
            return currentSubId === subTaskId ? { ...s, done: !s.done } : s
          })
        }
      }))
    }
  }

  // --- ARCHIVE / RESTORE ---
  const archiveTask = (id) => {
    if (user) {
      updateTaskAPI(id, { isArchived: true })
    } else {
      setTasks(prev => prev.map(t => {
        const taskId = t.id || t._id
        return taskId === id ? { ...t, isArchived: true } : t
      }))
    }
  }

  const restoreTask = (id) => {
    if (user) {
      updateTaskAPI(id, { isArchived: false })
    } else {
      setTasks(prev => prev.map(t => {
        const taskId = t.id || t._id
        return taskId === id ? { ...t, isArchived: false } : t
      }))
    }
  }

  // deleteTask permanently removes it
  const deleteTask = (id) => {
    if (user) {
      deleteTaskAPI(id)
    } else {
      setTasks((prev) => prev.filter((t) => {
        const taskId = t.id || t._id
        return taskId !== id
      }))
    }
  }

  const deleteRecurring = (id) => {
    setRecurring(prev => prev.filter(r => r.id !== id))
  }

  const getTasksForDate = (dateKey) =>
    tasks.filter((t) => t.dateKey === dateKey && !t.isArchived)

  const todayKey = getTodayKey()
  const todayTasks = useMemo(() => getTasksForDate(todayKey), [tasks, todayKey])

  const completedCount = todayTasks.filter((t) => t.done).length
  const totalCount = todayTasks.length

  return (
    <TaskContext.Provider
      value={{
        tasks,
        recurring,
        addTask,
        updateTask: updateTaskAPI,
        toggleTask,
        updateTaskStatus,
        deleteTask,
        deleteRecurring,
        getTasksForDate,
        addSubtask,
        toggleSubtask,
        moveTask,
        archiveTask,
        restoreTask,
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
