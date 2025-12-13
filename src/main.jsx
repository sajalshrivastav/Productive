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

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <GamificationProvider>
              <TaskProvider>
                <ChallengeProvider>
                  <HabitProvider>
                    <FocusSessionProvider>
                      <App />
                    </FocusSessionProvider>
                  </HabitProvider>
                </ChallengeProvider>
              </TaskProvider>
            </GamificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </Router>
  </StrictMode>,
)
