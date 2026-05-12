'use client'
import { useState } from 'react'
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
const GOLD   = '#FFD700'
const CYAN   = '#00C8FF'
const LIME   = '#A8FF1E'
const PINK   = '#FF2A8A'
const ORANGE = '#FF6B1A'
const PURPLE = '#B44FFF'
const INK    = '#F2F0FF'
const FADE   = '#4C4C68'
const MUTE   = '#9090A8'
const SOFT   = '#C8C6E0'

// ─── Car positions in 360×360 SVG space ─────────────────────
const CAR_POS: Record<string, { x: number; y: number; angle: number }> = {
  S: { x: 208, y: 290, angle:   0 },
  N: { x: 152, y:  70, angle: 180 },
  E: { x: 290, y: 152, angle: 270 },
  W: { x:  70, y: 208, angle:  90 },
}

const SIGN_POS: Record<string, { x: number; y: number }> = {
  S: { x: 250, y: 305 },
  N: { x: 110, y:  55 },
  E: { x: 305, y: 110 },
  W: { x:  55, y: 250 },
}

interface Car {
  id: string; arm: string; goes: 'straight' | 'left' | 'right'
  color: string; label: string; isPlayer?: boolean
  sign?: 'stop' | 'yield'; priorityRoad?: boolean
}

interface Scenario {
  title: string; hint: string; rule: string; why: string
  cars: Car[]; correctOrder: string[]
}

const SCENARIOS: Scenario[] = [
  {
    title: 'Niciun semn',
    hint: 'Fără semne aici. Cine vine de pe dreapta ta?',
    rule: 'Prioritate de dreapta — în lipsa altor reguli, vehiculul care vine din partea dreaptă trece primul.',
    why: 'Mașina A vine dinspre dreapta ta. Are prioritate.',
    cars: [
      { id:'me', arm:'S', goes:'straight', color:CYAN,   label:'Tu', isPlayer:true },
      { id:'A',  arm:'E', goes:'straight', color:PINK,   label:'A' },
    ],
    correctOrder: ['A','me'],
  },
  {
    title: 'Drum cu prioritate',
    hint: 'Tu ești pe drumul galben. Ceilalți au «cedează».',
    rule: 'Indicatorul «drum cu prioritate» domină asupra drumurilor laterale cu «cedează trecerea».',
    why: 'Tu și B sunteți pe drum cu prioritate, deci treceți înaintea lui A. Între voi, prioritate de dreapta: B (în dreapta ta) trece primul.',
    cars: [
      { id:'me', arm:'S', goes:'straight', color:CYAN,   label:'Tu', isPlayer:true, priorityRoad:true },
      { id:'A',  arm:'W', goes:'straight', color:ORANGE, label:'A', sign:'yield' },
      { id:'B',  arm:'E', goes:'straight', color:PURPLE, label:'B', priorityRoad:true },
    ],
    correctOrder: ['B','me','A'],
  },
  {
    title: 'STOP',
    hint: 'Indicatorul tău e STOP. Te oprești complet.',
    rule: 'STOP înseamnă oprire totală la linie și cedare față de toți participanții.',
    why: 'Tu ai STOP, deci ceilalți trec înaintea ta — chiar dacă A vine din față.',
    cars: [
      { id:'me', arm:'S', goes:'straight', color:CYAN, label:'Tu', isPlayer:true, sign:'stop' },
      { id:'A',  arm:'N', goes:'straight', color:LIME, label:'A' },
    ],
    correctOrder: ['A','me'],
  },
  {
    title: 'Viraj la stânga',
    hint: 'Tu vrei să virezi la stânga. Cu cine te încrucișezi?',
    rule: 'La virajul la stânga, cedezi trecerea vehiculelor care vin din sens opus și merg drept sau la dreapta.',
    why: 'A merge drept din sens opus. Trebuie să-l lași să treacă înainte să virezi la stânga.',
    cars: [
      { id:'me', arm:'S', goes:'left',     color:CYAN, label:'Tu', isPlayer:true },
      { id:'A',  arm:'N', goes:'straight', color:PINK, label:'A' },
    ],
    correctOrder: ['A','me'],
  },
]

