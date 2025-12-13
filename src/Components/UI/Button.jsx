import React from 'react'

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const baseStyle = {
    padding: '10px 20px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  }

  const variants = {
    primary: {
      background: 'var(--accent-gradient)',
      color: 'white',
      boxShadow: '0 4px 12px var(--accent-glow)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-subtle)'
    },
    danger: {
      background: 'rgba(244, 63, 94, 0.1)',
      color: 'var(--danger)',
      border: '1px solid rgba(244, 63, 94, 0.2)'
    }
  }

  const combinedStyle = { ...baseStyle, ...variants[variant] }

  return (
    <button style={combinedStyle} className={className} {...props} onMouseEnter={(e) => {
        if(variant === 'primary') e.currentTarget.style.transform = 'translateY(-2px)'
        if(variant === 'ghost') e.currentTarget.style.background = 'var(--bg-card-hover)'
    }} onMouseLeave={(e) => {
        if(variant === 'primary') e.currentTarget.style.transform = 'translateY(0)'
        if(variant === 'ghost') e.currentTarget.style.background = 'transparent'
    }}>
      {children}
    </button>
  )
}
