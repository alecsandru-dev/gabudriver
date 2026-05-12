'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PisiPilotBubble } from '@/components/PisiPilotBubble'
import { GlassCard } from '@/components/GlassCard'
import { PrimaryButton } from '@/components/PrimaryButton'
import { CompletionMoment } from '@/components/CompletionMoment'
import { getState, setState as saveState, addXP, addPraise, updateStreakAndDate, markActivityComplete } from '@/lib/storage'
import { checkNewBadges, getBadgeById } from '@/lib/badges'
import { completeMission } from '@/lib/quest'
import { getRandomPraise } from '@/lib/messages'
import { XP_REWARDS } from '@/lib/progress'

const CYAN   = '#00C8FF'
const PINK   = '#FF2A8A'
const LIME   = '#A8FF1E'
const ORANGE = '#FF6B1A'
const GOLD   = '#FFD700'
const BLUE   = '#4B7FFF'
const INK    = '#F2F0FF'
const FADE   = '#4C4C68'
const MUTE   = '#9090A8'

type Phase = 'idle' | 'ready' | 'green' | 'result' | 'toosoon'

function TrafficLamp({ on, color, bright }: { on?: boolean; color: string; bright?: boolean }) {
  return (
    <div style={{
      width:56, height:56, borderRadius:'50%', position:'relative',
      background: on
        ? `radial-gradient(circle at 30% 30%, ${color}ff 0%, ${color}aa 50%, ${color}33 100%)`
        : 'radial-gradient(circle at 30% 30%, #1a1a2c 0%, #0a0a14 100%)',
      border: `1px solid ${on ? color : 'rgba(255,255,255,0.06)'}`,
      boxShadow: on
        ? `0 0 24px ${color}cc, 0 0 48px ${color}66, inset 0 2px 6px rgba(255,255,255,0.4), inset 0 -3px 8px ${color}88`
        : 'inset 0 2px 4px rgba(0,0,0,0.7)',
      transition: 'background 0.25s, box-shadow 0.25s',
    }}>
      {on && (
        <div style={{
          position:'absolute', inset:'12% 14% 50% 14%', borderRadius:'50%',
          background:`radial-gradient(ellipse, rgba(255,255,255,${bright?0.7:0.55}) 0%, transparent 70%)`,
          filter:'blur(2px)',
        }} />
      )}
    </div>
  )
}

