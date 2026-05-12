'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { PisiPilotBubble } from '@/components/PisiPilotBubble'
import { GlassCard } from '@/components/GlassCard'
import { PrimaryButton } from '@/components/PrimaryButton'
import { getState, AppState, updateStreakAndDate } from '@/lib/storage'
import { getOrCreateDailyQuest, getMoodFlow } from '@/lib/quest'
import { DailyQuest } from '@/lib/storage'
import { getRandomThought } from '@/lib/messages'
import { getCurrentLevel, getBestReactionTime } from '@/lib/progress'

const N = { cyan:'#00C8FF', pink:'#FF2A8A', lime:'#A8FF1E', orange:'#FF6B1A', blue:'#4B7FFF', purple:'#B44FFF', gold:'#FFD700' }
const S = { ink:'#F2F0FF', inkSoft:'#C8C6E0', inkMute:'#9090A8', inkFade:'#4C4C68' }

const GAMES = [
  { emoji:'🏎️', label:'Trepte',   href:'/jocuri/trepte',   accent:N.orange },
  { emoji:'⚡',  label:'Reacție',  href:'/jocuri/reactie',  accent:N.cyan   },
  { emoji:'🚦',  label:'Semne',    href:'/jocuri/semne',    accent:N.blue   },
  { emoji:'🔧',  label:'Viteze',   href:'/jocuri/viteze',   accent:N.purple },
  { emoji:'🎭',  label:'Scenarii', href:'/jocuri/scenarii', accent:N.pink   },
  { emoji:'🫁',  label:'Calm',     href:'/calm',            accent:N.lime   },
]

const MOODS = [
  { key:'hard'  as const, emoji:'😮‍💨', label:'Am avut o zi grea',    sub:'Calm · Semne ușoare · Laudă', accent:N.blue   },
  { key:'brave' as const, emoji:'💪',   label:'Azi mă simt curajoasă', sub:'Reacție · Viteze · Scenarii', accent:N.orange },
  { key:'easy'  as const, emoji:'🌸',   label:'Vreau ceva ușor',       sub:'3 semne · 1 scenariu',        accent:N.purple },
]

function CockpitFrame({ children, accent = N.cyan }: { children: React.ReactNode; accent?: string }) {
  const corners = [
    { top:0, left:0, br:'12px 0 0 0', edges:['top','left'] },
    { top:0, right:0, br:'0 12px 0 0', edges:['top','right'] },
    { bottom:0, left:0, br:'0 0 0 12px', edges:['bottom','left'] },
    { bottom:0, right:0, br:'0 0 12px 0', edges:['bottom','right'] },
  ]
  return (
    <div style={{
      position:'relative', borderRadius:22, padding:16, overflow:'hidden',
      background:`linear-gradient(135deg, ${accent}10 0%, ${N.purple}06 100%)`,
      border:`1px solid ${accent}40`,
      boxShadow:`0 4px 30px ${accent}18, 0 0 0 1px ${accent}10 inset`,
    }}>
      {corners.map((c, i) => (
        <div key={i} style={{
          position:'absolute', width:22, height:22,
          borderRadius: c.br,
          top: (c as { top?: number }).top, left: (c as { left?: number }).left,
          right: (c as { right?: number }).right, bottom: (c as { bottom?: number }).bottom,
          borderTop:    c.edges.includes('top')    ? `2px solid ${accent}99` : 'none',
          borderBottom: c.edges.includes('bottom') ? `2px solid ${accent}99` : 'none',
          borderLeft:   c.edges.includes('left')   ? `2px solid ${accent}99` : 'none',
          borderRight:  c.edges.includes('right')  ? `2px solid ${accent}99` : 'none',
          boxShadow:`0 0 12px ${accent}66`,
        }} />
      ))}
      {children}
    </div>
  )
}

