import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../Context/AuthContext'
import { Sparkles, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import '../../Styles/Auth.css'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await login(email, password)

        if (result.success) {
            navigate('/dashboard')
        } else {
            setError(result.message || 'Login failed')
        }
        setLoading(false)
    }

    return (
        <div className="auth-container">
            {/* Animated Background */}
            <div className="auth-bg">
                <div className="auth-blob auth-blob-1"></div>
                <div className="auth-blob auth-blob-2"></div>
                <div className="auth-blob auth-blob-3"></div>
            </div>

            {/* Login Card */}
            <div className="auth-card animate-slide-up">
                {/* Logo & Header */}
                <div className="auth-header">
                    <div className="auth-logo">
                        <Sparkles size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to continue your journey</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="auth-error animate-shake">
                            {error}
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="auth-input-group">
                        <label className="auth-label">Email Address</label>
                        <input
                            type="email"
                            className="auth-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div className="auth-input-group">
                        <label className="auth-label">Password</label>
                        <div className="auth-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="auth-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="auth-toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`auth-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="auth-spinner"></span>
                        ) : (
                            <>
                                Sign In
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    <p className="auth-footer-text">
                        Don't have an account?{' '}
                        <button
                            onClick={() => navigate('/signup')}
                            className="auth-link"
                        >
                            Sign up
                        </button>
                    </p>
                </div>

                {/* Features */}
                <div className="auth-features">
                    <div className="auth-feature">
                        <CheckCircle2 size={16} />
                        <span>Track habits & goals</span>
                    </div>
                    <div className="auth-feature">
                        <CheckCircle2 size={16} />
                        <span>Real-time sync</span>
                    </div>
                    <div className="auth-feature">
                        <CheckCircle2 size={16} />
                        <span>Beautiful analytics</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
