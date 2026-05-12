// 28 real Romanian traffic signs — exact SIGN_BANK from pisi-signs.js
// Images served from /public/signs/

export interface SignEntry {
  img: string      // path under /signs/
  name: string
  cat: 'Prioritate' | 'Avertizare' | 'Restricție' | 'Obligare' | 'Informare'
  correct: string  // correct answer text
  why: string      // explanation shown after answering
  decoys: [string, string, string]  // three wrong options
}

export const SIGNS_BANK: SignEntry[] = [
  // ── Prioritate ────────────────────────────────────────────────────
  { img:'/signs/prio-stop.jpeg', name:'STOP', cat:'Prioritate',
    correct:'Oprire obligatorie la linia STOP, apoi cedare priorit.',
    why:'Oprire completă, chiar dacă nu vine nimic. Apoi cedezi tuturor.',
    decoys:['Încetinire și continuare dacă e liber','Cedezi priorit. doar pieton.','Drum fără ieșire'] },
  { img:'/signs/prio-cedeaza.jpeg', name:'Cedează trecerea', cat:'Prioritate',
    correct:'Cedezi trecerea vehiculelor din intersecție.',
    why:'Nu obligatoriu să oprești, dar trebuie să cedezi.',
    decoys:['Oprire obligatorie completă','Drum cu prioritate','Curbă periculoasă'] },
  { img:'/signs/prio-drum-prioritate.jpeg', name:'Drum cu prioritate', cat:'Prioritate',
    correct:'Ai prioritate la intersecțiile următoare.',
    why:'Indicatorul te anunță că ești pe drumul prioritar.',
    decoys:['Trebuie să cedezi la următoarea intersecție','Sfârșitul drumului cu prioritate','Strict obligatoriu la dreapta'] },
  { img:'/signs/prio-sfarsit-prioritate.jpeg', name:'Sfârșitul drumului cu prioritate', cat:'Prioritate',
    correct:'Nu mai ai prioritate. Se aplică regulile normale.',
    why:'De aici încolo, prioritate de dreapta (sau alte indicatoare).',
    decoys:['Începutul drumului cu prioritate','Sfârșitul autostrăzii','Oprire obligatorie'] },
  { img:'/signs/prio-intersectie-fara-prio.jpeg', name:'Intersecție cu drum fără prioritate', cat:'Prioritate',
    correct:'Ai prioritate față de drumul lateral.',
    why:'Ești pe drumul cu prioritate, ceilalți trebuie să cedeze.',
    decoys:['Cedezi trecerii vehiculelor laterale','Drum interzis în lateral','Sens unic la dreapta'] },
  { img:'/signs/prio-fata-de-sens-invers.jpeg', name:'Prioritate față de circulația din sens invers', cat:'Prioritate',
    correct:'Ai prioritate față de vehiculele din sens opus.',
    why:'Drumul îngust de aici încolo — tu treci primul.',
    decoys:['Cedezi trecerii sensului opus','Sens unic','Depășire interzisă'] },
  { img:'/signs/prio-pentru-sens-invers.jpeg', name:'Prioritate pentru circulația din sens invers', cat:'Prioritate',
    correct:'Cedezi trecerea vehiculelor din sens opus.',
    why:'Drumul îngust — ei trec primii.',
    decoys:['Ai prioritate față de sensul opus','Drum interzis','Sens unic în direcția ta'] },

  // ── Avertizare ────────────────────────────────────────────────────
  { img:'/signs/avert-curba-stanga.jpeg', name:'Curbă periculoasă la stânga', cat:'Avertizare',
    correct:'Urmează o curbă periculoasă spre stânga.',
    why:'Redu viteza și păstrează banda.',
    decoys:['Curbă la dreapta','Drum cu serpentine','Stânga obligatorie'] },
  { img:'/signs/avert-curba-dreapta.jpeg', name:'Curbă periculoasă la dreapta', cat:'Avertizare',
    correct:'Urmează o curbă periculoasă spre dreapta.',
    why:'Redu viteza și păstrează banda.',
    decoys:['Curbă la stânga','Drum cu serpentine','Dreapta obligatorie'] },
  { img:'/signs/avert-denivelari.jpeg', name:'Drum cu denivelări', cat:'Avertizare',
    correct:'Urmează un drum cu denivelări (gropi sau cocoașe).',
    why:'Încetinește pentru a evita avariile.',
    decoys:['Limită de înălțime','Trecere la nivel cu cale ferată','Drum alunecos'] },
  { img:'/signs/avert-copii.jpeg', name:'Copii', cat:'Avertizare',
    correct:'Atenție: zonă cu copii (școală, parc).',
    why:'Reducere de viteză și atenție sporită.',
    decoys:['Trecere pentru pietoni','Loc de joacă interzis','Drum impracticabil'] },
  { img:'/signs/avert-trecere-pietoni.jpeg', name:'Trecere pentru pietoni (avertizare)', cat:'Avertizare',
    correct:'Atenție: urmează o trecere pentru pietoni.',
    why:'Triunghiul roșu = avertizare. Cedezi pietonilor.',
    decoys:['Trecere pentru pietoni (informare)','Pieton interzis','Trotuar obligatoriu'] },
  { img:'/signs/avert-intersectie-dreapta.jpeg', name:'Intersecție cu drum lateral pe dreapta', cat:'Avertizare',
    correct:'Atenție: drum lateral intră dinspre dreapta.',
    why:'Ai prioritate, dar atenție la cei care vin din lateral.',
    decoys:['Drum lateral pe stânga','Sens obligatoriu la dreapta','Curbă la dreapta'] },
  { img:'/signs/avert-intersectie-stanga.jpeg', name:'Intersecție cu drum lateral pe stânga', cat:'Avertizare',
    correct:'Atenție: drum lateral intră dinspre stânga.',
    why:'Ai prioritate, dar atenție la cei care vin din lateral.',
    decoys:['Drum lateral pe dreapta','Sens obligatoriu la stânga','Curbă la stânga'] },
  { img:'/signs/avert-lucrari.jpeg', name:'Lucrări', cat:'Avertizare',
    correct:'Atenție: lucrări în desfășurare pe carosabil.',
    why:'Redu viteza, respectă semnalizarea temporară.',
    decoys:['Drum impracticabil','Trecere la nivel','Drum în pantă'] },

  // ── Restricție ────────────────────────────────────────────────────
  { img:'/signs/interz-viteza-50.jpg', name:'Limită de viteză 50', cat:'Restricție',
    correct:'Viteza maximă admisă: 50 km/h.',
    why:'Tipic în localitate. Depășirea = amendă + puncte.',
    decoys:['Viteza minimă 50 km/h','Distanță până la 50 km','Greutate maximă 5 tone'] },
  { img:'/signs/interz-viteza-70.jpg', name:'Limită de viteză 70', cat:'Restricție',
    correct:'Viteza maximă admisă: 70 km/h.',
    why:'Drum tipic interurban sau zonă tranzitorie.',
    decoys:['Viteza minimă 70 km/h','Limită doar pentru camioane','Distanță 70 km până la destinație'] },
  { img:'/signs/interz-viteza-90.webp', name:'Limită de viteză 90', cat:'Restricție',
    correct:'Viteza maximă admisă: 90 km/h.',
    why:'Drumuri din afara localității, drum european.',
    decoys:['Viteza minimă 90 km/h','Doar pentru autovehicule','Distanță până la 90 km'] },
  { img:'/signs/interz-depasire-interzisa.jpeg', name:'Depășirea autovehiculelor interzisă', cat:'Restricție',
    correct:'Depășirea autovehiculelor este interzisă.',
    why:'Poți depăși bicicliști sau căruțe — nu autoturisme.',
    decoys:['Toate depășirile interzise','Limită de viteză diferențiată','Acces interzis camioanelor'] },
  { img:'/signs/interz-oprire-interzisa.jpeg', name:'Oprirea interzisă', cat:'Restricție',
    correct:'Oprirea este interzisă pe partea cu indicatorul.',
    why:'Nici pentru staționare, nici pentru oprire — strict tranzit.',
    decoys:['Staționarea interzisă (doar)','Sens interzis','Drum cu sens unic'] },
  { img:'/signs/interz-stationare-interzisa.jpeg', name:'Staționarea interzisă', cat:'Restricție',
    correct:'Staționarea este interzisă. Oprirea scurtă e permisă.',
    why:'Poți opri ≤5 min, dar nu staționa.',
    decoys:['Oprirea interzisă','Parcare obligatorie','Sens interzis'] },

  // ── Obligare ──────────────────────────────────────────────────────
  { img:'/signs/oblig-inainte.jpeg', name:'Sens obligatoriu înainte', cat:'Obligare',
    correct:'Direcție obligatorie: înainte.',
    why:'Doar înainte. Nu poți vira stânga sau dreapta.',
    decoys:['Sens unic în direcția înainte','Drum interzis înapoi','Stație de taxi'] },
  { img:'/signs/oblig-dreapta.jpeg', name:'Direcție obligatorie la dreapta', cat:'Obligare',
    correct:'Direcție obligatorie: la dreapta.',
    why:'Trebuie să virezi la dreapta.',
    decoys:['Sens unic la dreapta','Atenție curbă la dreapta','Drum interzis pe stânga'] },
  { img:'/signs/oblig-stanga.jpg', name:'Direcție obligatorie la stânga', cat:'Obligare',
    correct:'Direcție obligatorie: la stânga.',
    why:'Trebuie să virezi la stânga.',
    decoys:['Sens unic la stânga','Atenție curbă la stânga','Drum interzis pe dreapta'] },
  { img:'/signs/oblig-sens-giratoriu.jpeg', name:'Sens giratoriu', cat:'Obligare',
    correct:'Sens giratoriu obligatoriu.',
    why:'Cedezi trecerii celor deja în sens giratoriu.',
    decoys:['Ocolire obligatorie pe stânga','Bucla de întoarcere','Drum cu serpentine'] },

  // ── Informare ─────────────────────────────────────────────────────
  { img:'/signs/info-trecere-pietoni.jpeg', name:'Trecere pentru pietoni (informare)', cat:'Informare',
    correct:'Aici este o trecere pentru pietoni.',
    why:'Pătratul albastru = informare. Cedezi pietonilor angajați.',
    decoys:['Avertizare: urmează trecere pietoni','Trotuar obligatoriu','Zonă rezidențială'] },
  { img:'/signs/info-parcare.jpeg', name:'Parcare', cat:'Informare',
    correct:'Loc de parcare disponibil.',
    why:'Poți parca aici (cu respectarea regulilor locale).',
    decoys:['Pasagiu pietonal','Punct de plată','Stație de pompare'] },
  { img:'/signs/info-spital.jpeg', name:'Spital', cat:'Informare',
    correct:'Spital în apropiere.',
    why:'Atenție sporită, redu zgomotul; pot apărea ambulanțe.',
    decoys:['Heliport','Punct de prim ajutor (truse)','Hotel'] },
]

export function shuffleSignDeck(count = 10): SignEntry[] {
  const copy = [...SIGNS_BANK]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, Math.min(count, copy.length))
}

export function buildAnswers(sign: SignEntry, questionIdx: number): { text: string; correct: boolean }[] {
  const arr = [
    { text: sign.correct, correct: true },
    ...sign.decoys.map(t => ({ text: t, correct: false })),
  ]
  // Deterministic shuffle per question index
  const seed = questionIdx * 9301 + 49297
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.abs((seed >> i) ^ (i * 31)) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