function ProgressBar({ value, accent = N.cyan }: { value: number; accent?: string }) {
  return (
    <div style={{ marginTop:10, height:6, borderRadius:999, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${value * 100}%` }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          height:'100%',
          background:`linear-gradient(90deg, ${accent}, ${accent}bb)`,
          boxShadow:`0 0 12px ${accent}aa, inset 0 1px 0 rgba(255,255,255,0.3)`,
        }}
      />
    </div>
  )
}

function QuestRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap:10,
      padding:'8px 10px', borderRadius:12,
      background: done ? `${N.lime}10` : 'rgba(255,255,255,0.02)',
      border: `1px solid ${done ? N.lime+'38' : 'rgba(255,255,255,0.05)'}`,
    }}>
      <div style={{
        width:22, height:22, borderRadius:'50%',
        background: done ? `${N.lime}22` : 'transparent',
        border: `1.5px solid ${done ? N.lime : 'rgba(255,255,255,0.18)'}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow: done ? `0 0 10px ${N.lime}66` : 'none', flexShrink:0,
      }}>
        {done && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l4 4 10-10" stroke={N.lime} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <div style={{
        flex:1, fontSize:12.5, color: done ? S.inkSoft : S.ink,
        textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.7 : 1,
      }}>{label}</div>
    </div>
  )
}

function HudChip({ label, value, accent = N.cyan }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="hud-chip">
      <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.18em', color:S.inkFade, marginBottom:3,
        fontFamily:'Space Grotesk, system-ui', textTransform:'uppercase' }}>{label}</div>
      <div style={{ fontFamily:'Space Grotesk, system-ui', fontWeight:700, fontSize:17,
        color:accent, textShadow:`0 0 14px ${accent}99`, lineHeight:1 }}>{value}</div>
    </div>
  )
}

function GameTile({ emoji, label, href, accent }: { emoji:string; label:string; href:string; accent:string }) {
  return (
    <motion.a
      href={href}
      whileTap={{ scale: 0.94 }}
      style={{
        padding:10, borderRadius:18,
        background:'rgba(14,14,28,0.7)',
        border:`1px solid ${accent}30`,
        boxShadow:`0 4px 16px ${accent}15, inset 0 1px 0 ${accent}30`,
        display:'flex', flexDirection:'column', alignItems:'center', gap:6,
        textDecoration:'none',
      }}
    >
      <div style={{
        width:40, height:40, borderRadius:14,
        background:`linear-gradient(135deg, ${accent}30 0%, ${accent}08 100%)`,
        border:`1px solid ${accent}55`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:20, boxShadow:`0 4px 12px ${accent}33, inset 0 1px 0 ${accent}66`,
      }}>{emoji}</div>
      <span style={{ fontSize:11, fontWeight:700, color:S.inkSoft,
        fontFamily:'Space Grotesk, system-ui' }}>{label}</span>
    </motion.a>
  )
}

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:0.07 } } }
const item = { hidden:{ opacity:0, y:14 }, show:{ opacity:1, y:0, transition:{ ease:[0.16,1,0.3,1], duration:0.4 } } }

