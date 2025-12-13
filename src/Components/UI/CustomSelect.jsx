import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

// options: { value, label, icon: IconComponentOrEmoji, color }[]
export default function CustomSelect({ value, onChange, options, placeholder = 'Select', width = 'auto' }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)

  const handleSelect = (val) => {
    onChange(val)
    setIsOpen(false)
  }

  return (
    <div 
        ref={containerRef}
        style={{ 
            position: 'relative', 
            width: width,
            minWidth: '120px'
        }}
    >
        {/* Trigger */}
        <div 
            onClick={() => setIsOpen(!isOpen)}
            style={{
                background: 'var(--bg-surface)', 
                border: isOpen ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                userSelect: 'none'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedOption ? (
                    <>
                        {/* Render Icon if present (works for both Component or String/Emoji) */}
                        {selectedOption.icon && (
                            typeof selectedOption.icon === 'string' ? 
                            <span>{selectedOption.icon}</span> : 
                            <selectedOption.icon size={16} color={selectedOption.color || 'var(--text-primary)'} />
                        )}
                        <span style={{ color: selectedOption.color || 'inherit' }}>{selectedOption.label}</span>
                    </>
                ) : (
                    <span style={{ color: 'var(--text-muted)' }}>{placeholder}</span>
                )}
            </div>
            {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
            <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                zIndex: 100,
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                maxHeight: '200px',
                overflowY: 'auto'
            }}>
                {options.map((opt) => {
                    const isSelected = opt.value === value
                    return (
                        <div 
                            key={opt.value}
                            onClick={() => handleSelect(opt.value)}
                            className="custom-select-option" // We can stick a class in index.css for hover, or use inline mouse events
                            style={{
                                padding: '8px 10px',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.9rem',
                                background: isSelected ? 'var(--bg-surface)' : 'transparent',
                                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = isSelected ? 'var(--bg-surface)' : 'transparent'}
                        >
                             {opt.icon && (
                                typeof opt.icon === 'string' ? 
                                <span>{opt.icon}</span> : 
                                <opt.icon size={16} color={opt.color || 'var(--text-muted)'} />
                            )}
                            <span style={{ color: opt.color || 'inherit' }}>{opt.label}</span>
                            
                            {/* Checkmark for selected? Optional */}
                            {isSelected && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)' }} />}
                        </div>
                    )
                })}
            </div>
        )}
    </div>
  )
}
