'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/GlassCard'
import { getState, AppState } from '@/lib/storage'

const N = { cyan:'#00C8FF', pink:'#FF2A8A', lime:'#A8FF1E', orange:'#FF6B1A', blue:'#4B7FFF', purple:'#B44FFF' }
const S = { ink:'#F2F0FF', inkFade:'#4C4C68', inkMute:'#9090A8' }

const GAMES = [
  { emoji:'🏎️', title:'Trepte',     sub:'Schimbă vitezele la timp pe RPM',         accent:N.orange, href:'/jocuri/trepte',   badge:'Nou' },
  { emoji:'⚡',  title:'Reacție',    sub:'Apasă când semaforul devine verde',        accent:N.cyan,   href:'/jocuri/reactie'   },
  { emoji:'🚦',  title:'Semne',      sub:'Memorează și recunoaște semne românești',  accent:N.blue,   href:'/jocuri/semne'     },
  { emoji:'🔧',  title:'Viteze',     sub:'Simulator cu ambreiaj și frână',           accent:N.purple, href:'/jocuri/viteze'    },
  { emoji:'🎭',  title:'Scenarii',   sub:'Cum reacționezi în trafic?',               accent:N.pink,   href:'/jocuri/scenarii'  },
  { emoji:'🫁',  title:'Calm Mode',  sub:'Respiră 60 secunde înainte de drum',       accent:N.lime,   href:'/calm'             },
]

function GameRow({ emoji, title, sub, accent, href, badge, stats }: {
  emoji:string; title:string; sub:string; accent:string; href:string; badge?:string; stats?:string
}) {
  return (
    <motion.a
      href={href}
      whileTap={{ scale: 0.985 }}
      style={{
        position:'relative', display:'flex', alignItems:'center', gap:14,
        padding:14, borderRadius:20, textDecoration:'none',
        background:`linear-gradient(135deg, ${accent}10 0%, rgba(14,14,28,0.85) 60%)`,
        border:`1px solid ${accent}44`,
        boxShadow:`0 8px 24px ${accent}18, inset 0 1px 0 ${accent}33`,
        overflow:'hidden',
      }}
    >
      {/* Corner accent glow */}
      <div style={{
        position:'absolute', top:-30, right:-30, width:100, height:100, borderRadius:'50%',
        background:`radial-gradient(circle, ${accent}55 0%, transparent 60%)`,
        filter:'blur(10px)', pointerEvents:'none',
      }} />

      {/* Icon */}
      <div style={{
        width:52, height:52, borderRadius:18, flexShrink:0,
        background:`linear-gradient(135deg, ${accent}40 0%, ${accent}10 100%)`,
        border:`1px solid ${accent}aa`,
        boxShadow:`0 4px 16px ${accent}50, inset 0 1px 0 rgba(255,255,255,0.25)`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:26,
      }}>{emoji}</div>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:'Space Grotesk, system-ui', fontWeight:700, fontSize:16,
          color:S.ink, letterSpacing:'-0.01em' }}>{title}</div>
        <div style={{ fontSize:11.5, color:S.inkFade, marginTop:2 }}>{sub}</div>
        {stats && <div style={{ fontSize:11, color:accent, marginTop:4, fontWeight:600 }}>✓ {stats}</div>}
      </div>

      {badge && (
        <div style={{
          padding:'4px 8px', borderRadius:999, fontSize:9.5, fontWeight:700,
          letterSpacing:'0.05em', textTransform:'uppercase',
          background:`${accent}18`, color:accent, border:`1px solid ${accent}55`,
          flexShrink:0, fontFamily:'Space Grotesk, system-ui',
        }}>{badge}</div>
      )}
      <span style={{ color:accent, fontSize:22, marginLeft:2, textShadow:`0 0 8px ${accent}`, flexShrink:0 }}>›</span>
    </motion.a>
  )
}

export default function JocuriPage() {
  const [state, setState] = useState<AppState | null>(null)
  useEffect(() => { setState(getState()) }, [])

  function getStats(href: string) {
    if (!state) return undefined
    switch (href) {
      case '/jocuri/reactie': return state.reactionGamesPlayed > 0 ? `${state.reactionGamesPlayed} jocuri` : undefined
      case '/jocuri/semne':   return state.signGamesPlayed > 0 ? `${state.signGamesPlayed} sesiuni` : undefined
      case '/jocuri/viteze':  return state.gearboxGamesPlayed > 0 ? `${state.gearboxSuccesses} reușite` : undefined
      case '/jocuri/scenarii':return state.scenarioAnswers.length > 0 ? `${state.scenarioAnswers.filter(a=>a.correct).length} corecte` : undefined
      case '/jocuri/trepte':  return state.gearboxSuccesses > 0 ? `${state.gearboxSuccesses} schimbări` : undefined
      default: return undefined
    }
  }

  return (
    <div style={{ padding:'6px 14px 16px', display:'flex', flexDirection:'column', gap:14 }}>
      {/* Header */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ padding:'2px 2px 0' }}>
        <div style={{ fontFamily:'Space Grotesk, system-ui', fontWeight:700, fontSize:22, color:S.ink, letterSpacing:'-0.01em' }}>
          Jocuri
        </div>
        <div style={{ fontSize:12, color:S.inkFade, marginTop:1 }}>Alege ce vrei să exersezi azi</div>
      </motion.div>

      {/* Game list */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {GAMES.map((g, i) => (
          <motion.div
            key={g.href}
            initial={{ opacity:0, y:14 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay: i * 0.06, ease:[0.16,1,0.3,1] }}
          >
            <GameRow {...g} stats={getStats(g.href)} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
