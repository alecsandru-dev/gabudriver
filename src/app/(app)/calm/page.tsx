'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PisiPilotBubble } from '@/components/PisiPilotBubble'
import { GlassCard } from '@/components/GlassCard'
import { PrimaryButton } from '@/components/PrimaryButton'
import { CompletionMoment } from '@/components/CompletionMoment'
import { getState, setState as saveState, addXP, addPraise, updateStreakAndDate } from '@/lib/storage'
import { checkNewBadges, getBadgeById } from '@/lib/badges'
import { completeMission } from '@/lib/quest'
import { XP_REWARDS } from '@/lib/progress'

const N = { cyan:'#00C8FF', purple:'#B44FFF', blue:'#4B7FFF', lime:'#A8FF1E', pink:'#FF2A8A' }
const S = { ink:'#F2F0FF', inkSoft:'#C8C6E0', inkFade:'#4C4C68', inkMute:'#9090A8' }

// 4-2-6 pattern keyframes (0, 0.33, 0.50, 0.83, 1.0)
const ORB_TIMES = [0, 0.33, 0.50, 0.83, 1.0]

type SessionState = 'intro' | 'active' | 'done'

// Phase label changes every cycle
const PHASES = [
  { label:'Inspiră',  dur:4 },
  { label:'Ține',     dur:2 },
  { label:'Expiră',   dur:6 },
]
const CYCLE = 12 // total seconds per cycle
const TOTAL  = 60 // session length

// Which phase are we in at offset seconds?
function getPhase(offset: number) {
  const t = offset % CYCLE
  if (t < 4)  return { label:'Inspiră',  color:N.cyan }
  if (t < 6)  return { label:'Ține',     color:N.purple }
  return              { label:'Expiră',   color:N.blue }
}

// BreathingOrb — exact from pisi-screens-b.jsx
function BreathingOrb() {
  return (
    <div style={{ position:'relative', width:230, height:230 }}>
      {/* Outer halo */}
      <motion.div
        style={{
          position:'absolute', inset:-10, borderRadius:'50%',
          background:`radial-gradient(circle, ${N.cyan}22 0%, transparent 60%)`,
          filter:'blur(10px)',
        }}
        animate={{ scale:[1,1.18,1.18,1,1], opacity:[0.7,1,1,0.6,0.7] }}
        transition={{ duration:12, repeat:Infinity, ease:'easeInOut', times:ORB_TIMES }}
      />
      {/* Middle ring */}
      <motion.div
        style={{
          position:'absolute', inset:28, borderRadius:'50%',
          background:`radial-gradient(circle at 30% 30%, ${N.cyan}55 0%, ${N.purple}22 50%, transparent 80%)`,
          border:`1.5px solid ${N.cyan}88`,
          boxShadow:`0 0 36px ${N.cyan}66, inset 0 0 30px ${N.cyan}44`,
        }}
        animate={{ scale:[0.85,1.05,1.05,0.85,0.85] }}
        transition={{ duration:12, repeat:Infinity, ease:'easeInOut', times:ORB_TIMES }}
      />
      {/* Inner core */}
      <motion.div
        style={{
          position:'absolute', inset:60, borderRadius:'50%',
          background:`radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, ${N.cyan}cc 30%, ${N.purple}88 70%, transparent 100%)`,
          boxShadow:`0 0 30px ${N.cyan}aa, inset 0 0 24px rgba(255,255,255,0.4)`,
        }}
        animate={{ scale:[0.7,1,1,0.7,0.7], opacity:[0.85,1,1,0.85,0.85] }}
        transition={{ duration:12, repeat:Infinity, ease:'easeInOut', times:ORB_TIMES }}
      />
      {/* 6 orbital particles */}
      {[0,1,2,3,4,5].map(i => {
        const a = (i / 6) * Math.PI * 2
        return (
          <motion.div key={i}
            style={{
              position:'absolute',
              left: 115 + Math.cos(a) * 100 - 2,
              top:  115 + Math.sin(a) * 100 - 2,
              width:4, height:4, borderRadius:'50%',
              background:N.cyan, boxShadow:`0 0 8px ${N.cyan}`,
            }}
            animate={{ opacity:[0.2,1,0.2] }}
            transition={{ duration:3, repeat:Infinity, delay:i*0.4, ease:'easeInOut' }}
          />
        )
      })}
    </div>
  )
}

