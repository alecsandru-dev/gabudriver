'use client'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { BottomNav } from './BottomNav'

const NEON = {
  cyan:   '#00C8FF',
  pink:   '#FF2A8A',
  purple: '#B44FFF',
}

interface Props {
  children: ReactNode
  accent?: string
}

export function AppShell({ children, accent = NEON.cyan }: Props) {
  return (
    <div style={{ position: 'relative', minHeight: '100dvh', overflowX: 'hidden', background: '#05050C' }}>
      {/* CockpitBackground — exact from pisi-shared.jsx */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none',
        background: 'radial-gradient(ellipse 120% 80% at 50% 0%, #0C0C18 0%, #05050C 70%)',
      }}>
        {/* Cyan orb — top-left */}
        <motion.div
          style={{
            position: 'absolute', width: 360, height: 360, borderRadius: '50%',
            left: '-20%', top: '5%', filter: 'blur(70px)',
            background: `radial-gradient(circle, ${NEON.cyan}44 0%, transparent 60%)`,
            willChange: 'transform',
          }}
          animate={{ x: [0, 40, -10, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Pink orb — right */}
        <motion.div
          style={{
            position: 'absolute', width: 320, height: 320, borderRadius: '50%',
            right: '-15%', top: '40%', filter: 'blur(70px)',
            background: `radial-gradient(circle, ${NEON.pink}40 0%, transparent 60%)`,
            willChange: 'transform',
          }}
          animate={{ x: [0, -30, 20, 0], y: [0, -40, 15, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Purple orb — bottom */}
        <motion.div
          style={{
            position: 'absolute', width: 300, height: 300, borderRadius: '50%',
            left: '20%', bottom: '-10%', filter: 'blur(80px)',
            background: `radial-gradient(circle, ${NEON.purple}38 0%, transparent 60%)`,
            willChange: 'transform',
          }}
          animate={{ x: [0, 50, -20, 0], y: [0, -25, 10, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Dot grid HUD overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)',
        }} />
        {/* Accent vignette top */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 70% 50% at 50% -10%, ${accent}18 0%, transparent 60%)`,
        }} />
      </div>

      {/* Content */}
      <div
        className="relative z-10 max-w-md mx-auto pb-nav"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
      >
        {children}
      </div>

      <BottomNav />
    </div>
  )
}
