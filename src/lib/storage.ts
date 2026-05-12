const STORAGE_KEY = 'pisipilot_v1'

export interface DailyMission {
  id: string
  type: 'reaction' | 'signs' | 'gearbox' | 'calm' | 'scenario'
  label: string
  completed: boolean
}

export interface DailyQuest {
  date: string
  missions: DailyMission[]
}

export interface PraiseEntry {
  text: string
  source: string
  date: string
}

export interface AppState {
  installedAt: string
  lastPracticeDate: string | null
  streak: number
  totalDays: number
  xp: number

  reactionTimes: number[]
  reactionGamesPlayed: number

  signScores: Array<{ correct: number; total: number; date: string }>
  signGamesPlayed: number

  gearboxSuccesses: number
  gearboxStalls: number
  gearboxGamesPlayed: number

  calmSessions: number

  scenarioAnswers: Array<{ id: string; correct: boolean; date: string }>

  unlockedBadges: string[]

  praiseHistory: PraiseEntry[]

  dailyQuest: DailyQuest | null

  questsCompleted: number
  activitiesCompleted: string[]
}

const DEFAULT_STATE: AppState = {
  installedAt: '',
  lastPracticeDate: null,
  streak: 0,
  totalDays: 0,
  xp: 0,

  reactionTimes: [],
  reactionGamesPlayed: 0,

  signScores: [],
  signGamesPlayed: 0,

  gearboxSuccesses: 0,
  gearboxStalls: 0,
  gearboxGamesPlayed: 0,

  calmSessions: 0,

  scenarioAnswers: [],

  unlockedBadges: [],

  praiseHistory: [],

  dailyQuest: null,

  questsCompleted: 0,
  activitiesCompleted: [],
}

export function getState(): AppState {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_STATE, installedAt: new Date().toISOString() }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { ...DEFAULT_STATE, installedAt: new Date().toISOString() }
    }
    return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_STATE, installedAt: new Date().toISOString() }
  }
}

export function setState(updates: Partial<AppState>): AppState {
  const current = getState()
  const next: AppState = { ...current, ...updates }
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  return next
}

export function resetState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function clearPraiseHistory(): void {
  const state = getState()
  setState({ ...state, praiseHistory: [] })
}

export function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function updateStreakAndDate(): void {
  const state = getState()
  const today = todayString()

  if (state.lastPracticeDate === today) return

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  const newStreak =
    state.lastPracticeDate === yesterdayStr ? state.streak + 1 : 1
  const newTotalDays = state.totalDays + 1

  setState({
    lastPracticeDate: today,
    streak: newStreak,
    totalDays: newTotalDays,
  })
}

export function addXP(amount: number): void {
  const state = getState()
  setState({ xp: state.xp + amount })
}

export function addPraise(text: string, source: string): void {
  const state = getState()
  const entry: PraiseEntry = { text, source, date: new Date().toISOString() }
  const updated = [entry, ...state.praiseHistory].slice(0, 50)
  setState({ praiseHistory: updated })
}

export function markActivityComplete(id: string): void {
  const state = getState()
  if (!state.activitiesCompleted.includes(id)) {
    setState({ activitiesCompleted: [...state.activitiesCompleted, id] })
  }
}
