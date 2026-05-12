'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PisiPilotBubble } from '@/components/PisiPilotBubble'
import { PrimaryButton } from '@/components/PrimaryButton'
import { CompletionMoment } from '@/components/CompletionMoment'
import { SCENARIOS, Scenario } from '@/lib/scenarios'
import { getState, setState as saveState, addXP, addPraise, updateStreakAndDate } from '@/lib/storage'
import { checkNewBadges, getBadgeById } from '@/lib/badges'
import { completeMission } from '@/lib/quest'
import { getRandomPraise } from '@/lib/messages'
import { XP_REWARDS } from '@/lib/progress'
import { clsx } from 'clsx'

type Phase = 'reading' | 'choosing' | 'explanation' | 'done'

export default function ScenariiPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('reading')
  const [selected, setSelected] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)
  const [newBadgeNames, setNewBadgeNames] = useState<string[]>([])
  const [bubbleMsg, setBubbleMsg] = useState('Situații reale. Alege răspunsul care ți se pare corect. Nu există judecată aici.')

  useEffect(() => {
    const shuffled = [...SCENARIOS].sort(() => Math.random() - 0.5).slice(0, 4)
    setScenarios(shuffled)
  }, [])

  if (scenarios.length === 0) {
    return <div className="flex items-center justify-center h-64 text-pisi-muted text-sm">Se încarcă...</div>
  }

  const current = scenarios[index]

  function handleSelect(choiceId: string) {
    if (selected) return
    setSelected(choiceId)
    setPhase('explanation')

    const isCorrect = current.choices.find((c) => c.id === choiceId)?.isCorrect ?? false

    if (isCorrect) {
      setCorrectCount((n) => n + 1)
      setBubbleMsg(current.explanation)
    } else {
      setBubbleMsg('Aproape. ' + current.explanation)
    }

    const prevState = getState()
    const newAnswer = { id: current.id, correct: isCorrect, date: new Date().toISOString() }
    saveState({ ...prevState, scenarioAnswers: [...prevState.scenarioAnswers, newAnswer] })
    addXP(XP_REWARDS.scenario)
  }

  function handleNext() {
    if (index < scenarios.length - 1) {
      setIndex((i) => i + 1)
      setSelected(null)
      setPhase('reading')
      setBubbleMsg('Situație nouă. Fii atentă la detalii.')
    } else {
      finishGame()
    }
  }

  function finishGame() {
    const total = scenarios.length
    updateStreakAndDate()
    completeMission('scenario')
    addPraise(getRandomPraise(), 'Scenarii Mici')

    const freshState = getState()
    const newBadges = checkNewBadges(freshState)
    if (newBadges.length > 0) {
      saveState({ ...freshState, unlockedBadges: [...new Set([...freshState.unlockedBadges, ...newBadges])] })
      setNewBadgeNames(newBadges.map((id) => getBadgeById(id)?.name ?? id))
      setShowCompletion(true)
    }

    setPhase('done')
    setBubbleMsg(`${correctCount} din ${total} corecte. ${correctCount >= total * 0.75 ? 'Excelent! 🏆' : 'Bine! Practică mai mult.'}`)
  }

  function restart() {
    const shuffled = [...SCENARIOS].sort(() => Math.random() - 0.5).slice(0, 4)
    setScenarios(shuffled)
    setIndex(0)
    setPhase('reading')
    setSelected(null)
    setCorrectCount(0)
    setNewBadgeNames([])
    setBubbleMsg('Situații reale. Alege răspunsul care ți se pare corect.')
  }

  return (
    <div className="px-4 space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
        <h1 className="text-xl font-bold text-pisi-text">Scenarii Mici 🎭</h1>
        <p className="text-sm text-pisi-muted mt-0.5">
          {phase !== 'done' ? `Scenariul ${index + 1} din ${scenarios.length}` : 'Sesiune completă!'}
        </p>
      </motion.div>

      <PisiPilotBubble message={bubbleMsg} mood={phase === 'explanation' ? 'thinking' : 'happy'} />

      {/* Progress */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full gradient-primary"
          animate={{ width: `${((index + (phase === 'done' ? 1 : 0)) / scenarios.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {phase !== 'done' && (
          <motion.div
            key={`scenario-${index}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-4"
          >
            {/* Scenario card */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{current.emoji}</span>
                <h2 className="font-bold text-pisi-text">{current.title}</h2>
              </div>
              <p className="text-sm text-pisi-text leading-relaxed bg-gray-50 rounded-2xl p-4">
                {current.story}
              </p>
            </div>

            {/* Choices */}
            <div className="space-y-3">
              {current.choices.map((choice) => {
                const isSelected = selected === choice.id
                const showResult = phase === 'explanation'
                const isCorrectChoice = choice.isCorrect

                let bg = 'bg-white border-pisi-border'
                if (showResult && isSelected && isCorrectChoice) bg = 'bg-emerald-50 border-emerald-400'
                else if (showResult && isSelected && !isCorrectChoice) bg = 'bg-red-50 border-red-300'
                else if (showResult && isCorrectChoice) bg = 'bg-emerald-50 border-emerald-200'

                return (
                  <motion.button
                    key={choice.id}
                    whileTap={selected ? {} : { scale: 0.98 }}
                    onClick={() => handleSelect(choice.id)}
                    disabled={!!selected}
                    className={clsx(
                      'w-full text-left card border-2 p-4 tap-target transition-colors',
                      bg,
                      choice.isFunny && !selected && 'border-purple-100 bg-purple-50/40'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className={clsx(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
                        showResult && isCorrectChoice
                          ? 'bg-emerald-500 text-white'
                          : showResult && isSelected
                          ? 'bg-red-400 text-white'
                          : 'bg-gray-100 text-gray-600'
                      )}>
                        {choice.id.toUpperCase()}
                      </span>
                      <p className={clsx('text-sm leading-relaxed', choice.isFunny ? 'italic text-purple-700' : 'text-pisi-text')}>
                        {choice.text}
                        {choice.isFunny && <span className="text-purple-400"> 😄</span>}
                      </p>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Explanation + next button */}
            {phase === 'explanation' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="card p-4 bg-blue-50 border-blue-100">
                  <p className="text-xs font-bold text-blue-600 mb-1">📖 Explicație</p>
                  <p className="text-sm text-blue-800 leading-relaxed">{current.explanation}</p>
                </div>
                <PrimaryButton onClick={handleNext} fullWidth>
                  {index < scenarios.length - 1 ? 'Scenariul următor →' : 'Finalizează! 🎉'}
                </PrimaryButton>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-6 text-center space-y-4"
          >
            <div className="text-5xl">🎭</div>
            <p className="text-2xl font-bold text-pisi-text">{correctCount} / {scenarios.length}</p>
            <p className="text-sm text-pisi-muted">
              {correctCount === scenarios.length
                ? 'Toate corecte! Ești gata pentru situații reale.'
                : correctCount >= scenarios.length * 0.75
                ? 'Foarte bine! Continuă să exersezi.'
                : 'Practică mai mult. Fiecare greșeală e gratuită.'}
            </p>
            <PrimaryButton onClick={restart} fullWidth variant="ghost">
              Scenarii noi 🔄
            </PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>

      <CompletionMoment
        show={showCompletion}
        title="Scenarii complete!"
        message={getRandomPraise()}
        emoji="🎭"
        onContinue={() => setShowCompletion(false)}
        newBadges={newBadgeNames}
      />
    </div>
  )
}