// ─── Path preview (dashed arc for the player car) ────────────
function PathPreview({ car }: { car: Car }) {
  const start = CAR_POS[car.arm]
  let endX = 180, endY = 180
  if (car.goes === 'straight') {
    if (car.arm==='S') { endX=208; endY=50  }
    if (car.arm==='N') { endX=152; endY=310 }
    if (car.arm==='E') { endX=50;  endY=152 }
    if (car.arm==='W') { endX=310; endY=208 }
  } else if (car.goes === 'left') {
    if (car.arm==='S') { endX=50;  endY=152 }
    if (car.arm==='N') { endX=310; endY=208 }
    if (car.arm==='E') { endX=208; endY=310 }
    if (car.arm==='W') { endX=152; endY=50  }
  }
  return (
    <g opacity="0.55">
      <path d={`M ${start.x} ${start.y} Q 180 180 ${endX} ${endY}`}
        stroke={CYAN} strokeWidth="3" strokeDasharray="6 6" fill="none" strokeLinecap="round"
        style={{ filter:`drop-shadow(0 0 6px ${CYAN})` }}/>
      <circle cx={endX} cy={endY} r="4" fill={CYAN}
        style={{ filter:`drop-shadow(0 0 6px ${CYAN})` }}/>
    </g>
  )
}

