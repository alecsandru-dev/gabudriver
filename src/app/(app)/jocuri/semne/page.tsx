'use client'
import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { PisiPilotBubble } from '@/components/PisiPilotBubble'
import { GlassCard } from '@/components/GlassCard'
import { PrimaryButton } from '@/components/PrimaryButton'
import { CompletionMoment } from '@/components/CompletionMoment'
import { SIGNS_BANK, shuffleSignDeck, buildAnswers, SignEntry } from '@/lib/signs-bank'
import { getState, setState as saveState, addXP, addPraise, updateStreakAndDate } from '@/lib/storage'
import { checkNewBadges, getBadgeById } from '@/lib/badges'
import { completeMission } from '@/lib/quest'
import { getRandomPraise } from '@/lib/messages'
import { XP_REWARDS } from '@/lib/progress'

const BLUE   = '#4B7FFF'
const LIME   = '#A8FF1E'
const PINK   = '#FF2A8A'
const CYAN   = '#00C8FF'
const INK    = '#F2F0FF'
const SOFT   = '#C8C6E0'
const FADE   = '#4C4C68'
const MUTE   = '#9090A8'

const DECK_SIZE = 10

// AnswerRow — exact from pisi-screens-c.jsx AnswerRow
function AnswerRow({
  letter, text, state, onClick,
}: { letter: string; text: string; state: 'idle'|'correct'|'wrong'|'dim'; onClick?: () => void }) {
  const accent =
    state === 'correct' ? LIME :
    state === 'wrong'   ? PINK : null
  const dim = state === 'dim'

  return (
    <motion.div
      whileTap={state === 'idle' && onClick ? { scale: 0.98 } : undefined}
      onClick={state === 'idle' ? onClick : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', borderRadius: 16, cursor: state === 'idle' ? 'pointer' : 'default',
        background: accent ? `${accent}12` : 'rgba(14,14,28,0.65)',
        border: `1px solid ${accent ? accent + '66' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: accent
          ? `0 0 16px ${accent}33, inset 0 1px 0 ${accent}33`
          : 'inset 0 1px 0 rgba(255,255,255,0.04)',
        opacity: dim ? 0.45 : 1,
        transition: 'all 0.2s',
        minHeight: 52,
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        background: accent ? `${accent}25` : 'rgba(255,255,255,0.05)',
        border: `1px solid ${accent ? accent + 'aa' : 'rgba(255,255,255,0.10)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Space Grotesk, system-ui', fontWeight: 800, fontSize: 12,
        color: accent || MUTE,
        textShadow: accent ? `0 0 6px ${accent}` : 'none',
      }}>{letter}</div>
      <div style={{ flex: 1, fontSize: 13, color: INK, lineHeight: 1.3 }}>{text}</div>
      {state === 'correct' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <path d="M5 12l4 4 10-10" stroke={LIME} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {state === 'wrong' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <path d="M6 6l12 12M18 6L6 18" stroke={PINK} strokeWidth="2.4" strokeLinecap="round"/>
        </svg>
      )}
    </motion.div>
  )
}

// Category chip color
function catColor(cat: string): string {
  switch (cat) {
    case 'Prioritate':  return '#FFD700'
    case 'Avertizare':  return '#FF6B1A'
    case 'Restricție':  return '#FF2A8A'
    case 'Obligare':    return '#00C8FF'
    case 'Informare':   return '#4B7FFF'
    default: return BLUE
  }
}

