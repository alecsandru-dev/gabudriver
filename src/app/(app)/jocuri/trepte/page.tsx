'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PisiPilotBubble } from '@/components/PisiPilotBubble'
import { CompletionMoment } from '@/components/CompletionMoment'
import { getState, setState as saveState, addXP, addPraise, updateStreakAndDate } from '@/lib/storage'
import { checkNewBadges, getBadgeById } from '@/lib/badges'
import { completeMission } from '@/lib/quest'
import { getRandomPraise } from '@/lib/messages'
import { XP_REWARDS } from '@/lib/progress'
import { clsx } from 'clsx'

// ─── SVG gauge helpers ────────────────────────────────────────────────────────
const CX = 90
const CY = 92
const R = 70
const GAUGE_START = 225   // degrees clockwise from 12-o'clock
const GAUGE_SWEEP = 270   // total sweep

function polar(deg: number, r = R) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) }
}

function arcD(fromDeg: number, toDeg: number, r = R): string {
  if (Math.abs(toDeg - fromDeg) < 0.1) return ''
  const s = polar(fromDeg, r)
  const e = polar(toDeg, r)
  const sweep = ((toDeg - fromDeg) % 360 + 360) % 360
  const large = sweep > 180 ? 1 : 0
  return `M ${s.x.toFixed(1)} ${s.y.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(1)} ${e.y.toFixed(1)}`
}

