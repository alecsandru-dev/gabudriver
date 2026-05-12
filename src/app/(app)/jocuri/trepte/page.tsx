'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PisiPilotBubble } from '@/components/PisiPilotBubble'
import { GlassCard } from '@/components/GlassCard'
import { PrimaryButton } from '@/components/PrimaryButton'
import { CompletionMoment } from '@/components/CompletionMoment'
import { getState, setState as saveState, addXP, addPraise, updateStreakAndDate } from '@/lib/storage'
import { checkNewBadges, getBadgeById } from '@/lib/badges'
import { completeMission } from '@/lib/quest'
import { getRandomPraise } from '@/lib/messages'
import { XP_REWARDS } from '@/lib/progress'

// ─── Design tokens ────────────────────────────────────────────
const ORANGE = '#FF6B1A'
const PURPLE = '#B44FFF'
const CYAN   = '#00C8FF'
const LIME   = '#A8FF1E'
const GOLD   = '#FFD700'
const PINK   = '#FF2A8A'
const INK    = '#F2F0FF'
const FADE   = '#4C4C68'
const MUTE   = '#9090A8'

// ─── Game constants ───────────────────────────────────────────
const MAX_RPM    = 6500
const IDLE_RPM   = 900
const BLOWN_RPM  = 6350
const STALL_RPM  = 720
const DANGER_MS  = 1200
const SPEED_KRPM = [0, 5, 10, 17, 25, 35]   // km/h per 1000 RPM by gear
const GEAR_LABELS = ['N', '1', '2', '3', '4', '5']

function rpmToSpeed(rpm: number, gear: number) {
  return Math.round((rpm / 1000) * SPEED_KRPM[gear])
}

// ─── Scenarios ────────────────────────────────────────────────
interface ShiftTask {
  direction: 'up' | 'down'
  prompt: string
  idealRPM: [number, number]
  goodRPM:  [number, number]
}
interface Scenario {
  id: string; title: string; emoji: string; description: string
  startGear: number; startRPM: number; rpmPerSec: number; tasks: ShiftTask[]
}
const SCENARIOS: Scenario[] = [
  { id:'city',     title:'Start în oraș',       emoji:'🏙️', description:'Semafor verde! Urcă prin trepte 1→2→3.',
    startGear:1, startRPM:1500, rpmPerSec:300,
    tasks:[
      { direction:'up',   prompt:'Urcă la treapta 2! ⬆',  idealRPM:[2500,3200], goodRPM:[2000,4000] },
      { direction:'up',   prompt:'Urcă la treapta 3! ⬆',  idealRPM:[2500,3200], goodRPM:[2000,4000] },
    ] },
  { id:'highway',  title:'Intrare autostradă',  emoji:'🛣️', description:'Banda de accelerare! Urcă 3→4→5.',
    startGear:3, startRPM:2200, rpmPerSec:360,
    tasks:[
      { direction:'up',   prompt:'Treapta 4! ⬆',          idealRPM:[2800,3600], goodRPM:[2200,4500] },
      { direction:'up',   prompt:'Treapta 5! ⬆',          idealRPM:[2800,3600], goodRPM:[2200,4500] },
    ] },
  { id:'slowdown', title:'Trafic blocat',        emoji:'🚦', description:'Traficul frânează! Coboară 4→3→2.',
    startGear:4, startRPM:3200, rpmPerSec:-280,
    tasks:[
      { direction:'down', prompt:'Coboară la treapta 3! ⬇', idealRPM:[1400,2000], goodRPM:[1100,2500] },
      { direction:'down', prompt:'Coboară la treapta 2! ⬇', idealRPM:[1400,2000], goodRPM:[1100,2500] },
    ] },
  { id:'mixed',    title:'Drum montan',          emoji:'⛰️', description:'Urci, virezi, cobori. 2→3, 3→2, 2→3.',
    startGear:2, startRPM:1800, rpmPerSec:260,
    tasks:[
      { direction:'up',   prompt:'Treapta 3! ⬆',          idealRPM:[2500,3200], goodRPM:[2000,4000] },
      { direction:'down', prompt:'Viraj — treapta 2! ⬇',  idealRPM:[1500,2200], goodRPM:[1200,2800] },
      { direction:'up',   prompt:'Ieși din viraj! ⬆',     idealRPM:[2500,3200], goodRPM:[2000,4000] },
    ] },
]

