'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'

interface Props {
  message: string
  mood?: 'happy' | 'thinking' | 'excited' | 'calm' | 'proud'
  className?: string
  compact?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const MOOD = {
  happy:   { emoji: '😸', glow: 'rgba(0,200,255,0.4)',   border: 'rgba(0,200,255,0.3)'   },
  thinking:{ emoji: '🤔', glow: 'rgba(180,79,255,0.4)',  border: 'rgba(180,79,255,0.3)'  },
  excited: { emoji: '😻', glow: 'rgba(255,42,138,0.5)',  border: 'rgba(255,42,138,0.35)' },
  calm:    { emoji: '😺', glow: 'rgba(168,255,30,0.35)', border: 'rgba(168,255,30,0.25)' },
  proud:   { emoji: '🦁', glow: 'rgba(255,215,0,0.4)',   border: 'rgba(255,215,0,0.3)'   },
}

export function PisiPilotBubble({ message, mood = 'happy', className, compact = false, size = 'md' }: Props) {
  const m = MOOD[mood]
  const emojiSize = compact ? 'text-3xl' : size === 'lg' ? 'text-5xl' : 'text-4xl'

  return (
    <div className={clsx('flex items-start gap-3', className)}>
      {/* Cat avatar with neon ring */}
      <motion.div
        className="shrink-0 select-none relative"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className={clsx('flex items-center justify-center rounded-full', emojiSize)}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: `2px solid ${m.border}`,
            padding: compact ? 6 : 8,
            boxShadow: `0 0 16px ${m.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
          }}
          role="img"
          aria-label="PisiPilot"
        >
          {m.emoji}
        </div>
        {/* Pulsing glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
          style={{ border: `2px solid ${m.border}` }}
        />
      </motion.div>

      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, scale: 0.9, x: -6 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={clsx('relative flex-1 rounded-2xl rounded-tl-sm', compact ? 'px-3 py-2' : 'px-4 py-3')}
          style={{
            background: 'rgba(18,18,32,0.8)',
            border: `1px solid ${m.border}`,
            boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 12px ${m.glow}`,
            backdropFilter: 'blur(12px)',
          }}
        >
          <p
            className={clsx('leading-relaxed', compact ? 'text-xs' : 'text-sm')}
            style={{ color: '#C8C6E0' }}
          >
            {message}
          </p>
          {/* Tail */}
          <div
            className="absolute -left-2 top-3 w-0 h-0"
            style={{
              borderTop: `8px solid transparent`,
              borderBottom: `8px solid transparent`,
              borderRight: `8px solid ${m.border}`,
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
