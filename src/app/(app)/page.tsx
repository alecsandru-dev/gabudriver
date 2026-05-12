'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { PisiPilotBubble } from '@/components/PisiPilotBubble'
import { GlassCard } from '@/components/GlassCard'
import { PrimaryButton } from '@/components/PrimaryButton'
import { getState, AppState, updateStreakAndDate } from '@/lib/storage'
import { getOrCreateDailyQuest } from '@/lib/quest'
import { DailyQuest } from '@/lib/storage'
import { getRandomThought, PRAISE_MESSAGES } from '@/lib/messages'
import { getCurrentLevel, getBestReactionTime } from '@/lib/progress'

const N = { cyan:'#00C8FF', pink:'#FF2A8A', lime:'#A8FF1E', orange:'#FF6B1A', blue:'#4B7FFF', purple:'#B44FFF', gold:'#FFD700' }
const S = { ink:'#F2F0FF', inkSoft:'#C8C6E0', inkMute:'#9090A8', inkFade:'#4C4C68' }

// ─── Gabu's avatar — 112px spinning neon ring ────────────────
function GabuAvatar({ size = 112, accent = N.cyan }: { size?: number; accent?: string }) {
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      {/* Spinning conic ring */}
      <motion.div
        style={{
          position:'absolute', inset:-3, borderRadius:'50%',
          background:`conic-gradient(from 0deg,${accent},transparent 30%,${accent}55 60%,transparent 90%,${accent})`,
          filter:`drop-shadow(0 0 10px ${accent}88)`,
          mask:'radial-gradient(circle,transparent 68%,black 70%,black 86%,transparent 88%)',
          WebkitMask:'radial-gradient(circle,transparent 68%,black 70%,black 86%,transparent 88%)',
        }}
        animate={{ rotate:360 }}
        transition={{ duration:9, repeat:Infinity, ease:'linear' }}
      />
      {/* Pulsing halo */}
      <motion.div
        style={{ position:'absolute', inset:0, borderRadius:'50%', border:`1.5px solid ${accent}55`, pointerEvents:'none' }}
        animate={{ scale:[1,1.18,1], opacity:[0.6,0,0.6] }}
        transition={{ duration:3.4, repeat:Infinity, ease:'easeOut' }}
      />
      {/* Photo */}
      <div style={{
        position:'absolute', inset:4, borderRadius:'50%', overflow:'hidden',
        border:`1.5px solid ${accent}aa`,
        boxShadow:`0 0 16px ${accent}55, inset 0 1px 0 rgba(255,255,255,0.18)`,
        background:'#05050C',
      }}>
        <Image
          src="/avatar.png"
          alt="Gabu"
          fill
          sizes={`${size}px`}
          style={{ objectFit:'cover', objectPosition:'63% 26%' }}
          priority
        />
      </div>
    </div>
  )
}

// ─── Mood bundle data ─────────────────────────────────────────
type MoodKey = 'hard' | 'brave' | 'easy'

interface BundleStep {
  kind: 'game' | 'praise'
  emoji: string; name: string; sub: string
  accent: string; href?: string
}
interface Bundle {
  moodEmoji: string; moodLabel: string
  bundleTitle: string; bundleSub: string
  accent: string; pisiHint: string
  steps: BundleStep[]
}

