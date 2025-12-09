import { useState } from 'react'
import Dashboard from './pages/Dashboard.jsx'
import Button from './Components/UI/Button.jsx'
import Habits from './pages/Habits.jsx'
import Tasks from './pages/Task.jsx'
import Challenges from './pages/Challenges.jsx'
import CalendarPage from './pages/Calendar.jsx'
import JobTracker from './pages/JobTracker.jsx'
import Productivity from './pages/Productivity.jsx'
import { Settings2 } from 'lucide-react'
import TodayInfo from './Components/dashboard/TodayInfo.jsx'

const PAGES = [
  'Dashboard',
  'Habits',
  'Tasks',
  'Productivity',
  'Challenges',
  'Calendar',
  'Jobs',
]
export default function App() {
  const [activePage, setActivePage] = useState('Dashboard')

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard />
      case 'Habits':
        return <Habits />
      case 'Tasks':
        return <Tasks />
      case 'Challenges':
        return <Challenges />
      case 'Calendar':
        return <CalendarPage />
      case 'Jobs':
        return <JobTracker />
      case 'Productivity':
        return <Productivity />
      default:
        return (
          <div style={{ padding: '8px 2px', fontSize: '0.85rem' }}>
            {activePage} page – coming soon ✨
          </div>
        )
    }
  }

  return (
    <div className="app-root">
      <div className="app-shell">
        {/* Top header */}
        <header className="app-header">
          <div className="app-logo">
            <div className="app-logo-badge">CB</div>
            <div>
              <div className="app-logo-text-title">Challenge OS</div>
              <div className="app-logo-text-subtitle">
                Focus. Track. Ship. Grow.
              </div>
            </div>
          </div>
          <Button variant="ghost" onClick={() => setActivePage('Dashboard')}>
            Today
          </Button>
        </header>

        {/* Nav */}
        <div className="nav-bar-function">
          <nav className="app-nav">
            {PAGES.map((page) => (
              <button
                key={page}
                className={
                  'app-nav-button' + (activePage === page ? ' active' : '')
                }
                onClick={() => setActivePage(page)}
              >
                {page}
              </button>
            ))}
          </nav>
          <div className="app-nav extra-nav-icon ">
            <TodayInfo />
            <Settings2 className="settings" size={16} />
          </div>
        </div>

        {/* Active page */}
        {renderPage()}
      </div>
    </div>
  )
}