export default function CalmPage() {
  const [session, setSession]   = useState<SessionState>('intro')
  const [elapsed, setElapsed]   = useState(0)
  const [offset, setOffset]     = useState(0)
  const [show, setShow]         = useState(false)
  const [newBadge, setNewBadge] = useState<string[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  function start() {
    setSession('active'); setElapsed(0); setOffset(0)
    intervalRef.current = setInterval(() => {
      setElapsed(p => {
        const n = p + 1
        setOffset(o => o + 1)
        if (n >= TOTAL) { clearInterval(intervalRef.current!); finish() }
        return n
      })
    }, 1000)
  }

  function finish() {
    const prev = getState()
    const updated = { ...prev, calmSessions:prev.calmSessions+1, activitiesCompleted:[...new Set([...prev.activitiesCompleted,'calm'])] }
    saveState(updated)
    updateStreakAndDate(); addXP(XP_REWARDS.calm); completeMission('calm')
    addPraise('Respirăm. Resetăm bordul. Continuăm.', 'Calm Mode')
    const fresh = getState(); const nb = checkNewBadges(fresh)
    if (nb.length) { saveState({...fresh,unlockedBadges:[...new Set([...fresh.unlockedBadges,...nb])]}); setNewBadge(nb.map(id=>getBadgeById(id)?.name??id)) }
    setSession('done'); setShow(true)
  }

  const phase   = getPhase(offset)
  const pct     = Math.min(100, (elapsed / TOTAL) * 100)
  const remain  = TOTAL - elapsed
  const minuteStr = `${String(Math.floor(remain/60)).padStart(2,'0')}:${String(remain%60).padStart(2,'0')}`

  return (
    <div style={{ padding:'6px 14px 16px', display:'flex', flexDirection:'column', gap:14 }}>
      {/* Header */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ padding:'2px 2px 0' }}>
        <div style={{ fontFamily:'Space Grotesk, system-ui', fontWeight:700, fontSize:22, color:S.ink }}>Calm Mode</div>
        <div style={{ fontSize:12, color:S.inkFade, marginTop:1 }}>Respiră 4 — ține 2 — eliberează 6</div>
      </motion.div>

      <PisiPilotBubble
        mood="calm"
        message={session === 'active'
          ? 'Ești în siguranță. Aplicăm ritmul 4-2-6. Eu respir cu tine.'
          : 'Fără scor. Fără judecată. Urmărește cercul și respiră cu el.'}
        avatarSize={48}
      />

      <AnimatePresence mode="wait">
        {session === 'intro' && (
          <motion.div key="intro" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Preview orb */}
            <GlassCard accent={N.cyan} padding={20} style={{ borderRadius:26 }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
                <BreathingOrb />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {PHASES.map((p, i) => (
                  <div key={p.label} style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', flexShrink:0,
                      background: i===0?N.cyan:i===1?N.purple:N.blue,
                      boxShadow:`0 0 6px ${i===0?N.cyan:i===1?N.purple:N.blue}` }} />
                    <span style={{ fontSize:13, color:S.inkSoft }}>{p.label}</span>
                    <span style={{ fontSize:12, color:S.inkFade, marginLeft:'auto' }}>{p.dur}s</span>
                  </div>
                ))}
              </div>
            </GlassCard>
            <PrimaryButton onClick={start} fullWidth variant="cyan" size="lg">
              🫁 Începe sesiunea
            </PrimaryButton>
            <div style={{ textAlign:'center', fontSize:12, color:S.inkFade }}>
              Sesiuni completate: <strong style={{ color:N.cyan }}>{getState().calmSessions}</strong>
            </div>
          </motion.div>
        )}

        {session === 'active' && (
          <motion.div key="active" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* The orb */}
            <GlassCard accent={N.cyan} padding={20} style={{ borderRadius:26 }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
                <BreathingOrb />
              </div>
              {/* Phase label */}
              <div style={{ textAlign:'center' }}>
                <motion.div
                  key={phase.label}
                  initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                  style={{ fontFamily:'Space Grotesk, system-ui', fontWeight:700, fontSize:26,
                    color:phase.color, textShadow:`0 0 18px ${phase.color}aa`, letterSpacing:'-0.01em' }}
                >
                  {phase.label}
                </motion.div>
                <div style={{ marginTop:6, fontSize:12.5, color:S.inkFade }}>
                  {remain}s rămase · ciclul {Math.ceil(elapsed/CYCLE)}/5
                </div>
              </div>
            </GlassCard>

            {/* HUD row */}
            <div style={{ display:'flex', gap:8 }}>
              <div className="hud-chip">
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.18em', color:S.inkFade, marginBottom:3,
                  fontFamily:'Space Grotesk', textTransform:'uppercase' }}>DURATĂ</div>
                <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:16, color:N.cyan,
                  textShadow:`0 0 14px ${N.cyan}99`, lineHeight:1 }}>{minuteStr}</div>
              </div>
              <div className="hud-chip">
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.18em', color:S.inkFade, marginBottom:3,
                  fontFamily:'Space Grotesk', textTransform:'uppercase' }}>RITM</div>
                <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:16, color:N.purple,
                  textShadow:`0 0 14px ${N.purple}99`, lineHeight:1 }}>4·2·6</div>
              </div>
              <div className="hud-chip">
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.18em', color:S.inkFade, marginBottom:3,
                  fontFamily:'Space Grotesk', textTransform:'uppercase' }}>CICLU</div>
                <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:16, color:N.lime,
                  textShadow:`0 0 14px ${N.lime}99`, lineHeight:1 }}>{Math.ceil(elapsed/CYCLE)}/5</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height:6, borderRadius:999, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
              <motion.div style={{ height:'100%', background:`linear-gradient(90deg,${N.blue},${N.cyan})`,
                boxShadow:`0 0 10px ${N.cyan}88`, width:`${pct}%` }} />
            </div>

            <PrimaryButton onClick={() => { if(intervalRef.current) clearInterval(intervalRef.current); setSession('intro') }} fullWidth variant="ghost">
              Termină sesiunea
            </PrimaryButton>
          </motion.div>
        )}

        {session === 'done' && !show && (
          <motion.div key="done" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
            style={{ textAlign:'center', display:'flex', flexDirection:'column', gap:16 }}>
            <GlassCard accent={N.cyan} padding={24} style={{ borderRadius:26 }}>
              <div style={{ fontSize:48, marginBottom:10, filter:`drop-shadow(0 0 14px ${N.cyan}aa)` }}>✨</div>
              <div style={{ fontFamily:'Space Grotesk, system-ui', fontWeight:700, fontSize:22, color:N.cyan,
                textShadow:`0 0 16px ${N.cyan}` }}>Gata!</div>
              <div style={{ fontSize:13.5, color:S.inkSoft, marginTop:8, lineHeight:1.5 }}>
                Respirăm. Resetăm bordul. Continuăm.
              </div>
            </GlassCard>
            <PrimaryButton onClick={() => setSession('intro')} fullWidth variant="cyan">
              🫁 Sesiune nouă
            </PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>

      <CompletionMoment show={show} title="Calm Mode complet!" message="Respirăm. Resetăm bordul. Continuăm."
        emoji="✨" variant="calm" onContinue={() => { setShow(false); setSession('done') }} newBadges={newBadge} />
    </div>
  )
}
