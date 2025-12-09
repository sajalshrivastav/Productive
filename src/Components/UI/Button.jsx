import React from 'react'

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const base =
    'cb-btn ' +
    (variant === 'primary'
      ? 'cb-btn-primary'
      : variant === 'ghost'
      ? 'cb-btn-ghost'
      : '')

  return (
    <button className={base + ' ' + className} {...props}>
      {children}
    </button>
  )
}