function rpmToDeg(rpm: number) {
  return GAUGE_START + Math.min(1, rpm / MAX_RPM) * GAUGE_SWEEP
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_RPM = 6500
const IDLE_RPM = 900
const SPEED_PER_KRPM = [0, 5, 10, 17, 25, 35] // km/h per 1000 RPM by gear
const GEAR_LABELS = ['N', '1', '2', '3', '4', '5']

function rpmToSpeed(rpm: number, gear: number) {
  return Math.round((rpm / 1000) * SPEED_PER_KRPM[gear])
}

// ─── Scenarios ────────────────────────────────────────────────────────────────
interface ShiftTask {
  direction: 'up' | 'down'
  prompt: string
  idealRPM: [number, number]
  goodRPM: [number, number]
}

interface Scenario {
  id: string
  title: string
  emoji: string
  description: string
  startGear: number
  startRPM: number
  rpmPerSec: number   // positive = accelerating, negative = decelerating
  tasks: ShiftTask[]
}

const SCENARIOS: Scenario[] = [
  {
    id: 'city',
    title: 'Start în oraș',
    emoji: '🏙️',
    description: 'Semafor verde, Gabu! Accelerează și urcă prin trepte 1 → 2 → 3.',
    startGear: 1,
    startRPM: 1500,
    rpmPerSec: 300,
    tasks: [
      { direction: 'up', prompt: 'Urcă la treapta 2! 🔼', idealRPM: [2500, 3200], goodRPM: [2000, 4000] },
      { direction: 'up', prompt: 'Urcă la treapta 3! 🔼', idealRPM: [2500, 3200], goodRPM: [2000, 4000] },
    ],
  },
  {
    id: 'highway',
    title: 'Intrare autostradă',
    emoji: '🛣️',
    description: 'Banda de accelerare! Urcă repede 3 → 4 → 5.',
    startGear: 3,
    startRPM: 2200,
    rpmPerSec: 360,
    tasks: [
      { direction: 'up', prompt: 'Treapta 4! 🔼', idealRPM: [2800, 3600], goodRPM: [2200, 4500] },
      { direction: 'up', prompt: 'Treapta 5! 🔼', idealRPM: [2800, 3600], goodRPM: [2200, 4500] },
    ],
  },
  {
    id: 'slowdown',
    title: 'Trafic blocat',
    emoji: '🚦',
    description: 'Traficul frânează! Coboară trepte 4 → 3 → 2 pe măsură ce RPM-ul scade.',
    startGear: 4,
    startRPM: 3200,
    rpmPerSec: -280,
    tasks: [
      { direction: 'down', prompt: 'Coboară la treapta 3! 🔽', idealRPM: [1400, 2000], goodRPM: [1100, 2500] },
      { direction: 'down', prompt: 'Coboară la treapta 2! 🔽', idealRPM: [1400, 2000], goodRPM: [1100, 2500] },
    ],
  },
  {
    id: 'mixed',
    title: 'Drum montan',
    emoji: '⛰️',
    description: 'Urci, virezi, cobori. 2→3, 3→2, 2→3 — fii atentă la RPM!',
    startGear: 2,
    startRPM: 1800,
    rpmPerSec: 260,
    tasks: [
      { direction: 'up',   prompt: 'Treapta 3! 🔼', idealRPM: [2500, 3200], goodRPM: [2000, 4000] },
      { direction: 'down', prompt: 'Viraj strâns — treapta 2! 🔽', idealRPM: [1500, 2200], goodRPM: [1200, 2800] },
      { direction: 'up',   prompt: 'Ieși din viraj — treapta 3! 🔼', idealRPM: [2500, 3200], goodRPM: [2000, 4000] },
    ],
  },
]

// ─── Quality helpers ─────────────────────────────────────────────────────────
type Quality = 'perfect' | 'good' | 'ok' | 'wrong'

function evaluate(rpm: number, task: ShiftTask, actualDirection: 'up' | 'down'): { quality: Quality; points: number; msg: string } {
  if (actualDirection !== task.direction) {
    return { quality: 'wrong', points: 5, msg: 'Direcție greșită! Încearcă din nou. 🐾' }
  }
  const [iMin, iMax] = task.idealRPM
  const [gMin, gMax] = task.goodRPM
  if (rpm >= iMin && rpm <= iMax) {
    return { quality: 'perfect', points: 100, msg: `Perfect! ${Math.round(rpm)} RPM — zona ideală! 🏆` }
  }
  if (rpm >= gMin && rpm <= gMax) {
    return { quality: 'good', points: 65, msg: `Bine! ${Math.round(rpm)} RPM — schimbare curată. 👏` }
  }
  return { quality: 'ok', points: 25, msg: `Merge! ${Math.round(rpm)} RPM. Încearcă zona verde data viitoare.` }
}

// ─── Tachometer SVG ──────────────────────────────────────────────────────────
function Tachometer({ rpm, isRedline }: { rpm: number; isRedline: boolean }) {
  const valueDeg = rpmToDeg(rpm)

  // Zone colors
  const greenEnd = rpmToDeg(3200)
  const yellowEnd = rpmToDeg(5000)

  const needleTip = polar(valueDeg, 58)
  const needleBase1 = polar(valueDeg + 90, 8)
  const needleBase2 = polar(valueDeg - 90, 8)

  return (
    <svg width="180" height="175" viewBox="0 0 180 184" className="w-full max-w-[180px]">
      {/* Dark background circle */}
      <circle cx={CX} cy={CY} r={R + 14} fill="#111827" />
      <circle cx={CX} cy={CY} r={R + 10} fill="#1f2937" />

      {/* Background track */}
      <path d={arcD(GAUGE_START, GAUGE_START + GAUGE_SWEEP)} fill="none" stroke="#374151" strokeWidth={10} strokeLinecap="round" />

      {/* Zone arcs */}
      <path d={arcD(GAUGE_START, greenEnd)} fill="none" stroke="#22c55e" strokeWidth={10} strokeLinecap="round" opacity={0.35} />
      <path d={arcD(greenEnd, yellowEnd)} fill="none" stroke="#f59e0b" strokeWidth={10} strokeLinecap="round" opacity={0.35} />
      <path d={arcD(yellowEnd, GAUGE_START + GAUGE_SWEEP)} fill="none" stroke="#ef4444" strokeWidth={10} strokeLinecap="round" opacity={0.45} />

      {/* Active arc */}
      {rpm > IDLE_RPM && (
        <path
          d={arcD(GAUGE_START, valueDeg)}
          fill="none"
          stroke={rpm > 5000 ? '#ef4444' : rpm > 3200 ? '#f59e0b' : '#22c55e'}
          strokeWidth={10}
          strokeLinecap="round"
        />
      )}

      {/* Tick marks at each 1000 RPM */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const deg = GAUGE_START + (i / 6.5) * GAUGE_SWEEP
        const outer = polar(deg, R + 3)
        const inner = polar(deg, R - 10)
        const label = polar(deg, R - 20)
        return (
          <g key={i}>
            <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#9ca3af" strokeWidth={i % 2 === 0 ? 2 : 1.5} strokeLinecap="round" />
            {i % 2 === 0 && (
              <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fill="#6b7280" fontSize="9" fontFamily="system-ui">
                {i}
              </text>
            )}
          </g>
        )
      })}

      {/* Needle */}
      <motion.polygon
        points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
        fill={isRedline ? '#ef4444' : '#ffffff'}
        animate={{ opacity: isRedline ? [1, 0.4, 1] : 1 }}
        transition={{ duration: 0.3, repeat: isRedline ? Infinity : 0 }}
      />
      <circle cx={CX} cy={CY} r={7} fill="#374151" stroke="#6b7280" strokeWidth={1.5} />
      <circle cx={CX} cy={CY} r={3} fill="#9ca3af" />

      {/* RPM readout */}
      <text x={CX} y={CY + 24} textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="system-ui">
        {Math.round(rpm / 100) * 100}
      </text>
      <text x={CX} y={CY + 36} textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="system-ui">
        RPM
      </text>
    </svg>
  )
}

