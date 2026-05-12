import { AppState } from './storage'

export interface Badge {
  id: string
  emoji: string
  name: string
  description: string
  hint: string
  color: string
}

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_tap',
    emoji: '👆',
    name: 'First Tap',
    description: 'Prima activitate completată!',
    hint: 'Completează orice activitate.',
    color: 'from-orange-400 to-amber-400',
  },
  {
    id: 'no_panic',
    emoji: '🫁',
    name: 'No Panic Today',
    description: 'Ai completat modul Calm.',
    hint: 'Completează o sesiune de respirație.',
    color: 'from-teal-400 to-cyan-400',
  },
  {
    id: 'reaction_rookie',
    emoji: '⚡',
    name: 'Reaction Rookie',
    description: 'Ai jucat Reaction Warm-up.',
    hint: 'Joacă jocul de reacție.',
    color: 'from-yellow-400 to-orange-400',
  },
  {
    id: 'cat_reflexes',
    emoji: '🐱',
    name: 'Reflexe de pisică',
    description: 'Reacție sub 400ms!',
    hint: 'Reacționează mai repede de 400ms.',
    color: 'from-pink-400 to-rose-400',
  },
  {
    id: 'first_stall',
    emoji: '💨',
    name: 'First Stall Survived',
    description: 'Ai supraviețuit primei calări.',
    hint: 'Calează în jocul cutiei de viteze.',
    color: 'from-slate-400 to-gray-500',
  },
  {
    id: 'ambreiaj_survivor',
    emoji: '🏆',
    name: 'Ambreiaj Survivor',
    description: 'Pornire lină reușită!',
    hint: 'Reușește o pornire lină.',
    color: 'from-violet-400 to-purple-500',
  },
  {
    id: 'smart_sign',
    emoji: '🚦',
    name: 'Semn deștept',
    description: 'Ai completat Sign Memory!',
    hint: 'Completează jocul de semne.',
    color: 'from-blue-400 to-indigo-400',
  },
  {
    id: 'priority_queen',
    emoji: '👑',
    name: 'Prioritate Queen',
    description: '3 scenarii corecte la rând!',
    hint: 'Răspunde corect la 3 scenarii.',
    color: 'from-amber-400 to-yellow-500',
  },
  {
    id: 'five_min_hero',
    emoji: '🎯',
    name: '5 Minute Hero',
    description: 'Misiunea zilei completată!',
    hint: 'Completează misiunea zilei.',
    color: 'from-emerald-400 to-green-500',
  },
  {
    id: 'streak_3',
    emoji: '🔥',
    name: '3 Days Streak',
    description: '3 zile la rând!',
    hint: 'Practică 3 zile consecutive.',
    color: 'from-red-400 to-orange-500',
  },
  {
    id: 'miau_master',
    emoji: '🌟',
    name: 'Miau Master',
    description: 'Ai deblocat 5 badge-uri!',
    hint: 'Deblochează 5 badge-uri.',
    color: 'from-fuchsia-400 to-pink-500',
  },
]

export function checkNewBadges(state: AppState): string[] {
  const already = new Set(state.unlockedBadges)
  const earned: string[] = []

  const earn = (id: string) => {
    if (!already.has(id)) earned.push(id)
  }

  // first_tap
  if (state.activitiesCompleted.length >= 1) earn('first_tap')

  // no_panic
  if (state.calmSessions >= 1) earn('no_panic')

  // reaction_rookie
  if (state.reactionGamesPlayed >= 1) earn('reaction_rookie')

  // cat_reflexes
  if (state.reactionTimes.some((t) => t < 400)) earn('cat_reflexes')

  // first_stall
  if (state.gearboxStalls >= 1) earn('first_stall')

  // ambreiaj_survivor
  if (state.gearboxSuccesses >= 1) earn('ambreiaj_survivor')

  // smart_sign
  if (state.signGamesPlayed >= 1) earn('smart_sign')

  // priority_queen
  const correctCount = state.scenarioAnswers.filter((a) => a.correct).length
  if (correctCount >= 3) earn('priority_queen')

  // five_min_hero
  if (state.questsCompleted >= 1) earn('five_min_hero')

  // streak_3
  if (state.streak >= 3) earn('streak_3')

  // miau_master
  const totalUnlocked = already.size + earned.length
  if (totalUnlocked >= 5) earn('miau_master')

  return earned
}

export function getBadgeById(id: string): Badge | undefined {
  return ALL_BADGES.find((b) => b.id === id)
}
