export interface ScenarioChoice {
  id: string
  text: string
  isCorrect: boolean
  isFunny?: boolean
}

export interface Scenario {
  id: string
  emoji: string
  title: string
  story: string
  choices: ScenarioChoice[]
  explanation: string
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'stall_light',
    emoji: '🚦',
    title: 'La semafor',
    story:
      'Ești la semafor. Se face verde. Mașina se oprește pentru că ambreiajul a avut alte planuri. Ce faci?',
    choices: [
      { id: 'a', text: 'Respiri, pornești mașina și încerci din nou.', isCorrect: true },
      { id: 'b', text: 'Te muți în alt oraș.', isCorrect: false, isFunny: true },
      { id: 'c', text: 'Apeși accelerația ca în Fast & Furious.', isCorrect: false },
    ],
    explanation:
      'Exact. Oprirea motorului se întâmplă tuturor. Rămâi calmă, pornești mașina și refaci pașii. Nimeni nu te judecă.',
  },
  {
    id: 'right_priority',
    emoji: '🔀',
    title: 'Intersecție nedirijată',
    story:
      'Te apropiezi de o intersecție fără semne. O mașină vine din dreapta ta. Ce faci?',
    choices: [
      { id: 'a', text: 'Ii cedezi trecerea — mașinile din dreapta au prioritate.', isCorrect: true },
      { id: 'b', text: 'Accelerezi ca să treci primul.', isCorrect: false },
      { id: 'c', text: 'Claxonezi și speri la ce e mai bine.', isCorrect: false, isFunny: true },
    ],
    explanation:
      'Corect! La intersecțiile fără semne, vehiculele venind din dreapta au prioritate. E o regulă simplă și te ține în siguranță.',
  },
  {
    id: 'roundabout_exit',
    emoji: '🔄',
    title: 'În giratoriu',
    story:
      'Ești în giratoriu și trebuie să ieși pe a doua ieșire. Cum semnalizezi?',
    choices: [
      { id: 'a', text: 'Semnalizezi dreapta înainte de ieșirea ta.', isCorrect: true },
      { id: 'b', text: 'Nu semnalizezi, e girator, nu autostradă.', isCorrect: false },
      { id: 'c', text: 'Semnalizezi stânga la intrare și dreapta la ieșire.', isCorrect: false, isFunny: true },
    ],
    explanation:
      'Da! Semnalizezi dreapta chiar înainte de ieșire. Ajuți pe toată lumea să anticipeze mișcarea ta.',
  },
  {
    id: 'pedestrian_waiting',
    emoji: '🚶',
    title: 'Pieton la trecere',
    story:
      'Un pieton stă lângă o trecere de pietoni și pare că vrea să traverseze. Nu e semafor. Ce faci?',
    choices: [
      { id: 'a', text: 'Frânezi și îi dai prioritate să traverseze.', isCorrect: true },
      { id: 'b', text: 'Treci repede înainte să decidă.', isCorrect: false },
      { id: 'c', text: 'Îi faci semn cu mâna că e liber, dar nu te oprești.', isCorrect: false, isFunny: true },
    ],
    explanation:
      'Corect! La trecerile nemarcate cu semafor, dacă un pieton dorește să traverseze, oprești și lași să treacă.',
  },
  {
    id: 'hill_start',
    emoji: '⛰️',
    title: 'Pornire pe pantă',
    story:
      'Ești pe o pantă, în spate ai o mașină. Trebuie să pornești. Cum faci să nu dai înapoi?',
    choices: [
      { id: 'a', text: 'Folosești frâna de mână — eliberezi când simți că mașina "trage" înainte.', isCorrect: true },
      { id: 'b', text: 'Dai drumul la frână brusc și apeși accelerația.', isCorrect: false },
      { id: 'c', text: 'Faci rugăciuni scurte și speri că funcționează.', isCorrect: false, isFunny: true },
    ],
    explanation:
      'Exact! Frâna de mână îți dă timp să găsești punctul de cuplare fără să dai înapoi. Eliberezi frâna când mașina începe să tracționeze ușor.',
  },
  {
    id: 'stop_sign_empty',
    emoji: '🛑',
    title: 'STOP pe drum gol',
    story:
      'Ajungi la un semn STOP. Drumul pare complet gol în ambele direcții. Ce faci?',
    choices: [
      { id: 'a', text: 'Oprești complet, verifici, apoi mergi.', isCorrect: true },
      { id: 'b', text: 'Frânezi ușor și treci — e gol, nu contează.', isCorrect: false },
      { id: 'c', text: 'Faci o pauză filosofică despre sensul regulilor.', isCorrect: false, isFunny: true },
    ],
    explanation:
      'STOP înseamnă oprire completă. Chiar dacă e gol. Îți formezi un reflex corect pentru situațiile când nu e gol.',
  },
  {
    id: 'parking_stress',
    emoji: '🅿️',
    title: 'Parcare și emoții',
    story:
      'Instructorul îți cere să parchezi paralel. Îți tremură mâinile. Ce faci?',
    choices: [
      { id: 'a', text: 'Respiri, faci pașii metodic, nu te grăbești.', isCorrect: true },
      { id: 'b', text: 'Intri în reverse fără să te uiți și speri la bine.', isCorrect: false },
      { id: 'c', text: 'Ceri instructorului să parcheze el.', isCorrect: false, isFunny: true },
    ],
    explanation:
      'Da! Parcarea cu emoții se face în pași mici, calm. Instructorul nu se grăbește. Tu ai timp.',
  },
  {
    id: 'impatient_driver',
    emoji: '📯',
    title: 'Șofer nerăbdător',
    story:
      'Un șofer din spate te claxonează insistent. Ești la o intersecție și nu ești sigură că e sigur să mergi. Ce faci?',
    choices: [
      { id: 'a', text: 'Ignori claxonul și pleci doar când ești sigură că e sigur.', isCorrect: true },
      { id: 'b', text: 'Pleci imediat ca să nu îl mai enervezi.', isCorrect: false },
      { id: 'c', text: 'Cobori să îi explici teoria priorităților.', isCorrect: false, isFunny: true },
    ],
    explanation:
      'Perfect. Presiunea din spate nu este niciodată un motiv să faci o manevră nesigură. Tu ești responsabilă de mașina ta.',
  },
]