export default function HomePage() {
  const router = useRouter()
  const [state, setAppState] = useState<AppState | null>(null)
  const [quest, setQuest]    = useState<DailyQuest | null>(null)
  const [thought, setThought] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    updateStreakAndDate()
    setAppState(getState())
    setQuest(getOrCreateDailyQuest())
    setThought(getRandomThought())
    setMounted(true)
  }, [])

  if (!mounted || !state || !quest) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', border:`2px solid ${N.cyan}33`, borderTopColor:N.cyan,
          animation:'spin 1s linear infinite' }} />
      </div>
    )
  }

  const level  = getCurrentLevel(state.xp)
  const bestRT = getBestReactionTime(state)
  const allDone = quest.missions.every((m) => m.completed)
  const doneCnt = quest.missions.filter((m) => m.completed).length
  const pct     = quest.missions.length ? doneCnt / quest.missions.length : 0

  return (
    <motion.div
      variants={stagger} initial="hidden" animate="show"
      style={{ padding:'6px 14px 16px', display:'flex', flexDirection:'column', gap:14 }}
    >
      {/* Page header */}
      <motion.div variants={item} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'2px 2px 0' }}>
        <div>
          <div style={{ fontFamily:'Space Grotesk, system-ui', fontWeight:700, fontSize:22, color:S.ink, letterSpacing:'-0.01em' }}>
            Bună, Gabu
          </div>
          <div style={{ fontSize:12, color:S.inkFade, marginTop:1 }}>Aplicația ta pentru permis 🐾</div>
        </div>
      </motion.div>

      {/* Cockpit hero + mascot */}
      <motion.div variants={item}>
        <CockpitFrame accent={N.cyan}>
          <PisiPilotBubble mood="happy" message={thought} avatarSize={60} />
        </CockpitFrame>
      </motion.div>

      {/* HUD stat row */}
      <motion.div variants={item} style={{ display:'flex', gap:8 }}>
        <HudChip label="STREAK" value={`${state.streak}🔥`} accent={N.orange} />
        <HudChip label="NIVEL"  value={`${level.emoji}`}    accent={N.purple} />
        <HudChip label="BEST RT" value={bestRT ? `${bestRT}ms` : '—⚡'} accent={N.cyan} />
      </motion.div>

      {/* Daily quest */}
      <motion.div variants={item}>
        <GlassCard accent={N.lime} padding={16}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:999,
              background:`${N.lime}15`, border:`1px solid ${N.lime}55`, color:N.lime,
              fontSize:10.5, fontWeight:700, letterSpacing:'0.06em', fontFamily:'Space Grotesk, system-ui',
              textTransform:'uppercase', textShadow:`0 0 8px ${N.lime}80` }}>
              🎯 Misiunea zilei
            </span>
            <span style={{ marginLeft:'auto', fontSize:11, color:S.inkFade }}>{doneCnt} / {quest.missions.length}</span>
          </div>
          {quest.missions.map((m) => (
            <div key={m.id} style={{ marginBottom:6 }}>
              <QuestRow label={m.label} done={m.completed} />
            </div>
          ))}
          <ProgressBar value={pct} accent={N.lime} />
        </GlassCard>
      </motion.div>

      {/* CTA */}
      <motion.div variants={item}>
        {allDone ? (
          <GlassCard accent={N.lime} padding={16}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:6, filter:`drop-shadow(0 0 12px ${N.lime}aa)` }}>🏁</div>
              <div style={{ fontFamily:'Space Grotesk, system-ui', fontWeight:700, fontSize:16, color:N.lime,
                textShadow:`0 0 12px ${N.lime}` }}>Misiunea completă!</div>
              <div style={{ fontSize:12.5, color:S.inkFade, marginTop:4 }}>PisiPilot e mândru. Și cam surprins.</div>
            </div>
          </GlassCard>
        ) : (
          <PrimaryButton fullWidth variant="orange" onClick={() => router.push('/jocuri')}>
            <span style={{ fontSize:18 }}>🚗</span> Pornesc motorul!
          </PrimaryButton>
        )}
      </motion.div>

      {/* Mood selector */}
      <motion.div variants={item}>
        <GlassCard padding={16}>
          <div style={{ fontFamily:'Space Grotesk, system-ui', fontWeight:700, fontSize:14, color:S.ink, marginBottom:10 }}>
            Cum te simți azi?
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {MOODS.map((m) => (
              <motion.button
                key={m.key}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(getMoodFlow(m.key)[0])}
                style={{
                  display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:16,
                  background:`linear-gradient(135deg, ${m.accent}10 0%, transparent 100%)`,
                  border:`1px solid ${m.accent}35`,
                  boxShadow:`inset 0 1px 0 ${m.accent}22`,
                  cursor:'pointer', textAlign:'left',
                }}
              >
                <span style={{ fontSize:22 }}>{m.emoji}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13.5, fontWeight:600, color:S.ink, lineHeight:1.2,
                    fontFamily:'Space Grotesk, system-ui' }}>{m.label}</div>
                  <div style={{ fontSize:11, color:S.inkFade, marginTop:2 }}>{m.sub}</div>
                </div>
                <span style={{ color:m.accent, fontSize:20, textShadow:`0 0 6px ${m.accent}` }}>›</span>
              </motion.button>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick games grid */}
      <motion.div variants={item}>
        <div style={{ fontSize:10.5, fontWeight:800, letterSpacing:'0.18em', color:S.inkFade,
          textTransform:'uppercase', margin:'0 4px 10px', fontFamily:'Space Grotesk, system-ui' }}>
          Jocuri rapide
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10 }}>
          {GAMES.map((g) => <GameTile key={g.label} {...g} />)}
        </div>
      </motion.div>
    </motion.div>
  )
}