const MOOD_BUNDLES: Record<MoodKey, Bundle> = {
  hard: {
    moodEmoji:'😮‍💨', moodLabel:'Am avut o zi grea',
    bundleTitle:'Plan blând', bundleSub:'Te cobor de pe gard',
    accent:N.blue,
    pisiHint:'Respiri întâi, apoi câteva semne ușoare, apoi îți spun ceva frumos.',
    steps:[
      { kind:'game',   emoji:'🫁', name:'Calm 60s',     sub:'Respiră 4 – 2 – 6',          accent:N.lime,  href:'/calm' },
      { kind:'game',   emoji:'🚦', name:'Semne ușoare', sub:'3 semne familiare',            accent:N.blue,  href:'/jocuri/semne' },
      { kind:'praise', emoji:'💝', name:'O laudă',      sub:'De la PisiPilot, doar pentru tine', accent:N.gold },
    ],
  },
  brave: {
    moodEmoji:'💪', moodLabel:'Azi mă simt curajoasă',
    bundleTitle:'Plan curajos', bundleSub:'Hai să atacăm partea grea',
    accent:N.orange,
    pisiHint:'Reacție rapidă, apoi viteze, și un scenariu nou. Pumnul în aer.',
    steps:[
      { kind:'game', emoji:'⚡', name:'Reacție',  sub:'Cinci runde la semafor', accent:N.cyan,   href:'/jocuri/reactie' },
      { kind:'game', emoji:'🔧', name:'Viteze',   sub:'Ambreiaj + accelerație', accent:N.purple, href:'/jocuri/viteze' },
      { kind:'game', emoji:'🎭', name:'Scenarii', sub:'Trei povești de trafic', accent:N.pink,   href:'/jocuri/scenarii' },
    ],
  },
  easy: {
    moodEmoji:'🌸', moodLabel:'Vreau ceva ușor',
    bundleTitle:'Plan ușor', bundleSub:'Două opriri scurte și gata',
    accent:N.purple,
    pisiHint:'Trei semne pe care le știi, apoi un singur scenariu. Cinci minute, atât.',
    steps:[
      { kind:'game', emoji:'🚦', name:'3 semne',    sub:'Doar familiare',      accent:N.blue, href:'/jocuri/semne' },
      { kind:'game', emoji:'🎭', name:'1 scenariu', sub:'Un singur exercițiu', accent:N.pink, href:'/jocuri/scenarii' },
    ],
  },
}

// ─── Bundle step row (preview) ────────────────────────────────
function BundleStepRow({ step, num, total }: { step:BundleStep; num:number; total:number }) {
  const c = step.accent
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:14,
      background:`linear-gradient(135deg,${c}10 0%,rgba(14,14,28,0.65) 100%)`,
      border:`1px solid ${c}44`, boxShadow:`inset 0 1px 0 ${c}33`,
    }}>
      <div style={{
        width:22, height:22, borderRadius:'50%', flexShrink:0,
        background:`${c}25`, border:`1px solid ${c}aa`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:11, fontWeight:800, color:c, fontFamily:'Space Grotesk, system-ui',
        textShadow:`0 0 6px ${c}aa`,
      }}>{num}</div>
      <div style={{ fontSize:18, lineHeight:1, flexShrink:0 }}>{step.emoji}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:700, color:S.ink, lineHeight:1.2 }}>{step.name}</div>
        <div style={{ fontSize:11, color:S.inkFade, marginTop:1 }}>{step.sub}</div>
      </div>
      <span style={{ fontSize:9, color:S.inkFade, fontWeight:700, letterSpacing:'0.1em' }}>
        {num === total ? 'FINAL' : `${num}/${total}`}
      </span>
    </div>
  )
}

// ─── Praise step ─────────────────────────────────────────────
function PraiseStep({ onContinue }: { onContinue:()=>void }) {
  const line = useMemo(() => PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)], [])
  return (
    <>
      <div style={{
        position:'relative', padding:'24px 18px', borderRadius:18, textAlign:'center',
        background:`radial-gradient(circle at 50% 0%,${N.gold}22,rgba(14,14,28,0.85) 70%)`,
        border:`1px solid ${N.gold}66`,
        boxShadow:`inset 0 1px 0 ${N.gold}44, 0 0 28px ${N.gold}33`,
        overflow:'hidden', marginBottom:12,
      }}>
        <div style={{ fontSize:48, lineHeight:1, marginBottom:8, filter:`drop-shadow(0 0 14px ${N.gold}cc)` }}>🦁</div>
        <div style={{ fontFamily:'Space Grotesk,system-ui', fontWeight:800, fontSize:16,
          color:N.gold, textShadow:`0 0 10px ${N.gold}99`, letterSpacing:'-0.01em' }}>
          O laudă pentru tine
        </div>
        <div style={{ marginTop:10, padding:'0 4px', fontSize:13.5, lineHeight:1.55,
          color:S.inkSoft, fontStyle:'italic' }}>"{line}"</div>
        <div style={{ marginTop:12, fontSize:11, color:S.inkFade, letterSpacing:'0.05em' }}>— PisiPilot</div>
      </div>
      <PrimaryButton fullWidth variant="orange" onClick={onContinue}>Termină planul →</PrimaryButton>
    </>
  )
}

