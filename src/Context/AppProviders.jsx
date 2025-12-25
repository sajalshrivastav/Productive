import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { GamificationProvider } from './GamificationContext.jsx'
import { AuthProvider } from './AuthContext.jsx'
import { ThemeProvider } from './ThemeContext.jsx'
import { ToastProvider } from './ToastContext.jsx'


import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000,
        },
    },
})

export function AppProviders({ children }) {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>

                <AuthProvider>
                    <ThemeProvider>
                        <GamificationProvider>
                            <ToastProvider>
                                {children}
                            </ToastProvider>
                        </GamificationProvider>
                    </ThemeProvider>
                </AuthProvider>

            </Router>
        </QueryClientProvider>
    )
}

