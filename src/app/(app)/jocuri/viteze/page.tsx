'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PisiPilotBubble } from '@/components/PisiPilotBubble'
import { PrimaryButton } from '@/components/PrimaryButton'
import { CompletionMoment } from '@/components/CompletionMoment'
import { getState, setState as saveState, addXP, addPraise, updateStreakAndDate } from '@/lib/storage'
import { checkNewBadges, getBadgeById } from '@/lib/badges'
import { completeMission } from '@/lib/quest'
import { getRandomPraise } from '@/lib/messages'
import { XP_REWARDS } from '@/lib/progress'
import { GEARBOX_MESSAGES } from '@/lib/messages'

type GameResult = 'idle' | 'stall' | 'tooMuchGas' | 'success' | 'needsGas'

function evaluateStart(clutch: number, gas: number): GameResult {
  // clutch: 0 = not pressed (engaged), 100 = fully pressed (disengaged)
  // When starting: need to release clutch slowly while adding gas
  // bite point: clutch 30-60 (partial release), gas 20-55

  if (gas > 72) return 'tooMuchGas'
  if (clutch > 65) return 'needsGas' // still mostly pressed, need to release more
  if (clutch < 20 && gas < 18) return 'stall' // too fast release, not enough gas
  if (clutch >= 25 && clutch <= 62 && gas >= 18 && gas <= 60) return 'success'
  if (clutch < 25 && gas >= 18 && gas <= 72) return 'success' // also valid — clutch released with gas
  return 'stall'
}

function getRpm(clutch: number, gas: number): number {
  const base = 800
  const gasContrib = gas * 35
  const clutchRelease = clutch < 50 ? (50 - clutch) * 5 : 0
  return Math.min(6500, base + gasContrib + clutchRelease)
}

function getRpmColor(rpm: number): string {
  if (rpm < 2000) return '#60a5fa' // blue - too low
  if (rpm < 3500) return '#34d399' // green - good
  if (rpm < 5000) return '#fbbf24' // amber - high
  return '#ef4444' // red - danger
}

const getRandomFrom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

