import { AppState } from './storage'

export interface Level {
  level: number
  name: string
  emoji: string
  minXP: number
  maxXP: number
  color: string
}

export const LEVELS: Level[] = [
  { level: 1, name: 'Pieton cu vise', emoji: '🚶', minXP: 0, maxXP: 49, color: 'from-gray-400 to-gray-500' },
  { level: 2, name: 'Copilot curios', emoji: '👀', minXP: 50, maxXP: 149, color: 'from-blue-400 to-cyan-400' },
  { level: 3, name: 'Începătoare curajoasă', emoji: '💪', minXP: 150, maxXP: 299, color: 'from-emerald-400 to-teal-400' },
  { level: 4, name: 'Ambreiaj Survivor', emoji: '🔧', minXP: 300, maxXP: 499, color: 'from-amber-400 to-orange-400' },
  { level: 5, name: 'Prioritate Queen', emoji: '👑', minXP: 500, maxXP: 749, color: 'from-pink-400 to-rose-400' },
  { level: 6, name: 'Calm Driver Mode', emoji: '🧘', minXP: 750, maxXP: 999, color: 'from-violet-400 to-purple-400' },
  { level: 7, name: 'Șoferiță aproape oficială', emoji: '🏁', minXP: 1000, maxXP: 99999, color: 'from-orange-400 to-pink-500' },
]

export function getCurrentLevel(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i]
  }
  return LEVELS[0]
}

export function getLevelProgress(xp: number): number {
  const level = getCurrentLevel(xp)
  const range = level.maxXP - level.minXP
  const progress = xp - level.minXP
  if (range <= 0) return 100
  return Math.min(100, Math.round((progress / range) * 100))
}

export function getNextLevel(xp: number): Level | null {
  const current = getCurrentLevel(xp)
  const next = LEVELS.find((l) => l.level === current.level + 1)
  return next ?? null
}

export function getBestReactionTime(state: AppState): number | null {
  if (state.reactionTimes.length === 0) return null
  return Math.min(...state.reactionTimes)
}

export function getAverageReactionTime(state: AppState): number | null {
  if (state.reactionTimes.length === 0) return null
  const sum = state.reactionTimes.reduce((a, b) => a + b, 0)
  return Math.round(sum / state.reactionTimes.length)
}

export function getBestSignScore(state: AppState): number | null {
  if (state.signScores.length === 0) return null
  return Math.max(...state.signScores.map((s) => Math.round((s.correct / s.total) * 100)))
}

export function getTotalCorrectScenarios(state: AppState): number {
  return state.scenarioAnswers.filter((a) => a.correct).length
}

export const XP_REWARDS: Record<string, number> = {
  reaction: 15,
  signs: 20,
  gearbox: 15,
  calm: 25,
  scenario: 10,
  quest: 30,
}
