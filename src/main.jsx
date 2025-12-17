import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TaskProvider } from './Context/TaskContext.jsx'
import { ChallengeProvider } from './Context/ChallengeContext.jsx'
import { HabitProvider } from './Context/HabitContext.jsx'
import { GamificationProvider } from './Context/GamificationContext.jsx'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './Context/AuthContext.jsx'
import { FocusSessionProvider } from './Context/FocusSessionContext.jsx'
import { ThemeProvider } from './Context/ThemeContext.jsx'
import { ToastProvider } from './Context/ToastContext.jsx'
import { ProjectProvider } from './Context/ProjectContext.jsx'
import { EventProvider } from './Context/EventContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <GamificationProvider>
            <ToastProvider>
              <TaskProvider>
                <ChallengeProvider>
                  <HabitProvider>
                    <FocusSessionProvider>
                      <ProjectProvider>
                        <EventProvider>
                          <App />
                        </EventProvider>
                      </ProjectProvider>
                    </FocusSessionProvider>
                  </HabitProvider>
                </ChallengeProvider>
              </TaskProvider>
            </ToastProvider>
          </GamificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  </StrictMode>,
)
