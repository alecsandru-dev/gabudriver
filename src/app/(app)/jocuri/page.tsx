'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getState, AppState } from '@/lib/storage'

const GAMES = [
  {
    href: '/jocuri/trepte',
    emoji: '🏎️',
    name: 'Schimb de Trepte',
    desc: 'Bord real, turometru, vitezometru. Schimbă la momentul potrivit!',
    iconGradient: 'linear-gradient(135deg,#EF4444,#FF8E53)',
    glowColor: 'rgba(239,68,68,0.2)',
    borderColor: 'rgba(239,68,68,0.3)',
    isNew: true,
  },
  {
    href: '/jocuri/reactie',
    emoji: '⚡',
    name: 'Reaction Warm-up',
    desc: 'Antrenează focusul și reacția. Fără judecată.',
    iconGradient: 'linear-gradient(135deg,#FBBF24,#FF8E53)',
    glowColor: 'rgba(251,191,36,0.15)',
    borderColor: 'rgba(251,191,36,0.25)',
  },
  {
    href: '/jocuri/semne',
    emoji: '🚦',
    name: 'Sign Memory',
    desc: 'Memorează semne, răspunde calm la quiz.',
    iconGradient: 'linear-gradient(135deg,#60A5FA,#818CF8)',
    glowColor: 'rgba(96,165,250,0.15)',
    borderColor: 'rgba(96,165,250,0.25)',
  },
  {
    href: '/jocuri/viteze',
    emoji: '🔧',
    name: 'Cutia de Viteze',
    desc: 'Găsește punctul magic al ambreiajului.',
    iconGradient: 'linear-gradient(135deg,#A78BFA,#818CF8)',
    glowColor: 'rgba(167,139,250,0.15)',
    borderColor: 'rgba(167,139,250,0.25)',
  },
  {
    href: '/jocuri/scenarii',
    emoji: '🎭',
    name: 'Scenarii Mici',
    desc: 'Situații reale. Răspunsuri corecte. Fără stres.',
    iconGradient: 'linear-gradient(135deg,#F472B6,#FB7185)',
    glowColor: 'rgba(244,114,182,0.15)',
    borderColor: 'rgba(244,114,182,0.25)',
  },
]

export default function JocuriPage() {
  const [state, setState] = useState<AppState | null>(null)

  useEffect(() => {
    setState(getState())
  }, [])

  const getStats = (href: string) => {
    if (!state) return null
    switch (href) {
      case '/jocuri/reactie':
        return state.reactionGamesPlayed > 0
          ? `${state.reactionGamesPlayed} jocuri jucate`
          : null
      case '/jocuri/semne':
        return state.signGamesPlayed > 0
          ? `${state.signGamesPlayed} sesiuni`
          : null
      case '/jocuri/viteze':
        return state.gearboxGamesPlayed > 0
          ? `${state.gearboxSuccesses} reușite · ${state.gearboxStalls} calări`
          : null
      case '/jocuri/scenarii':
        return state.scenarioAnswers.length > 0
          ? `${state.scenarioAnswers.filter((a) => a.correct).length} corecte`
          : null
      default:
        return null
    }
  }

  return (
    <div className="px-4 space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
        <h1 className="text-xl font-bold text-pisi-text">Jocuri 🎮</h1>
        <p className="text-sm text-pisi-muted mt-0.5">Alege o activitate. Nicio presiune.</p>
      </motion.div>

      <div className="space-y-3">
        {GAMES.map((game, i) => {
          const { href, emoji, name, desc, iconGradient, glowColor, borderColor } = game
          const isNew = 'isNew' in game && game.isNew
          const stats = getStats(href)
          return (
            <motion.div
              key={href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={href}
                className="block rounded-3xl p-5 tap-target active:scale-[0.99] transition-transform relative overflow-hidden"
                style={{
                  background: `rgba(255,255,255,0.04)`,
                  border: `1px solid ${borderColor}`,
                  boxShadow: `0 4px 24px ${glowColor}, 0 1px 0 rgba(255,255,255,0.05) inset`,
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* subtle glow bg */}
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 100% at 0% 50%, ${glowColor.replace('0.', '0.8').replace('rgba(', '').replace(')', '').split(',').slice(0, 3).join(',')}, transparent)` }} />

                {isNew && (
                  <span className="absolute top-3 right-3 text-white text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg,#EF4444,#FF8E53)' }}>
                    NOU
                  </span>
                )}
                <div className="flex items-center gap-4 relative z-10">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: iconGradient, boxShadow: `0 4px 16px ${glowColor}` }}
                  >
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-pisi-text">{name}</h2>
                    <p className="text-xs text-pisi-muted mt-0.5 leading-relaxed">{desc}</p>
                    {stats && (
                      <p className="text-xs text-emerald-400 font-medium mt-1.5">✓ {stats}</p>
                    )}
                  </div>
                  <span className="text-pisi-dim text-xl shrink-0">›</span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="card p-4"
        style={{ border: '1px solid rgba(52,211,153,0.25)', boxShadow: '0 4px 24px rgba(52,211,153,0.1)' }}
      >
        <Link href="/calm" className="flex items-center gap-3 tap-target">
          <div className="w-12 h-12 rounded-2xl gradient-mint flex items-center justify-center text-xl shrink-0">
            🫁
          </div>
          <div>
            <p className="font-bold text-pisi-text">Calm Mode</p>
            <p className="text-xs text-pisi-muted mt-0.5">Respirație · Fără scor · Resetare completă</p>
          </div>
          <span className="text-pisi-dim text-xl ml-auto">›</span>
        </Link>
      </motion.div>
    </div>
  )
}
