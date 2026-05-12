'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PisiPilotBubble } from '@/components/PisiPilotBubble'
import { PrimaryButton } from '@/components/PrimaryButton'
import { CompletionMoment } from '@/components/CompletionMoment'
import { getState, setState as saveState, addXP, addPraise, updateStreakAndDate } from '@/lib/storage'
import { checkNewBadges, getBadgeById } from '@/lib/badges'
import { completeMission } from '@/lib/quest'
import { XP_REWARDS } from '@/lib/progress'

type SessionState = 'intro' | 'active' | 'done'

const CYCLE = [
  { phase: 'inhale',  duration: 4, label: 'Inspiră',  sub: '4 secunde',  color: '#00C8FF', scale: 1.35 },
  { phase: 'hold',    duration: 2, label: 'Ține',      sub: '2 secunde',  color: '#B44FFF', scale: 1.35 },
  { phase: 'exhale',  duration: 6, label: 'Expiră',    sub: '6 secunde',  color: '#4B7FFF', scale: 1.0  },
]
const CYCLE_TOTAL = CYCLE.reduce((a, b) => a + b.duration, 0)
const TOTAL_SECS  = 60

function getBreathPhase(offset: number) {
  let r = offset % CYCLE_TOTAL
  for (const b of CYCLE) {
    if (r < b.duration) return { ...b, progress: r / b.duration }
    r -= b.duration
  }
  return { ...CYCLE[0], progress: 0 }
}

