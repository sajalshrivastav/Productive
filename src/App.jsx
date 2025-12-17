import { useState } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Button from './Components/UI/Button.jsx'
import Habits from './pages/Habits.jsx'
import Tasks from './pages/Task.jsx'
import Challenges from './pages/Challenges.jsx'
import CalendarPage from './pages/Calendar.jsx'
import JobTracker from './pages/JobTracker.jsx'
import Projects from './pages/Projects.jsx'
import Productivity from './pages/Productivity.jsx'
import { Settings2 } from 'lucide-react'
import TodayInfo from './Components/dashboard/TodayInfo.jsx'
import GlobalDrawer from './Components/layout/GlobalDrawer.jsx'
import Login from './Components/Auth/Login.jsx'
import Signup from './Components/Auth/Signup.jsx'
import ProtectedRoute from './Components/Auth/ProtectedRoute.jsx'
import { useAuth } from './Context/AuthContext.jsx'
import { ThemeProvider } from './Context/ThemeContext.jsx'

const PAGES = [
  { name: 'Dashboard', path: '/' },
  { name: 'Projects', path: '/projects' },
  { name: 'Habits', path: '/habits' },
  { name: 'Tasks', path: '/tasks' },
  { name: 'Challenges', path: '/challenges' },
  { name: 'Calendar', path: '/calendar' },
  { name: 'Jobs', path: '/jobs' },
]

function AppLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const location = useLocation()
  const { logout } = useAuth()

  return (
    <div className="app-root">
      <GlobalDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <div className="app-shell">
        {/* Top header */}
        <header className="app-header">
          <div className="app-logo">
            <div className="app-logo-badge">ON</div>
            <div>
              <div className="app-logo-text-title">Onyx</div>
              <div className="app-logo-text-subtitle">
                Focus. Track. Ship. Grow.
              </div>
            </div>
          </div>
          {/* Functional Bar / Today Button */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Button variant="ghost" onClick={() => setIsDrawerOpen(true)} style={{ color: 'var(--text-main)' }}>
              Today
            </Button>
            <Button variant="ghost" onClick={logout} style={{ color: 'var(--text-muted)' }}>
              Logout
            </Button>
          </div>
        </header>

        {/* Nav */}
        <div className="nav-bar-function">
          <nav className="app-nav">
            {PAGES.map((page) => (
              <LinkButton
                key={page.name}
                to={page.path}
                isActive={location.pathname === page.path || (page.path === '/' && location.pathname === '/dashboard')}
              >
                {page.name}
              </LinkButton>
            ))}
          </nav>
          <div className="app-nav extra-nav-icon ">
            <TodayInfo />
            <Settings2 className="settings" size={16} />
          </div>
        </div>

        {/* Active page */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/jobs" element={<JobTracker />} />
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'

function LinkButton({ to, isActive, children }) {
  return (
    <Link
      to={to}
      className={'app-nav-button' + (isActive ? ' active' : '')}
      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {children}
    </Link>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<AppLayout />} />
        </Route>
      </Routes>
    </ThemeProvider>
  )
}
