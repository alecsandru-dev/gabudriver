'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PisiPilotBubble } from '@/components/PisiPilotBubble'
import { QuestCard } from '@/components/QuestCard'
import { ProgressHeader } from '@/components/ProgressHeader'
import { PrimaryButton } from '@/components/PrimaryButton'
import { getState, AppState, updateStreakAndDate } from '@/lib/storage'
import { getOrCreateDailyQuest, getMoodFlow } from '@/lib/quest'
import { DailyQuest } from '@/lib/storage'
import { getRandomThought, getRandomWelcome } from '@/lib/messages'
import { getCurrentLevel, getBestReactionTime } from '@/lib/progress'

const GAME_LINKS = [
  { emoji: '🏎️', label: 'Trepte',  href: '/jocuri/trepte',   color: '#FF6B1A' },
  { emoji: '⚡',  label: 'Reacție', href: '/jocuri/reactie',  color: '#00C8FF' },
  { emoji: '🚦',  label: 'Semne',   href: '/jocuri/semne',    color: '#4B7FFF' },
  { emoji: '🔧',  label: 'Viteze',  href: '/jocuri/viteze',   color: '#B44FFF' },
  { emoji: '🎭',  label: 'Scenarii',href: '/jocuri/scenarii', color: '#FF2A8A' },
  { emoji: '🫁',  label: 'Calm',    href: '/calm',            color: '#A8FF1E' },
]

const MOOD_OPTS = [
  { key: 'hard'  as const, emoji: '😮‍💨', label: 'Am avut o zi grea',   sub: 'Calm · Semne ușoare · Laudă', color: '#4B7FFF' },
  { key: 'brave' as const, emoji: '💪',   label: 'Azi mă simt curajoasă', sub: 'Reacție · Viteze · Scenarii', color: '#FF6B1A' },
  { key: 'easy'  as const, emoji: '🌸',   label: 'Vreau ceva ușor',       sub: '3 semne · 1 scenariu',        color: '#B44FFF' },
]

