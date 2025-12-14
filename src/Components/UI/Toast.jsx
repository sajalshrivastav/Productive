import React, { useEffect, useState } from 'react'
import { X, Check, Info, AlertTriangle, AlertOctagon, ArrowRight } from 'lucide-react'
import '../../Styles/Toast.css'

const ICONS = {
    success: Check,
    info: Info,
    warning: AlertTriangle,
    danger: AlertOctagon
}

export default function Toast({ id, type = 'info', title, message, actionLabel, onAction, onClose, duration = 5000 }) {
    const [isExiting, setIsExiting] = useState(false)
    const Icon = ICONS[type] || Info

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose()
        }, duration)
        return () => clearTimeout(timer)
    }, [duration])

    const handleClose = () => {
        setIsExiting(true)
        setTimeout(() => {
            onClose(id)
        }, 200) // Match animation time
    }

    return (
        <div className={`cb-toast ${type} ${isExiting ? 'exiting' : ''}`}>
            <div className="toast-icon-wrapper">
                <Icon size={18} strokeWidth={2.5} />
            </div>

            <div className="toast-content">
                <div className="toast-title">{title}</div>
                <div className="toast-message">{message}</div>
                {actionLabel && (
                    <button className="toast-action" onClick={onAction}>
                        {actionLabel} <ArrowRight size={14} />
                    </button>
                )}
            </div>

            <button className="toast-close" onClick={handleClose}>
                <X size={16} />
            </button>
        </div>
    )
}
