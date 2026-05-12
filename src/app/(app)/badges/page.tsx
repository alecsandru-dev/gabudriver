'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BadgeCard } from '@/components/BadgeCard'
import { ProgressHeader } from '@/components/ProgressHeader'
import { PisiPilotBubble } from '@/components/PisiPilotBubble'
import { ALL_BADGES } from '@/lib/badges'
import { getState, AppState, PraiseEntry } from '@/lib/storage'
import { getCurrentLevel, getLevelProgress, getNextLevel, getBestReactionTime, getAverageReactionTime, getBestSignScore } from '@/lib/progress'

type Tab = 'badges' | 'laude' | 'stats'

export default function BadgesPage() {
  const [state, setState] = useState<AppState | null>(null)
  const [tab, setTab] = useState<Tab>('badges')
  useEffect(() => { setState(getState()) }, [])
  if (!state) return <div className="flex items-center justify-center h-64" />

  const level    = getCurrentLevel(state.xp)
  const pct      = getLevelProgress(state.xp)
  const next     = getNextLevel(state.xp)
  const unlocked = new Set(state.unlockedBadges)
  const bestRT   = getBestReactionTime(state)
  const avgRT    = getAverageReactionTime(state)
  const bestSign = getBestSignScore(state)
  const correct  = state.scenarioAnswers.filter((a) => a.correct).length

  const TABS: { id: Tab; label: string }[] = [
    { id: 'badges', label: '🏅 Badge-uri' },
    { id: 'laude',  label: '💬 Laude' },
    { id: 'stats',  label: '📊 Stats' },
  ]

  return (
    <div className="px-4 space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
        <h1 className="font-display text-xl font-bold" style={{ color: '#F2F0FF' }}>Progres 🏆</h1>
        <p className="text-sm mt-0.5" style={{ color: '#4C4C68' }}>Colecția ta de realizări</p>
      </motion.div>

      <ProgressHeader state={state} />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card p-5"
        style={{ border: '1px solid rgba(180,79,255,0.3)', boxShadow: 'var(--glass-shadow), 0 0 40px rgba(180,79,255,0.08)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center text-2xl`}
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
            {level.emoji}
          </div>
          <div>
            <p className="font-display font-bold" style={{ color: '#F2F0FF' }}>{level.name}</p>
            <p className="text-xs" style={{ color: '#4C4C68' }}>{state.xp} XP total</p>
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div className={`h-full rounded-full bg-gradient-to-r ${level.color}`}
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
        </div>
        {next && <p className="text-xs mt-1.5" style={{ color: '#4C4C68' }}>Urmează: {next.emoji} {next.name} · {next.minXP - state.xp} XP</p>}
      </motion.div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-2.5 rounded-2xl text-xs font-display font-bold transition-all tap-target"
            style={tab === t.id
              ? { background: 'linear-gradient(135deg,#B44FFF,#4B7FFF)', color: '#fff', boxShadow: '0 0 16px rgba(180,79,255,0.4)' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#4C4C68' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'badges' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-2">
          <PisiPilotBubble
            message={`${unlocked.size}/${ALL_BADGES.length} badge-uri deblocate. ${unlocked.size === 0 ? 'Primul e mereu cel mai greu.' : 'PisiPilot e impresionat, Gabu.'}`}
            compact
          />
          <div className="grid grid-cols-3 gap-3">
            {ALL_BADGES.map((b, i) => <BadgeCard key={b.id} badge={b} unlocked={unlocked.has(b.id)} delay={i * 0.04} />)}
          </div>
        </motion.div>
      )}

      {tab === 'laude' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 pb-2">
          {state.praiseHistory.length === 0 ? (
            <div className="card p-8 text-center space-y-3">
              <div className="text-4xl animate-float">🐱</div>
              <p className="text-sm" style={{ color: '#4C4C68' }}>Nicio laudă încă, Gabu. Completează o activitate!</p>
            </div>
          ) : (
            state.praiseHistory.map((e: PraiseEntry, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card p-4" style={{ border: '1px solid rgba(180,79,255,0.15)' }}>
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">😸</span>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed" style={{ color: '#C8C6E0' }}>{e.text}</p>
                    <p className="text-xs mt-1" style={{ color: '#4C4C68' }}>{e.source} · {new Date(e.date).toLocaleDateString('ro-RO')}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {tab === 'stats' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3 pb-2">
          {[
            { label: 'Streak',         value: `${state.streak} zile 🔥`,    color: '#FF6B1A' },
            { label: 'Total zile',     value: `${state.totalDays}`,          color: '#4B7FFF' },
            { label: 'Misiuni ok',     value: `${state.questsCompleted}`,    color: '#A8FF1E' },
            { label: 'Sesiuni Calm',   value: `${state.calmSessions}`,       color: '#00C8FF' },
            { label: 'Reacție Best',   value: bestRT ? `${bestRT}ms` : '–', color: '#FFD700' },
            { label: 'Reacție Medie',  value: avgRT  ? `${avgRT}ms`  : '–', color: '#FF6B1A' },
            { label: 'Semne Best',     value: bestSign ? `${bestSign}%` : '–', color: '#4B7FFF' },
            { label: 'Scenarii ok',    value: `${correct}`,                  color: '#FF2A8A' },
            { label: 'Viteze reușite', value: `${state.gearboxSuccesses}`,   color: '#A8FF1E' },
            { label: 'Calări (OK!)',   value: `${state.gearboxStalls}`,      color: '#B44FFF' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4">
              <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#4C4C68' }}>{label}</p>
              <p className="font-display font-bold text-lg" style={{ color, textShadow: `0 0 12px ${color}60` }}>{value}</p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