export default function VitezePage() {
  const [clutch, setClutch] = useState(100)
  const [gas, setGas] = useState(0)
  const [result, setResult] = useState<GameResult>('idle')
  const [attempts, setAttempts] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)
  const [displaySuccesses, setDisplaySuccesses] = useState(0)
  const [displayStalls, setDisplayStalls] = useState(0)
  const [displayGamesPlayed, setDisplayGamesPlayed] = useState(0)

  useEffect(() => {
    const s = getState()
    setDisplaySuccesses(s.gearboxSuccesses)
    setDisplayStalls(s.gearboxStalls)
    setDisplayGamesPlayed(s.gearboxGamesPlayed)
  }, [])
  const [newBadgeNames, setNewBadgeNames] = useState<string[]>([])
  const [bubbleMsg, setBubbleMsg] = useState(
    getRandomFrom(GEARBOX_MESSAGES.ready)
  )

  const rpm = getRpm(clutch, gas)
  const rpmPercent = Math.min(100, (rpm / 6500) * 100)
  const rpmColor = getRpmColor(rpm)

  function tryStart() {
    const r = evaluateStart(clutch, gas)
    setResult(r)
    setAttempts((a) => a + 1)

    const prevState = getState()

    if (r === 'stall') {
      setBubbleMsg(getRandomFrom(GEARBOX_MESSAGES.stall))
      const updated = {
        ...prevState,
        gearboxStalls: prevState.gearboxStalls + 1,
        gearboxGamesPlayed: prevState.gearboxGamesPlayed + 1,
        activitiesCompleted: [...new Set([...prevState.activitiesCompleted, 'gearbox'])],
      }
      saveState(updated)
      setDisplayStalls(updated.gearboxStalls)
      setDisplayGamesPlayed(updated.gearboxGamesPlayed)
      const newBadges = checkNewBadges(getState())
      if (newBadges.length > 0) {
        const fresh = getState()
        saveState({ ...fresh, unlockedBadges: [...new Set([...fresh.unlockedBadges, ...newBadges])] })
        setNewBadgeNames(newBadges.map((id) => getBadgeById(id)?.name ?? id))
      }
    } else if (r === 'tooMuchGas') {
      setBubbleMsg(getRandomFrom(GEARBOX_MESSAGES.tooMuchGas))
      const n = prevState.gearboxGamesPlayed + 1
      saveState({ ...prevState, gearboxGamesPlayed: n })
      setDisplayGamesPlayed(n)
    } else if (r === 'success') {
      setBubbleMsg(getRandomFrom(GEARBOX_MESSAGES.success))
      const updated = {
        ...prevState,
        gearboxSuccesses: prevState.gearboxSuccesses + 1,
        gearboxGamesPlayed: prevState.gearboxGamesPlayed + 1,
        activitiesCompleted: [...new Set([...prevState.activitiesCompleted, 'gearbox'])],
      }
      saveState(updated)
      setDisplaySuccesses(updated.gearboxSuccesses)
      setDisplayGamesPlayed(updated.gearboxGamesPlayed)
      updateStreakAndDate()
      addXP(XP_REWARDS.gearbox)
      completeMission('gearbox')
      addPraise(getRandomPraise(), 'Cutia de Viteze')
      const fresh = getState()
      const newBadges = checkNewBadges(fresh)
      if (newBadges.length > 0) {
        saveState({ ...fresh, unlockedBadges: [...new Set([...fresh.unlockedBadges, ...newBadges])] })
        setNewBadgeNames(newBadges.map((id) => getBadgeById(id)?.name ?? id))
        setShowCompletion(true)
      }
    } else {
      setBubbleMsg('Eliberează ambreiajul mai mult și adaugă puțin gaz.')
    }
  }

  function reset() {
    setClutch(100)
    setGas(0)
    setResult('idle')
    setNewBadgeNames([])
    setBubbleMsg(getRandomFrom(GEARBOX_MESSAGES.ready))
  }

  const statusInfo: Record<GameResult, { label: string; color: string; emoji: string }> = {
    idle: { label: 'Motor pornit', color: 'text-blue-500', emoji: '🔑' },
    stall: { label: 'S-a oprit motorul', color: 'text-red-500', emoji: '💨' },
    tooMuchGas: { label: 'Prea mult gaz', color: 'text-orange-500', emoji: '🚀' },
    success: { label: 'Pornire lină', color: 'text-emerald-600', emoji: '✅' },
    needsGas: { label: 'Eliberează ambreiajul', color: 'text-blue-500', emoji: '⚙️' },
  }

  const status = statusInfo[result]

  return (
    <div className="px-4 space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
        <h1 className="text-xl font-bold text-pisi-text">Cutia de Viteze 🔧</h1>
        <p className="text-sm text-pisi-muted mt-0.5">Găsește punctul magic al ambreiajului</p>
      </motion.div>

      <PisiPilotBubble message={bubbleMsg} mood="thinking" />

      {/* Car status */}
      <AnimatePresence mode="wait">
        <motion.div
          key={result}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`card p-4 flex items-center gap-3 ${result === 'success' ? 'bg-emerald-50 border-emerald-100' : result === 'stall' ? 'bg-red-50 border-red-100' : ''}`}
        >
          <span className="text-3xl">{status.emoji}</span>
          <div>
            <p className={`font-bold ${status.color}`}>{status.label}</p>
            <p className="text-xs text-pisi-muted">{attempts > 0 ? `${attempts} ${attempts === 1 ? 'tentativă' : 'tentative'}` : 'Prima tentativă'}</p>
          </div>
          {result === 'success' && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="ml-auto text-3xl"
            >
              🎉
            </motion.span>
          )}
        </motion.div>
      </AnimatePresence>

      {/* RPM meter */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-pisi-muted uppercase tracking-wide">Turație motor</span>
          <span className="text-sm font-bold" style={{ color: rpmColor }}>{rpm.toFixed(0)} RPM</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full transition-all duration-100"
            style={{ width: `${rpmPercent}%`, backgroundColor: rpmColor }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-gray-400">
          <span>800</span>
          <span className="text-emerald-500">2000–3500 zona ideală</span>
          <span>6500</span>
        </div>
      </div>

      {/* Sliders */}
      <div className="card p-5 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-violet-700">🦶 Ambreiaj</label>
            <span className="text-xs text-pisi-muted font-mono">
              {clutch === 100 ? 'Apăsat ✓' : clutch === 0 ? 'Eliberat' : `${clutch}%`}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={clutch}
            onChange={(e) => { setClutch(Number(e.target.value)); setResult('idle') }}
            className="w-full clutch"
            style={{ background: `linear-gradient(to right, #A78BFA ${clutch}%, #e5e7eb ${clutch}%)` }}
            aria-label="Ambreiaj"
          />
          <p className="text-xs text-violet-500">
            {clutch > 70 ? 'Apăsat complet → eliberează treptat' : clutch > 35 ? '⚡ Zona de cuplare!' : 'Ambreiaj eliberat'}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-orange-600">⛽ Accelerație</label>
            <span className="text-xs text-pisi-muted font-mono">{gas}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={gas}
            onChange={(e) => { setGas(Number(e.target.value)); setResult('idle') }}
            className="w-full"
            style={{ background: `linear-gradient(to right, #FF8E53 ${gas}%, #e5e7eb ${gas}%)` }}
            aria-label="Acceleratie"
          />
          <p className="text-xs text-orange-500">
            {gas === 0 ? 'Fără gaz' : gas < 25 ? 'Gaz minim' : gas < 60 ? '✓ Gaz optim' : 'Gaz mult — risc de supra-turație'}
          </p>
        </div>
      </div>

      {/* Mini car animation */}
      <div className="card p-4 flex items-center gap-4 overflow-hidden">
        <div className="text-3xl select-none">🚗</div>
        <div className="flex-1">
          <motion.div
            className="h-1.5 bg-gray-100 rounded-full overflow-hidden"
          >
            <motion.div
              className={`h-full rounded-full ${result === 'success' ? 'gradient-mint' : 'bg-gray-300'}`}
              animate={{ width: result === 'success' ? '100%' : result === 'idle' ? `${Math.max(5, (100 - clutch) * 0.3)}%` : '0%' }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
          <p className="text-xs text-pisi-muted mt-1">
            {result === 'success' ? '🏁 Mașina se mișcă!' : result === 'stall' ? '💤 Motor oprit' : 'Viteza 0'}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <PrimaryButton onClick={tryStart} fullWidth size="lg">
          Pornește 🚗
        </PrimaryButton>
        {result !== 'idle' && (
          <PrimaryButton onClick={reset} variant="ghost" size="lg">
            Reset
          </PrimaryButton>
        )}
      </div>

      {/* Stats */}
      {displayGamesPlayed > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 gap-3 pb-2"
        >
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-emerald-500">{displaySuccesses}</p>
            <p className="text-xs text-pisi-muted mt-0.5">Porniri reușite</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{displayStalls}</p>
            <p className="text-xs text-pisi-muted mt-0.5">Calări (normale!)</p>
          </div>
        </motion.div>
      )}

      <CompletionMoment
        show={showCompletion}
        title="Punctul magic găsit!"
        message="Ambreiajul și gazul au cooperat. Universul e în echilibru."
        emoji="🔧"
        onContinue={() => setShowCompletion(false)}
        newBadges={newBadgeNames}
      />
    </div>
  )
}