// ─── Mood Bundle Section ──────────────────────────────────────
type BundleMode = 'pick' | 'preview' | 'step' | 'done'

function MoodBundleSection() {
  const router = useRouter()
  const [mode, setMode]       = useState<BundleMode>('pick')
  const [moodKey, setMoodKey] = useState<MoodKey|null>(null)
  const [stepIdx, setStepIdx] = useState(0)

  const bundle = moodKey ? MOOD_BUNDLES[moodKey] : null

  function chooseMood(key: MoodKey) { setMoodKey(key); setStepIdx(0); setMode('preview') }
  function startBundle()            { setStepIdx(0); setMode('step') }
  function completeStep() {
    if (!bundle) return
    if (stepIdx + 1 >= bundle.steps.length) setMode('done')
    else setStepIdx(i => i + 1)
  }
  function reset() { setMode('pick'); setMoodKey(null); setStepIdx(0) }

  // ── Pick
  if (mode === 'pick') {
    return (
      <GlassCard padding={16}>
        <div style={{ fontFamily:'Space Grotesk,system-ui', fontWeight:700, fontSize:14, color:S.ink, marginBottom:10 }}>
          Cum te simți azi?
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {(Object.entries(MOOD_BUNDLES) as [MoodKey,Bundle][]).map(([key,b])=>(
            <motion.button key={key} whileTap={{ scale:0.98 }} onClick={()=>chooseMood(key)}
              style={{
                display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:16,
                background:`linear-gradient(135deg,${b.accent}10 0%,transparent 100%)`,
                border:`1px solid ${b.accent}35`, boxShadow:`inset 0 1px 0 ${b.accent}22`,
                cursor:'pointer', textAlign:'left',
              }}>
              <span style={{ fontSize:22 }}>{b.moodEmoji}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13.5, fontWeight:600, color:S.ink, lineHeight:1.2,
                  fontFamily:'Space Grotesk,system-ui' }}>{b.moodLabel}</div>
                <div style={{ fontSize:11, color:S.inkFade, marginTop:2 }}>
                  {b.steps.map(s=>s.name).join(' · ')}
                </div>
              </div>
              <span style={{ color:b.accent, fontSize:20, textShadow:`0 0 6px ${b.accent}` }}>›</span>
            </motion.button>
          ))}
        </div>
      </GlassCard>
    )
  }

  if (!bundle) return null

  // ── Preview
  if (mode === 'preview') {
    return (
      <GlassCard accent={bundle.accent} padding={16}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:10 }}>
          <div style={{
            width:36, height:36, borderRadius:12, flexShrink:0,
            background:`${bundle.accent}20`, border:`1px solid ${bundle.accent}66`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:20, boxShadow:`0 0 14px ${bundle.accent}44`,
          }}>{bundle.moodEmoji}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'Space Grotesk,system-ui', fontWeight:700, fontSize:15,
              color:bundle.accent, textShadow:`0 0 10px ${bundle.accent}66` }}>{bundle.bundleTitle}</div>
            <div style={{ fontSize:11, color:S.inkFade, marginTop:1 }}>{bundle.bundleSub}</div>
          </div>
          <button onClick={reset} aria-label="Anulează" style={{
            background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
            color:S.inkMute, width:28, height:28, borderRadius:8, fontSize:14,
            cursor:'pointer', lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center',
          }}>×</button>
        </div>
        <PisiPilotBubble mood="calm" message={bundle.pisiHint} avatarSize={40} compact/>
        <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:8 }}>
          {bundle.steps.map((s,i)=>(
            <BundleStepRow key={i} step={s} num={i+1} total={bundle.steps.length}/>
          ))}
        </div>
        <div style={{ marginTop:14 }}>
          <PrimaryButton fullWidth variant="orange" onClick={startBundle}>
            Pornește planul →
          </PrimaryButton>
        </div>
      </GlassCard>
    )
  }

  // ── Step
  if (mode === 'step') {
    const step = bundle.steps[stepIdx]
    const isPraise = step.kind === 'praise'
    return (
      <GlassCard accent={step.accent} padding={16}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
          <span style={{
            padding:'3px 8px', borderRadius:999, fontSize:9.5, fontWeight:800,
            letterSpacing:'0.1em', color:bundle.accent,
            background:`${bundle.accent}15`, border:`1px solid ${bundle.accent}55`,
            fontFamily:'Space Grotesk,system-ui',
          }}>{bundle.bundleTitle.toUpperCase()}</span>
          <span style={{ fontSize:11, color:S.inkFade, fontFamily:'Space Grotesk', fontWeight:700 }}>
            Pasul {stepIdx+1}/{bundle.steps.length}
          </span>
          <button onClick={reset} aria-label="Renunță" style={{
            marginLeft:'auto', background:'rgba(255,255,255,0.05)',
            border:'1px solid rgba(255,255,255,0.08)',
            color:S.inkMute, width:26, height:26, borderRadius:8, fontSize:13,
            cursor:'pointer', lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center',
          }}>×</button>
        </div>
        {/* Timeline */}
        <div style={{ display:'flex', gap:6, marginBottom:14 }}>
          {bundle.steps.map((_,i)=>{
            const state = i<stepIdx?'done':i===stepIdx?'active':'upcoming'
            const c = bundle.steps[i].accent
            return (
              <div key={i} style={{
                flex:1, height:4, borderRadius:999,
                background: state==='done'?N.lime : state==='active'?c : 'rgba(255,255,255,0.10)',
                boxShadow: state==='active'?`0 0 8px ${c}aa`:'none',
                transition:'all 0.3s',
              }}/>
            )
          })}
        </div>
        {/* Step content */}
        {isPraise ? (
          <PraiseStep onContinue={completeStep}/>
        ) : (
          <>
            <div style={{
              position:'relative', padding:'20px 16px', borderRadius:18,
              background:`linear-gradient(135deg,${step.accent}18 0%,rgba(14,14,28,0.85) 80%)`,
              border:`1px solid ${step.accent}55`,
              boxShadow:`inset 0 1px 0 ${step.accent}33, 0 0 22px ${step.accent}22`,
              overflow:'hidden', marginBottom:12,
            }}>
              <div style={{
                position:'absolute', top:-22, right:-22, width:80, height:80, borderRadius:'50%',
                background:`radial-gradient(circle,${step.accent}66,transparent 70%)`,
                filter:'blur(8px)', pointerEvents:'none',
              }}/>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{
                  width:48, height:48, borderRadius:14, flexShrink:0,
                  background:`linear-gradient(135deg,${step.accent}40,${step.accent}10)`,
                  border:`1px solid ${step.accent}aa`,
                  boxShadow:`0 0 16px ${step.accent}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:24,
                }}>{step.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'Space Grotesk,system-ui', fontWeight:700, fontSize:17,
                    color:S.ink, lineHeight:1.1 }}>{step.name}</div>
                  <div style={{ fontSize:12, color:S.inkSoft, marginTop:3 }}>{step.sub}</div>
                </div>
              </div>
            </div>
            <PrimaryButton fullWidth variant="orange"
              onClick={() => { if (step.href) router.push(step.href); else completeStep() }}>
              {stepIdx+1 >= bundle.steps.length ? 'Termină planul →' : 'Începe pasul →'}
            </PrimaryButton>
          </>
        )}
      </GlassCard>
    )
  }

  // ── Done
  return (
    <GlassCard accent={N.lime} padding={18}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:44, lineHeight:1, marginBottom:8, filter:`drop-shadow(0 0 14px ${N.lime}cc)` }}>🏁</div>
        <div style={{
          fontFamily:'Space Grotesk,system-ui', fontWeight:800, fontSize:18,
          background:`linear-gradient(135deg,${N.lime} 0%,${N.cyan} 100%)`,
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          letterSpacing:'-0.01em',
        }}>
          {bundle.bundleTitle} — încheiat
        </div>
        <div style={{ marginTop:6, fontSize:12.5, color:S.inkSoft, lineHeight:1.45 }}>
          Ai dus la capăt toți pașii. PisiPilot e mândru.
        </div>
        <div style={{
          marginTop:12, display:'inline-flex', gap:6, padding:'6px 12px', borderRadius:999,
          background:`${N.cyan}15`, border:`1px solid ${N.cyan}55`,
          color:N.cyan, fontSize:11, fontWeight:700, letterSpacing:'0.08em',
          fontFamily:'Space Grotesk,system-ui', textShadow:`0 0 8px ${N.cyan}88`,
        }}>+{bundle.steps.length * 15} XP · BRAVO 🔥</div>
      </div>
      <div style={{ marginTop:14 }}>
        <PrimaryButton fullWidth variant="ghost" onClick={reset}>Alege altă stare</PrimaryButton>
      </div>
    </GlassCard>
  )
}

// ─── Quick game tiles ─────────────────────────────────────────
const GAMES = [
  { emoji:'🏎️', label:'Trepte',      href:'/jocuri/trepte',      accent:N.orange },
  { emoji:'⚡',  label:'Reacție',     href:'/jocuri/reactie',     accent:N.cyan   },
  { emoji:'🛑',  label:'Priorități', href:'/jocuri/intersectie', accent:N.gold   },
  { emoji:'🚦',  label:'Semne',       href:'/jocuri/semne',       accent:N.blue   },
  { emoji:'🔧',  label:'Viteze',      href:'/jocuri/viteze',      accent:N.purple },
  { emoji:'🎭',  label:'Scenarii',    href:'/jocuri/scenarii',    accent:N.pink   },
]

function CockpitFrame({ children, accent = N.cyan }: { children:React.ReactNode; accent?:string }) {
  const corners = [
    { top:0,    left:0,  br:'12px 0 0 0',  edges:['top','left']   },
    { top:0,    right:0, br:'0 12px 0 0',  edges:['top','right']  },
    { bottom:0, left:0,  br:'0 0 0 12px',  edges:['bottom','left'] },
    { bottom:0, right:0, br:'0 0 12px 0',  edges:['bottom','right'] },
  ]
  return (
    <div style={{
      position:'relative', borderRadius:22, padding:16, overflow:'hidden',
      background:`linear-gradient(135deg,${accent}10 0%,${N.purple}06 100%)`,
      border:`1px solid ${accent}40`,
      boxShadow:`0 4px 30px ${accent}18, 0 0 0 1px ${accent}10 inset`,
    }}>
      {corners.map((c,i)=>(
        <div key={i} style={{
          position:'absolute', width:22, height:22, borderRadius:(c as {br:string}).br,
          top:(c as {top?:number}).top, left:(c as {left?:number}).left,
          right:(c as {right?:number}).right, bottom:(c as {bottom?:number}).bottom,
          borderTop:   c.edges.includes('top')    ? `2px solid ${accent}99`:'none',
          borderBottom:c.edges.includes('bottom') ? `2px solid ${accent}99`:'none',
          borderLeft:  c.edges.includes('left')   ? `2px solid ${accent}99`:'none',
          borderRight: c.edges.includes('right')  ? `2px solid ${accent}99`:'none',
          boxShadow:`0 0 12px ${accent}66`,
        }}/>
      ))}
      {children}
    </div>
  )
}

function ProgressBar({ value, accent = N.cyan }: { value:number; accent?:string }) {
  return (
    <div style={{ marginTop:10, height:6, borderRadius:999, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
      <motion.div initial={{ width:0 }} animate={{ width:`${value*100}%` }}
        transition={{ duration:1, ease:[0.16,1,0.3,1] }}
        style={{ height:'100%', background:`linear-gradient(90deg,${accent},${accent}cc)`,
          boxShadow:`0 0 12px ${accent}aa` }}/>
    </div>
  )
}

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } }
const item = { hidden:{ opacity:0,y:14 }, show:{ opacity:1,y:0,transition:{ ease:[0.16,1,0.3,1],duration:0.4 } } }

// ─── Main page ────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const [appState, setAppState] = useState<AppState|null>(null)
  const [quest, setQuest]       = useState<DailyQuest|null>(null)
  const [thought, setThought]   = useState('')
  const [mounted, setMounted]   = useState(false)

  useEffect(()=>{
    updateStreakAndDate()
    setAppState(getState())
    setQuest(getOrCreateDailyQuest())
    setThought(getRandomThought())
    setMounted(true)
  },[])

  if (!mounted||!appState||!quest) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
        <div style={{ width:28,height:28,borderRadius:'50%',border:`2px solid ${N.cyan}33`,borderTopColor:N.cyan,animation:'spin 1s linear infinite' }}/>
      </div>
    )
  }

  const level   = getCurrentLevel(appState.xp)
  const bestRT  = getBestReactionTime(appState)
  const allDone = quest.missions.every(m=>m.completed)
  const doneCnt = quest.missions.filter(m=>m.completed).length
  const pct     = quest.missions.length ? doneCnt/quest.missions.length : 0

  return (
    <motion.div variants={stagger} initial="hidden" animate="show"
      style={{ padding:'6px 14px 16px', display:'flex', flexDirection:'column', gap:14 }}>

      {/* Page header with Gabu's avatar */}
      <motion.div variants={item} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'2px 2px 0' }}>
        <div>
          <div style={{ fontFamily:'Space Grotesk,system-ui', fontWeight:700, fontSize:22, color:S.ink, letterSpacing:'-0.01em' }}>
            Bună, Gabu
          </div>
          <div style={{ fontSize:12, color:S.inkFade, marginTop:1 }}>Aplicația ta pentru permis 🐾</div>
        </div>
        <GabuAvatar size={64} accent={N.cyan} />
      </motion.div>

      {/* Cockpit hero */}
      <motion.div variants={item}>
        <CockpitFrame accent={N.cyan}>
          <PisiPilotBubble mood="happy" message={thought} avatarSize={60}/>
        </CockpitFrame>
      </motion.div>

      {/* HUD chips */}
      <motion.div variants={item} style={{ display:'flex', gap:8 }}>
        {[
          { label:'STREAK', value:`${appState.streak}🔥`, accent:N.orange },
          { label:'NIVEL',  value:level.emoji,             accent:N.purple },
          { label:'BEST RT',value:bestRT?`${bestRT}ms`:'—⚡', accent:N.cyan },
        ].map(({ label,value,accent })=>(
          <div key={label} className="hud-chip" style={{ flex:1 }}>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.18em', color:S.inkFade, marginBottom:3,
              fontFamily:'Space Grotesk,system-ui', textTransform:'uppercase' }}>{label}</div>
            <div style={{ fontFamily:'Space Grotesk,system-ui', fontWeight:700, fontSize:17,
              color:accent, textShadow:`0 0 14px ${accent}99`, lineHeight:1 }}>{value}</div>
          </div>
        ))}
      </motion.div>

      {/* Daily quest */}
      <motion.div variants={item}>
        <GlassCard accent={N.lime} padding={16}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <span style={{
              display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:999,
              background:`${N.lime}15`, border:`1px solid ${N.lime}55`, color:N.lime,
              fontSize:10.5, fontWeight:700, letterSpacing:'0.06em',
              fontFamily:'Space Grotesk,system-ui', textTransform:'uppercase', textShadow:`0 0 8px ${N.lime}80`,
            }}>🎯 Misiunea zilei</span>
            <span style={{ marginLeft:'auto', fontSize:11, color:S.inkFade }}>{doneCnt}/{quest.missions.length}</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {quest.missions.map(m=>(
              <div key={m.id} style={{
                display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:12,
                background: m.completed?`${N.lime}10`:'rgba(255,255,255,0.02)',
                border:`1px solid ${m.completed?N.lime+'38':'rgba(255,255,255,0.05)'}`,
              }}>
                <div style={{
                  width:22, height:22, borderRadius:'50%', flexShrink:0,
                  background: m.completed?`${N.lime}22`:'transparent',
                  border:`1.5px solid ${m.completed?N.lime:'rgba(255,255,255,0.18)'}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow: m.completed?`0 0 10px ${N.lime}66`:'none',
                }}>
                  {m.completed&&<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12l4 4 10-10" stroke={N.lime} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div style={{ flex:1, fontSize:12.5, color:m.completed?S.inkSoft:S.ink,
                  textDecoration:m.completed?'line-through':'none', opacity:m.completed?0.7:1 }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
          <ProgressBar value={pct} accent={N.lime}/>
        </GlassCard>
      </motion.div>

      {/* CTA */}
      <motion.div variants={item}>
        {allDone ? (
          <GlassCard accent={N.lime} padding={16}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:6, filter:`drop-shadow(0 0 12px ${N.lime}aa)` }}>🏁</div>
              <div style={{ fontFamily:'Space Grotesk,system-ui', fontWeight:700, fontSize:16,
                color:N.lime, textShadow:`0 0 12px ${N.lime}` }}>Misiunea completă!</div>
              <div style={{ fontSize:12.5, color:S.inkFade, marginTop:4 }}>PisiPilot e mândru. Și cam surprins.</div>
            </div>
          </GlassCard>
        ) : (
          <PrimaryButton fullWidth size="lg" variant="orange" onClick={()=>router.push('/jocuri')}>
            <span style={{ fontSize:18 }}>🚗</span> Pornesc motorul!
          </PrimaryButton>
        )}
      </motion.div>

      {/* Mood bundle section */}
      <motion.div variants={item}>
        <MoodBundleSection/>
      </motion.div>

      {/* Quick game tiles */}
      <motion.div variants={item}>
        <div style={{ fontSize:10.5, fontWeight:800, letterSpacing:'0.18em', color:S.inkFade,
          textTransform:'uppercase', margin:'0 4px 10px', fontFamily:'Space Grotesk,system-ui' }}>
          Jocuri rapide
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {GAMES.map(({emoji,label,href,accent})=>(
            <motion.a key={href} href={href} whileTap={{ scale:0.94 }}
              style={{
                padding:10, borderRadius:18, background:'rgba(14,14,28,0.7)',
                border:`1px solid ${accent}30`,
                boxShadow:`0 4px 16px ${accent}15, inset 0 1px 0 ${accent}30`,
                display:'flex', flexDirection:'column', alignItems:'center', gap:6, textDecoration:'none',
              }}>
              <div style={{
                width:40, height:40, borderRadius:14,
                background:`linear-gradient(135deg,${accent}30 0%,${accent}08 100%)`,
                border:`1px solid ${accent}55`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
                boxShadow:`0 4px 12px ${accent}33, inset 0 1px 0 ${accent}66`,
              }}>{emoji}</div>
              <span style={{ fontSize:11, fontWeight:700, color:S.inkSoft,
                fontFamily:'Space Grotesk,system-ui' }}>{label}</span>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
