'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PisiPilotBubble } from '@/components/PisiPilotBubble'
import { PrimaryButton } from '@/components/PrimaryButton'
import { CompletionMoment } from '@/components/CompletionMoment'
import { SIGNS, RoadSign, getRandomSignQuiz } from '@/lib/signs'
import { getState, setState as saveState, addXP, addPraise, updateStreakAndDate } from '@/lib/storage'
import { checkNewBadges, getBadgeById } from '@/lib/badges'
import { completeMission } from '@/lib/quest'
import { getRandomPraise } from '@/lib/messages'
import { XP_REWARDS } from '@/lib/progress'
import { clsx } from 'clsx'

type Phase = 'memorize' | 'quiz' | 'done'

function SignDisplay({ sign }: { sign: RoadSign }) {
  return (
    <div className="w-28 h-28 mx-auto flex items-center justify-center">
      {sign.shape === 'octagon' && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <polygon points="29,5 71,5 95,29 95,71 71,95 29,95 5,71 5,29" fill={sign.bgColor} stroke={sign.borderColor} strokeWidth="4" />
          <text x="50" y="63" textAnchor="middle" fill={sign.textColor} fontSize="19" fontWeight="bold" fontFamily="system-ui">{sign.symbol}</text>
        </svg>
      )}
      {sign.shape === 'triangle-down' && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <polygon points="5,5 95,5 50,90" fill={sign.bgColor} stroke={sign.borderColor} strokeWidth="6" />
          <polygon points="20,15 80,15 50,72" fill="none" stroke={sign.borderColor} strokeWidth="3" />
        </svg>
      )}
      {sign.shape === 'triangle-up' && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <polygon points="50,5 95,90 5,90" fill={sign.bgColor} stroke={sign.borderColor} strokeWidth="6" />
          <text x="50" y="78" textAnchor="middle" fontSize="26" fontFamily="system-ui">{sign.symbol}</text>
        </svg>
      )}
      {sign.shape === 'circle' && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <circle cx="50" cy="50" r="44" fill={sign.bgColor} stroke={sign.borderColor} strokeWidth="8" />
          {sign.symbol === '—' ? (
            <rect x="18" y="44" width="64" height="12" fill={sign.textColor} rx="4" />
          ) : sign.symbol === '⊘' ? (
            <>
              <circle cx="50" cy="50" r="25" fill="none" stroke={sign.textColor} strokeWidth="4" />
              <line x1="30" y1="30" x2="70" y2="70" stroke={sign.textColor} strokeWidth="5" strokeLinecap="round" />
            </>
          ) : sign.symbol === '✕' ? (
            <>
              <line x1="30" y1="30" x2="70" y2="70" stroke={sign.textColor} strokeWidth="7" strokeLinecap="round" />
              <line x1="70" y1="30" x2="30" y2="70" stroke={sign.textColor} strokeWidth="7" strokeLinecap="round" />
            </>
          ) : (
            <text x="50" y="62" textAnchor="middle" fill={sign.textColor} fontSize={sign.symbol.length > 1 ? '26' : '34'} fontWeight="bold" fontFamily="system-ui">{sign.symbol}</text>
          )}
        </svg>
      )}
      {sign.shape === 'diamond' && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <polygon points="50,5 95,50 50,95 5,50" fill={sign.bgColor} stroke={sign.borderColor} strokeWidth="4" />
          <polygon points="50,18 82,50 50,82 18,50" fill="none" stroke={sign.borderColor} strokeWidth="2" />
        </svg>
      )}
      {sign.shape === 'rectangle' && (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <rect x="8" y="8" width="84" height="84" rx="8" fill={sign.bgColor} stroke={sign.borderColor} strokeWidth="4" />
          <text x="50" y="66" textAnchor="middle" fill={sign.textColor} fontSize="42" fontWeight="bold" fontFamily="system-ui">{sign.symbol}</text>
        </svg>
      )}
    </div>
  )
}

const STUDY_COUNT = 5

