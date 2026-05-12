export const PRAISE_MESSAGES = [
  'Miau, Gabu. Asta a fost soferie cu potential.',
  'Foarte bine, Gabu! Ai facut progres real, nu doar ai apasat butoane.',
  'Nu trebuie sa fii perfecta, Gabu. Trebuie sa fii calma si atenta.',
  'Creierul tau incepe sa intre in modul sofer.',
  'Instructorul imaginar aproba. Eu, ca pisica, aprob si mai tare.',
  'Ambreiajul te-a testat. Tu ai ramas in joc, Gabu.',
  'Respira. Nu te claxoneaza nimeni in aplicatia asta.',
  'Ai supravietuit misiunii, Gabu. Permisul se apropie strategic.',
  'Azi ai mai pus o caramida la incredere.',
  'Progres real. Chiar si pisicile sunt impresionate, Gabu.',
  'Aia a fost soferie cu suflet.',
  'Creierul tau tocmai a salvat un neuron de sofer.',
  'Bravo, Gabu. PisiPilot a zambit cu toti mustatoi.',
  'Exact tipul de determinare care face permisul posibil.',
  'Mici victorii. Mare progres, Gabu. 🐾',
  'Nu te-ai dat batuta. Asta e cel mai important.',
  'Felicitari, Gabu. Si pisicile spun bravo rar.',
  'Ai trecut testul. Testul secret. Cel de caracter.',
  'Fiecare greseala te aduce mai aproape de dreptul drumului.',
  'Ai reusit, Gabu. PisiPilot era sigur de asta.',
]

export const MISTAKE_MESSAGES = [
  'Aproape, Gabu. Hai sa o luam mai usor.',
  'Nu e problema. Aici gresim gratis.',
  'Motorul s-a oprit, dar increderea nu.',
  'Buna greseala. Din asta chiar inveti.',
  'Nu panicam. Repetam si devine reflex.',
  'Ai ratat raspunsul, dar ai castigat claritate, Gabu.',
  'Oops. PisiPilot a mai vazut chestia asta. Merge mai bine data viitoare.',
  'Greseala asta e gratuita. Profitati.',
  'Ai dreptul sa gresesti in siguranta. Exact asta face aplicatia asta.',
  'Repeta. De doua ori. Trei daca vrei. Fara judecata, Gabu.',
]

export const PISI_THOUGHTS = [
  'Gabu, stiu ca ai avut o zi lunga. Asta nu conteaza. Esti deja aici.',
  'Permisul nu se ia in graba. Se ia cu calm si practica.',
  'Toti soferii buni au gresit la inceput. Diferenta? Au continuat.',
  'Eu conduc prost (nu am maini), dar te incurajez cu expertiza.',
  'Daca ai deschis aplicatia asta, Gabu, esti deja mai pregatita decat crezi.',
  'Azi nu trebuie sa fii perfecta. Trebuie sa fii prezenta.',
  'Semnele de circulatie sunt prietenii tai. Ok, unele sunt mai prietenoase.',
  'Ambreiajul pare dur la inceput. Poi devine instinct. Promit, Gabu.',
  'Fiecare sesiune de azi = mai putin stres la examen.',
  'Pisicile nu dau permis. Dar daca ar da, tu ai lua, Gabu.',
]

export const WELCOME_MESSAGES = [
  'Buna, Gabu! 🐱 Copilotul tau e gata.',
  'Bine ai revenit, Gabu! PisiPilot te astepta.',
  'Esti din nou aici, Gabu. Asta se numeste determinare.',
  'Salut, Gabu! PisiPilot e gata de copilot.',
  'Buna ziua, viitoare soferița Gabu! 🚗',
]

export const GEARBOX_MESSAGES = {
  success: [
    'Punctul de cuplare a fost gasit, Gabu. Universul e in echilibru.',
    'Pornire lina ca un pisoi. Exact.',
    'Ambreiajul a cooperat. Rare ori se intampla. Savureaza.',
    'Asta s-a simtit corect, nu? 🐾',
  ],
  stall: [
    'Motorul s-a oprit. Nu e drama. Doar feedback.',
    'Ambreiajul nu se arunca. Se invita politicos.',
    'S-a mai oprit un motor in lume. Maine tot soferi suntem.',
    'Oops. PisiPilot a vazut asta. Incearca mai lin.',
  ],
  tooMuchGas: [
    'Prea mult gaz. Nu decolam azi.',
    'Aaaaa. Ai vrut sa accelerezi, nu sa zbori.',
    'Motor fericit, ambreiaj suparat. Gasim echilibrul.',
  ],
  ready: [
    'Apasa ambreiajul pana jos, pune prima treapta, gaseste punctul magic.',
    'Usor cu ambreiajul. Dozat cu gazul. Tu poti, Gabu.',
  ],
}

export function getRandomPraise(): string {
  return PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)]
}

export function getRandomMistake(): string {
  return MISTAKE_MESSAGES[Math.floor(Math.random() * MISTAKE_MESSAGES.length)]
}

export function getRandomThought(): string {
  return PISI_THOUGHTS[Math.floor(Math.random() * PISI_THOUGHTS.length)]
}

export function getRandomWelcome(): string {
  return WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]
}
