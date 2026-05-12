'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { PrimaryButton } from './PrimaryButton'
import { fireConfetti } from '@/lib/confetti'

interface Props {
  show: boolean
  title: string
  message: string
  emoji?: string
  onContinue: () => void
  newBadges?: string[]
  variant?: 'success' | 'perfect' | 'calm'
}

const VARIANTS = {
  success: { border: 'rgba(168,255,30,0.35)', glow: 'rgba(168,255,30,0.15)', accent: '#A8FF1E' },
  perfect: { border: 'rgba(0,200,255,0.35)',  glow: 'rgba(0,200,255,0.15)',  accent: '#00C8FF' },
  calm:    { border: 'rgba(75,127,255,0.35)', glow: 'rgba(75,127,255,0.15)', accent: '#4B7FFF' },
}

export function CompletionMoment({ show, title, message, emoji = '🎉', onContinue, newBadges = [], variant = 'success' }: Props) {
  const v = VARIANTS[variant]

  useEffect(() => {
    if (show) fireConfetti()
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center pb-8"
          style={{
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(16px)',
            paddingBottom: 'max(32px, calc(env(safe-area-inset-bottom) + 24px))',
          }}
          onClick={(e) => e.target === e.currentTarget && onContinue()}
        >
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="w-full max-w-sm mx-4 card-lg p-7 text-center"
            style={{
              border: `1px solid ${v.border}`,
              boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 60px ${v.glow}`,
            }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 350, damping: 18 }}
              className="text-6xl mb-4"
            >
              {emoji}
            </motion.div>

            <h2 className="font-display text-xl font-bold mb-2" style={{ color: v.accent }}>
              {title}
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#9090A8' }}>
              {message}
            </p>

            {newBadges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl p-3 mb-6 chip-purple"
              >
                <p className="text-xs font-bold mb-1">🏆 Badge nou deblocat!</p>
                {newBadges.map((b) => <p key={b} className="text-xs opacity-80">🎖️ {b}</p>)}
              </motion.div>
            )}

            <PrimaryButton onClick={onContinue} fullWidth variant="lime" size="lg">
              Continuă 🐾
            </PrimaryButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
