'use client'
import { motion } from 'framer-motion'
import { DailyMission } from '@/lib/storage'
import { clsx } from 'clsx'

const ICONS: Record<string, string> = {
  reaction: '⚡', signs: '🚦', gearbox: '🔧', calm: '🫁', scenario: '🎭',
}

export function QuestCard({ missions, className }: { missions: DailyMission[]; className?: string }) {
  const done = missions.filter((m) => m.completed).length
  const pct = missions.length ? (done / missions.length) * 100 : 0
  const allDone = done === missions.length

  return (
    <div
      className={clsx('card p-5', className)}
      style={{
        border: allDone
          ? '1px solid rgba(168,255,30,0.4)'
          : '1px solid rgba(0,200,255,0.25)',
        boxShadow: allDone
          ? 'var(--glass-shadow), 0 0 40px rgba(168,255,30,0.1)'
          : 'var(--glass-shadow), 0 0 24px rgba(0,200,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-pisi-text text-sm">
            {allDone ? '🏁 Misiunea completă!' : '🎯 Misiunea de azi'}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: '#4C4C68' }}>
            {done}/{missions.length} finalizate
          </p>
        </div>
        <div
          className="text-xs font-bold px-2 py-1 rounded-full"
          style={allDone
            ? { background: 'rgba(168,255,30,0.15)', color: '#A8FF1E', border: '1px solid rgba(168,255,30,0.3)' }
            : { background: 'rgba(0,200,255,0.1)', color: '#00C8FF', border: '1px solid rgba(0,200,255,0.2)' }
          }
        >
          {done}/{missions.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: allDone
              ? 'linear-gradient(90deg, #82D400, #A8FF1E)'
              : 'linear-gradient(90deg, #00A8E8, #00C8FF)',
            boxShadow: allDone ? '0 0 8px rgba(168,255,30,0.6)' : '0 0 8px rgba(0,200,255,0.5)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="space-y-2">
        {missions.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: m.completed ? 'rgba(168,255,30,0.07)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${m.completed ? 'rgba(168,255,30,0.2)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            <span className="text-base w-6 text-center">{ICONS[m.type] ?? '📌'}</span>
            <span
              className="text-sm flex-1"
              style={{ color: m.completed ? 'rgba(168,255,30,0.6)' : '#C8C6E0', textDecoration: m.completed ? 'line-through' : 'none' }}
            >
              {m.label}
            </span>
            {m.completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
                style={{ color: '#A8FF1E', fontWeight: 700 }}
              >
                ✓
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
