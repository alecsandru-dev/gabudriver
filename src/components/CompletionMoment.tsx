'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { PrimaryButton } from './PrimaryButton'
import { fireConfetti } from '@/lib/confetti'

const NEON = { cyan:'#00C8FF', pink:'#FF2A8A', lime:'#A8FF1E', orange:'#FF6B1A', purple:'#B44FFF', gold:'#FFD700' }
const COLORS = [NEON.cyan, NEON.pink, NEON.lime, NEON.orange, NEON.purple, NEON.gold]

function ConfettiBurst() {
  const bits = Array.from({ length: 26 }).map((_, i) => ({
    i, color: COLORS[i % COLORS.length],
    left: 5 + ((i * 37) % 90),
    delay: (i % 8) * 0.08,
    rot: (i * 47) % 360,
  }))
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none', overflow: 'hidden' }}>
      {bits.map((b) => (
        <motion.div
          key={b.i}
          style={{
            position: 'absolute', left: `${b.left}%`, top: '12%',
            width: 8, height: 4, borderRadius: 1,
            background: b.color, boxShadow: `0 0 6px ${b.color}`,
            transform: `rotate(${b.rot}deg)`,
          }}
          animate={{ y: [0, 320 + (b.i % 7) * 25], opacity: [1, 1, 0] }}
          transition={{ duration: 2.4 + (b.i % 5) * 0.2, delay: b.delay, repeat: Infinity, repeatDelay: 1.4, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

function ResultPill({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{
      padding: '6px 12px', borderRadius: 14,
      background: `${accent}10`, border: `1px solid ${accent}40`,
      textAlign: 'center', minWidth: 64,
    }}>
      <div style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '0.16em', color: '#4C4C68', marginBottom: 1,
        fontFamily: 'Space Grotesk, system-ui', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'Space Grotesk, system-ui', fontWeight: 800, fontSize: 14,
        color: accent, textShadow: `0 0 10px ${accent}aa` }}>{value}</div>
    </div>
  )
}

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
  success: { accent: NEON.lime,   borderTop: `${NEON.lime}aa` },
  perfect: { accent: NEON.cyan,   borderTop: `${NEON.cyan}aa` },
  calm:    { accent: '#4B7FFF',    borderTop: `#4B7FFfaa` },
}

export function CompletionMoment({ show, title, message, emoji = '🏁', onContinue, newBadges = [], variant = 'success' }: Props) {
  const v = VARIANTS[variant] ?? VARIANTS.success

  useEffect(() => { if (show) fireConfetti() }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'linear-gradient(180deg, rgba(5,5,12,0.4) 0%, rgba(5,5,12,0.88) 100%)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => e.target === e.currentTarget && onContinue()}
        >
          <ConfettiBurst />

          {/* Bottom sheet — exact from CompletionScreen */}
          <div style={{ position: 'absolute', left: 12, right: 12, bottom: 'max(14px, env(safe-area-inset-bottom))', zIndex: 20 }}>
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              style={{
                borderRadius: 28, padding: '24px 22px 22px',
                background: 'linear-gradient(180deg, rgba(28,28,48,0.95) 0%, rgba(14,14,28,0.95) 100%)',
                border: `1px solid ${v.accent}55`,
                borderTopColor: v.borderTop,
                boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 60px ${v.accent}33, inset 0 1px 0 rgba(255,255,255,0.15)`,
                backdropFilter: 'blur(24px) saturate(180%)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 10,
                  filter: `drop-shadow(0 0 18px ${v.accent}aa)` }}>
                  {emoji}
                </div>
                <div style={{
                  fontFamily: 'Space Grotesk, system-ui', fontWeight: 800, fontSize: 24,
                  background: `linear-gradient(135deg, ${v.accent} 0%, #00C8FF 100%)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.01em',
                }}>
                  {title}
                </div>
                <div style={{ marginTop: 6, fontSize: 13.5, color: '#C8C6E0', lineHeight: 1.45, padding: '0 6px' }}>
                  {message}
                </div>

                {newBadges.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      margin: '14px 0 0',
                      padding: '10px 14px', borderRadius: 14,
                      background: `${NEON.purple}12`, border: `1px solid ${NEON.purple}40`,
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 800, color: NEON.purple, marginBottom: 4,
                      fontFamily: 'Space Grotesk', letterSpacing: '0.1em' }}>BADGE NOU 🏆</div>
                    {newBadges.map((b) => (
                      <div key={b} style={{ fontSize: 12.5, color: '#C8C6E0' }}>🎖️ {b}</div>
                    ))}
                  </motion.div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                  <ResultPill label="XP"     value="+15"    accent={v.accent} />
                  <ResultPill label="PROGRES" value="✓"     accent={NEON.cyan} />
                </div>
              </div>

              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <PrimaryButton fullWidth variant="lime" onClick={onContinue}>
                  Continuă 🐾
                </PrimaryButton>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
