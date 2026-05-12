'use client'
import { motion } from 'framer-motion'
import { ReactNode, CSSProperties } from 'react'

// Pre-computed gradients matching darken/lighten from pisi-shared.jsx
const GRADIENTS: Record<string, { bg: string; shadow: string; textColor: string }> = {
  orange: {
    bg:    'linear-gradient(135deg, #CC4400 0%, #FF6B1A 60%, #FF8E53 100%)',
    shadow:'0 0 24px rgba(255,107,26,0.8), 0 6px 20px rgba(255,107,26,0.55), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(180,50,0,0.5)',
    textColor: '#fff',
  },
  cyan: {
    bg:    'linear-gradient(135deg, #007ACC 0%, #00C8FF 60%, #44D4FF 100%)',
    shadow:'0 0 24px rgba(0,200,255,0.8), 0 6px 20px rgba(0,200,255,0.55), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,80,140,0.5)',
    textColor: '#fff',
  },
  pink: {
    bg:    'linear-gradient(135deg, #B00060 0%, #FF2A8A 60%, #FF60B0 100%)',
    shadow:'0 0 24px rgba(255,42,138,0.8), 0 6px 20px rgba(255,42,138,0.55), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(140,0,60,0.5)',
    textColor: '#fff',
  },
  lime: {
    bg:    'linear-gradient(135deg, #6ACC00 0%, #A8FF1E 60%, #C4FF66 100%)',
    shadow:'0 0 24px rgba(168,255,30,0.7), 0 6px 20px rgba(168,255,30,0.5), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(80,140,0,0.5)',
    textColor: '#0a1200',
  },
  blue: {
    bg:    'linear-gradient(135deg, #2840CC 0%, #4B7FFF 60%, #7A9FFF 100%)',
    shadow:'0 0 24px rgba(75,127,255,0.8), 0 6px 20px rgba(75,127,255,0.55), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(20,40,150,0.5)',
    textColor: '#fff',
  },
  purple: {
    bg:    'linear-gradient(135deg, #7000B4 0%, #B44FFF 60%, #CC88FF 100%)',
    shadow:'0 0 24px rgba(180,79,255,0.8), 0 6px 20px rgba(180,79,255,0.55), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(80,0,140,0.5)',
    textColor: '#fff',
  },
  danger: {
    bg:    'linear-gradient(135deg, #8B0000 0%, #EF4444 60%, #FF6B6B 100%)',
    shadow:'0 0 24px rgba(239,68,68,0.7), 0 6px 20px rgba(239,68,68,0.5), inset 0 1px 0 rgba(255,255,255,0.25)',
    textColor: '#fff',
  },
  ghost: {
    bg:    'rgba(255,255,255,0.04)',
    shadow:'inset 0 1px 0 rgba(255,255,255,0.07)',
    textColor: '#F2F0FF',
  },
}

type Variant = 'orange' | 'cyan' | 'pink' | 'lime' | 'blue' | 'purple' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  style?: CSSProperties
}

const SIZES: Record<Size, { minHeight: number; padding: string; fontSize: number; borderRadius: number }> = {
  sm: { minHeight: 40, padding: '0 14px', fontSize: 13, borderRadius: 14 },
  md: { minHeight: 48, padding: '0 18px', fontSize: 14, borderRadius: 16 },
  lg: { minHeight: 56, padding: '0 22px', fontSize: 17, borderRadius: 18 },
}

export function PrimaryButton({
  children, onClick, disabled, className, variant = 'orange', size = 'lg',
  fullWidth = false, type = 'button', style = {},
}: Props) {
  const g = GRADIENTS[variant]
  const s = SIZES[size]
  const isGhost = variant === 'ghost'

  return (
    <motion.button
      type={type}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: fullWidth ? '100%' : undefined,
        minHeight: s.minHeight,
        padding: s.padding,
        borderRadius: s.borderRadius,
        border: isGhost ? '1px solid rgba(255,255,255,0.10)' : 'none',
        background: g.bg,
        color: g.textColor,
        fontFamily: 'Space Grotesk, system-ui',
        fontWeight: 700,
        fontSize: s.fontSize,
        letterSpacing: '0.01em',
        boxShadow: g.shadow,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        transition: 'opacity 0.15s',
        ...style,
      }}
    >
      {children}
    </motion.button>
  )
}