type Quality = 'perfect' | 'good' | 'ok' | 'wrong'
function evaluate(rpm:number, task:ShiftTask, dir:'up'|'down'): {quality:Quality;points:number;msg:string} {
  if (dir !== task.direction) return { quality:'wrong', points:5, msg:'Direcție greșită! 🐾' }
  const [iMin,iMax] = task.idealRPM; const [gMin,gMax] = task.goodRPM
  if (rpm>=iMin&&rpm<=iMax) return { quality:'perfect', points:100, msg:`Perfect! ${Math.round(rpm)} RPM — zona ideală! 🏆` }
  if (rpm>=gMin&&rpm<=gMax) return { quality:'good',    points:65,  msg:`Bine! ${Math.round(rpm)} RPM — schimbare curată. 👏` }
  return                             { quality:'ok',     points:25,  msg:`Merge! ${Math.round(rpm)} RPM. Încearcă zona verde.` }
}

// ─── RPM Gauge — exact from pisi-screens-b.jsx ───────────────
function RpmGauge({ rpm, gear }: { rpm: number; gear: number }) {
  const value = Math.min(1, rpm / MAX_RPM)
  const START = -210; const SWEEP = 240
  const r = 84; const cx = 110; const cy = 110

  function polar(deg: number, rad = r) {
    const a = (deg - 90) * (Math.PI / 180)
    return { x: cx + rad * Math.cos(a), y: cy + rad * Math.sin(a) }
  }
  function arcPath(a0: number, a1: number, rad = r) {
    const p0 = polar(a0, rad); const p1 = polar(a1, rad)
    const large = a1 - a0 > 180 ? 1 : 0
    return `M ${p0.x} ${p0.y} A ${rad} ${rad} 0 ${large} 1 ${p1.x} ${p1.y}`
  }

  const needleAngle = START + SWEEP * value
  const needleTip = polar(needleAngle, r - 4)
  const greenEnd = START + SWEEP * 0.6
  const amberEnd = START + SWEEP * 0.85
  const redEnd   = START + SWEEP

  const rpmColor = rpm > 5500 ? PINK : rpm > 3900 ? GOLD : LIME

  return (
    <div style={{ position:'relative', width:220, height:220, margin:'0 auto' }}>
      <svg width="220" height="220" viewBox="0 0 220 220">
        {/* outer ring */}
        <circle cx={cx} cy={cy} r={r+10} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        {/* background track */}
        <path d={arcPath(START, redEnd)} stroke="rgba(255,255,255,0.06)" strokeWidth="12" fill="none" strokeLinecap="round"/>
        {/* zone arcs with glow */}
        <path d={arcPath(START, greenEnd)} stroke={LIME} strokeWidth="11" fill="none" strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 6px ${LIME}aa)` }}/>
        <path d={arcPath(greenEnd, amberEnd)} stroke={GOLD} strokeWidth="11" fill="none" strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 6px ${GOLD}aa)` }}/>
        <path d={arcPath(amberEnd, redEnd)} stroke={PINK} strokeWidth="11" fill="none" strokeLinecap="round"
          style={{ filter:`drop-shadow(0 0 8px ${PINK}cc)` }}/>
        {/* tick marks */}
        {Array.from({length:9}).map((_,i) => {
          const ang = START + (SWEEP/8)*i
          const a = polar(ang, r-18); const b = polar(ang, r-28)
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
        })}
        {/* needle */}
        <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y}
          stroke="#fff" strokeWidth="3" strokeLinecap="round"
          style={{ filter:'drop-shadow(0 0 6px #fff)' }}/>
        <circle cx={cx} cy={cy} r="10" fill="#0C0C18" stroke="#fff" strokeWidth="2"
          style={{ filter:'drop-shadow(0 0 6px #fff)' }}/>
      </svg>
      {/* RPM readout */}
      <div style={{
        position:'absolute', left:0, right:0, top:124,
        textAlign:'center', pointerEvents:'none',
      }}>
        <motion.div
          style={{
            fontFamily:'Space Grotesk, system-ui', fontWeight:800, fontSize:30,
            color: rpmColor, textShadow:`0 0 14px ${rpmColor}`,
            letterSpacing:'-0.02em', lineHeight:1,
          }}
          animate={rpm > BLOWN_RPM - 300 ? { opacity:[1,0.5,1] } : {}}
          transition={{ duration:0.3, repeat:Infinity }}
        >
          {rpm.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,',')}
        </motion.div>
        <div style={{ fontSize:10, letterSpacing:'0.2em', color:FADE, fontWeight:700, marginTop:4,
          fontFamily:'Space Grotesk, system-ui' }}>
          RPM · TREAPTA {GEAR_LABELS[gear]}
        </div>
      </div>
    </div>
  )
}

