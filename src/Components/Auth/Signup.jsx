import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../Context/AuthContext'
import { Sparkles, ArrowRight, Eye, EyeOff, User, Mail, Lock, CheckCircle2 } from 'lucide-react'
import '../../Styles/Auth.css'

export default function Signup() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(0)

    const { register } = useAuth()
    const navigate = useNavigate()

    const calculatePasswordStrength = (password) => {
        let strength = 0
        if (password.length >= 6) strength++
        if (password.length >= 10) strength++
        if (/[A-Z]/.test(password)) strength++
        if (/[0-9]/.test(password)) strength++
        if (/[^A-Za-z0-9]/.test(password)) strength++
        return strength
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)
        const result = await register(formData.username, formData.email, formData.password)

        if (result.success) {
            navigate('/dashboard')
        } else {
            setError(result.message || 'Registration failed')
        }
        setLoading(false)
    }

    const strengthColors = ['#52525b', '#ef4444', '#f59e0b', '#eab308', '#22c55e']
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

    return (
        <div className="auth-container">
            {/* Animated Background */}
            <div className="auth-bg">
                <div className="auth-blob auth-blob-1"></div>
                <div className="auth-blob auth-blob-2"></div>
                <div className="auth-blob auth-blob-3"></div>
            </div>

            {/* Signup Card */}
            <div className="auth-card auth-card-large animate-slide-up">
                {/* Logo & Header */}
                <div className="auth-header">
                    <div className="auth-logo">
                        <Sparkles size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Start your productivity journey today</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="auth-error animate-shake">
                            {error}
                        </div>
                    )}

                    {/* Username Input */}
                    <div className="auth-input-group">
                        <label className="auth-label">Username</label>
                        <div className="auth-input-wrapper">
                            <User className="auth-input-icon" size={20} />
                            <input
                                type="text"
                                name="username"
                                className="auth-input auth-input-with-icon"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div className="auth-input-group">
                        <label className="auth-label">Email Address</label>
                        <div className="auth-input-wrapper">
                            <Mail className="auth-input-icon" size={20} />
                            <input
                                type="email"
                                name="email"
                                className="auth-input auth-input-with-icon"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="auth-input-group">
                        <label className="auth-label">Password</label>
                        <div className="auth-input-wrapper">
                            <Lock className="auth-input-icon" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className="auth-input auth-input-with-icon"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
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

                        {/* Password Strength Indicator */}
                        {formData.password && (
                            <div className="password-strength">
                                <div className="password-strength-bars">
                                    {[1, 2, 3, 4, 5].map(level => (
                                        <div
                                            key={level}
                                            className="password-strength-bar"
                                            style={{
                                                backgroundColor: level <= passwordStrength ? strengthColors[passwordStrength] : '#27272a'
                                            }}
                                        />
                                    ))}
                                </div>
                                <span
                                    className="password-strength-label"
                                    style={{ color: strengthColors[passwordStrength] }}
                                >
                                    {strengthLabels[passwordStrength]}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Input */}
                    <div className="auth-input-group">
                        <label className="auth-label">Confirm Password</label>
                        <div className="auth-input-wrapper">
                            <Lock className="auth-input-icon" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                className="auth-input auth-input-with-icon"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
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
                                Create Account
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    <p className="auth-footer-text">
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="auth-link"
                        >
                            Sign in
                        </button>
                    </p>
                </div>

                {/* Features */}
                <div className="auth-features">
                    <div className="auth-feature">
                        <CheckCircle2 size={16} />
                        <span>Free forever</span>
                    </div>
                    <div className="auth-feature">
                        <CheckCircle2 size={16} />
                        <span>No credit card required</span>
                    </div>
                    <div className="auth-feature">
                        <CheckCircle2 size={16} />
                        <span>Start in seconds</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