export default function HomePage() {
  const router = useRouter()
  const [state, setState]   = useState<AppState | null>(null)
  const [quest, setQuest]   = useState<DailyQuest | null>(null)
  const [thought, setThought] = useState('')
  const [welcome, setWelcome] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    updateStreakAndDate()
    const s = getState()
    setState(s)
    setQuest(getOrCreateDailyQuest())
    setThought(getRandomThought())
    setWelcome(getRandomWelcome())
    setMounted(true)
  }, [])

  if (!mounted || !state || !quest) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-neon-cyan/30 border-t-neon-cyan animate-spin" />
      </div>
    )
  }

  const level   = getCurrentLevel(state.xp)
  const bestRT  = getBestReactionTime(state)
  const allDone = quest.missions.every((m) => m.completed)

  function handleMood(mood: 'hard' | 'brave' | 'easy') {
    router.push(getMoodFlow(mood)[0])
  }

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { ease: [0.16,1,0.3,1], duration: 0.4 } } }

  return (
    <motion.div
      className="px-4 space-y-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* ── Cockpit hero ────────────────────────────────────────────────── */}
      <motion.div variants={item} className="relative pt-2">
        {/* Greeting */}
        <div className="mb-4">
          <h1 className="font-display text-2xl font-bold" style={{ color: '#F2F0FF' }}>
            {welcome.replace('! 🐱 Copilotul tău e gata.', '!')}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#4C4C68' }}>
            Aplicatia ta pentru permis, Gabu 🐾
          </p>
        </div>

        {/* Mascot cockpit card */}
        <div
          className="relative rounded-3xl p-5 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(0,200,255,0.06) 0%, rgba(180,79,255,0.04) 100%)',
            border: '1px solid rgba(0,200,255,0.2)',
            boxShadow: '0 4px 30px rgba(0,200,255,0.08), var(--glass-shadow)',
          }}
        >
          {/* Decorative corner lines — cockpit HUD effect */}
          <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none" style={{ borderTop: '2px solid rgba(0,200,255,0.4)', borderLeft: '2px solid rgba(0,200,255,0.4)', borderRadius: '12px 0 0 0' }} />
          <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none" style={{ borderTop: '2px solid rgba(0,200,255,0.4)', borderRight: '2px solid rgba(0,200,255,0.4)', borderRadius: '0 12px 0 0' }} />
          <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none" style={{ borderBottom: '2px solid rgba(0,200,255,0.4)', borderLeft: '2px solid rgba(0,200,255,0.4)', borderRadius: '0 0 0 12px' }} />
          <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none" style={{ borderBottom: '2px solid rgba(0,200,255,0.4)', borderRight: '2px solid rgba(0,200,255,0.4)', borderRadius: '0 0 12px 0' }} />

          <PisiPilotBubble message={thought} mood="happy" />
        </div>
      </motion.div>

      {/* ── Progress HUD ────────────────────────────────────────────────── */}
      <motion.div variants={item}>
        <ProgressHeader state={state} />
      </motion.div>

      {/* ── HUD stat chips ──────────────────────────────────────────────── */}
      <motion.div variants={item} className="grid grid-cols-3 gap-2">
        {[
          { label: 'STREAK',    value: `${state.streak}🔥`,   neon: 'orange' as const },
          { label: 'NIVEL',     value: level.emoji,             neon: 'purple' as const },
          { label: 'BEST RT',   value: bestRT ? `${bestRT}ms` : '–⚡', neon: 'cyan' as const },
        ].map(({ label, value, neon }) => (
          <div
            key={label}
            className="card p-3 text-center"
            style={{ border: `1px solid rgba(255,255,255,0.07)` }}
          >
            <p className="text-[9px] font-semibold tracking-widest mb-1" style={{ color: '#4C4C68' }}>{label}</p>
            <p
              className="text-lg font-display font-bold"
              style={{
                color: neon === 'orange' ? '#FF6B1A' : neon === 'purple' ? '#B44FFF' : '#00C8FF',
                textShadow: `0 0 14px currentColor`,
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </motion.div>

      {/* ── Quest card ──────────────────────────────────────────────────── */}
      <motion.div variants={item}>
        <QuestCard missions={quest.missions} />
      </motion.div>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      {allDone ? (
        <motion.div
          variants={item}
          className="card p-5 text-center"
          style={{ border: '1px solid rgba(168,255,30,0.4)', boxShadow: 'var(--glass-shadow), 0 0 40px rgba(168,255,30,0.1)' }}
        >
          <div className="text-3xl mb-2">🏁</div>
          <p className="font-display font-bold text-sm" style={{ color: '#A8FF1E' }}>Misiunea completă!</p>
          <p className="text-xs mt-1" style={{ color: '#4C4C68' }}>PisiPilot e mândru. Și cam surprins.</p>
        </motion.div>
      ) : (
        <motion.div variants={item}>
          <PrimaryButton fullWidth size="lg" onClick={() => router.push('/jocuri')} variant="orange">
            Pornesc motorul! 🚗
          </PrimaryButton>
        </motion.div>
      )}

      {/* ── Mood selection ──────────────────────────────────────────────── */}
      <motion.div variants={item} className="card p-5">
        <p className="font-display font-bold text-sm mb-4" style={{ color: '#F2F0FF' }}>
          Cum te simți azi?
        </p>
        <div className="space-y-2.5">
          {MOOD_OPTS.map(({ key, emoji, label, sub, color }) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleMood(key)}
              className="w-full text-left p-4 rounded-2xl tap-target relative overflow-hidden"
              style={{
                background: `${color}0D`,
                border: `1px solid ${color}30`,
                boxShadow: `0 4px 16px ${color}0A`,
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{emoji}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#F2F0FF' }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#4C4C68' }}>{sub}</p>
                </div>
                <span className="ml-auto text-lg" style={{ color: '#4C4C68' }}>›</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Quick game links ────────────────────────────────────────────── */}
      <motion.div variants={item} className="pb-2">
        <p className="font-display font-bold text-xs mb-3 tracking-widest uppercase" style={{ color: '#4C4C68' }}>
          Jocuri rapide
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {GAME_LINKS.map(({ emoji, label, href, color }) => (
            <motion.a
              key={href}
              href={href}
              whileTap={{ scale: 0.94 }}
              className="card p-3 flex flex-col items-center gap-2 tap-target"
              style={{
                border: `1px solid ${color}25`,
                boxShadow: `0 4px 16px ${color}0A`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{
                  background: `${color}18`,
                  border: `1px solid ${color}30`,
                  boxShadow: `0 4px 12px ${color}25`,
                }}
              >
                {emoji}
              </div>
              <span className="text-[11px] font-semibold" style={{ color: '#9090A8' }}>{label}</span>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
