import { CSSProperties } from 'react'
import { 
  Heart, Star, Target, Zap, Coffee, Book, Dumbbell, 
  Moon, Sun, Droplets, Leaf, Music, Camera, Palette,
  Gamepad2, Headphones, Bike, Activity, Plane,
  Home, Car, Train, Bus, Truck, Ship, Rocket,
  Apple, Pizza, Cake, Coffee as CoffeeIcon, Sandwich, Cookie,
  Check, X, Plus, Minus, ArrowUp, ArrowDown,
  Circle, Square, Triangle, Diamond, Hexagon, Octagon,
  LucideIcon
} from 'lucide-react'

// ... (omitting strict imports for brevity if tool allows, but exact content is safer)

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  'Heart': Heart,
  'Star': Star,
  'Target': Target,
  'Zap': Zap,
  'Coffee': Coffee,
  'Book': Book,
  'Dumbbell': Dumbbell,
  'Moon': Moon,
  'Sun': Sun,
  'Droplets': Droplets,
  'Leaf': Leaf,
  'Music': Music,
  'Camera': Camera,
  'Palette': Palette,
  'Gamepad2': Gamepad2,
  'Headphones': Headphones,
  'Bike': Bike,
  'Activity': Activity,
  'Plane': Plane,
  'Home': Home,
  'Car': Car,
  'Train': Train,
  'Bus': Bus,
  'Truck': Truck,
  'Ship': Ship,
  'Rocket': Rocket,
  'Apple': Apple,
  'Pizza': Pizza,
  'Cake': Cake,
  'CoffeeIcon': CoffeeIcon,
  'Sandwich': Sandwich,
  'Cookie': Cookie,
  'Check': Check,
  'X': X,
  'Plus': Plus,
  'Minus': Minus,
  'ArrowUp': ArrowUp,
  'ArrowDown': ArrowDown,
  'Circle': Circle,
  'Square': Square,
  'Triangle': Triangle,
  'Diamond': Diamond,
  'Hexagon': Hexagon,
  'Octagon': Octagon
}

// Color definitions
const COLOR_STYLES: Record<string, CSSProperties> = {
  // Solid colors
  'pink': { backgroundColor: '#ec4899' },
  'blue': { backgroundColor: '#3b82f6' },
  'green': { backgroundColor: '#10b981' },
  'amber': { backgroundColor: '#f59e0b' },
  'purple': { backgroundColor: '#8b5cf6' },
  'red': { backgroundColor: '#ef4444' },
  'orange': { backgroundColor: '#f97316' },
  'cyan': { backgroundColor: '#06b6d4' },
  
  // Pastel colors
  'pastel-pink': { backgroundColor: '#fbb6ce' },
  'pastel-blue': { backgroundColor: '#93c5fd' },
  'pastel-green': { backgroundColor: '#86efac' },
  'pastel-purple': { backgroundColor: '#c4b5fd' },
  'pastel-yellow': { backgroundColor: '#fde047' },
  'pastel-orange': { backgroundColor: '#fdba74' },
  'pastel-cyan': { backgroundColor: '#67e8f9' },
  'pastel-rose': { backgroundColor: '#fda4af' },
  
  // Gradient colors
  'gradient-sunset': { background: 'linear-gradient(135deg, #ff7e5f, #feb47b)' },
  'gradient-ocean': { background: 'linear-gradient(135deg, #667eea, #764ba2)' },
  'gradient-forest': { background: 'linear-gradient(135deg, #11998e, #38ef7d)' },
  'gradient-fire': { background: 'linear-gradient(135deg, #ff9a9e, #fecfef)' },
  'gradient-sky': { background: 'linear-gradient(135deg, #a8edea, #fed6e3)' },
  'gradient-cosmic': { background: 'linear-gradient(135deg, #667eea, #764ba2)' }
}

export function getIconComponent(iconName: string, size: number = 20): JSX.Element {
  const IconComponent = ICON_MAP[iconName]
  if (!IconComponent) {
    return <Star size={size} /> // Default fallback
  }
  return <IconComponent size={size} />
}

export function getColorStyle(colorName: string): CSSProperties {
  return COLOR_STYLES[colorName] || { backgroundColor: '#ec4899' } // Default fallback
}

export function getColorValue(colorName: string): string {
  const style = COLOR_STYLES[colorName]
  if (!style) return '#ec4899'
  
  if (style.background) {
    // For gradients, return the first color
    const match = (style.background as string).match(/#[a-fA-F0-9]{6}/)
    return match ? match[0] : '#ec4899'
  }
  
  return (style.backgroundColor as string) || '#ec4899'
}