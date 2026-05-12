'use client'
import { motion, AnimatePresence } from 'framer-motion'

// Exact MOOD_MAP from pisi-shared.jsx
const MOOD_MAP: Record<string, { emoji: string; accent: string; line: string }> = {
  happy:    { emoji: '😸', accent: '#00C8FF', line: 'Salut, Gabu! Pornim la drum?' },
  thinking: { emoji: '🤔', accent: '#B44FFF', line: 'Hmm... ce-ar fi să recapitulăm semnele?' },
  excited:  { emoji: '😻', accent: '#FF2A8A', line: 'WOOO! Reacția ta a fost fulger!' },
  calm:     { emoji: '😺', accent: '#A8FF1E', line: 'Respiră adânc. Ești în siguranță, fetița mea.' },
  proud:    { emoji: '🦁', accent: '#FFD700', line: 'Sunt mândru de tine. 7 zile la rând.' },
}

interface Props {
  message?: string
  mood?: 'happy' | 'thinking' | 'excited' | 'calm' | 'proud'
  avatarSize?: number
  className?: string
  compact?: boolean
}

function CatAvatar({ mood = 'happy', size = 64 }: { mood?: string; size?: number }) {
  const m = MOOD_MAP[mood] ?? MOOD_MAP.happy
  return (
    <motion.div
      style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Spinning conic ring */}
      <motion.div
        style={{
          position: 'absolute', inset: -4, borderRadius: '50%',
          background: `conic-gradient(from 0deg, ${m.accent}, transparent 30%, ${m.accent}66 60%, transparent 90%, ${m.accent})`,
          filter: `blur(0.5px) drop-shadow(0 0 12px ${m.accent}88)`,
          mask: 'radial-gradient(circle, transparent 58%, black 60%, black 72%, transparent 74%)',
          WebkitMask: 'radial-gradient(circle, transparent 58%, black 60%, black 72%, transparent 74%)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      {/* Pulsing halo */}
      <motion.div
        style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `1.5px solid ${m.accent}66`,
          pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.55, 0, 0.55] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
      />
      {/* Face */}
      <div style={{
        position: 'absolute', inset: 4, borderRadius: '50%',
        background: `radial-gradient(circle at 30% 25%, ${m.accent}30 0%, #0C0C18 70%)`,
        border: `1.5px solid ${m.accent}88`,
        boxShadow: `0 0 18px ${m.accent}55, inset 0 1px 0 rgba(255,255,255,0.18)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.5, lineHeight: 1,
      }} role="img" aria-label="PisiPilot">
        {m.emoji}
      </div>
    </motion.div>
  )
}

export function PisiPilotBubble({ message, mood = 'happy', avatarSize = 56, className, compact }: Props) {
  const m = MOOD_MAP[mood] ?? MOOD_MAP.happy
  const displayMessage = message || m.line

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }} className={className}>
      <CatAvatar mood={mood} size={compact ? 44 : avatarSize} />
      <AnimatePresence mode="wait">
        <motion.div
          key={displayMessage}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.1, ease: [0.16, 1, 0.3, 1], duration: 0.25 }}
          style={{
            flex: 1, position: 'relative',
            background: 'rgba(18,18,32,0.85)',
            border: `1px solid ${m.accent}55`,
            borderRadius: '14px 16px 16px 4px',
            padding: compact ? '8px 12px' : '10px 14px',
            boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 14px ${m.accent}33`,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{
            fontSize: compact ? 12 : 13.5,
            lineHeight: 1.45,
            color: '#C8C6E0',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}>
            {displayMessage}
          </div>
          {/* Tail */}
          <div style={{
            position: 'absolute', left: -7, top: 12,
            width: 0, height: 0,
            borderTop: '7px solid transparent',
            borderBottom: '7px solid transparent',
            borderRight: `7px solid ${m.accent}55`,
          }} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