export default function CalmPage() {
  const [session, setSession]       = useState<SessionState>('intro')
  const [elapsed, setElapsed]       = useState(0)
  const [offset, setOffset]         = useState(0)
  const [showCompletion, setShow]   = useState(false)
  const [newBadgeNames, setNewBadge] = useState<string[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  function start() {
    setSession('active'); setElapsed(0); setOffset(0)
    intervalRef.current = setInterval(() => {
      setElapsed(p => {
        const n = p + 1
        setOffset(o => o + 1)
        if (n >= TOTAL_SECS) {
          clearInterval(intervalRef.current!)
          finish()
        }
        return n
      })
    }, 1000)
  }

  function finish() {
    const prev = getState()
    const updated = { ...prev, calmSessions: prev.calmSessions + 1, activitiesCompleted: [...new Set([...prev.activitiesCompleted, 'calm'])] }
    saveState(updated)
    updateStreakAndDate(); addXP(XP_REWARDS.calm); completeMission('calm')
    addPraise('Respirăm. Resetăm bordul. Continuăm.', 'Calm Mode')
    const fresh = getState()
    const nb = checkNewBadges(fresh)
    if (nb.length) { saveState({ ...fresh, unlockedBadges: [...new Set([...fresh.unlockedBadges, ...nb])] }); setNewBadge(nb.map(id => getBadgeById(id)?.name ?? id)) }
    setSession('done'); setShow(true)
  }

  const breath  = getBreathPhase(offset)
  const pct     = Math.min(100, (elapsed / TOTAL_SECS) * 100)
  const remaining = TOTAL_SECS - elapsed

  return (
    <div className="px-4 space-y-4">
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="pt-2">
        <h1 className="font-display text-xl font-bold" style={{ color:'#F2F0FF' }}>Calm Mode 🫁</h1>
        <p className="text-sm mt-0.5" style={{ color:'#4C4C68' }}>60 de secunde de resetare totală</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {session === 'intro' && (
          <motion.div key="intro" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-4">
            <PisiPilotBubble
              message="Fără scor. Fără judecată. Urmărește cercul și respiră cu el. Sistemul se resetează singur."
              mood="calm" size="lg"
            />

            {/* Preview orb */}
            <div className="card p-8 flex flex-col items-center gap-6"
              style={{ border:'1px solid rgba(75,127,255,0.3)', boxShadow:'var(--glass-shadow), 0 0 60px rgba(75,127,255,0.08)' }}
            >
              <motion.div
                animate={{ scale:[1, 1.2, 1] }}
                transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}
                className="relative w-36 h-36 flex items-center justify-center"
              >
                <motion.div className="absolute inset-0 rounded-full" animate={{ scale:[1.0,1.3,1.0], opacity:[0.2,0,0.2] }} transition={{ duration:4,repeat:Infinity }} style={{ background:'rgba(75,127,255,0.4)', borderRadius:'50%' }} />
                <motion.div className="absolute inset-3 rounded-full" style={{ background:'linear-gradient(135deg, rgba(0,200,255,0.3), rgba(180,79,255,0.3))', backdropFilter:'blur(4px)' }} />
                <span className="relative z-10 text-4xl">🫁</span>
              </motion.div>

              <div className="space-y-2 w-full">
                {CYCLE.map(b => (
                  <div key={b.phase} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background:b.color, boxShadow:`0 0 6px ${b.color}` }} />
                    <span className="text-sm" style={{ color:'#F2F0FF' }}>{b.label}</span>
                    <span className="text-xs ml-auto" style={{ color:'#4C4C68' }}>{b.duration}s</span>
                  </div>
                ))}
              </div>
            </div>

            <PrimaryButton onClick={start} fullWidth size="lg" variant="blue">
              Începe sesiunea 🧘
            </PrimaryButton>
            <div className="card p-3 text-center">
              <p className="text-xs" style={{ color:'#4C4C68' }}>
                Sesiuni completate: <span className="font-bold" style={{ color:'#4B7FFF' }}>{getState().calmSessions}</span>
              </p>
            </div>
          </motion.div>
        )}

        {session === 'active' && (
          <motion.div key="active" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="space-y-4">
            {/* Breathing orb — the main visual */}
            <div
              className="card p-8 flex flex-col items-center gap-6"
              style={{ border:`1px solid ${breath.color}30`, boxShadow:`var(--glass-shadow), 0 0 80px ${breath.color}10` }}
            >
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Outer halo */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ scale: breath.scale, opacity: breath.phase === 'inhale' ? 0.15 : 0.08 }}
                  transition={{ duration: breath.phase === 'inhale' ? breath.duration : breath.phase === 'hold' ? 0.5 : breath.duration, ease: 'easeInOut' }}
                  style={{ background: `radial-gradient(circle, ${breath.color}, transparent 70%)`, filter:'blur(16px)' }}
                />
                {/* Mid ring */}
                <motion.div
                  className="absolute rounded-full"
                  style={{ inset:16, border:`2px solid ${breath.color}`, opacity:0.3 }}
                  animate={{ scale: breath.scale * 0.9, opacity: [0.15,0.3,0.15] }}
                  transition={{ duration: breath.duration, ease:'easeInOut' }}
                />
                {/* Core orb */}
                <motion.div
                  className="absolute rounded-full"
                  style={{ inset:28, background:`radial-gradient(circle at 35% 35%, ${breath.color}CC, ${breath.color}66)` }}
                  animate={{ scale: breath.scale * 0.78 }}
                  transition={{ duration: breath.duration, ease: breath.phase === 'inhale' ? 'easeIn' : 'easeOut' }}
                />
                {/* Center content */}
                <div className="relative z-10 text-center">
                  <motion.p
                    key={breath.phase}
                    initial={{ opacity:0, scale:0.8 }}
                    animate={{ opacity:1, scale:1 }}
                    className="font-display text-2xl font-bold"
                    style={{ color: breath.color, textShadow:`0 0 20px ${breath.color}` }}
                  >
                    {remaining}
                  </motion.p>
                  <p className="text-xs mt-0.5" style={{ color:breath.color, opacity:0.8 }}>sec</p>
                </div>
              </div>

              {/* Phase label */}
              <motion.div key={breath.phase} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} className="text-center">
                <p className="font-display text-2xl font-bold" style={{ color:breath.color, textShadow:`0 0 16px ${breath.color}` }}>
                  {breath.label}
                </p>
                <p className="text-sm mt-1" style={{ color:'#4C4C68' }}>{breath.sub}</p>
              </motion.div>
            </div>

            {/* Progress bar */}
            <div className="card p-4">
              <div className="flex justify-between text-xs mb-2" style={{ color:'#4C4C68' }}>
                <span>Progres sesiune</span>
                <span>{remaining}s rămase</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.07)' }}>
                <motion.div className="h-full rounded-full" style={{ width:`${pct}%`, background:`linear-gradient(90deg,#4B7FFF,#00C8FF)`, boxShadow:'0 0 8px rgba(0,200,255,0.5)' }} />
              </div>
            </div>

            <p className="text-center text-xs px-8 leading-relaxed" style={{ color:'#4C4C68' }}>
              Nu trebuie să fii perfectă. Respiră și urmărește cercul. 🐾
            </p>
          </motion.div>
        )}

        {session === 'done' && !showCompletion && (
          <motion.div key="done" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="card p-8 text-center space-y-4">
            <div className="text-5xl">✨</div>
            <h2 className="font-display font-bold text-xl" style={{ color:'#00C8FF' }}>Gata!</h2>
            <p className="text-sm leading-relaxed" style={{ color:'#9090A8' }}>
              Respirăm. Resetăm bordul. Continuăm când vrei.
            </p>
            <PrimaryButton onClick={() => setSession('intro')} fullWidth variant="blue">
              Sesiune nouă 🫁
            </PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>

      <CompletionMoment
        show={showCompletion}
        title="Sesiune Calm completă!"
        message="Respirăm. Resetăm bordul. Continuăm."
        emoji="✨"
        variant="calm"
        onContinue={() => { setShow(false); setSession('done') }}
        newBadges={newBadgeNames}
      />
    </div>
  )
}