export default function ReactiePage() {
  const [phase, setPhase]     = useState<Phase>('idle')
  const [rt, setRt]           = useState<number | null>(null)
  const [history, setHistory] = useState<number[]>([])
  const [showComp, setShowComp] = useState(false)
  const [newBadge, setNewBadge] = useState<string[]>([])
  const [msg, setMsg]         = useState('Concentrare maximă, fetița mea! Degetul gata pe ecran.')
  const startRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setHistory(getState().reactionTimes.slice(-5).reverse())
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  function startRound() {
    setPhase('ready'); setMsg('Ochii pe semafor. Nu te mișca…')
    timerRef.current = setTimeout(() => {
      setPhase('green'); startRef.current = Date.now()
    }, 1500 + Math.random() * 2500)
  }

  function handleTap() {
    if (phase === 'ready') {
      clearTimeout(timerRef.current!)
      setPhase('toosoon')
      setMsg('Ai plecat pe roșu! Dar aici nu te vede poliția. 😹')
      return
    }
    if (phase === 'green') {
      const elapsed = Date.now() - startRef.current
      setRt(elapsed); setPhase('result')
      const prev = getState()
      const times = [...prev.reactionTimes, elapsed].slice(-50)
      saveState({ ...prev, reactionTimes: times, reactionGamesPlayed: prev.reactionGamesPlayed + 1,
        activitiesCompleted: [...new Set([...prev.activitiesCompleted, 'reaction'])] })
      updateStreakAndDate(); addXP(XP_REWARDS.reaction); completeMission('reaction')
      addPraise(getRandomPraise(), 'Reaction Warm-up'); markActivityComplete('reaction_' + Date.now())
      const nb = checkNewBadges(getState())
      if (nb.length) {
        const f = getState()
        saveState({ ...f, unlockedBadges: [...new Set([...f.unlockedBadges, ...nb])] })
        setNewBadge(nb.map(id => getBadgeById(id)?.name ?? id))
        setShowComp(true)
      }
      setHistory(getState().reactionTimes.slice(-5).reverse())
      setMsg(elapsed < 300 ? 'WOOO! Reacția ta a fost fulger!' : elapsed < 450 ? 'Reacție excelentă!' : 'Bun start. Practică și devine instinct.')
    }
  }

  function reset() { setPhase('idle'); setRt(null); setMsg('Concentrare maximă, fetița mea! Degetul gata.') }

  const best = history.length ? Math.min(...history) : null
  const avg  = history.length ? Math.round(history.reduce((a,b)=>a+b,0)/history.length) : null

  return (
    <div style={{ padding:'6px 14px 16px', display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'2px 2px 0' }}>
        <div>
          <div style={{ fontFamily:'Space Grotesk, system-ui', fontWeight:700, fontSize:22, color:INK }}>Reacție</div>
          <div style={{ fontSize:12, color:FADE, marginTop:1 }}>Apasă când devine verde</div>
        </div>
        {best && (
          <div style={{ padding:'6px 12px', borderRadius:999, fontFamily:'Space Grotesk', fontWeight:700, fontSize:12,
            color:CYAN, background:`${CYAN}15`, border:`1px solid ${CYAN}55`, textShadow:`0 0 8px ${CYAN}` }}>
            Best {best}ms
          </div>
        )}
      </div>

      <PisiPilotBubble
        mood={phase === 'green' ? 'excited' : phase === 'result' ? 'proud' : 'happy'}
        message={msg} avatarSize={48}
      />

      <GlassCard accent={CYAN} padding={20} style={{ borderRadius:26 }}>
        {/* Traffic light housing */}
        <div style={{
          width:156, margin:'6px auto 4px', padding:14, borderRadius:22,
          background:'linear-gradient(180deg, #060611 0%, #0C0C18 100%)',
          border:'1px solid rgba(255,255,255,0.08)', borderTopColor:'rgba(255,255,255,0.18)',
          boxShadow:'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 24px rgba(0,0,0,0.6)',
          display:'flex', flexDirection:'column', gap:12, alignItems:'center',
        }}>
          <TrafficLamp on={phase === 'ready'} color="#FF2A4A" />
          <TrafficLamp color={GOLD} />
          <TrafficLamp on={phase === 'green'} color={LIME} bright />
        </div>

        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ marginTop:18 }}>
              <PrimaryButton onClick={startRound} fullWidth variant="cyan" size="lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                  <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z" fill="#fff" strokeWidth="0.5"/>
                </svg>
                Pornește runda
              </PrimaryButton>
            </motion.div>
          )}

          {phase === 'ready' && (
            <motion.button key="ready" initial={{ opacity:0 }} animate={{ opacity:1 }}
              onClick={handleTap}
              style={{
                width:'100%', marginTop:18, height:72, borderRadius:22, cursor:'pointer',
                background:'rgba(255,42,74,0.08)', border:'1px solid rgba(255,42,74,0.25)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
              <span style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:18, color:'#FF2A4A' }}>
                Stai… ⏳
              </span>
            </motion.button>
          )}

          {phase === 'green' && (
            <motion.button key="green"
              initial={{ scale:0.85, opacity:0 }} animate={{ scale:1, opacity:1 }}
              transition={{ type:'spring', stiffness:400, damping:20 }}
              onClick={handleTap}
              style={{
                width:'100%', marginTop:18, height:88, borderRadius:22, cursor:'pointer',
                background:`rgba(168,255,30,0.15)`, border:`2px solid ${LIME}55`,
                boxShadow:`0 0 40px ${LIME}25`,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
              <span style={{ fontFamily:'Space Grotesk', fontWeight:900, fontSize:26, color:LIME,
                textShadow:`0 0 20px ${LIME}` }}>
                TAP NOW! 🟢
              </span>
            </motion.button>
          )}

          {phase === 'toosoon' && (
            <motion.div key="toosoon" initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ marginTop:18, display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ padding:'12px 16px', borderRadius:16, textAlign:'center',
                background:`rgba(255,107,26,0.08)`, border:`1px solid rgba(255,107,26,0.25)` }}>
                <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:16, color:ORANGE }}>Pe roșu! 🔴</div>
                <div style={{ fontSize:12.5, color:FADE, marginTop:4 }}>Ambreiajul a mai văzut asta. Încearcă din nou.</div>
              </div>
              <PrimaryButton onClick={reset} fullWidth variant="ghost">Încearcă din nou</PrimaryButton>
            </motion.div>
          )}

          {phase === 'result' && rt !== null && (
            <motion.div key="result" initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }} style={{ marginTop:18 }}>
              <div style={{ textAlign:'center', marginBottom:14 }}>
                <motion.div
                  initial={{ scale:0.5 }} animate={{ scale:1 }}
                  transition={{ type:'spring', stiffness:300 }}
                  style={{
                    fontFamily:'Space Grotesk', fontWeight:800, fontSize:52,
                    color: rt < 350 ? LIME : rt < 500 ? CYAN : GOLD,
                    textShadow:'0 0 24px currentColor', letterSpacing:'-0.02em', lineHeight:1,
                  }}
                >
                  {rt}<span style={{ fontSize:22, opacity:0.7 }}>ms</span>
                </motion.div>
                <div style={{ fontSize:12, color:MUTE, marginTop:6 }}>
                  {rt < 300 ? '🔥 Imposibil de rapid!' : rt < 400 ? '⚡ Reflexe excepționale!' : rt < 550 ? '✅ Bine!' : '🌱 Practică mai mult'}
                </div>
              </div>

              {/* History chips */}
              <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:14 }}>
                {Array.from({ length:5 }).map((_, i) => {
                  const t = history[i]
                  return (
                    <div key={i} style={{
                      width:46, padding:'6px 0', borderRadius:10, textAlign:'center',
                      background: t ? `${CYAN}10` : 'transparent',
                      border: `1px solid ${t ? CYAN + '40' : 'rgba(255,255,255,0.08)'}`,
                      fontFamily:'Space Grotesk', fontWeight:700, fontSize:11,
                      color: t ? CYAN : FADE,
                      textShadow: t ? `0 0 6px ${CYAN}aa` : 'none',
                    }}>{t ? `${t}` : '—'}</div>
                  )
                })}
              </div>

              {(best || avg) && (
                <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                  {best !== null && (
                    <div style={{ flex:1, padding:'8px 0', borderRadius:12, textAlign:'center',
                      background:`${GOLD}10`, border:`1px solid ${GOLD}30` }}>
                      <div style={{ fontSize:9, fontWeight:700, color:FADE, letterSpacing:'0.1em', fontFamily:'Space Grotesk', textTransform:'uppercase' }}>BEST</div>
                      <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:16, color:GOLD, textShadow:`0 0 8px ${GOLD}` }}>{best}ms</div>
                    </div>
                  )}
                  {avg !== null && (
                    <div style={{ flex:1, padding:'8px 0', borderRadius:12, textAlign:'center',
                      background:`${BLUE}10`, border:`1px solid ${BLUE}30` }}>
                      <div style={{ fontSize:9, fontWeight:700, color:FADE, letterSpacing:'0.1em', fontFamily:'Space Grotesk', textTransform:'uppercase' }}>MEDIE</div>
                      <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:16, color:BLUE, textShadow:`0 0 8px ${BLUE}` }}>{avg}ms</div>
                    </div>
                  )}
                </div>
              )}
              <PrimaryButton onClick={reset} fullWidth variant="cyan">Încă o rundă ⚡</PrimaryButton>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <CompletionMoment show={showComp} title="Reflexe de pisică!" message={getRandomPraise()}
        emoji="⚡" variant="perfect" onContinue={() => setShowComp(false)} newBadges={newBadge} />
    </div>
  )
}
