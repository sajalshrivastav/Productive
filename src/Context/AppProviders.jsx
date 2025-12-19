import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { TaskProvider } from './TaskContext.jsx'
import { ChallengeProvider } from './ChallengeContext.jsx'
import { HabitProvider } from './HabitContext.jsx'
import { GamificationProvider } from './GamificationContext.jsx'
import { AuthProvider } from './AuthContext.jsx'
import { FocusSessionProvider } from './FocusSessionContext.jsx'
import { ThemeProvider } from './ThemeContext.jsx'
import { ToastProvider } from './ToastContext.jsx'
import { ProjectProvider } from './ProjectContext.jsx'
import { EventProvider } from './EventContext.jsx'

export function AppProviders({ children }) {
    return (
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
                                                    {children}
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
    )
}
