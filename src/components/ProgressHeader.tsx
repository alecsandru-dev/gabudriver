'use client'
import { motion } from 'framer-motion'
import { AppState } from '@/lib/storage'
import { getCurrentLevel, getLevelProgress } from '@/lib/progress'

export function ProgressHeader({ state }: { state: AppState }) {
  const level = getCurrentLevel(state.xp)
  const pct   = getLevelProgress(state.xp)

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-3.5 flex items-center gap-3"
    >
      <div
        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center text-base shrink-0`}
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' }}
      >
        {level.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold truncate" style={{ color: '#4C4C68' }}>{level.name}</p>
        <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${level.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* HUD chips */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="hud-chip" style={{ color: '#FFD700' }}>⭐ {state.xp}</span>
        <span className="hud-chip" style={{ color: '#FF6B1A' }}>🔥 {state.streak}</span>
      </div>
    </motion.div>
  )
}
