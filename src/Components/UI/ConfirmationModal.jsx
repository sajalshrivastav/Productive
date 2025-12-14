import React from 'react'
import '../../Styles/ConfirmationModal.css'
import { AlertTriangle, Trash2, X } from 'lucide-react'

export default function ConfirmationModal({ 
    open, 
    onClose, 
    onConfirm, 
    title = 'Are you sure?', 
    message = 'This action cannot be undone.',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    type = 'danger' // danger, warning, or info
}) {
    if (!open) return null

    return (
        <div className="conf-modal-backdrop" onClick={onClose}>
            <div className="conf-modal" onClick={e => e.stopPropagation()}>
                <button className="conf-close-icon" onClick={onClose}><X size={20} /></button>
                
                <div className="conf-icon-wrapper">
                   {type === 'danger' && <div className="conf-icon danger"><Trash2 size={32} /></div>}
                   {type === 'warning' && <div className="conf-icon warning"><AlertTriangle size={32} /></div>}
                </div>

                <div className="conf-content">
                    <h3 className="conf-title">{title}</h3>
                    <p className="conf-message">{message}</p>
                </div>

                <div className="conf-actions">
                    <button className="conf-btn cancel" onClick={onClose}>{cancelText}</button>
                    <button 
                        className={`conf-btn confirm ${type}`} 
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
