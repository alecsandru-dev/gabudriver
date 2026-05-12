'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PisiPilotBubble } from '@/components/PisiPilotBubble'
import { PrimaryButton } from '@/components/PrimaryButton'
import { CompletionMoment } from '@/components/CompletionMoment'
import { getState, setState as saveState, addXP, addPraise, updateStreakAndDate, markActivityComplete } from '@/lib/storage'
import { checkNewBadges, getBadgeById } from '@/lib/badges'
import { completeMission } from '@/lib/quest'
import { getRandomPraise } from '@/lib/messages'
import { XP_REWARDS } from '@/lib/progress'

type Phase = 'idle' | 'ready' | 'green' | 'result' | 'toosoon'

export default function ReactiePage() {
  const [phase, setPhase]               = useState<Phase>('idle')
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [history, setHistory]           = useState<number[]>([])
  const [showCompletion, setShowCompletion] = useState(false)
  const [newBadgeNames, setNewBadgeNames]   = useState<string[]>([])
  const [bubbleMsg, setBubbleMsg]        = useState('Reflexe de pisică activate. Când apare verde — tap instant!')

  const startRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setHistory(getState().reactionTimes.slice(-5).reverse())
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  function startRound() {
    setPhase('ready')
    setBubbleMsg('Ochii pe semafor. Nu te mișca…')
    timerRef.current = setTimeout(() => {
      setPhase('green')
      startRef.current = Date.now()
    }, 1500 + Math.random() * 2500)
  }

  function handleTap() {
    if (phase === 'ready') {
      clearTimeout(timerRef.current!)
      setPhase('toosoon')
      setBubbleMsg('Ai plecat pe roșu! Dar aici nu te vede poliția. 😹')
      return
    }
    if (phase === 'green') {
      const elapsed = Date.now() - startRef.current
      setReactionTime(elapsed)
      setPhase('result')

      const prev = getState()
      const newTimes = [...prev.reactionTimes, elapsed].slice(-50)
      const updated = { ...prev, reactionTimes: newTimes, reactionGamesPlayed: prev.reactionGamesPlayed + 1, activitiesCompleted: [...new Set([...prev.activitiesCompleted, 'reaction'])] }
      saveState(updated)
      updateStreakAndDate(); addXP(XP_REWARDS.reaction); completeMission('reaction')
      addPraise(getRandomPraise(), 'Reaction Warm-up'); markActivityComplete('reaction_' + Date.now())

      const nb = checkNewBadges(getState())
      if (nb.length) {
        const fresh = getState()
        saveState({ ...fresh, unlockedBadges: [...new Set([...fresh.unlockedBadges, ...nb])] })
        setNewBadgeNames(nb.map(id => getBadgeById(id)?.name ?? id))
        setShowCompletion(true)
      }

      setHistory(getState().reactionTimes.slice(-5).reverse())

      if (elapsed < 300)      setBubbleMsg('Reflexe de pisică! Sub 300ms — absolut incredibil. 🐱⚡')
      else if (elapsed < 450) setBubbleMsg('Reacție excelentă! Creierul tău e în formă.')
      else                    setBubbleMsg('Bun start. Cu practică devine instinct.')
    }
  }

  function reset() { setPhase('idle'); setReactionTime(null); setNewBadgeNames([]); setBubbleMsg('Gata de o nouă rundă?') }

  const best = history.length ? Math.min(...history) : null
  const avg  = history.length ? Math.round(history.reduce((a,b) => a+b, 0) / history.length) : null

  const LIGHT_BG: Record<Phase, string> = {
    idle:    'rgba(255,255,255,0.04)',
    ready:   'rgba(255,42,138,0.12)',
    green:   'rgba(168,255,30,0.15)',
    result:  'rgba(0,200,255,0.08)',
    toosoon: 'rgba(255,107,26,0.1)',
  }

  return (
    <div className="px-4 space-y-4">
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="pt-2">
        <h1 className="font-display text-xl font-bold" style={{ color:'#F2F0FF' }}>Reaction Warm-up ⚡</h1>
        <p className="text-sm mt-0.5" style={{ color:'#4C4C68' }}>Când vede verde, tu apeși. Simplu.</p>
      </motion.div>

      <PisiPilotBubble message={bubbleMsg} mood={phase === 'green' ? 'excited' : phase === 'result' ? 'proud' : 'happy'} />

      {/* ── Traffic light card ── */}
      <motion.div
        key={phase}
        initial={{ opacity:0, scale:0.97 }}
        animate={{ opacity:1, scale:1 }}
        className="card p-6 flex flex-col items-center gap-6"
        style={{
          background: LIGHT_BG[phase] || LIGHT_BG.idle,
          border: phase === 'green'
            ? '1px solid rgba(168,255,30,0.4)'
            : phase === 'ready'
            ? '1px solid rgba(255,42,138,0.3)'
            : '1px solid rgba(255,255,255,0.08)',
          boxShadow: phase === 'green'
            ? 'var(--glass-shadow), 0 0 60px rgba(168,255,30,0.15)'
            : 'var(--glass-shadow)',
        }}
      >
        {/* Traffic light housing */}
        <div
          className="flex flex-col items-center gap-3 px-5 py-6 rounded-3xl"
          style={{ background:'rgba(0,0,0,0.6)', border:'1px solid rgba(255,255,255,0.06)' }}
        >
          {[
            { lit: phase === 'ready', color: '#FF2A8A', offColor: '#2A0810' },
            { lit: false,              color: '#FFD700', offColor: '#2A2000' },
            { lit: phase === 'green',  color: '#A8FF1E', offColor: '#0A1400' },
          ].map((l, i) => (
            <motion.div
              key={i}
              className="w-14 h-14 rounded-full"
              animate={l.lit ? { scale:[1,1.05,1] } : {}}
              transition={{ duration:0.4, repeat:Infinity }}
              style={{
                background: l.lit ? l.color : l.offColor,
                boxShadow: l.lit ? `0 0 24px ${l.color}, 0 0 48px ${l.color}60` : 'none',
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="w-full">
              <PrimaryButton onClick={startRound} fullWidth size="lg" variant="cyan">
                Sunt gata ⚡
              </PrimaryButton>
            </motion.div>
          )}
          {phase === 'ready' && (
            <motion.button
              key="waiting"
              initial={{ opacity:0 }} animate={{ opacity:1 }}
              onClick={handleTap}
              className="w-full h-20 rounded-3xl tap-target flex items-center justify-center"
              style={{ background:'rgba(255,42,138,0.08)', border:'1px solid rgba(255,42,138,0.2)' }}
            >
              <p className="font-display font-bold" style={{ color:'#FF2A8A' }}>Stai… ⏳</p>
            </motion.button>
          )}
          {phase === 'green' && (
            <motion.button
              key="green"
              initial={{ scale:0.85, opacity:0 }}
              animate={{ scale:1, opacity:1 }}
              transition={{ type:'spring', stiffness:400, damping:20 }}
              onClick={handleTap}
              className="w-full h-24 rounded-3xl tap-target flex items-center justify-center"
              style={{ background:'rgba(168,255,30,0.15)', border:'2px solid rgba(168,255,30,0.5)', boxShadow:'0 0 40px rgba(168,255,30,0.25)' }}
            >
              <p className="font-display font-black text-2xl" style={{ color:'#A8FF1E', textShadow:'0 0 20px rgba(168,255,30,0.8)' }}>
                TAP! 🟢
              </p>
            </motion.button>
          )}
          {phase === 'toosoon' && (
            <motion.div
              key="toosoon"
              initial={{ x:-10 }} animate={{ x:0 }}
              className="w-full space-y-3"
            >
              <div className="rounded-2xl p-4 text-center chip-orange">
                <p className="font-display font-bold">Pe roșu! 🔴</p>
                <p className="text-xs mt-1 opacity-80">Ambreiajul a mai văzut asta. Încearcă din nou.</p>
              </div>
              <PrimaryButton onClick={reset} fullWidth variant="ghost">Încearcă din nou</PrimaryButton>
            </motion.div>
          )}
          {phase === 'result' && reactionTime !== null && (
            <motion.div key="result" initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} className="w-full space-y-4">
              <div className="text-center">
                <motion.p
                  initial={{ scale:0.5 }} animate={{ scale:1 }}
                  transition={{ type:'spring', stiffness:300 }}
                  className="font-display font-black text-5xl"
                  style={{ color: reactionTime < 350 ? '#A8FF1E' : reactionTime < 500 ? '#00C8FF' : '#FFD700', textShadow:`0 0 30px currentColor` }}
                >
                  {reactionTime}ms
                </motion.p>
                <p className="text-sm mt-1" style={{ color:'#4C4C68' }}>
                  {reactionTime < 300 ? '🔥 Imposibil de rapid!' : reactionTime < 400 ? '⚡ Reflexe excepționale!' : reactionTime < 550 ? '✅ Bine!' : '🌱 Practică mai mult'}
                </p>
              </div>
              {(best || avg) && (
                <div className="grid grid-cols-2 gap-3">
                  {best && <div className="card p-3 text-center"><p className="text-[10px] tracking-widest uppercase" style={{ color:'#4C4C68' }}>Best</p><p className="font-display font-bold text-lg" style={{ color:'#FFD700' }}>{best}ms</p></div>}
                  {avg  && <div className="card p-3 text-center"><p className="text-[10px] tracking-widest uppercase" style={{ color:'#4C4C68' }}>Medie</p><p className="font-display font-bold text-lg" style={{ color:'#4B7FFF' }}>{avg}ms</p></div>}
                </div>
              )}
              <PrimaryButton onClick={reset} fullWidth variant="cyan">Încă o rundă ⚡</PrimaryButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* History chips */}
      {history.length > 0 && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="card p-4">
          <p className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color:'#4C4C68' }}>Ultimele runde</p>
          <div className="flex gap-2 flex-wrap">
            {history.map((t, i) => (
              <div
                key={i}
                className="px-3 py-1.5 rounded-xl text-xs font-display font-bold"
                style={{
                  background: t < 400 ? 'rgba(168,255,30,0.1)' : t < 600 ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.06)',
                  color:      t < 400 ? '#A8FF1E'               : t < 600 ? '#FFD700'              : '#4C4C68',
                  border:     `1px solid ${t < 400 ? 'rgba(168,255,30,0.3)' : t < 600 ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {t}ms
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <CompletionMoment show={showCompletion} title="Reflexe de pisică!" message={getRandomPraise()} emoji="⚡" variant="success" onContinue={() => setShowCompletion(false)} newBadges={newBadgeNames} />
    </div>
  )
}