// ─── Road view ────────────────────────────────────────────────────────────────
function RoadView({ speed }: { speed: number }) {
  const duration = speed > 5 ? Math.max(0.12, 1.8 / (speed / 20)) : 99

  return (
    <div className="relative overflow-hidden" style={{ height: 100, borderRadius: 20 }}>
      {/* Sky */}
      <div
        className="absolute inset-x-0 top-0"
        style={{ height: '45%', background: 'linear-gradient(180deg, #1e3a5f 0%, #2563eb 60%, #7dd3fc 100%)' }}
      />
      {/* Road surface */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ height: '58%', background: 'linear-gradient(180deg, #6b7280 0%, #374151 100%)' }}
      />
      {/* Horizon */}
      <div className="absolute inset-x-0" style={{ top: '43%', height: 2, background: '#9ca3af', opacity: 0.4 }} />

      {/* Road edges */}
      <div className="absolute" style={{ top: '44%', bottom: 0, left: '15%', width: 2, background: 'rgba(255,255,255,0.2)' }} />
      <div className="absolute" style={{ top: '44%', bottom: 0, right: '15%', width: 2, background: 'rgba(255,255,255,0.2)' }} />

      {/* Scrolling center lane dashes */}
      <div className="absolute" style={{ top: '44%', bottom: 0, left: '49%', width: 4, overflow: 'hidden' }}>
        <motion.div
          animate={{ y: ['0%', '100%'] }}
          transition={{ duration, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', top: '-100%', bottom: 0, width: '100%' }}
        >
          {[-120, -80, -40, 0, 40, 80, 120, 160, 200].map((y) => (
            <div
              key={y}
              style={{
                position: 'absolute',
                top: y,
                width: '100%',
                height: 22,
                background: 'rgba(255,220,50,0.8)',
                borderRadius: 2,
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Car bonnet hint */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{ width: 52, height: 14, background: 'linear-gradient(180deg,#dc2626,#991b1b)', borderRadius: '12px 12px 0 0', boxShadow: '0 -3px 10px rgba(0,0,0,0.5)' }}
      />

      {/* Speed blur at high speeds */}
      {speed > 80 && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.05) 100%)' }} />
      )}
    </div>
  )
}

// ─── Main game ────────────────────────────────────────────────────────────────
type Phase = 'intro' | 'playing' | 'clutch_in' | 'shifted' | 'result' | 'complete' | 'blown' | 'stalled'

interface ShiftResult { direction: 'up' | 'down'; rpm: number; quality: Quality; points: number }

const BLOWN_RPM = 6350   // RPM threshold for blown engine
const STALL_RPM = 720    // RPM threshold for stall
const DANGER_MS = 1200   // ms in danger zone before game over

export default function TreptePage() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const scenario = SCENARIOS[scenarioIdx]

  const [phase, setPhase] = useState<Phase>('intro')
  const [rpm, setRpm] = useState(scenario.startRPM)
  const [gear, setGear] = useState(scenario.startGear)
  const [taskIdx, setTaskIdx] = useState(0)
  const [clutchRpm, setClutchRpm] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [shiftResults, setShiftResults] = useState<ShiftResult[]>([])
  const [lastMsg, setLastMsg] = useState<string | null>(null)
  const [lastQuality, setLastQuality] = useState<Quality | null>(null)
  const [showCompletion, setShowCompletion] = useState(false)
  const [newBadgeNames, setNewBadgeNames] = useState<string[]>([])
  const [bubbleMsg, setBubbleMsg] = useState('Urmărește turometrul! Apasă AMBREIAJ la momentul potrivit, schimbă treapta, apoi eliberează ambreiajul.')
  const dangerMsRef = useRef(0)
  const lastTickTimeRef = useRef(Date.now())

  const rpmRef = useRef(rpm)
  const gearRef = useRef(gear)
  const phaseRef = useRef(phase)
  const taskIdxRef = useRef(taskIdx)
  const scenarioRef = useRef(scenario)
  rpmRef.current = rpm
  gearRef.current = gear
  phaseRef.current = phase
  taskIdxRef.current = taskIdx
  scenarioRef.current = scenario

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentTask = scenario.tasks[taskIdx]
  const speed = rpmToSpeed(rpm, gear)
  const isRedline = rpm > 5200

  const rpmZone = rpm > 5000 ? 'red' : rpm > 3200 ? 'yellow' : 'green'

  // Show prompt when RPM is in trigger zone
  const showPrompt = phase === 'playing' && (
    (currentTask?.direction === 'up' && rpm >= 2800) ||
    (currentTask?.direction === 'down' && rpm <= 2000)
  )

  // ── Game loop
  useEffect(() => {
    if (!['playing', 'clutch_in', 'shifted'].includes(phase)) return

    dangerMsRef.current = 0
    lastTickTimeRef.current = Date.now()
    const TICK = 80

    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastTickTimeRef.current
      lastTickTimeRef.current = now

      setRpm((prev) => {
        const p = phaseRef.current
        if (p === 'clutch_in' || p === 'shifted') {
          dangerMsRef.current = 0
          return prev > IDLE_RPM + 20 ? prev - 60 : IDLE_RPM
        }

        const delta = (scenarioRef.current.rpmPerSec * TICK) / 1000
        const next = prev + delta

        // Check danger zones
        if (next >= BLOWN_RPM) {
          dangerMsRef.current += elapsed
          if (dangerMsRef.current >= DANGER_MS) {
            setPhase('blown')
            return next
          }
          return Math.min(next, MAX_RPM)
        }
        if (next <= STALL_RPM) {
          dangerMsRef.current += elapsed
          if (dangerMsRef.current >= DANGER_MS) {
            setPhase('stalled')
            return next
          }
          return Math.max(next, 600)
        }

        dangerMsRef.current = 0
        return next
      })
    }, TICK)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [phase])

  function startGame() {
    dangerMsRef.current = 0
    setRpm(scenario.startRPM)
    setGear(scenario.startGear)
    setTaskIdx(0)
    setClutchRpm(null)
    setScore(0)
    setCombo(0)
    setShiftResults([])
    setLastMsg(null)
    setLastQuality(null)
    setPhase('playing')
    setBubbleMsg(scenario.tasks[0].direction === 'up'
      ? 'Zona verde = bun. Zona galbenă = schimbă curând. Zona roșie = schimbă ACUM!'
      : 'RPM-ul scade pe măsură ce frânezi. Schimbă jos înainte să caleze!')
  }

  function handleClutch() {
    if (phase === 'playing') {
      setClutchRpm(rpmRef.current)
      setPhase('clutch_in')
    } else if (phase === 'shifted') {
      releaseClutch()
    }
  }

  function handleShift(direction: 'up' | 'down') {
    if (phase !== 'clutch_in') return
    const newGear = direction === 'up'
      ? Math.min(5, gearRef.current + 1)
      : Math.max(1, gearRef.current - 1)
    setGear(newGear)
    setPhase('shifted')
  }

  const releaseClutch = useCallback(() => {
    const task = scenarioRef.current.tasks[taskIdxRef.current]
    const shiftedGear = gearRef.current
    const origGear = scenarioRef.current.startGear + shiftResults.length * (task.direction === 'up' ? 1 : -1)
    const actualDir: 'up' | 'down' = shiftedGear > origGear ? 'up' : 'down'
    const evalRpm = clutchRpm ?? rpmRef.current
    const { quality, points, msg } = evaluate(evalRpm, task, actualDir)

    const bonus = (quality === 'perfect' || quality === 'good') ? combo * 15 : 0
    const totalPts = points + bonus

    setLastMsg(msg + (bonus > 0 ? ` (+${bonus} combo!)` : ''))
    setLastQuality(quality)
    setScore((s) => s + totalPts)
    setCombo((c) => (quality === 'perfect' || quality === 'good') ? c + 1 : 0)
    setShiftResults((r) => [...r, { direction: actualDir, rpm: Math.round(evalRpm), quality, points: totalPts }])
    setPhase('result')

    const nextIdx = taskIdxRef.current + 1
    setTimeout(() => {
      if (nextIdx >= scenarioRef.current.tasks.length) {
        finishScenario()
      } else {
        setTaskIdx(nextIdx)
        setClutchRpm(null)
        setPhase('playing')
        setBubbleMsg(scenarioRef.current.tasks[nextIdx].prompt)
      }
    }, 1800)
  }, [clutchRpm, combo, shiftResults])

  function finishScenario() {
    setPhase('complete')
    updateStreakAndDate()
    addXP(XP_REWARDS.gearbox)
    completeMission('gearbox')
    addPraise(getRandomPraise(), 'Schimb de Trepte')

    const prevState = getState()
    const updatedState = {
      ...prevState,
      gearboxSuccesses: prevState.gearboxSuccesses + 1,
      gearboxGamesPlayed: prevState.gearboxGamesPlayed + 1,
      activitiesCompleted: [...new Set([...prevState.activitiesCompleted, 'gearbox'])],
    }
    saveState(updatedState)

    const newBadges = checkNewBadges(getState())
    if (newBadges.length > 0) {
      const fresh = getState()
      saveState({ ...fresh, unlockedBadges: [...new Set([...fresh.unlockedBadges, ...newBadges])] })
      setNewBadgeNames(newBadges.map((id) => getBadgeById(id)?.name ?? id))
      setShowCompletion(true)
    }
  }

  const qualityColor: Record<Quality, string> = {
    perfect: 'text-emerald-400',
    good: 'text-blue-400',
    ok: 'text-amber-400',
    wrong: 'text-red-400',
  }

  const qualityBg: Record<Quality, string> = {
    perfect: 'bg-emerald-500/20 border-emerald-500/40',
    good: 'bg-blue-500/20 border-blue-500/40',
    ok: 'bg-amber-500/20 border-amber-500/40',
    wrong: 'bg-red-500/20 border-red-500/40',
  }

  // ── BLOWN ENGINE SCREEN ───────────────────────────────────────────────────────
  if (phase === 'blown') {
    return (
      <div className="px-4 flex flex-col items-center justify-center min-h-[70vh] space-y-5">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-8xl mb-4"
          >
            💥🔥
          </motion.div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Motor avariat!</h2>
          <p className="text-pisi-muted text-sm leading-relaxed max-w-xs mx-auto">
            RPM-ul a depășit zona roșie prea mult timp. Motorul a cedat. Se întâmplă — chiar și piloților reali.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-4 w-full max-w-xs"
          style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}
        >
          <p className="text-xs text-red-400 text-center leading-relaxed">
            🔴 Zona roșie = atenție! Schimbă treapta înainte să ajungi acolo. Motorul îți mulțumește.
          </p>
        </motion.div>

        <div className="flex gap-3 w-full max-w-xs">
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setPhase('intro')}
            className="flex-1 h-12 rounded-2xl text-pisi-muted text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Scenarii
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={startGame}
            className="flex-[2] h-12 rounded-2xl text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)', boxShadow: '0 4px 16px rgba(239,68,68,0.3)' }}>
            Încearcă din nou 🔄
          </motion.button>
        </div>
      </div>
    )
  }

  // ── STALLED SCREEN ────────────────────────────────────────────────────────────
  if (phase === 'stalled') {
    return (
      <div className="px-4 flex flex-col items-center justify-center min-h-[70vh] space-y-5">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
          className="text-center"
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: 2 }}
            className="text-8xl mb-4"
          >
            😴💨
          </motion.div>
          <h2 className="text-2xl font-bold text-amber-400 mb-2">Motor calat!</h2>
          <p className="text-pisi-muted text-sm leading-relaxed max-w-xs mx-auto">
            RPM-ul a scăzut prea mult și motorul s-a oprit. Schimbă treapta mai devreme când RPM-ul coboară.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-4 w-full max-w-xs"
          style={{ border: '1px solid rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.08)' }}
        >
          <p className="text-xs text-amber-400 text-center leading-relaxed">
            💡 Nu panica! Se întâmplă la toată lumea la început. Apasă ambreiajul mai devreme data viitoare.
          </p>
        </motion.div>

        <div className="flex gap-3 w-full max-w-xs">
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setPhase('intro')}
            className="flex-1 h-12 rounded-2xl text-pisi-muted text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Scenarii
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={startGame}
            className="flex-[2] h-12 rounded-2xl text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg,#FBBF24,#F59E0B)', boxShadow: '0 4px 16px rgba(251,191,36,0.3)' }}>
            Încearcă din nou 🔄
          </motion.button>
        </div>
      </div>
    )
  }

  // ── INTRO SCREEN ─────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="px-4 space-y-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
          <h1 className="text-xl font-bold text-pisi-text">Schimb de Trepte 🏎️</h1>
          <p className="text-sm text-pisi-muted mt-0.5">Ambreiaj → Schimbă → Eliberează</p>
        </motion.div>

        <PisiPilotBubble message="Uite bord-ul mașinii! Apasă AMBREIAJ la RPM-ul corect, schimbă treapta, apoi eliberează. Zona verde = perfect!" mood="excited" />

        {/* Scenario cards */}
        <div className="space-y-2.5">
          {SCENARIOS.map((s, i) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => { setScenarioIdx(i); setBubbleMsg(s.description) }}
              className={clsx(
                'w-full text-left p-4 rounded-3xl border-2 tap-target transition-all',
                scenarioIdx === i
                  ? 'bg-orange-50 border-orange-400 shadow-glow-orange'
                  : 'bg-white border-pisi-border'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-pisi-text text-sm">{s.title}</p>
                  <p className="text-xs text-pisi-muted mt-0.5">{s.description}</p>
                </div>
                <div className="text-xs text-pisi-muted shrink-0">
                  {s.tasks.length} {s.tasks.length === 1 ? 'schimb' : 'schimburi'}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          whileTap={{ scale: 0.97 }}
          onClick={startGame}
          className="w-full h-14 gradient-primary text-white font-bold text-base rounded-2xl shadow-glow-orange"
        >
          Pornesc motorul! 🚗
        </motion.button>
      </div>
    )
  }

  // ── COMPLETE SCREEN ───────────────────────────────────────────────────────────
  if (phase === 'complete') {
    const perfect = shiftResults.filter((r) => r.quality === 'perfect').length
    const good = shiftResults.filter((r) => r.quality === 'good').length
    return (
      <div className="px-4 space-y-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card p-6 text-center">
          <div className="text-5xl mb-3">🏁</div>
          <h2 className="text-xl font-bold text-pisi-text">Scenariu complet!</h2>
          <p className="text-3xl font-bold text-gradient-primary mt-2">{score} puncte</p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {shiftResults.map((r, i) => (
              <div key={i} className={clsx('p-3 rounded-2xl border', qualityBg[r.quality])}>
                <p className={clsx('font-bold text-sm', qualityColor[r.quality])}>
                  {r.direction === 'up' ? '↑' : '↓'} {r.quality === 'perfect' ? 'Perfect!' : r.quality === 'good' ? 'Bine!' : r.quality === 'ok' ? 'OK' : 'Greșit'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{r.rpm} RPM · +{r.points}p</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-pisi-muted mt-4">
            {perfect === shiftResults.length ? '🏆 Toate perfecte! Ești gata de examen, Gabu.' : good + perfect === shiftResults.length ? '⭐ Toate curate! Bravo.' : 'Continuă să practici — devine reflex!'}
          </p>
        </motion.div>
        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setPhase('intro'); setScenarioIdx(0) }} className="flex-1 h-12 bg-white border-2 border-orange-200 text-orange-500 font-semibold rounded-2xl">
            Alt scenariu
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => { startGame() }} className="flex-1 h-12 gradient-primary text-white font-semibold rounded-2xl">
            Din nou 🔄
          </motion.button>
        </div>
        <CompletionMoment
          show={showCompletion}
          title="Schimb de Trepte!"
          message={getRandomPraise()}
          emoji="🏎️"
          onContinue={() => setShowCompletion(false)}
          newBadges={newBadgeNames}
        />
      </div>
    )
  }

  // ── PLAYING SCREEN ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3 px-4">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-pisi-text">{scenario.emoji} {scenario.title}</h1>
          <p className="text-xs text-pisi-muted">
            Schimb {taskIdx + 1} din {scenario.tasks.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {combo >= 2 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-xl">
              x{combo} 🔥
            </motion.div>
          )}
          <div className="text-right">
            <p className="text-lg font-bold text-gradient-primary">{score}</p>
            <p className="text-[10px] text-pisi-muted">puncte</p>
          </div>
        </div>
      </div>

      {/* Road */}
      <RoadView speed={speed} />

      {/* Dashboard */}
      <div
        className="rounded-3xl p-4 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
      >
        {/* Tachometer */}
        <div className="flex-1 flex justify-center">
          <Tachometer rpm={rpm} isRedline={isRedline} />
        </div>

        {/* Right panel: speed + gear + indicator */}
        <div className="flex flex-col items-center gap-3 min-w-[80px]">
          {/* Speed */}
          <div className="text-center">
            <p className="text-2xl font-bold text-white leading-none">{speed}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">km/h</p>
          </div>

          {/* Gear display */}
          <motion.div
            key={gear}
            initial={{ scale: 1.4, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)' }}
          >
            <p className="text-[10px] text-gray-500">Treapta</p>
            <p className="text-3xl font-bold text-white leading-none">{GEAR_LABELS[gear]}</p>
          </motion.div>

          {/* RPM zone dot */}
          <motion.div
            animate={{ scale: rpmZone === 'red' ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.4, repeat: rpmZone === 'red' ? Infinity : 0 }}
            className={clsx(
              'w-3 h-3 rounded-full',
              rpmZone === 'green' ? 'bg-emerald-400' : rpmZone === 'yellow' ? 'bg-amber-400' : 'bg-red-500'
            )}
          />
        </div>
      </div>

      {/* Status / prompt */}
      <AnimatePresence mode="wait">
        {phase === 'result' && lastMsg && lastQuality ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={clsx('rounded-2xl border px-4 py-3 text-center', qualityBg[lastQuality])}
          >
            <p className={clsx('text-sm font-bold', qualityColor[lastQuality])}>{lastMsg}</p>
          </motion.div>
        ) : showPrompt ? (
          <motion.div
            key="prompt"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className={clsx(
              'rounded-2xl border px-4 py-3 text-center',
              rpmZone === 'red' ? 'bg-red-500/20 border-red-500/50' : 'bg-amber-500/20 border-amber-500/40'
            )}
          >
            <p className={clsx('text-sm font-bold', rpmZone === 'red' ? 'text-red-400' : 'text-amber-400')}>
              {currentTask?.prompt}
            </p>
          </motion.div>
        ) : (
          <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-white/[0.04] border border-pisi-border px-4 py-2.5 text-center">
            <p className="text-xs text-pisi-muted">{bubbleMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PisiPilot compact */}
      <PisiPilotBubble
        message={phase === 'clutch_in' ? 'Ambreiaj apăsat! Acum alege direcția trepteei.' : phase === 'shifted' ? 'Treapta schimbată! Acum eliberează ambreiajul!' : 'Urmărește turometrul. Schimbă în zona verde-galbenă!'}
        mood={phase === 'result' && lastQuality === 'perfect' ? 'excited' : 'thinking'}
        compact
      />

      {/* Controls */}
      <div className="flex items-center gap-3 pb-2">
        {/* Downshift */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => handleShift('down')}
          disabled={phase !== 'clutch_in' || gear <= 1}
          className={clsx(
            'flex-1 h-16 rounded-2xl font-bold text-sm transition-all tap-target flex flex-col items-center justify-center gap-0.5',
            phase === 'clutch_in' && gear > 1
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          )}
        >
          <span className="text-2xl">🔽</span>
          <span className="text-[11px]">Coboară</span>
        </motion.button>

        {/* Clutch */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={handleClutch}
          disabled={phase === 'result'}
          className={clsx(
            'flex-[1.4] h-20 rounded-3xl font-bold text-base transition-all tap-target flex flex-col items-center justify-center gap-1',
            phase === 'clutch_in' || phase === 'shifted'
              ? 'bg-gradient-to-b from-violet-500 to-purple-600 text-white shadow-glow-purple scale-105'
              : phase === 'playing'
              ? 'gradient-primary text-white shadow-glow-orange'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          <span className="text-xl">🦶</span>
          <span className="text-sm leading-none">
            {phase === 'shifted' ? 'Eliberează' : 'AMBREIAJ'}
          </span>
          {(phase === 'clutch_in' || phase === 'shifted') && (
            <span className="text-[10px] opacity-70">apăsat ✓</span>
          )}
        </motion.button>

        {/* Upshift */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => handleShift('up')}
          disabled={phase !== 'clutch_in' || gear >= 5}
          className={clsx(
            'flex-1 h-16 rounded-2xl font-bold text-sm transition-all tap-target flex flex-col items-center justify-center gap-0.5',
            phase === 'clutch_in' && gear < 5
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          )}
        >
          <span className="text-2xl">🔼</span>
          <span className="text-[11px]">Urcă</span>
        </motion.button>
      </div>
    </div>
  )
}
