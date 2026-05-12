'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/GlassCard'
import { PisiPilotBubble } from '@/components/PisiPilotBubble'
import { ALL_BADGES } from '@/lib/badges'
import { getState, AppState, PraiseEntry } from '@/lib/storage'
import { getCurrentLevel, getLevelProgress, getNextLevel, getBestReactionTime, getAverageReactionTime, getBestSignScore } from '@/lib/progress'

const CYAN='#00C8FF'; const GOLD='#FFD700'; const LIME='#A8FF1E'; const ORANGE='#FF6B1A'; const PURPLE='#B44FFF'
const INK='#F2F0FF'; const SOFT='#C8C6E0'; const FADE='#4C4C68'; const MUTE='#9090A8'

type Tab = 'badges' | 'laude' | 'stats'

function getBadgeGlow(color:string):string{
  if(color.includes('orange')||color.includes('red')) return ORANGE
  if(color.includes('blue')||color.includes('cyan'))  return CYAN
  if(color.includes('violet')||color.includes('purple')) return PURPLE
  if(color.includes('emerald')||color.includes('teal')||color.includes('green')) return LIME
  if(color.includes('amber')||color.includes('yellow')) return GOLD
  if(color.includes('pink')||color.includes('rose')) return '#FF2A8A'
  return CYAN
}

function BadgeTile({emoji,name,desc,accent,earned}:{emoji:string;name:string;desc:string;accent:string;earned:boolean}){
  return(
    <div style={{
      position:'relative', padding:14, borderRadius:18, textAlign:'center', overflow:'hidden',
      background: earned?`linear-gradient(135deg,${accent}15 0%,rgba(14,14,28,0.85) 100%)`:'rgba(14,14,28,0.6)',
      border:`1px solid ${earned?accent+'55':'rgba(255,255,255,0.08)'}`,
      boxShadow: earned?`0 4px 16px ${accent}22, inset 0 1px 0 ${accent}40`:'inset 0 1px 0 rgba(255,255,255,0.04)',
      opacity: earned?1:0.55,
    }}>
      {earned&&<div style={{position:'absolute',top:-20,right:-20,width:60,height:60,borderRadius:'50%',
        background:`radial-gradient(circle,${accent}66,transparent 70%)`,filter:'blur(8px)'}}/>}
      <div style={{
        width:52,height:52,borderRadius:'50%',margin:'0 auto 8px',
        background:earned?`radial-gradient(circle at 30% 25%,${accent}55,${accent}10)`:'rgba(255,255,255,0.04)',
        border:`1.5px solid ${earned?accent+'aa':'rgba(255,255,255,0.12)'}`,
        boxShadow:earned?`0 0 18px ${accent}77, inset 0 1px 0 rgba(255,255,255,0.25)`:'none',
        display:'flex',alignItems:'center',justifyContent:'center',
        fontSize:26,filter:earned?'none':'grayscale(1)',
      }}>{emoji}</div>
      <div style={{fontFamily:'Space Grotesk,system-ui',fontWeight:700,fontSize:13,color:earned?INK:MUTE}}>{name}</div>
      <div style={{fontSize:10.5,color:FADE,marginTop:2}}>{desc}</div>
      {!earned&&<div style={{marginTop:6,fontSize:9.5,fontWeight:700,color:FADE,letterSpacing:'0.15em'}}>🔒 LOCKED</div>}
    </div>
  )
}

function PraiseLine({children,accent}:{children:React.ReactNode;accent:string}){
  return(
    <div style={{
      padding:'8px 12px',borderRadius:12,
      background:`${accent}0C`,border:`1px solid ${accent}30`,borderLeft:`2px solid ${accent}`,
      fontSize:12,color:SOFT,lineHeight:1.45,fontStyle:'italic',
    }}>{children}</div>
  )
}

function ProgressBar({value,accent=CYAN}:{value:number;accent?:string}){
  return(
    <div style={{height:6,borderRadius:999,background:'rgba(255,255,255,0.06)',overflow:'hidden'}}>
      <motion.div initial={{width:0}} animate={{width:`${value*100}%`}}
        transition={{duration:1,ease:[0.16,1,0.3,1]}}
        style={{height:'100%',background:`linear-gradient(90deg,${accent},${accent}bb)`,
          boxShadow:`0 0 10px ${accent}aa`}}/>
    </div>
  )
}