export default function SemnePage() {
  const [phase, setPhase]         = useState<Phase>('memorize')
  const [studyIdx, setStudyIdx]   = useState(0)
  const [studySigns, setStudySigns] = useState<RoadSign[]>([])
  const [quizSigns, setQuizSigns] = useState<RoadSign[]>([])
  const [quizIdx, setQuizIdx]     = useState(0)
  const [options, setOptions]     = useState<RoadSign[]>([])
  const [selected, setSelected]   = useState<string | null>(null)
  const [correct, setCorrect]     = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)
  const [newBadgeNames, setNewBadgeNames] = useState<string[]>([])
  const [bubbleMsg, setBubbleMsg] = useState('Uite 5 semne de circulație. Urmărește-le cu atenție — vei fi "testată" ușor după.')

  useEffect(() => {
    const shuffled = [...SIGNS].sort(() => Math.random() - 0.5).slice(0, STUDY_COUNT)
    setStudySigns(shuffled)
    setQuizSigns([...shuffled].sort(() => Math.random() - 0.5))
  }, [])

  useEffect(() => {
    if (phase === 'quiz' && quizSigns.length > 0) {
      setOptions(getRandomSignQuiz(quizSigns[quizIdx], SIGNS))
      setSelected(null)
    }
  }, [phase, quizIdx, quizSigns])

  function nextStudy() {
    if (studyIdx < studySigns.length - 1) { setStudyIdx(studyIdx + 1) }
    else { setPhase('quiz'); setBubbleMsg('Ce semn ai văzut? Alege cu atenție.') }
  }

  function handleAnswer(signId: string) {
    if (selected) return
    setSelected(signId)
    const cur = quizSigns[quizIdx]
    const isOk = signId === cur.id
    if (isOk) { setCorrect((c) => c + 1); setBubbleMsg('Corect! 🎉 ' + cur.tip) }
    else setBubbleMsg('Aproape. ' + cur.description)
  }

  function nextQ() {
    if (quizIdx < quizSigns.length - 1) { setQuizIdx((i) => i + 1) }
    else finishGame()
  }

  function finishGame() {
    const total = quizSigns.length
    const score = correct + (selected === quizSigns[quizIdx]?.id ? 1 : 0)
    const prev  = getState()
    saveState({ ...prev, signScores: [...prev.signScores, { correct: score, total, date: new Date().toISOString() }], signGamesPlayed: prev.signGamesPlayed + 1, activitiesCompleted: [...new Set([...prev.activitiesCompleted, 'signs'])] })
    updateStreakAndDate(); addXP(XP_REWARDS.signs); completeMission('signs'); addPraise(getRandomPraise(), 'Sign Memory')
    const nb = checkNewBadges(getState())
    if (nb.length) { const f = getState(); saveState({ ...f, unlockedBadges: [...new Set([...f.unlockedBadges, ...nb])] }); setNewBadgeNames(nb.map(id => getBadgeById(id)?.name ?? id)) }
    setPhase('done')
    setBubbleMsg(`${score} din ${total} corecte. ${score >= 4 ? 'Impresionant! 🏆' : score >= 3 ? 'Bine! 👏' : 'Repetând, devine reflex.'}`)
  }

  function restart() {
    const s = [...SIGNS].sort(() => Math.random() - 0.5).slice(0, STUDY_COUNT)
    setStudySigns(s); setQuizSigns([...s].sort(() => Math.random() - 0.5))
    setStudyIdx(0); setQuizIdx(0); setCorrect(0); setSelected(null); setPhase('memorize')
    setBubbleMsg('Uite 5 semne de circulație.')
  }

  const curQuiz = phase === 'quiz' ? quizSigns[quizIdx] : null

  return (
    <div className="px-4 space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
        <h1 className="font-display text-xl font-bold" style={{ color: '#F2F0FF' }}>Sign Memory 🚦</h1>
        <p className="text-sm mt-0.5" style={{ color: '#4C4C68' }}>
          {phase === 'memorize' ? `Semn ${studyIdx + 1}/${studySigns.length}` : phase === 'quiz' ? `Întrebarea ${quizIdx + 1}/${quizSigns.length}` : 'Sesiune completă!'}
        </p>
      </motion.div>

      <PisiPilotBubble message={bubbleMsg} mood={phase === 'done' ? 'excited' : 'thinking'} />

      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg,#4B7FFF,#00C8FF)', boxShadow: '0 0 8px rgba(0,200,255,0.5)' }}
          animate={{ width: phase === 'memorize' ? `${((studyIdx + 1) / studySigns.length) * 50}%` : phase === 'quiz' ? `${50 + ((quizIdx + 1) / quizSigns.length) * 50}%` : '100%' }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {phase === 'memorize' && studySigns.length > 0 && (
          <motion.div key={`study-${studyIdx}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="card p-6 space-y-5"
            style={{ border: '1px solid rgba(75,127,255,0.3)', boxShadow: 'var(--glass-shadow), 0 0 40px rgba(75,127,255,0.08)' }}
          >
            <SignDisplay sign={studySigns[studyIdx]} />
            <div className="text-center">
              <h2 className="font-display font-bold text-lg" style={{ color: '#F2F0FF' }}>{studySigns[studyIdx].name}</h2>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: '#9090A8' }}>{studySigns[studyIdx].description}</p>
            </div>
            <PrimaryButton onClick={nextStudy} fullWidth variant="blue">
              {studyIdx < studySigns.length - 1 ? 'Semnul următor →' : 'Start quiz! 🧠'}
            </PrimaryButton>
          </motion.div>
        )}

        {phase === 'quiz' && curQuiz && (
          <motion.div key={`quiz-${quizIdx}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
            <div className="card p-5" style={{ border: '1px solid rgba(0,200,255,0.2)' }}>
              <p className="text-center text-sm font-semibold mb-4" style={{ color: '#4C4C68' }}>Ce semn este acesta?</p>
              <SignDisplay sign={curQuiz} />
            </div>

            <div className="flex flex-col gap-2.5">
              {options.map((opt, idx) => {
                const isSelected  = selected === opt.id
                const isCorrectOpt = opt.id === curQuiz.id
                const labels = ['A', 'B', 'C', 'D']
                let bg = 'rgba(255,255,255,0.04)'
                let border = 'rgba(255,255,255,0.08)'
                let labelBg = 'rgba(255,255,255,0.08)'
                let labelColor = '#4C4C68'
                let icon = ''
                if (isSelected && isCorrectOpt)  { bg = 'rgba(168,255,30,0.08)';  border = 'rgba(168,255,30,0.4)';  labelBg = '#A8FF1E'; labelColor = '#0a1200'; icon = '✓' }
                else if (isSelected)              { bg = 'rgba(255,42,138,0.08)';  border = 'rgba(255,42,138,0.4)'; labelBg = '#FF2A8A'; labelColor = '#fff'; icon = '✕' }
                else if (selected && isCorrectOpt){ bg = 'rgba(168,255,30,0.06)';  border = 'rgba(168,255,30,0.3)'; labelBg = '#A8FF1E'; labelColor = '#0a1200'; icon = '✓' }

                return (
                  <motion.button key={opt.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.07 }}
                    whileTap={selected ? {} : { scale: 0.98 }}
                    onClick={() => handleAnswer(opt.id)}
                    className="w-full text-left rounded-2xl p-4 flex items-center gap-3 tap-target"
                    style={{ background: bg, border: `1px solid ${border}`, transition: 'all 0.2s' }}
                  >
                    <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: labelBg, color: labelColor }}>
                      {icon || labels[idx]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-snug" style={{ color: '#F2F0FF' }}>{opt.name}</p>
                      <p className="text-xs mt-0.5 leading-tight" style={{ color: '#4C4C68' }}>{opt.description}</p>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {selected && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <PrimaryButton onClick={nextQ} fullWidth variant={quizIdx < quizSigns.length - 1 ? 'cyan' : 'lime'}>
                  {quizIdx < quizSigns.length - 1 ? 'Următorul →' : 'Finalizează! 🎉'}
                </PrimaryButton>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card p-6 text-center space-y-4"
            style={{ border: '1px solid rgba(168,255,30,0.4)', boxShadow: 'var(--glass-shadow), 0 0 40px rgba(168,255,30,0.1)' }}
          >
            <div className="text-5xl">🎉</div>
            <p className="font-display font-bold text-2xl" style={{ color: '#A8FF1E' }}>{correct} / {quizSigns.length}</p>
            <p className="text-sm" style={{ color: '#9090A8' }}>
              {correct === quizSigns.length ? 'Perfect! Toate corecte!' : correct >= quizSigns.length * 0.6 ? 'Bine! Continuă să exersezi.' : 'Practică mai mult — devine reflex.'}
            </p>
            <PrimaryButton onClick={restart} fullWidth variant="ghost">Joacă din nou 🔄</PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>

      <CompletionMoment show={showCompletion} title="Semne memorate!" message={getRandomPraise()} emoji="🚦" variant="perfect" onContinue={() => setShowCompletion(false)} newBadges={newBadgeNames} />
    </div>
  )
}
