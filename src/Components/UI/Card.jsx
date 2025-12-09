import React from 'react'

export default function Card({ children, className = '' }) {
  return <div className={'cb-card ' + className}>{children}</div>
}
