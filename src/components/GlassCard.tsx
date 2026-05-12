'use client'
import { ReactNode, CSSProperties } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface GlassCardProps {
  children: ReactNode
  accent?: string
  glow?: boolean
  radius?: number
  padding?: number | string
  style?: CSSProperties
  onClick?: () => void
  className?: string
  animate?: boolean
  delay?: number
  as?: 'div' | 'button'
}

export function GlassCard({
  children,
  accent,
  glow = true,
  radius = 22,
  padding = 16,
  style = {},
  onClick,
  className,
  animate = false,
  delay = 0,
}: GlassCardProps) {
  const borderColor     = accent ? `${accent}55` : 'rgba(255,255,255,0.10)'
  const borderTopColor  = accent ? `${accent}90` : 'rgba(255,255,255,0.20)'
  const highlightColor  = accent || 'rgba(255,255,255,0.6)'
  const glowShadow      = (glow && accent)
    ? `0 0 0 1px ${accent}22, 0 8px 32px ${accent}22, 0 4px 12px rgba(0,0,0,0.4)`
    : '0 4px 6px rgba(0,0,0,0.35), 0 20px 60px rgba(0,0,0,0.35)'

  const cardStyle: CSSProperties = {
    position: 'relative',
    background: 'linear-gradient(180deg, rgba(28,28,48,0.78) 0%, rgba(14,14,28,0.78) 100%)',
    border: `1px solid ${borderColor}`,
    borderTopColor,
    borderRadius: radius,
    boxShadow: `${glowShadow}, inset 0 1px 0 rgba(255,255,255,0.10)`,
    backdropFilter: 'blur(18px) saturate(160%)',
    WebkitBackdropFilter: 'blur(18px) saturate(160%)',
    padding,
    ...style,
  }

  const highlightEl = (
    <div style={{
      position: 'absolute', top: 0, left: 12, right: 12, height: 1,
      background: `linear-gradient(90deg, transparent, ${highlightColor}, transparent)`,
      opacity: 0.45, borderRadius: 1, pointerEvents: 'none',
    }} />
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClick}
        className={className}
        style={cardStyle}
      >
        {highlightEl}
        {children}
      </motion.div>
    )
  }

  return (
    <div onClick={onClick} className={className} style={cardStyle}>
      {highlightEl}
      {children}
    </div>
  )
}
