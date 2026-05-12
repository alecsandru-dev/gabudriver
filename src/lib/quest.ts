import { DailyMission, DailyQuest, getState, setState, todayString } from './storage'

const MISSION_POOL: Omit<DailyMission, 'completed'>[] = [
  { id: 'reaction', type: 'reaction', label: 'Joacă un joc de reacție ⚡' },
  { id: 'signs', type: 'signs', label: 'Memorează 5 semne 🚦' },
  { id: 'gearbox', type: 'gearbox', label: 'Încearcă cutia de viteze 🔧' },
  { id: 'calm', type: 'calm', label: 'O sesiune de respirație 🫁' },
  { id: 'scenario', type: 'scenario', label: 'Rezolvă 2 scenarii 🎭' },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function getOrCreateDailyQuest(): DailyQuest {
  const state = getState()
  const today = todayString()

  if (state.dailyQuest && state.dailyQuest.date === today) {
    return state.dailyQuest
  }

  const shuffled = shuffle(MISSION_POOL)
  const count = 3 + Math.floor(Math.random() * 2) // 3 or 4 missions
  const missions: DailyMission[] = shuffled.slice(0, count).map((m) => ({
    ...m,
    completed: false,
  }))

  const quest: DailyQuest = { date: today, missions }
  setState({ dailyQuest: quest })
  return quest
}

export function completeMission(missionType: string): DailyQuest | null {
  const state = getState()
  if (!state.dailyQuest) return null

  const updated: DailyQuest = {
    ...state.dailyQuest,
    missions: state.dailyQuest.missions.map((m) =>
      m.type === missionType ? { ...m, completed: true } : m
    ),
  }

  const allDone = updated.missions.every((m) => m.completed)
  if (allDone) {
    setState({
      dailyQuest: updated,
      questsCompleted: state.questsCompleted + 1,
    })
  } else {
    setState({ dailyQuest: updated })
  }

  return updated
}

export function isDailyQuestComplete(): boolean {
  const state = getState()
  if (!state.dailyQuest) return false
  return state.dailyQuest.missions.every((m) => m.completed)
}

export function getMoodFlow(mood: 'hard' | 'brave' | 'easy'): string[] {
  switch (mood) {
    case 'hard':
      return ['/calm', '/jocuri/semne', '/badges']
    case 'brave':
      return ['/jocuri/reactie', '/jocuri/viteze', '/jocuri/scenarii']
    case 'easy':
      return ['/jocuri/semne', '/jocuri/scenarii', '/badges']
    default:
      return ['/jocuri']
  }
}