// ─── Direction arrow above car ────────────────────────────────
function DirArrow({ goes, accent }: { goes: string; accent: string }) {
  const glow = { filter:`drop-shadow(0 0 4px ${accent})` }
  if (goes === 'straight') return (
    <g style={glow}>
      <path d="M 0 -30 L 0 -42" stroke={accent} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M -4 -38 L 0 -42 L 4 -38" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  )
  if (goes === 'left') return (
    <g style={glow}>
      <path d="M 0 -30 L 0 -36 L -10 -36" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M -6 -40 L -10 -36 L -6 -32" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  )
  return (
    <g style={glow}>
      <path d="M 0 -30 L 0 -36 L 10 -36" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M 6 -40 L 10 -36 L 6 -32" stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  )
}

// ─── Sign badge on curb ───────────────────────────────────────
function SignBadge({ car }: { car: Car }) {
  const p = SIGN_POS[car.arm]
  const type = car.sign || (car.priorityRoad ? 'priority' : null)
  if (!type) return null
  return (
    <g transform={`translate(${p.x} ${p.y})`} style={{ filter:'drop-shadow(0 4px 6px rgba(0,0,0,0.6))' }}>
      {type === 'stop' && (
        <>
          <polygon points="-13,-6 -6,-13 6,-13 13,-6 13,6 6,13 -6,13 -13,6"
            fill="#E0263A" stroke="#fff" strokeWidth="1.5"/>
          <text y="3" textAnchor="middle" fill="#fff"
            fontFamily="Space Grotesk, system-ui" fontWeight="900" fontSize="8">STOP</text>
        </>
      )}
      {type === 'yield' && (
        <polygon points="0,12 -13,-10 13,-10" fill="#fff" stroke="#E0263A" strokeWidth="2.5"/>
      )}
      {type === 'priority' && (
        <>
          <polygon points="0,-14 14,0 0,14 -14,0" fill="#FFD700" stroke="#fff" strokeWidth="1.5"/>
          <polygon points="0,-10 10,0 0,10 -10,0" fill="none" stroke="#fff" strokeWidth="0.8"/>
        </>
      )}
    </g>
  )
}

// ─── Car sprite ───────────────────────────────────────────────
function CarSprite({ car, orderIdx, result, correct, onTap }: {
  car: Car; orderIdx: number; result: string|null; correct: boolean; onTap: () => void
}) {
  const p = CAR_POS[car.arm]
  const tapped = orderIdx >= 0
  const status = result ? (correct ? LIME : PINK) : (tapped ? car.color : null)
  return (
    <g style={{ cursor:'pointer' }} onClick={onTap}>
      <rect x={p.x-28} y={p.y-36} width="56" height="72" rx="10" fill="transparent"/>
      <g transform={`translate(${p.x} ${p.y}) rotate(${p.angle})`}>
        {status && (
          <rect x="-22" y="-30" width="44" height="60" rx="11" fill="none" stroke={status} strokeWidth="2"
            style={{ filter:`drop-shadow(0 0 8px ${status})` }}/>
        )}
        <rect x="-15" y="-23" width="30" height="48" rx="7" fill="rgba(0,0,0,0.5)" transform="translate(1.5 2)"/>
        <rect x="-15" y="-23" width="30" height="48" rx="7"
          fill={car.color} opacity={car.isPlayer?1:0.95}
          stroke={car.isPlayer?'#fff':'rgba(255,255,255,0.4)'} strokeWidth={car.isPlayer?1.5:1}
          style={{ filter:`drop-shadow(0 0 8px ${car.color}77)` }}/>
        <rect x="-11" y="-16" width="22" height="11" rx="2" fill="rgba(0,0,0,0.45)"/>
        <rect x="-11" y="6"   width="22" height="9"  rx="2" fill="rgba(0,0,0,0.32)"/>
        <line x1="-11" y1="-5" x2="11" y2="-5" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8"/>
        <circle cx="-9" cy="-22" r="2.2" fill="#fff8d4" opacity="0.9"/>
        <circle cx="9"  cy="-22" r="2.2" fill="#fff8d4" opacity="0.9"/>
        <rect x="-12" y="22" width="4" height="2" rx="1" fill="#ff4040"/>
        <rect x="8"   y="22" width="4" height="2" rx="1" fill="#ff4040"/>
        <DirArrow goes={car.goes} accent={car.color}/>
        {orderIdx >= 0 && (
          <g>
            <circle r="12" cx="20" cy="-30" fill="#0a0a14" stroke={status||car.color} strokeWidth="2"
              style={{ filter:`drop-shadow(0 0 8px ${status||car.color})` }}/>
            <text x="20" y="-26" textAnchor="middle" fill={status||car.color}
              fontFamily="Space Grotesk, system-ui" fontWeight="800" fontSize="14">{orderIdx+1}</text>
          </g>
        )}
        {car.isPlayer && (
          <g>
            <rect x="-15" y="-3" width="30" height="9" rx="3" fill="#0a0a14" stroke="rgba(255,255,255,0.4)" strokeWidth="0.7"/>
            <text x="0" y="4" textAnchor="middle" fill="#fff"
              fontFamily="Space Grotesk, system-ui" fontWeight="700" fontSize="7" letterSpacing="0.05em">TU</text>
          </g>
        )}
      </g>
    </g>
  )
}

// ─── Priority road overlay ────────────────────────────────────
function PriorityRoadStrip({ cars }: { cars: Car[] }) {
  const vert = cars.some(c => c.priorityRoad && (c.arm==='N'||c.arm==='S'))
  const horiz = cars.some(c => c.priorityRoad && (c.arm==='E'||c.arm==='W'))
  return (
    <g>
      {vert  && <rect x="120" y="0"   width="120" height="360" fill="#FFD700" opacity="0.06"/>}
      {horiz && <rect x="0"   y="120" width="360" height="120" fill="#FFD700" opacity="0.06"/>}
    </g>
  )
}

// ─── The intersection SVG ─────────────────────────────────────
function Intersection({ scn, selected, onTap, result }: {
  scn: Scenario; selected: string[]; onTap: (id:string)=>void; result: string|null
}) {
  const SZ = 360
  const crosswalks = [
    { x:122, y:248, w:116, h:4,   n:6, dir:'h' },
    { x:122, y:108, w:116, h:4,   n:6, dir:'h' },
    { x:108, y:122, w:4,   h:116, n:6, dir:'v' },
    { x:248, y:122, w:4,   h:116, n:6, dir:'v' },
  ]
  return (
    <svg viewBox={`0 0 ${SZ} ${SZ}`} style={{ width:'100%', height:'auto', display:'block', borderRadius:14 }}>
      <defs>
        <linearGradient id="asphalt-g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#15151f"/>
          <stop offset="1" stopColor="#1f1f2e"/>
        </linearGradient>
        <radialGradient id="centerGlow-g">
          <stop offset="0" stopColor="rgba(0,200,255,0.18)"/>
          <stop offset="1" stopColor="transparent"/>
        </radialGradient>
      </defs>
      <rect width={SZ} height={SZ} fill="#06060d"/>
      <rect x="120" y="0"   width="120" height={SZ}  fill="url(#asphalt-g)"/>
      <rect x="0"   y="120" width={SZ}  height="120" fill="url(#asphalt-g)"/>
      {scn.cars.some(c=>c.priorityRoad) && <PriorityRoadStrip cars={scn.cars}/>}
      <circle cx="180" cy="180" r="80" fill="url(#centerGlow-g)"/>
      {/* lane center dashes */}
      <g stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeDasharray="10 10">
        <line x1="180" y1="0"   x2="180" y2="118"/>
        <line x1="180" y1="242" x2="180" y2={SZ}/>
        <line x1="0"   y1="180" x2="118" y2="180"/>
        <line x1="242" y1="180" x2={SZ}  y2="180"/>
      </g>
      {/* curb edges with cyan glow */}
      <g stroke="rgba(0,200,255,0.35)" strokeWidth="1" fill="none">
        <path d="M0 120 L120 120 L120 0"/>
        <path d="M240 0 L240 120 L360 120"/>
        <path d="M360 240 L240 240 L240 360"/>
        <path d="M120 360 L120 240 L0 240"/>
      </g>
      {/* stop lines */}
      <g stroke="rgba(255,255,255,0.55)" strokeWidth="3" strokeLinecap="butt">
        <line x1="180" y1="254" x2="240" y2="254"/>
        <line x1="120" y1="106" x2="180" y2="106"/>
        <line x1="254" y1="120" x2="254" y2="180"/>
        <line x1="106" y1="180" x2="106" y2="240"/>
      </g>
      {/* crosswalks */}
      {crosswalks.map((cw,i)=>(
        <g key={i} fill="rgba(255,255,255,0.25)">
          {Array.from({length:cw.n}).map((_,j)=>
            cw.dir==='h'
              ? <rect key={j} x={cw.x+j*20} y={cw.y} width="14" height="4" rx="1"/>
              : <rect key={j} x={cw.x} y={cw.y+j*20} width="4" height="14" rx="1"/>
          )}
        </g>
      ))}
      {/* player path preview */}
      {scn.cars.filter(c=>c.isPlayer).map(c=><PathPreview key="path" car={c}/>)}
      {/* sign badges */}
      {scn.cars.map(c=>(c.sign||c.priorityRoad) && <SignBadge key={'s'+c.id} car={c}/>)}
      {/* cars */}
      {scn.cars.map(car=>{
        const orderIdx = selected.indexOf(car.id)
        const correct = !!result && scn.correctOrder.indexOf(car.id)===selected.indexOf(car.id)
        return (
          <CarSprite key={car.id} car={car} orderIdx={orderIdx}
            result={result} correct={correct} onTap={()=>onTap(car.id)}/>
        )
      })}
    </svg>
  )
}

// ─── Sign legend ──────────────────────────────────────────────
function SignLegend({ type, label }: { type:'stop'|'yield'|'priority'; label:string }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
      <svg width="34" height="34" viewBox="-17 -17 34 34">
        {type==='stop' && (
          <>
            <polygon points="-13,-6 -6,-13 6,-13 13,-6 13,6 6,13 -6,13 -13,6"
              fill="#E0263A" stroke="#fff" strokeWidth="1.2"/>
            <text y="3" textAnchor="middle" fill="#fff"
              fontFamily="Space Grotesk, system-ui" fontWeight="900" fontSize="8">STOP</text>
          </>
        )}
        {type==='yield' && (
          <polygon points="0,12 -13,-10 13,-10" fill="#fff" stroke="#E0263A" strokeWidth="2.5"/>
        )}
        {type==='priority' && (
          <>
            <polygon points="0,-14 14,0 0,14 -14,0" fill="#FFD700" stroke="#fff" strokeWidth="1.5"/>
            <polygon points="0,-10 10,0 0,10 -10,0" fill="none" stroke="#fff" strokeWidth="0.8"/>
          </>
        )}
      </svg>
      <div style={{ fontSize:9.5, color:SOFT, textAlign:'center', lineHeight:1.2 }}>{label}</div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────
export default function IntersectiePage() {
  const [idx, setIdx]         = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const [result, setResult]   = useState<'correct'|'wrong'|null>(null)
  const [showComp, setShowComp] = useState(false)
  const [newBadge, setNewBadge] = useState<string[]>([])
  const [totalCorrect, setTotalCorrect] = useState(0)

  const scn = SCENARIOS[idx]

  function tapCar(id: string) {
    if (result) return
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id))
    } else if (selected.length < scn.cars.length) {
      setSelected([...selected, id])
    }
  }

  function verify() {
    if (selected.length !== scn.cars.length) return
    const ok = selected.every((id,i) => scn.correctOrder[i] === id)
    setResult(ok ? 'correct' : 'wrong')

    const prev = getState()
    const answer = { id:`intersectie_${idx}`, correct:ok, date:new Date().toISOString() }
    saveState({ ...prev, scenarioAnswers:[...prev.scenarioAnswers, answer] })
    addXP(ok ? 15 : 5)
    if (ok) {
      setTotalCorrect(c => c+1)
      addPraise(getRandomPraise(), 'Priorități la Intersecție')
    }
  }

  function reset() { setSelected([]); setResult(null) }

  function nextScenario() {
    const isLast = idx === SCENARIOS.length - 1
    if (isLast) {
      updateStreakAndDate()
      completeMission('scenario')
      const fresh = getState()
      const nb = checkNewBadges(fresh)
      if (nb.length) {
        saveState({...fresh, unlockedBadges:[...new Set([...fresh.unlockedBadges,...nb])]})
        setNewBadge(nb.map(id=>getBadgeById(id)?.name??id))
        setShowComp(true)
      }
    }
    setIdx((idx+1) % SCENARIOS.length)
    setSelected([])
    setResult(null)
  }

  const done = selected.length === scn.cars.length

  return (
    <div style={{ padding:'6px 14px 16px', display:'flex', flexDirection:'column', gap:14 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'2px 2px 0' }}>
        <div>
          <div style={{ fontFamily:'Space Grotesk,system-ui', fontWeight:700, fontSize:22, color:INK }}>
            Priorități
          </div>
          <div style={{ fontSize:12, color:FADE, marginTop:1 }}>
            Scenariul {idx+1}/{SCENARIOS.length} · {scn.title}
          </div>
        </div>
        <div style={{
          padding:'6px 12px', borderRadius:999, fontFamily:'Space Grotesk', fontWeight:700, fontSize:11,
          color:GOLD, background:`${GOLD}15`, border:`1px solid ${GOLD}55`, textShadow:`0 0 8px ${GOLD}`,
        }}>
          OUG 195
        </div>
      </div>

      {/* Scenario dots */}
      <div style={{ display:'flex', gap:6, justifyContent:'center' }}>
        {SCENARIOS.map((_,i)=>(
          <div key={i} style={{
            width:22, height:5, borderRadius:999,
            background: i===idx ? GOLD : (i<idx ? `${GOLD}66` : 'rgba(255,255,255,0.10)'),
            boxShadow: i===idx ? `0 0 10px ${GOLD}aa` : 'none',
            transition:'all 0.2s',
          }}/>
        ))}
      </div>

      {/* Mascot */}
      <PisiPilotBubble
        mood={result==='correct' ? 'excited' : result==='wrong' ? 'thinking' : 'happy'}
        message={
          result==='correct' ? 'Corect! Ai mâini de cursier, Gabu.' :
          result==='wrong'   ? 'Mmm... mai uită-te o dată la indicatori.' :
          scn.hint
        }
        avatarSize={48}
      />

      {/* Intersection canvas */}
      <GlassCard accent={GOLD} padding={10} style={{ borderRadius:20 }}>
        <Intersection scn={scn} selected={selected} onTap={tapCar} result={result}/>

        {/* Car legend */}
        <div style={{ marginTop:10, display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
          {scn.cars.map(c => {
            const orderIdx = selected.indexOf(c.id)
            return (
              <div key={c.id} style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'5px 10px', borderRadius:999,
                background:`${c.color}15`, border:`1px solid ${c.color}55`,
                fontSize:10, fontWeight:700, color:SOFT,
                fontFamily:'Space Grotesk, system-ui',
              }}>
                <span style={{ width:10, height:10, borderRadius:3, background:c.color, boxShadow:`0 0 6px ${c.color}`, display:'block' }}/>
                <span>{c.label}</span>
                {orderIdx >= 0 && (
                  <span style={{ marginLeft:2, fontSize:9, color:c.color, textShadow:`0 0 6px ${c.color}` }}>
                    #{orderIdx+1}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </GlassCard>

      {/* Order queue */}
      <GlassCard padding={12} style={{ borderRadius:16 }}>
        <div style={{
          fontSize:10.5, fontWeight:800, letterSpacing:'0.16em',
          color:FADE, textTransform:'uppercase', marginBottom:8,
          fontFamily:'Space Grotesk, system-ui',
        }}>
          Ordinea trecerii
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {scn.cars.map((_,i) => {
            const id = selected[i]
            const car = id ? scn.cars.find(c=>c.id===id) : null
            const isLast = i < scn.cars.length - 1
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
                <div style={{
                  flex:1, minHeight:44, borderRadius:12,
                  border:`1.5px dashed ${car ? car.color+'aa' : 'rgba(255,255,255,0.10)'}`,
                  background: car ? `${car.color}18` : 'rgba(255,255,255,0.02)',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  fontFamily:'Space Grotesk, system-ui',
                }}>
                  <div style={{ fontSize:9, color:FADE, fontWeight:700 }}>#{i+1}</div>
                  <div style={{
                    fontSize:14, fontWeight:800,
                    color: car ? car.color : FADE,
                    textShadow: car ? `0 0 8px ${car.color}` : 'none',
                  }}>{car ? car.label : '–'}</div>
                </div>
                {isLast && <span style={{ color:FADE, fontSize:16, flexShrink:0 }}>›</span>}
              </div>
            )
          })}
        </div>
      </GlassCard>

      {/* Verify / Feedback */}
      <AnimatePresence mode="wait">
        {result === null ? (
          <motion.div key="actions" initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ display:'flex', gap:8 }}>
            <PrimaryButton variant="ghost" onClick={reset} style={{ minWidth:100, minHeight:48 }}>
              Resetează
            </PrimaryButton>
            <div style={{ flex:1 }}>
              <PrimaryButton
                fullWidth
                variant={done ? 'orange' : 'ghost'}
                onClick={verify}
                disabled={!done}
                style={{ minHeight:48 }}
              >
                {done ? 'Verifică ✓' : `Atinge mașinile (${selected.length}/${scn.cars.length})`}
              </PrimaryButton>
            </div>
          </motion.div>
        ) : (
          <motion.div key="feedback" initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
            <GlassCard accent={result==='correct' ? LIME : PINK} padding={14} style={{ borderRadius:18 }}>
              <div style={{
                display:'flex', alignItems:'center', gap:8, marginBottom:6,
              }}>
                <span style={{
                  fontSize:11, fontWeight:800, letterSpacing:'0.12em',
                  color: result==='correct' ? LIME : PINK,
                  textShadow:`0 0 10px ${result==='correct' ? LIME : PINK}99`,
                  fontFamily:'Space Grotesk, system-ui',
                }}>
                  {result==='correct' ? '✓ CORECT' : '✗ MAI ÎNCEARCĂ'}
                </span>
              </div>
              <div style={{ fontSize:12.5, color:INK, lineHeight:1.45, marginBottom:6 }}>
                {scn.why}
              </div>
              <div style={{
                fontSize:11, color:MUTE, lineHeight:1.5,
                padding:'8px 10px', marginTop:6, borderRadius:10,
                background:'rgba(255,255,255,0.03)',
                borderLeft:`2px solid ${GOLD}88`,
              }}>
                <span style={{ color:GOLD, fontWeight:700 }}>Regula: </span>
                {scn.rule}
              </div>
              <div style={{ marginTop:12, display:'flex', gap:8 }}>
                <PrimaryButton variant="ghost" onClick={reset} style={{ minWidth:100, minHeight:48 }}>
                  Reîncearcă
                </PrimaryButton>
                <div style={{ flex:1 }}>
                  <PrimaryButton fullWidth variant="orange" onClick={nextScenario} style={{ minHeight:48 }}>
                    {idx < SCENARIOS.length-1 ? 'Următorul →' : 'Din nou 🔄'}
                  </PrimaryButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign legend */}
      <GlassCard padding={12} style={{ borderRadius:14 }}>
        <div style={{
          fontSize:10.5, fontWeight:800, letterSpacing:'0.16em',
          color:FADE, textTransform:'uppercase', marginBottom:8,
          fontFamily:'Space Grotesk, system-ui',
        }}>
          Indicatori
        </div>
        <div style={{ display:'flex', gap:14, alignItems:'center', justifyContent:'space-around' }}>
          <SignLegend type="priority" label="Drum cu prioritate"/>
          <SignLegend type="yield"    label="Cedează"/>
          <SignLegend type="stop"     label="STOP"/>
        </div>
      </GlassCard>

      <CompletionMoment
        show={showComp}
        title="Priorități stăpânite!"
        message={getRandomPraise()}
        emoji="🚦"
        variant="success"
        onContinue={() => setShowComp(false)}
        newBadges={newBadge}
      />
    </div>
  )
}