export default function SemnePage() {
  const [deck, setDeck]       = useState<SignEntry[]>([])
  const [idx, setIdx]         = useState(0)
  const [picked, setPicked]   = useState<number | null>(null)
  const [score, setScore]     = useState(0)
  const [finished, setFinished] = useState(false)
  const [showComp, setShowComp] = useState(false)
  const [newBadge, setNewBadge] = useState<string[]>([])

  useEffect(() => { setDeck(shuffleSignDeck(DECK_SIZE)) }, [])

  const sign    = deck[idx] ?? null
  const answers = useMemo(() => sign ? buildAnswers(sign, idx) : [], [sign, idx])

  function pick(i: number) {
    if (picked !== null || !sign) return
    setPicked(i)
    if (answers[i].correct) setScore(s => s + 1)

    const prev = getState()
    const isOk = answers[i].correct
    const entry = { id: `semne_${Date.now()}`, correct: isOk, date: new Date().toISOString() }
    saveState({ ...prev, scenarioAnswers: [...prev.scenarioAnswers, entry] })
    addXP(isOk ? 4 : 1)
  }

  function next() {
    if (idx + 1 >= deck.length) {
      setFinished(true)
      updateStreakAndDate(); addXP(XP_REWARDS.signs); completeMission('signs')
      addPraise(getRandomPraise(), 'Sign Memory')
      const prev = getState()
      const updated = { ...prev, signGamesPlayed: prev.signGamesPlayed + 1,
        signScores: [...prev.signScores, { correct: score + (picked !== null && answers[picked ?? 0]?.correct ? 1 : 0), total: deck.length, date: new Date().toISOString() }],
        activitiesCompleted: [...new Set([...prev.activitiesCompleted, 'signs'])] }
      saveState(updated)
      const nb = checkNewBadges(getState())
      if (nb.length) {
        const f = getState()
        saveState({ ...f, unlockedBadges: [...new Set([...f.unlockedBadges, ...nb])] })
        setNewBadge(nb.map(id => getBadgeById(id)?.name ?? id))
        setShowComp(true)
      }
    } else {
      setIdx(i => i + 1)
      setPicked(null)
    }
  }

  function restart() {
    setDeck(shuffleSignDeck(DECK_SIZE))
    setIdx(0); setPicked(null); setScore(0); setFinished(false)
    setNewBadge([])
  }

  // Loading
  if (deck.length === 0) {
    return (
      <div style={{ padding:'6px 14px 16px' }}>
        <div style={{ fontFamily:'Space Grotesk,system-ui', fontWeight:700, fontSize:22, color:INK }}>Semne</div>
        <div style={{ fontSize:12, color:FADE, marginTop:1 }}>Se încarcă...</div>
      </div>
    )
  }

  // ── End-of-deck summary ───────────────────────────────────────
  if (finished) {
    const finalScore = score
    const pct = Math.round((finalScore / deck.length) * 100)
    const mood = pct >= 80 ? 'proud' : pct >= 50 ? 'happy' : 'thinking'
    const accent = pct >= 80 ? LIME : pct >= 50 ? CYAN : PINK

    return (
      <div style={{ padding:'6px 14px 16px', display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ padding:'2px 2px 0' }}>
          <div style={{ fontFamily:'Space Grotesk,system-ui', fontWeight:700, fontSize:22, color:INK }}>Semne</div>
          <div style={{ fontSize:12, color:FADE, marginTop:1 }}>Rundă încheiată</div>
        </div>
        <PisiPilotBubble mood={mood} avatarSize={56}
          message={pct >= 80 ? `${pct}%! Aproape perfect, Gabu. 🦁` :
                   pct >= 50 ? `${pct}%. Drum bun. Mai exersează semnele dificile.` :
                               `${pct}%. E ok să greșim. Hai încă o rundă?`}
        />
        <GlassCard accent={accent} padding={20} style={{ borderRadius:22, textAlign:'center' }}>
          <div style={{
            fontFamily:'Space Grotesk,system-ui', fontWeight:800, fontSize:56,
            color:accent, textShadow:`0 0 24px ${accent}aa`, lineHeight:1,
          }}>
            {finalScore}<span style={{ opacity:0.4, fontSize:28 }}>/{deck.length}</span>
          </div>
          <div style={{ fontSize:11, letterSpacing:'0.2em', color:FADE, fontWeight:700, marginTop:6,
            fontFamily:'Space Grotesk,system-ui' }}>
            RĂSPUNSURI CORECTE
          </div>
        </GlassCard>
        <PrimaryButton fullWidth variant="blue" onClick={restart}>O rundă nouă 🔄</PrimaryButton>
        <CompletionMoment show={showComp} title="Semne memorate!" message={getRandomPraise()}
          emoji="🚦" variant="perfect" onContinue={() => setShowComp(false)} newBadges={newBadge}/>
      </div>
    )
  }

  if (!sign) return null

  const cc = catColor(sign.cat)

  // ── Quiz screen ───────────────────────────────────────────────
  return (
    <div style={{ padding:'6px 14px 16px', display:'flex', flexDirection:'column', gap:14 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'2px 2px 0' }}>
        <div>
          <div style={{ fontFamily:'Space Grotesk,system-ui', fontWeight:700, fontSize:22, color:INK }}>Semne</div>
          <div style={{ fontSize:12, color:FADE, marginTop:1 }}>Recunoaște și răspunde</div>
        </div>
        <div style={{
          padding:'6px 12px', borderRadius:999, fontFamily:'Space Grotesk', fontWeight:700, fontSize:12,
          color:BLUE, background:`${BLUE}15`, border:`1px solid ${BLUE}55`, textShadow:`0 0 8px ${BLUE}`,
        }}>
          {score} · {idx + 1}/{deck.length}
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ display:'flex', gap:4, justifyContent:'center', flexWrap:'wrap' }}>
        {deck.map((_,i) => (
          <div key={i} style={{
            width:20, height:5, borderRadius:999,
            background: i < idx ? LIME : i === idx ? BLUE : 'rgba(255,255,255,0.10)',
            boxShadow: i === idx ? `0 0 8px ${BLUE}aa` : 'none',
            transition:'all 0.2s',
          }}/>
        ))}
      </div>

      {/* Category chip */}
      <div style={{ display:'flex', justifyContent:'center' }}>
        <span style={{
          padding:'4px 12px', borderRadius:999, fontFamily:'Space Grotesk,system-ui',
          fontWeight:700, fontSize:10.5, letterSpacing:'0.06em', textTransform:'uppercase',
          background:`${cc}15`, border:`1px solid ${cc}55`, color:cc, textShadow:`0 0 8px ${cc}80`,
        }}>
          {sign.cat}
        </span>
      </div>

      {/* Sign image card */}
      <AnimatePresence mode="wait">
        <motion.div key={`sign-${idx}`} initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-30 }}
          transition={{ duration:0.3, ease:[0.16,1,0.3,1] }}>
          <GlassCard accent={BLUE} padding={20} style={{ borderRadius:26 }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
              <div style={{
                padding:10, borderRadius:14, background:'#0a0a14',
                boxShadow:`0 12px 32px rgba(0,0,0,0.6), 0 0 24px ${BLUE}22, inset 0 1px 0 rgba(255,255,255,0.10)`,
                border:'1px solid rgba(255,255,255,0.08)',
              }}>
                <Image
                  src={sign.img}
                  alt={sign.name}
                  width={164}
                  height={164}
                  style={{ display:'block', borderRadius:8, objectFit:'contain', background:'#fff' }}
                  unoptimized
                />
              </div>
            </div>
            <div style={{ textAlign:'center', fontSize:12, color:FADE }}>
              Ce semnifică acest indicator?
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* Answers */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {answers.map((a, i) => {
          let state: 'idle'|'correct'|'wrong'|'dim' = 'idle'
          if (picked !== null) {
            if (a.correct) state = 'correct'
            else if (i === picked) state = 'wrong'
            else state = 'dim'
          }
          return (
            <AnswerRow key={i} letter={'ABCD'[i]} text={a.text} state={state}
              onClick={() => pick(i)}/>
          )
        })}
      </div>

      {/* Feedback + next */}
      {picked !== null && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
          <GlassCard
            accent={answers[picked].correct ? LIME : PINK}
            padding={14} style={{ borderRadius:18 }}
          >
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <span style={{
                fontSize:11, fontWeight:800, letterSpacing:'0.12em',
                color: answers[picked].correct ? LIME : PINK,
                textShadow:`0 0 10px ${answers[picked].correct ? LIME : PINK}99`,
                fontFamily:'Space Grotesk,system-ui',
              }}>
                {answers[picked].correct ? '✓ CORECT' : '✗ GREȘIT'}
              </span>
              <span style={{ marginLeft:'auto', fontSize:11, color:FADE, fontFamily:'Space Grotesk', fontWeight:700 }}>
                {sign.name}
              </span>
            </div>
            <div style={{ fontSize:12.5, color:INK, lineHeight:1.45, marginBottom:12 }}>
              {sign.why}
            </div>
            <PrimaryButton fullWidth variant="blue" onClick={next}>
              {idx + 1 >= deck.length ? 'Vezi scorul →' : 'Următorul semn →'}
            </PrimaryButton>
          </GlassCard>
        </motion.div>
      )}

      <PisiPilotBubble
        mood={picked === null ? 'thinking' : answers[picked ?? 0]?.correct ? 'excited' : 'calm'}
        message={picked === null
          ? 'Uită-te cu atenție la indicatorul de mai sus. Alege cel mai corect răspuns.'
          : answers[picked ?? 0]?.correct
          ? 'Corect! Reții repede, Gabu.'
          : 'Aproape. ' + sign.why}
        compact
        avatarSize={44}
      />
    </div>
  )
}
