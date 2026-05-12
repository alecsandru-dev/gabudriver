export interface RoadSign {
  id: string
  name: string
  description: string
  tip: string
  shape: 'octagon' | 'triangle-down' | 'circle' | 'diamond' | 'rectangle' | 'triangle-up'
  bgColor: string
  borderColor: string
  textColor: string
  symbol: string
  category: 'priority' | 'prohibitory' | 'mandatory' | 'informational' | 'warning'
}

export const SIGNS: RoadSign[] = [
  {
    id: 'cedeza',
    name: 'Cedează trecerea',
    description: 'Trebuie să cedezi trecerea vehiculelor de pe drumul principal.',
    tip: 'Frânezi, te uiți, lași să treacă, apoi mergi.',
    shape: 'triangle-down',
    bgColor: '#FFFFFF',
    borderColor: '#CC0000',
    textColor: '#CC0000',
    symbol: '▽',
    category: 'priority',
  },
  {
    id: 'stop',
    name: 'STOP',
    description: 'Oprire obligatorie completă, chiar dacă nu vine nimeni.',
    tip: 'Complet oprit. Calculele tale sunt mai lente decât mașinile la intersecție.',
    shape: 'octagon',
    bgColor: '#CC0000',
    borderColor: '#990000',
    textColor: '#FFFFFF',
    symbol: 'STOP',
    category: 'priority',
  },
  {
    id: 'trecere_pietoni',
    name: 'Trecere pentru pietoni',
    description: 'Semnalizează o trecere de pietoni. Acordă prioritate pietonilor.',
    tip: 'Dacă un pieton e acolo sau se apropie, te oprești și lași să treacă.',
    shape: 'triangle-up',
    bgColor: '#FFFFFF',
    borderColor: '#CC0000',
    textColor: '#1A1A1A',
    symbol: '🚶',
    category: 'warning',
  },
  {
    id: 'sens_giratoriu',
    name: 'Sens giratoriu',
    description: 'Intersecție circulară. Vehiculele din interior au prioritate.',
    tip: 'Înainte să intri, cedezi trecerea celor deja în giratoriu.',
    shape: 'circle',
    bgColor: '#003399',
    borderColor: '#FFFFFF',
    textColor: '#FFFFFF',
    symbol: '↺',
    category: 'mandatory',
  },
  {
    id: 'drum_prioritate',
    name: 'Drum cu prioritate',
    description: 'Ești pe drumul cu prioritate față de toate intersecțiile.',
    tip: 'Ai prioritate la intersecții, dar nu-ți pierde atenția!',
    shape: 'diamond',
    bgColor: '#FFD700',
    borderColor: '#FFFFFF',
    textColor: '#1A1A1A',
    symbol: '◆',
    category: 'priority',
  },
  {
    id: 'depasire_interzisa',
    name: 'Depășirea interzisă',
    description: 'Nu ai voie să depășești vehicule în această zonă.',
    tip: 'Stai în spatele mașinii din față și fii răbdătoare.',
    shape: 'circle',
    bgColor: '#FFFFFF',
    borderColor: '#CC0000',
    textColor: '#1A1A1A',
    symbol: '⊘',
    category: 'prohibitory',
  },
  {
    id: 'acces_interzis',
    name: 'Acces interzis',
    description: 'Intrarea pe acel drum este interzisă.',
    tip: 'Dacă mergi înainte, înseamnă că ai pornit greșit. Înapoi!',
    shape: 'circle',
    bgColor: '#CC0000',
    borderColor: '#990000',
    textColor: '#FFFFFF',
    symbol: '—',
    category: 'prohibitory',
  },
  {
    id: 'limita_viteza',
    name: 'Limitare de viteză 50',
    description: 'Viteza maximă admisă este de 50 km/h.',
    tip: 'Dacă scrie 50, mergi max 50. Contoarul e acolo dintr-un motiv.',
    shape: 'circle',
    bgColor: '#FFFFFF',
    borderColor: '#CC0000',
    textColor: '#1A1A1A',
    symbol: '50',
    category: 'prohibitory',
  },
  {
    id: 'parcare',
    name: 'Parcare',
    description: 'Loc de parcare autorizat.',
    tip: 'P înseamnă poți parca. Fără frică!',
    shape: 'rectangle',
    bgColor: '#003399',
    borderColor: '#003399',
    textColor: '#FFFFFF',
    symbol: 'P',
    category: 'informational',
  },
  {
    id: 'oprire_interzisa',
    name: 'Oprirea interzisă',
    description: 'Nu ai voie să oprești sau să stationezi în această zonă.',
    tip: 'Galben cu roșu = nu te oprești, nu stationezi, treci mai departe.',
    shape: 'circle',
    bgColor: '#FFD700',
    borderColor: '#CC0000',
    textColor: '#CC0000',
    symbol: '✕',
    category: 'prohibitory',
  },
]

export function getRandomSignQuiz(correctSign: RoadSign, allSigns: RoadSign[]): RoadSign[] {
  const others = allSigns.filter((s) => s.id !== correctSign.id)
  const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3)
  const options = [...shuffled, correctSign].sort(() => Math.random() - 0.5)
  return options
}