// ─── Gear tiles row ───────────────────────────────────────────
function GearTiles({ gear }: { gear: number }) {
  return (
    <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:14 }}>
      {[1,2,3,4,5].map(g => {
        const active = g === gear
        return (
          <div key={g} style={{
            width:38, height:44, borderRadius:12,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'Space Grotesk, system-ui', fontWeight:800, fontSize:16,
            background: active ? `linear-gradient(180deg,${ORANGE}55,${ORANGE}10)` : 'rgba(14,14,28,0.7)',
            color: active ? '#fff' : MUTE,
            border:`1px solid ${active ? ORANGE+'aa' : 'rgba(255,255,255,0.08)'}`,
            boxShadow: active ? `0 0 16px ${ORANGE}aa, inset 0 1px 0 rgba(255,255,255,0.3)` : 'none',
            textShadow: active ? `0 0 8px ${ORANGE}` : 'none',
            transition:'all 0.2s',
          }}>{g}</div>
        )
      })}
    </div>
  )
}

// ─── Road preview — exact from pisi-screens-b.jsx ─────────────
function RoadPreview({ speed }: { speed: number }) {
  const animDur = speed > 5 ? Math.max(0.15, 1.6 / (speed / 20)) : 99
  return (
    <div style={{
      height:110, position:'relative', overflow:'hidden', borderRadius:20,
      background:'linear-gradient(180deg, #0C0C18 0%, #08080F 100%)',
    }}>
      {/* Horizon glow */}
      <div style={{
        position:'absolute', left:0, right:0, top:'32%',
        height:2, background:`linear-gradient(90deg, transparent, ${CYAN}88, transparent)`,
        filter:'blur(0.5px)', boxShadow:`0 0 16px ${CYAN}`,
      }}/>
      {/* SVG perspective road */}
      <svg width="100%" height="110" viewBox="0 0 320 110" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trepte-road" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={CYAN} stopOpacity="0.05"/>
            <stop offset="1" stopColor={CYAN} stopOpacity="0.2"/>
          </linearGradient>
        </defs>
        <path d="M150 35 L60 110 L80 110 L158 35 Z" fill="url(#trepte-road)" stroke={`${CYAN}66`} strokeWidth="1"/>
        <path d="M170 35 L260 110 L240 110 L162 35 Z" fill="url(#trepte-road)" stroke={`${CYAN}66`} strokeWidth="1"/>
        {/* Animated center dashes */}
        {[0,1,2,3].map(i => {
          const t = i/4; const y1 = 35 + t*75; const y2 = y1+10
          return (
            <line key={i} x1={160} y1={y1} x2={160} y2={y2}
              stroke={LIME} strokeWidth="2"
              style={{ filter:`drop-shadow(0 0 4px ${LIME})` }}/>
          )
        })}
      </svg>
      {/* HUD overlay */}
      <div style={{
        position:'absolute', top:10, left:12, right:12,
        display:'flex', justifyContent:'space-between',
        fontFamily:'Space Grotesk, system-ui', fontWeight:700, fontSize:10,
        color: MUTE, letterSpacing:'0.1em',
      }}>
        <span style={{ color:'#FF2A4A' }}>● REC</span>
        <span>{speed} km/h</span>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────
type Phase = 'intro' | 'playing' | 'clutch_in' | 'shifted' | 'result' | 'complete' | 'blown' | 'stalled'

interface ShiftResult { direction:'up'|'down'; rpm:number; quality:Quality; points:number }

export default function TreptePage() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const scenario = SCENARIOS[scenarioIdx]

  const [phase, setPhase]         = useState<Phase>('intro')
  const [rpm, setRpm]             = useState(scenario.startRPM)
  const [gear, setGear]           = useState(scenario.startGear)
  const [taskIdx, setTaskIdx]     = useState(0)
  const [clutchRpm, setClutchRpm] = useState<number|null>(null)
  const [score, setScore]         = useState(0)
  const [combo, setCombo]         = useState(0)
  const [results, setResults]     = useState<ShiftResult[]>([])
  const [lastMsg, setLastMsg]     = useState<string|null>(null)
  const [lastQuality, setLastQuality] = useState<Quality|null>(null)
  const [showComp, setShowComp]   = useState(false)
  const [newBadge, setNewBadge]   = useState<string[]>([])
  const [bubbleMsg, setBubbleMsg] = useState('Urmărește turometrul! Apasă AMBREIAJ, schimbă treapta, eliberează.')

  const rpmRef      = useRef(rpm)
  const gearRef     = useRef(gear)
  const phaseRef    = useRef(phase)
  const taskIdxRef  = useRef(taskIdx)
  const scenarioRef = useRef(scenario)
  rpmRef.current    = rpm; gearRef.current = gear
  phaseRef.current  = phase; taskIdxRef.current = taskIdx; scenarioRef.current = scenario

  const intervalRef  = useRef<ReturnType<typeof setInterval>|null>(null)
  const dangerMs     = useRef(0)
  const lastTickTime = useRef(Date.now())

  const currentTask = scenario.tasks[taskIdx]
  const speed       = rpmToSpeed(rpm, gear)
  const showPrompt  = phase === 'playing' && (
    (currentTask?.direction === 'up'   && rpm >= 2800) ||
    (currentTask?.direction === 'down' && rpm <= 2000)
  )
  const qualityColors: Record<Quality,string> = { perfect:LIME, good:CYAN, ok:GOLD, wrong:PINK }

  // ── Game loop
  useEffect(() => {
    if (!['playing','clutch_in','shifted'].includes(phase)) return
    dangerMs.current = 0; lastTickTime.current = Date.now()
    const TICK = 80
    intervalRef.current = setInterval(() => {
      const now = Date.now(); const dt = now - lastTickTime.current; lastTickTime.current = now
      setRpm(prev => {
        const p = phaseRef.current
        if (p === 'clutch_in' || p === 'shifted') { dangerMs.current = 0; return prev > IDLE_RPM + 20 ? prev - 60 : IDLE_RPM }
        const next = prev + (scenarioRef.current.rpmPerSec * TICK) / 1000
        if (next >= BLOWN_RPM) { dangerMs.current += dt; if (dangerMs.current >= DANGER_MS) setPhase('blown'); return Math.min(next, MAX_RPM) }
        if (next <= STALL_RPM) { dangerMs.current += dt; if (dangerMs.current >= DANGER_MS) setPhase('stalled'); return Math.max(next, 600) }
        dangerMs.current = 0; return next
      })
    }, TICK)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [phase])

  function startGame() {
    dangerMs.current = 0
    setRpm(scenario.startRPM); setGear(scenario.startGear); setTaskIdx(0)
    setClutchRpm(null); setScore(0); setCombo(0); setResults([]); setLastMsg(null); setLastQuality(null)
    setPhase('playing')
    setBubbleMsg(scenario.tasks[0].direction==='up'?'Zona verde = ideală. Galbenă = curând. Roșie = ACUM!':'RPM-ul scade. Schimbă jos înainte să caleze!')
  }

  function handleClutch() {
    if (phase === 'playing')  { setClutchRpm(rpmRef.current); setPhase('clutch_in') }
    else if (phase === 'shifted') releaseClutch()
  }

  function handleShift(dir: 'up'|'down') {
    if (phase !== 'clutch_in') return
    setGear(dir==='up' ? Math.min(5, gearRef.current+1) : Math.max(1, gearRef.current-1))
    setPhase('shifted')
  }

  const releaseClutch = useCallback(() => {
    const task    = scenarioRef.current.tasks[taskIdxRef.current]
    const shifted = gearRef.current
    const orig    = scenarioRef.current.startGear + results.length * (task.direction==='up'?1:-1)
    const dir: 'up'|'down' = shifted > orig ? 'up' : 'down'
    const evalRpm = clutchRpm ?? rpmRef.current
    const { quality, points, msg } = evaluate(evalRpm, task, dir)
    const bonus = (quality==='perfect'||quality==='good') ? combo*15 : 0
    const total = points + bonus
    setLastMsg(msg + (bonus>0?` (+${bonus} combo!)`:'')); setLastQuality(quality)
    setScore(s=>s+total); setCombo(c=>(quality==='perfect'||quality==='good')?c+1:0)
    setResults(r=>[...r,{direction:dir,rpm:Math.round(evalRpm),quality,points:total}])
    setPhase('result')
    const nextIdx = taskIdxRef.current + 1
    setTimeout(() => {
      if (nextIdx >= scenarioRef.current.tasks.length) finishScenario()
      else { setTaskIdx(nextIdx); setClutchRpm(null); setPhase('playing'); setBubbleMsg(scenarioRef.current.tasks[nextIdx].prompt) }
    }, 1800)
  }, [clutchRpm, combo, results])

  function finishScenario() {
    setPhase('complete'); updateStreakAndDate(); addXP(XP_REWARDS.gearbox); completeMission('gearbox')
    addPraise(getRandomPraise(), 'Schimb de Trepte')
    const prev = getState()
    saveState({...prev, gearboxSuccesses:prev.gearboxSuccesses+1, gearboxGamesPlayed:prev.gearboxGamesPlayed+1, activitiesCompleted:[...new Set([...prev.activitiesCompleted,'gearbox'])]})
    const nb = checkNewBadges(getState())
    if (nb.length) { const f=getState(); saveState({...f,unlockedBadges:[...new Set([...f.unlockedBadges,...nb])]}); setNewBadge(nb.map(id=>getBadgeById(id)?.name??id)); setShowComp(true) }
  }

  // ── BLOWN ENGINE ──────────────────────────────────────────────
  if (phase === 'blown') return (
    <div style={{padding:'6px 14px 16px',display:'flex',flexDirection:'column',gap:16,alignItems:'center',justifyContent:'center',minHeight:'70vh'}}>
      <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:260,damping:16}} style={{textAlign:'center'}}>
        <motion.div animate={{rotate:[-5,5,-5,0],scale:[1,1.1,1]}} transition={{duration:0.5,delay:0.2}} style={{fontSize:72,marginBottom:12}}>💥🔥</motion.div>
        <div style={{fontFamily:'Space Grotesk,system-ui',fontWeight:700,fontSize:24,color:PINK,textShadow:`0 0 20px ${PINK}`,marginBottom:8}}>Motor avariat!</div>
        <div style={{fontSize:13.5,color:MUTE,lineHeight:1.5,maxWidth:280}}>RPM-ul a depășit zona roșie prea mult. Motorul a cedat. Se întâmplă și piloților reali.</div>
      </motion.div>
      <GlassCard accent={PINK} padding={14} style={{width:'100%',borderRadius:18}}>
        <div style={{fontSize:12,color:PINK,textAlign:'center',lineHeight:1.6}}>🔴 Zona roșie = pericol! Schimbă treapta înainte. Motorul îți mulțumește.</div>
      </GlassCard>
      <div style={{display:'flex',gap:10,width:'100%'}}>
        <PrimaryButton variant="ghost" onClick={()=>setPhase('intro')} style={{flex:1,minHeight:48}}>Scenarii</PrimaryButton>
        <PrimaryButton variant="pink" onClick={startGame} style={{flex:2,minHeight:48}}>Încearcă din nou 🔄</PrimaryButton>
      </div>
    </div>
  )

  // ── STALLED ───────────────────────────────────────────────────
  if (phase === 'stalled') return (
    <div style={{padding:'6px 14px 16px',display:'flex',flexDirection:'column',gap:16,alignItems:'center',justifyContent:'center',minHeight:'70vh'}}>
      <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:260,damping:16}} style={{textAlign:'center'}}>
        <motion.div animate={{opacity:[1,0.3,1]}} transition={{duration:1,repeat:2}} style={{fontSize:72,marginBottom:12}}>😴💨</motion.div>
        <div style={{fontFamily:'Space Grotesk,system-ui',fontWeight:700,fontSize:24,color:GOLD,textShadow:`0 0 20px ${GOLD}`,marginBottom:8}}>Motor calat!</div>
        <div style={{fontSize:13.5,color:MUTE,lineHeight:1.5,maxWidth:280}}>RPM-ul a scăzut prea mult. Schimbă treapta mai devreme data viitoare.</div>
      </motion.div>
      <GlassCard accent={GOLD} padding={14} style={{width:'100%',borderRadius:18}}>
        <div style={{fontSize:12,color:GOLD,textAlign:'center',lineHeight:1.6}}>💡 Nu panica! Apasă ambreiajul mai devreme când RPM-ul coboară.</div>
      </GlassCard>
      <div style={{display:'flex',gap:10,width:'100%'}}>
        <PrimaryButton variant="ghost" onClick={()=>setPhase('intro')} style={{flex:1,minHeight:48}}>Scenarii</PrimaryButton>
        <PrimaryButton variant="orange" onClick={startGame} style={{flex:2,minHeight:48}}>Încearcă din nou 🔄</PrimaryButton>
      </div>
    </div>
  )

  // ── INTRO ─────────────────────────────────────────────────────
  if (phase === 'intro') return (
    <div style={{padding:'6px 14px 16px',display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:'2px 2px 0'}}>
        <div style={{fontFamily:'Space Grotesk,system-ui',fontWeight:700,fontSize:22,color:INK}}>Trepte</div>
        <div style={{fontSize:12,color:FADE,marginTop:1}}>Schimbă vitezele la momentul potrivit</div>
      </div>
      <PisiPilotBubble mood="thinking" message="Apasă AMBREIAJ când RPM-ul e corect, schimbă treapta, eliberează. Urmărește acul!" avatarSize={48}/>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {SCENARIOS.map((s,i)=>(
          <motion.button key={s.id} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:i*0.08}}
            onClick={()=>{setScenarioIdx(i);setBubbleMsg(s.description)}}
            style={{
              display:'flex',alignItems:'center',gap:14,padding:14,borderRadius:20,cursor:'pointer',
              textAlign:'left',
              background: scenarioIdx===i?`linear-gradient(135deg,${ORANGE}15,rgba(14,14,28,0.85))`:'rgba(14,14,28,0.7)',
              border:`1px solid ${scenarioIdx===i?ORANGE+'55':'rgba(255,255,255,0.08)'}`,
              boxShadow: scenarioIdx===i?`0 0 20px ${ORANGE}18, inset 0 1px 0 ${ORANGE}30`:'inset 0 1px 0 rgba(255,255,255,0.04)',
              transition:'all 0.2s',
            }}>
            <div style={{fontSize:28,flexShrink:0}}>{s.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:'Space Grotesk,system-ui',fontWeight:700,fontSize:15,color:INK}}>{s.title}</div>
              <div style={{fontSize:11.5,color:FADE,marginTop:2}}>{s.description}</div>
            </div>
            <div style={{fontSize:11,fontWeight:700,color:scenarioIdx===i?ORANGE:FADE,padding:'4px 8px',borderRadius:999,
              background:scenarioIdx===i?`${ORANGE}18`:'transparent',border:`1px solid ${scenarioIdx===i?ORANGE+'44':'transparent'}`,
              fontFamily:'Space Grotesk',flexShrink:0}}>
              {s.tasks.length} schimb{s.tasks.length>1?'uri':''}
            </div>
          </motion.button>
        ))}
      </div>
      <PrimaryButton fullWidth variant="orange" size="lg" onClick={startGame}>
        🚗 Pornesc motorul!
      </PrimaryButton>
    </div>
  )

  // ── COMPLETE ──────────────────────────────────────────────────
  if (phase === 'complete') {
    const perfect = results.filter(r=>r.quality==='perfect').length
    return (
      <div style={{padding:'6px 14px 16px',display:'flex',flexDirection:'column',gap:14}}>
        <GlassCard accent={LIME} padding={20} style={{borderRadius:26,textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:8,filter:`drop-shadow(0 0 16px ${LIME}aa)`}}>🏁</div>
          <div style={{fontFamily:'Space Grotesk,system-ui',fontWeight:800,fontSize:24,
            background:`linear-gradient(135deg,${LIME},${CYAN})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
            {perfect===results.length?'Wow, Gabu!':'Bine, Gabu!'}
          </div>
          <div style={{fontSize:13.5,color:MUTE,marginTop:6,lineHeight:1.45}}>
            {perfect===results.length?'Toate schimbările perfecte. Sunt mândru. Și cam invidios.':'Practică mai mult — devine reflex!'}
          </div>
          <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:14}}>
            <div style={{padding:'6px 12px',borderRadius:14,background:`${LIME}10`,border:`1px solid ${LIME}40`,minWidth:60}}>
              <div style={{fontSize:8.5,fontWeight:800,letterSpacing:'0.16em',color:FADE,marginBottom:1,fontFamily:'Space Grotesk'}}>SCOR</div>
              <div style={{fontFamily:'Space Grotesk',fontWeight:800,fontSize:14,color:LIME,textShadow:`0 0 10px ${LIME}aa`}}>{score}p</div>
            </div>
            <div style={{padding:'6px 12px',borderRadius:14,background:`${CYAN}10`,border:`1px solid ${CYAN}40`,minWidth:60}}>
              <div style={{fontSize:8.5,fontWeight:800,letterSpacing:'0.16em',color:FADE,marginBottom:1,fontFamily:'Space Grotesk'}}>PERFECT</div>
              <div style={{fontFamily:'Space Grotesk',fontWeight:800,fontSize:14,color:CYAN,textShadow:`0 0 10px ${CYAN}aa`}}>{perfect}/{results.length}</div>
            </div>
            <div style={{padding:'6px 12px',borderRadius:14,background:`${ORANGE}10`,border:`1px solid ${ORANGE}40`,minWidth:60}}>
              <div style={{fontSize:8.5,fontWeight:800,letterSpacing:'0.16em',color:FADE,marginBottom:1,fontFamily:'Space Grotesk'}}>COMBO</div>
              <div style={{fontFamily:'Space Grotesk',fontWeight:800,fontSize:14,color:ORANGE,textShadow:`0 0 10px ${ORANGE}aa`}}>{combo}x</div>
            </div>
          </div>
        </GlassCard>
        <div style={{display:'flex',gap:10}}>
          <PrimaryButton variant="ghost" onClick={()=>{setPhase('intro');setScenarioIdx(0)}} style={{flex:1,minHeight:48}}>Alt scenariu</PrimaryButton>
          <PrimaryButton variant="lime" onClick={startGame} style={{flex:2,minHeight:48}}>Din nou 🔄</PrimaryButton>
        </div>
        <CompletionMoment show={showComp} title="Schimb de Trepte!" message={getRandomPraise()} emoji="🏎️" variant="success"
          onContinue={()=>setShowComp(false)} newBadges={newBadge}/>
      </div>
    )
  }

  // ── PLAYING SCREEN — the cockpit ──────────────────────────────
  return (
    <div style={{padding:'6px 14px 16px',display:'flex',flexDirection:'column',gap:14}}>
      {/* Page header — exact from design */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'2px 2px 0'}}>
        <div>
          <div style={{fontFamily:'Space Grotesk,system-ui',fontWeight:700,fontSize:22,color:INK}}>{scenario.emoji} {scenario.title}</div>
          <div style={{fontSize:12,color:FADE,marginTop:1}}>Schimb {taskIdx+1} din {scenario.tasks.length}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {combo>=2&&(
            <motion.div initial={{scale:0}} animate={{scale:1}} style={{padding:'5px 10px',borderRadius:999,fontFamily:'Space Grotesk',
              fontWeight:700,fontSize:11,color:ORANGE,background:`${ORANGE}15`,border:`1px solid ${ORANGE}55`,
              textShadow:`0 0 8px ${ORANGE}`}}>×{combo} 🔥</motion.div>
          )}
          <div style={{padding:'6px 12px',borderRadius:999,fontFamily:'Space Grotesk',fontWeight:700,fontSize:12,
            color:ORANGE,background:`${ORANGE}15`,border:`1px solid ${ORANGE}55`,textShadow:`0 0 8px ${ORANGE}`}}>
            {rpm.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,',')} RPM
          </div>
        </div>
      </div>

      {/* RPM gauge cockpit card */}
      <GlassCard accent={ORANGE} padding={18} style={{borderRadius:26}}>
        <RpmGauge rpm={rpm} gear={gear}/>
        <GearTiles gear={gear}/>
      </GlassCard>

      {/* Road preview card */}
      <GlassCard padding={0} style={{borderRadius:20,overflow:'hidden'}}>
        <RoadPreview speed={speed}/>
      </GlassCard>

      {/* Status / prompt / feedback */}
      <AnimatePresence mode="wait">
        {phase==='result'&&lastMsg&&lastQuality?(
          <motion.div key="result" initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            style={{padding:'12px 16px',borderRadius:16,textAlign:'center',
              background:`${qualityColors[lastQuality]}10`,border:`1px solid ${qualityColors[lastQuality]}40`}}>
            <div style={{fontFamily:'Space Grotesk,system-ui',fontWeight:700,fontSize:14,
              color:qualityColors[lastQuality],textShadow:`0 0 8px ${qualityColors[lastQuality]}`}}>{lastMsg}</div>
          </motion.div>
        ):showPrompt?(
          <motion.div key="prompt" animate={{opacity:[0.7,1,0.7]}} transition={{duration:0.8,repeat:Infinity}}
            style={{padding:'12px 16px',borderRadius:16,textAlign:'center',
              background: rpm>5000?`${PINK}10`:`${GOLD}10`,
              border:`1px solid ${rpm>5000?PINK+'40':GOLD+'40'}`}}>
            <div style={{fontFamily:'Space Grotesk,system-ui',fontWeight:700,fontSize:14,
              color:rpm>5000?PINK:GOLD,textShadow:`0 0 8px currentColor`}}>{currentTask?.prompt}</div>
          </motion.div>
        ):(
          <motion.div key="hint" initial={{opacity:0}} animate={{opacity:1}}
            style={{padding:'10px 14px',borderRadius:14,textAlign:'center',
              background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)'}}>
            <div style={{fontSize:12.5,color:MUTE}}>{bubbleMsg}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls — DOWN | AMBREIAJ | UP */}
      <div style={{display:'flex',gap:10,alignItems:'stretch'}}>
        {/* Schimbă jos */}
        <motion.button whileTap={{scale:0.94}}
          onClick={()=>handleShift('down')}
          disabled={phase!=='clutch_in'||gear<=1}
          style={{
            flex:1, minHeight:56, borderRadius:18, cursor:'pointer',
            fontFamily:'Space Grotesk,system-ui', fontWeight:700, fontSize:13,
            display:'flex',alignItems:'center',justifyContent:'center',gap:6,
            ...(phase==='clutch_in'&&gear>1
              ? { background:`linear-gradient(135deg,#7000B4,${PURPLE})`, color:'#fff', border:'none',
                  boxShadow:`0 0 20px ${PURPLE}80,0 4px 16px ${PURPLE}55,inset 0 1px 0 rgba(255,255,255,0.3)` }
              : { background:'rgba(14,14,28,0.7)', color:FADE, border:'1px solid rgba(255,255,255,0.08)', boxShadow:'none' }
            )
          }}>
          <span style={{fontSize:14}}>⬇</span> Jos
        </motion.button>

        {/* AMBREIAJ — center, larger */}
        <motion.button whileTap={{scale:0.95}}
          onClick={handleClutch}
          disabled={phase==='result'}
          style={{
            flex:1.5, minHeight:64, borderRadius:22, cursor:'pointer',
            fontFamily:'Space Grotesk,system-ui', fontWeight:700, fontSize:14,
            display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,
            ...(phase==='clutch_in'||phase==='shifted'
              ? { background:`linear-gradient(135deg,#7000B4,${PURPLE})`, color:'#fff', border:'none',
                  boxShadow:`0 0 24px ${PURPLE}88,0 6px 20px ${PURPLE}55,inset 0 1px 0 rgba(255,255,255,0.35)`,
                  transform:'scale(1.03)' }
              : phase==='playing'
              ? { background:`linear-gradient(135deg,#CC4400,${ORANGE})`, color:'#fff', border:'none',
                  boxShadow:`0 0 24px ${ORANGE}80,0 6px 20px ${ORANGE}55,inset 0 1px 0 rgba(255,255,255,0.35)` }
              : { background:'rgba(14,14,28,0.7)', color:FADE, border:'1px solid rgba(255,255,255,0.08)' }
            )
          }}>
          <span style={{fontSize:18}}>🦶</span>
          <span style={{fontSize:11}}>{phase==='shifted'?'Eliberează':'AMBREIAJ'}</span>
          {(phase==='clutch_in'||phase==='shifted')&&<span style={{fontSize:9,opacity:0.7}}>apăsat ✓</span>}
        </motion.button>

        {/* Schimbă sus */}
        <motion.button whileTap={{scale:0.94}}
          onClick={()=>handleShift('up')}
          disabled={phase!=='clutch_in'||gear>=5}
          style={{
            flex:1, minHeight:56, borderRadius:18, cursor:'pointer',
            fontFamily:'Space Grotesk,system-ui', fontWeight:700, fontSize:13,
            display:'flex',alignItems:'center',justifyContent:'center',gap:6,
            ...(phase==='clutch_in'&&gear<5
              ? { background:`linear-gradient(135deg,#CC4400,${ORANGE})`, color:'#fff', border:'none',
                  boxShadow:`0 0 20px ${ORANGE}80,0 4px 16px ${ORANGE}55,inset 0 1px 0 rgba(255,255,255,0.3)` }
              : { background:'rgba(14,14,28,0.7)', color:FADE, border:'1px solid rgba(255,255,255,0.08)', boxShadow:'none' }
            )
          }}>
          <span style={{fontSize:14}}>⬆</span> Sus
        </motion.button>
      </div>
    </div>
  )
}