export default function BadgesPage() {
  const [state, setState] = useState<AppState|null>(null)
  const [tab, setTab] = useState<Tab>('badges')
  useEffect(()=>{setState(getState())},[])
  if(!state) return null

  const level   = getCurrentLevel(state.xp)
  const pct     = getLevelProgress(state.xp)/100
  const next    = getNextLevel(state.xp)
  const unlocked = new Set(state.unlockedBadges)
  const bestRT  = getBestReactionTime(state)
  const avgRT   = getAverageReactionTime(state)
  const bestSign= getBestSignScore(state)
  const correct = state.scenarioAnswers.filter(a=>a.correct).length

  const TABS:{id:Tab;label:string}[]=[
    {id:'badges',label:'🏅 Insigne'},{id:'laude',label:'💌 Laude'},{id:'stats',label:'📊 Stats'}
  ]

  return(
    <div style={{padding:'6px 14px 16px',display:'flex',flexDirection:'column',gap:14}}>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{padding:'2px 2px 0'}}>
        <div style={{fontFamily:'Space Grotesk,system-ui',fontWeight:700,fontSize:22,color:INK}}>Insigne</div>
        <div style={{fontSize:12,color:FADE,marginTop:1}}>{unlocked.size} câștigate · {ALL_BADGES.length-unlocked.size} de descoperit</div>
      </motion.div>

      {/* Level + XP card */}
      <GlassCard accent={GOLD} padding={16} style={{borderRadius:22}}>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <div style={{position:'relative',width:64,height:64,flexShrink:0}}>
            <motion.div style={{position:'absolute',inset:-3,borderRadius:'50%',
              background:`conic-gradient(from 0deg,${GOLD},transparent 30%,${GOLD}60 60%,transparent 90%,${GOLD})`,
              filter:`blur(0.5px) drop-shadow(0 0 10px ${GOLD}88)`,
              mask:'radial-gradient(circle,transparent 56%,black 58%,black 70%,transparent 72%)',
              WebkitMask:'radial-gradient(circle,transparent 56%,black 58%,black 70%,transparent 72%)'}}
              animate={{rotate:360}} transition={{duration:10,repeat:Infinity,ease:'linear'}}/>
            <div style={{position:'absolute',inset:4,borderRadius:'50%',
              background:`radial-gradient(circle at 30% 25%,${GOLD}30 0%,#0C0C18 70%)`,
              border:`1.5px solid ${GOLD}88`,boxShadow:`0 0 16px ${GOLD}55`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>{level.emoji}</div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:'Space Grotesk,system-ui',fontWeight:700,fontSize:16,color:INK}}>
              Nivel <span style={{color:GOLD,textShadow:`0 0 8px ${GOLD}`}}>{level.name}</span>
            </div>
            <div style={{fontSize:11.5,color:FADE,marginTop:2}}>{state.xp} / {next?.minXP||'MAX'} XP</div>
            <div style={{marginTop:8}}><ProgressBar value={pct} accent={GOLD}/></div>
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div style={{display:'flex',gap:8}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{
              flex:1, padding:'10px 0', borderRadius:16, cursor:'pointer',
              fontFamily:'Space Grotesk,system-ui', fontWeight:700, fontSize:11.5,
              border:'none',
              background: tab===t.id?`linear-gradient(135deg,${PURPLE},${CYAN})`:'rgba(255,255,255,0.04)',
              color: tab===t.id?INK:FADE,
              boxShadow: tab===t.id?`0 0 16px ${PURPLE}55`:'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}>{t.label}
          </button>
        ))}
      </div>

      {tab==='badges'&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{display:'flex',flexDirection:'column',gap:12}}>
          <PisiPilotBubble
            message={`${unlocked.size}/${ALL_BADGES.length} insigne deblocate. ${unlocked.size===0?'Primul e mereu cel mai greu.':'Sunt mândru de tine, Gabu.'}`}
            compact avatarSize={44}
          />
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
            {ALL_BADGES.map((b,i)=>(
              <motion.div key={b.id} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
                transition={{delay:i*0.05,type:'spring',stiffness:260,damping:22}}>
                <BadgeTile emoji={b.emoji} name={b.name} desc={unlocked.has(b.id)?b.description:b.hint}
                  accent={getBadgeGlow(b.color)} earned={unlocked.has(b.id)}/>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {tab==='laude'&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{display:'flex',flexDirection:'column',gap:12}}>
          <GlassCard padding={14}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
              <span style={{fontSize:13}}>💌</span>
              <span style={{fontFamily:'Space Grotesk,system-ui',fontWeight:700,fontSize:12.5,color:SOFT}}>Zid de laude</span>
            </div>
            {state.praiseHistory.length===0?(
              <div style={{textAlign:'center',padding:'16px 0',color:FADE,fontSize:13}}>
                Nicio laudă încă, Gabu. Completează o activitate!
              </div>
            ):(
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {state.praiseHistory.slice(0,10).map((e:PraiseEntry,i)=>{
                  const colors=[CYAN,'#A8FF1E','#FF2A8A',ORANGE,PURPLE,GOLD]
                  return <PraiseLine key={i} accent={colors[i%colors.length]}>„{e.text}"</PraiseLine>
                })}
              </div>
            )}
          </GlassCard>
        </motion.div>
      )}

      {tab==='stats'&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
          {[
            {label:'Streak',       value:`${state.streak} zile 🔥`,    accent:ORANGE },
            {label:'Total zile',   value:`${state.totalDays}`,           accent:CYAN   },
            {label:'Misiuni',      value:`${state.questsCompleted}`,     accent:LIME   },
            {label:'Sesiuni Calm', value:`${state.calmSessions}`,        accent:'#4B7FFF'},
            {label:'Best Reacție', value:bestRT?`${bestRT}ms`:'–',       accent:GOLD   },
            {label:'Medie',        value:avgRT?`${avgRT}ms`:'–',         accent:ORANGE },
            {label:'Semne',        value:bestSign?`${bestSign}%`:'–',    accent:'#4B7FFF'},
            {label:'Scenarii',     value:`${correct}`,                   accent:'#FF2A8A'},
            {label:'Schimbări',    value:`${state.gearboxSuccesses}`,    accent:LIME   },
            {label:'Calări',       value:`${state.gearboxStalls}`,       accent:PURPLE },
          ].map(({label,value,accent})=>(
            <div key={label} style={{
              padding:'12px 14px',borderRadius:16,
              background:'rgba(14,14,28,0.7)',
              border:'1px solid rgba(255,255,255,0.07)',borderTopColor:'rgba(255,255,255,0.14)',
              boxShadow:'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.18em',color:FADE,marginBottom:4,
                fontFamily:'Space Grotesk,system-ui',textTransform:'uppercase'}}>{label}</div>
              <div style={{fontFamily:'Space Grotesk,system-ui',fontWeight:700,fontSize:18,
                color:accent,textShadow:`0 0 14px ${accent}99`,lineHeight:1}}>{value}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
