import React, { useState } from 'react'
import { 
  Heart, Star, Target, Zap, Coffee, Book, Dumbbell, 
  Moon, Sun, Droplets, Leaf, Music, Camera, Palette,
  Gamepad2, Headphones, Bike, Activity, Plane,
  Home, Car, Train, Bus, Truck, Ship, Rocket,
  Apple, Pizza, Cake, Coffee as CoffeeIcon, Sandwich, Cookie,
  Check, X, Plus, Minus, ArrowUp, ArrowDown,
  Circle, Square, Triangle, Diamond, Hexagon, Octagon
} from 'lucide-react'

const ICON_CATEGORIES = {
  'Popular': [Heart, Star, Target, Zap, Coffee, Book, Dumbbell, Moon],
  'Activities': [Sun, Droplets, Leaf, Music, Camera, Palette, Gamepad2, Headphones],
  'Sports': [Bike, Activity, Dumbbell, Target, Circle, Star, Zap, Heart],
  'Transport': [Home, Car, Train, Bus, Truck, Ship, Rocket, Plane],
  'Food': [Apple, Pizza, Cake, CoffeeIcon, Sandwich, Cookie, Coffee, Droplets],
  'Shapes': [Circle, Square, Triangle, Diamond, Hexagon, Octagon, Star, Heart],
  'Actions': [Check, X, Plus, Minus, ArrowUp, ArrowDown, Zap, Target]
}

const COLORS = [
  // Solid colors
  { name: 'pink', color: '#ec4899', type: 'solid' },
  { name: 'blue', color: '#3b82f6', type: 'solid' },
  { name: 'green', color: '#10b981', type: 'solid' },
  { name: 'amber', color: '#f59e0b', type: 'solid' },
  { name: 'purple', color: '#8b5cf6', type: 'solid' },
  { name: 'red', color: '#ef4444', type: 'solid' },
  { name: 'orange', color: '#f97316', type: 'solid' },
  { name: 'cyan', color: '#06b6d4', type: 'solid' },
  
  // Pastel colors
  { name: 'pastel-pink', color: '#fbb6ce', type: 'pastel' },
  { name: 'pastel-blue', color: '#93c5fd', type: 'pastel' },
  { name: 'pastel-green', color: '#86efac', type: 'pastel' },
  { name: 'pastel-purple', color: '#c4b5fd', type: 'pastel' },
  { name: 'pastel-yellow', color: '#fde047', type: 'pastel' },
  { name: 'pastel-orange', color: '#fdba74', type: 'pastel' },
  { name: 'pastel-cyan', color: '#67e8f9', type: 'pastel' },
  { name: 'pastel-rose', color: '#fda4af', type: 'pastel' },
  
  // Gradient colors
  { name: 'gradient-sunset', color: 'linear-gradient(135deg, #ff7e5f, #feb47b)', type: 'gradient' },
  { name: 'gradient-ocean', color: 'linear-gradient(135deg, #667eea, #764ba2)', type: 'gradient' },
  { name: 'gradient-forest', color: 'linear-gradient(135deg, #11998e, #38ef7d)', type: 'gradient' },
  { name: 'gradient-fire', color: 'linear-gradient(135deg, #ff9a9e, #fecfef)', type: 'gradient' },
  { name: 'gradient-sky', color: 'linear-gradient(135deg, #a8edea, #fed6e3)', type: 'gradient' },
  { name: 'gradient-cosmic', color: 'linear-gradient(135deg, #667eea, #764ba2)', type: 'gradient' }
]

export default function IconSelector({ selectedIcon, selectedColor, onIconChange, onColorChange }) {
  const [activeCategory, setActiveCategory] = useState('Popular')
  const [colorFilter, setColorFilter] = useState('all')

  const filteredColors = colorFilter === 'all' 
    ? COLORS 
    : COLORS.filter(c => c.type === colorFilter)

  const getIconComponent = (IconComponent) => {
    return <IconComponent size={20} />
  }

  const getColorStyle = (colorData) => {
    if (colorData.type === 'gradient') {
      return { background: colorData.color }
    }
    return { backgroundColor: colorData.color }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Icon Selector */}
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-soft)', marginBottom: '12px', display: 'block' }}>
          Choose Icon
        </label>
        
        {/* Category Tabs */}
        <div style={{ 
          display: 'flex', gap: '4px', marginBottom: '12px', overflowX: 'auto', 
          padding: '4px', background: 'var(--bg-panel)', borderRadius: '8px'
        }}>
          {Object.keys(ICON_CATEGORIES).map(category => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              style={{
                padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '0.75rem',
                background: activeCategory === category ? 'var(--bg-surface)' : 'transparent',
                color: activeCategory === category ? 'var(--text-main)' : 'var(--text-soft)',
                cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap'
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Icon Grid */}
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px',
          maxHeight: '120px', overflowY: 'auto', padding: '4px'
        }}>
          {ICON_CATEGORIES[activeCategory].map((IconComponent, index) => {
            const iconName = IconComponent.name || `icon-${index}`
            const isSelected = selectedIcon === iconName
            
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => onIconChange(iconName)}
                style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: isSelected ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  color: isSelected ? '#000' : 'var(--text-main)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)'
                }}
              >
                {getIconComponent(IconComponent)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Color Selector */}
      <div>
        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-soft)', marginBottom: '12px', display: 'block' }}>
          Choose Color
        </label>

        {/* Color Filter Tabs */}
        <div style={{ 
          display: 'flex', gap: '4px', marginBottom: '12px',
          padding: '4px', background: 'var(--bg-panel)', borderRadius: '8px'
        }}>
          {['all', 'solid', 'pastel', 'gradient'].map(filter => (
            <button
              key={filter}
              type="button"
              onClick={() => setColorFilter(filter)}
              style={{
                padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '0.75rem',
                background: colorFilter === filter ? 'var(--bg-surface)' : 'transparent',
                color: colorFilter === filter ? 'var(--text-main)' : 'var(--text-soft)',
                cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'capitalize'
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Color Grid */}
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px',
          maxHeight: '80px', overflowY: 'auto', padding: '4px'
        }}>
          {filteredColors.map(colorData => {
            const isSelected = selectedColor === colorData.name
            
            return (
              <button
                key={colorData.name}
                type="button"
                onClick={() => onColorChange(colorData.name)}
                style={{
                  width: '32px', height: '32px', borderRadius: '6px',
                  border: isSelected ? '3px solid var(--text-main)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  ...getColorStyle(colorData)
                }}
                title={colorData.name}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}