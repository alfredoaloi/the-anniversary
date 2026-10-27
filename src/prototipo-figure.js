// PROTOTIPO, DA BUTTARE. Domanda: «come dovrebbero essere Jamie e Claire?» (i capelli di lui, soprattutto).
// Quattro versioni dell'illustrazione sulla stessa pagina, scelte con ?variant= e con la barra in basso:
//   O = l'illustrazione attuale (per confronto), A = sagome a profilo, B = cammeo, C = figure a colori.
// Tutte senza volti (la spec dell'Invito lo vuole). Nessuna persistenza, nessun asset esterno.

const NOMI = { O: 'Originale', A: 'Sagome a profilo', B: 'Cammeo', C: 'Figure a colori' };
const CHIAVI = Object.keys(NOMI);

// Tavolozza della pagina + i colori dei capelli.
const INK = '#2a1e14';
const WINE = '#7a1f2b';
const MOSS = '#2f4a36';
const CUOIO = '#8b6b3d';
const CARTA = '#efe3c8';
const AVORIO = '#f1e6cc';
const RAME = '#b4562b';
const RAME_SCURO = '#7b3418';
const RAME_CHIARO = '#dc8c4c';
const CASTAGNA = '#5b3521';
const CASTAGNA_CHIARO = '#93603a';

// Numeri pseudo-casuali ripetibili: stessa pagina, stessi ricci.
const casuale = (seme) => () => {
  seme = (seme * 16807) % 2147483647;
  return (seme - 1) / 2147483646;
};

// Un ricciolo: un cerchio pieno con un giro più chiaro dentro, così si legge come ciocca arricciata.
function ricciolo(cx, cy, r, base, luce) {
  return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${base}"/>` +
    `<path d="M${(cx - r * 0.55).toFixed(1)} ${(cy + r * 0.1).toFixed(1)}a${(r * 0.55).toFixed(1)} ${(r * 0.55).toFixed(1)} 0 1 1 ${(r * 0.9).toFixed(1)} ${(r * 0.35).toFixed(1)}` +
    `" fill="none" stroke="${luce}" stroke-width="${Math.max(0.9, r * 0.16).toFixed(1)}" stroke-linecap="round"/>`;
}

// Un ammasso di ricci su un'ellisse (per Claire).
function ammassoRicci(cx, cy, rx, ry, n, rMin, rMax, seme, base, luce) {
  const rnd = casuale(seme);
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd() * 0.5;
    const d = 0.55 + rnd() * 0.45;
    s += ricciolo(cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, rMin + rnd() * (rMax - rMin), base, luce);
  }
  return s;
}

// Profili del viso verso destra, in coordinate locali (origine al centro della testa; collo fino a y=34).
const VISO_LUI = 'M-4 -24C8 -24 15 -16 15 -8L18 -4C21 -1 23 2 22 4L18 6C18 8 19 9 18 10C19 11 18 12 17 13C18 15 17 17 16 19C13 23 8 23 5 22L5 34L-16 34L-16 -2C-18 -16 -12 -24 -4 -24Z';
const VISO_LEI = 'M-4 -24C7 -24 14 -17 14 -9L15 -5C17 -2 18 0 17 2L14 4C14.5 6 15 7 14.5 8.5C15.2 9.5 14.5 10.5 13.5 11C14 13 13.5 15 12.5 17C10 21 6 22 3 21L3 34L-16 34L-16 -2C-18 -16 -12 -24 -4 -24Z';

// Capelli di Jamie (locali, verso destra): tirati indietro dalla fronte, lunghi fino alle spalle,
// con il bordo basso a onde. L'orecchio resta libero (il bordo interno gli gira dietro).
const CAPELLI_LUI = 'M15 -12C14 -27 3 -34 -10 -33C-24 -32 -33 -20 -31 -6C-30 2 -34 6 -33 14C-32 20 -36 24 -33 30C-31 35 -25 36 -22 33C-21 39 -14 40 -12 34C-10 38 -4 37 -4 31C-6 26 -6 20 -5 12C-4 6 -4 1 -1 -4C3 -8 8 -11 15 -12Z';
const CIOCCHE_LUI = [
  'M13 -14C6 -26 -6 -29 -16 -24C-24 -19 -24 -10 -27 -3C-30 4 -26 10 -28 16C-30 22 -28 28 -28 32',
  'M8 -12C1 -21 -9 -22 -17 -16C-23 -10 -20 -2 -22 4C-24 10 -20 16 -22 22C-23 28 -20 32 -18 36',
  'M2 -8C-5 -14 -12 -12 -16 -5C-19 1 -15 6 -16 12C-17 18 -14 23 -14 28C-14 32 -12 36 -10 37',
  'M-5 0C-9 6 -7 12 -8 18C-9 24 -7 28 -6 33',
];
const ORECCHIO = 'M-3 -2C1 -5 5 -2 3 4C2 8 -1 8 -3 6';

function varianteA() {
  // Sagome a profilo, a inchiostro con due soli accenti di colore: i capelli. Lui a sinistra, lei a destra, mano nella mano.
  const lui = `
    <g fill="${INK}">
      <path d="M70 110C80 100 104 100 116 110L126 152L121 176L66 176L61 142Z"/>
      <path d="M112 116C128 130 140 150 148 172" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
      <path d="M66 170h60l11 72H55z"/>
      <path d="M68 240h24l-2 84H71zM101 240h24l-3 84h-20z"/>
      <path d="M62 322h33v11H55zM98 322h33l8 11h-41z"/>
    </g>
    <path d="M62 120L92 106L124 152L116 172Z" fill="${WINE}"/>
    <g fill="none" stroke="${INK}" stroke-width="1.4" stroke-linecap="round" opacity=".7"><path d="M74 118L110 164M86 112L118 156M66 132L98 168"/></g>
    <g fill="none" stroke="${CARTA}" stroke-width="1.5" stroke-linecap="round">
      <path d="M76 178l-4 62M87 178l-2 62M98 178l1 62M109 178l4 62M120 178l7 62"/>
      <path d="M79 296h14M105 296h14M79 286h14M105 286h14" opacity=".55"/>
    </g>
    <path d="M118 178h15l3 21h-21z" fill="${CUOIO}"/>
    <g transform="translate(94 76) scale(1.25)">
      <path d="${VISO_LUI}" fill="${INK}"/>
      <path d="${CAPELLI_LUI}" fill="${RAME}"/>
      <g fill="none" stroke-linecap="round" stroke-width="1.4">
        ${CIOCCHE_LUI.map((d, i) => `<path d="${d}" stroke="${i % 2 ? RAME_CHIARO : RAME_SCURO}"/>`).join('')}
      </g>
      <path d="${ORECCHIO}" fill="none" stroke="${RAME_SCURO}" stroke-width="1.1" stroke-linecap="round" opacity=".0"/>
    </g>`;

  const lei = `
    <g fill="${INK}">
      <path d="M168 146C180 134 228 134 240 146L246 204L168 204Z"/>
      <path d="M184 198h58L294 336H132z"/>
      <path d="M174 156C170 172 162 182 154 186" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
    </g>
    <path d="M172 194h72l2 12h-76z" fill="${WINE}"/>
    <g fill="none" stroke="${CARTA}" stroke-width="1.5" stroke-linecap="round">
      <path d="M196 214l-30 118M210 214l-8 120M224 214l12 120M238 214l36 118"/>
      <path d="M184 152c14 8 44 8 56 0" opacity=".7"/>
    </g>
    <g fill="${CARTA}"><circle cx="200" cy="160" r="1.8"/><circle cx="208" cy="163" r="1.8"/><circle cx="216" cy="163" r="1.8"/><circle cx="224" cy="160" r="1.8"/></g>
    <g>${ammassoRicci(217, 98, 24, 21, 20, 7, 10, 7, CASTAGNA, CASTAGNA_CHIARO)}</g>
    <g transform="translate(205 112) scale(-1.25 1.25)">
      <path d="${VISO_LEI}" fill="${INK}"/>
    </g>
    <g>
      ${ricciolo(192, 92, 6, CASTAGNA, CASTAGNA_CHIARO)}${ricciolo(200, 83, 7, CASTAGNA, CASTAGNA_CHIARO)}${ricciolo(211, 79, 7.5, CASTAGNA, CASTAGNA_CHIARO)}${ricciolo(222, 83, 7.5, CASTAGNA, CASTAGNA_CHIARO)}${ricciolo(229, 92, 7, CASTAGNA, CASTAGNA_CHIARO)}
      ${ricciolo(232, 104, 7, CASTAGNA, CASTAGNA_CHIARO)}${ricciolo(233, 117, 6.5, CASTAGNA, CASTAGNA_CHIARO)}${ricciolo(230, 130, 6, CASTAGNA, CASTAGNA_CHIARO)}${ricciolo(225, 142, 5.5, CASTAGNA, CASTAGNA_CHIARO)}
    </g>`;

  const mani = `<circle cx="151" cy="180" r="7.5" fill="${INK}"/>`;
  return { viewBox: '0 0 300 350', etichetta: 'Due figure a profilo, lui in kilt con i capelli rossi lunghi, lei in abito ampio con i ricci', corpo: lui + lei + mani };
}

function varianteB() {
  // Cammeo: due busti a profilo uno di fronte all'altro, in avorio inciso su fondo borgogna.
  const lui = `
    <g transform="translate(110 146) scale(1.9)">
      <path d="M-16 28C-30 32 -40 42 -44 62L12 62C14 50 8 38 5 28Z" fill="${AVORIO}"/>
      <path d="${VISO_LUI}" fill="${AVORIO}"/>
      <path d="M-4 36L2 46L10 36" fill="none" stroke="${CUOIO}" stroke-width=".9" stroke-linejoin="round"/>
      <path d="M-38 56L-8 40L8 62" fill="none" stroke="${CUOIO}" stroke-width=".8" opacity=".8"/>
      <path d="M-30 52L-6 42M-26 58L-4 48M-20 62L2 54" fill="none" stroke="${CUOIO}" stroke-width=".7"/>
      <path d="${CAPELLI_LUI}" fill="${AVORIO}" stroke="${CUOIO}" stroke-width=".8" stroke-linejoin="round"/>
      <g fill="none" stroke="${CUOIO}" stroke-width=".9" stroke-linecap="round">
        ${CIOCCHE_LUI.map((d) => `<path d="${d}"/>`).join('')}
        <path d="${ORECCHIO}"/>
      </g>
    </g>`;
  const lei = `
    <g transform="translate(192 156) scale(-1.8 1.8)">
      <path d="M-16 30C-26 34 -34 40 -36 60L8 60C9 48 6 38 3 30Z" fill="${AVORIO}"/>
      <path d="${VISO_LEI}" fill="${AVORIO}"/>
      <path d="M-12 40C-4 48 4 46 8 38" fill="none" stroke="${CUOIO}" stroke-width=".8"/>
      <g fill="${AVORIO}" stroke="${CUOIO}" stroke-width=".6"><circle cx="-8" cy="44" r="1.7"/><circle cx="-3" cy="47" r="1.7"/><circle cx="2" cy="46" r="1.7"/><circle cx="6" cy="42" r="1.7"/></g>
      <g stroke="${CUOIO}" stroke-width=".7">
        ${ammassoRicci(-9, -12, 20, 15, 14, 5.5, 8, 11, AVORIO, CUOIO)}
        ${ricciolo(-21, 6, 5, AVORIO, CUOIO)}${ricciolo(-20, 15, 4.5, AVORIO, CUOIO)}${ricciolo(-17, 24, 4, AVORIO, CUOIO)}
      </g>
    </g>`;
  const cornice = `
    <ellipse cx="150" cy="175" rx="140" ry="164" fill="${WINE}" stroke="${CUOIO}" stroke-width="3"/>
    <ellipse cx="150" cy="175" rx="130" ry="154" fill="none" stroke="${CUOIO}" stroke-width="1.2"/>`;
  const cardo = `<g fill="none" stroke="${AVORIO}" stroke-width="1.6" stroke-linecap="round" opacity=".9">
      <path d="M150 304c0-10 0-18 0-26M150 290c-8-4-12-10-12-18M150 290c8-4 12-10 12-18"/>
    </g>
    <g fill="${AVORIO}"><circle cx="150" cy="268" r="3.2"/><circle cx="138" cy="270" r="2.6"/><circle cx="162" cy="270" r="2.6"/></g>`;
  return { viewBox: '0 0 300 350', etichetta: 'Cammeo con due profili uno di fronte all\'altro: lui con i capelli lunghi e mossi, lei con i ricci', corpo: cornice + lui + lei + cardo };
}

function varianteC() {
  // Figure intere a colori, di fronte, mano nella mano: capelli come forme grandi e riconoscibili.
  const pelle = '#ecc9a2';
  const camicia = '#f4ead2';
  const defs = `<defs><pattern id="tartan" width="14" height="14" patternUnits="userSpaceOnUse">
      <rect width="14" height="14" fill="${WINE}"/>
      <rect y="2" width="14" height="4" fill="${MOSS}" opacity=".85"/><rect x="2" width="4" height="14" fill="${MOSS}" opacity=".85"/>
      <rect y="9" width="14" height="1.2" fill="${CARTA}" opacity=".8"/><rect x="9" width="1.2" height="14" fill="${CARTA}" opacity=".8"/>
      <rect y="12.5" width="14" height="1" fill="${INK}"/><rect x="12.5" width="1" height="14" fill="${INK}"/>
    </pattern>
    <linearGradient id="argento" x1="0" x2="1"><stop offset="0" stop-color="#d3d7dd"/><stop offset=".5" stop-color="#f3f4f6"/><stop offset="1" stop-color="#b9bec7"/></linearGradient></defs>`;

  const lui = `
    <!-- gambe e calze -->
    <path d="M76 236h22l-2 84H78zM104 236h22l-2 84h-20z" fill="#e8dcc0" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M74 320h26v12H66zM102 320h26l8 12h-34z" fill="${INK}"/>
    <!-- braccio che pende, a sinistra -->
    <path d="M70 112c-8 18-10 40-8 62" fill="none" stroke="${INK}" stroke-width="17" stroke-linecap="round"/>
    <path d="M70 112c-8 18-10 40-8 62" fill="none" stroke="${camicia}" stroke-width="14.5" stroke-linecap="round"/>
    <circle cx="62" cy="178" r="7" fill="${pelle}" stroke="${INK}" stroke-width="1.4"/>
    <!-- camicia -->
    <path d="M66 112C72 100 90 96 100 96S128 100 134 112L132 172H68Z" fill="${camicia}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M90 98l10 22 10-22" fill="${pelle}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M97 102v14M103 102v14" stroke="${INK}" stroke-width="1" opacity=".5"/>
    <!-- plaid in diagonale dalla spalla -->
    <path d="M66 114L96 102L136 172L114 178Z" fill="url(#tartan)" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <!-- kilt -->
    <path d="M66 168h68l14 72H52z" fill="url(#tartan)" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M74 170l-8 70M86 170l-5 70M98 170l-2 70M110 170l2 70M122 170l5 70M132 170l9 70" stroke="${INK}" stroke-width="1" opacity=".45"/>
    <path d="M65 170h70" stroke="${CUOIO}" stroke-width="5"/>
    <path d="M92 176h16l2 22H90z" fill="${CUOIO}" stroke="${INK}" stroke-width="1.4"/>
    <!-- braccio verso di lei -->
    <path d="M132 114c12 14 20 36 22 64" fill="none" stroke="${INK}" stroke-width="17" stroke-linecap="round"/>
    <path d="M132 114c12 14 20 36 22 64" fill="none" stroke="${camicia}" stroke-width="14.5" stroke-linecap="round"/>
    <!-- capelli: massa dietro la testa, più larga del viso, con il bordo a onde all'altezza delle spalle -->
    <path d="M100 28C80 28 68 46 70 70C71 84 67 92 72 102C74 109 80 112 84 108C87 115 94 114 96 108C99 115 106 115 109 108C113 113 120 112 122 106C130 108 132 98 129 90C127 82 131 78 130 68C132 46 120 28 100 28Z" fill="${RAME}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M77 72C74 82 78 90 76 100M85 70C82 82 87 92 85 106M123 72C126 82 122 90 124 100M115 70C118 82 113 92 115 106" fill="none" stroke="${RAME_SCURO}" stroke-width="1.5" stroke-linecap="round"/>
    <!-- orecchie: i capelli sono tirati dietro -->
    <ellipse cx="83.5" cy="72" rx="3.6" ry="6.5" fill="${pelle}" stroke="${INK}" stroke-width="1.3"/><ellipse cx="116.5" cy="72" rx="3.6" ry="6.5" fill="${pelle}" stroke="${INK}" stroke-width="1.3"/>
    <!-- viso e frangia scostata -->
    <ellipse cx="100" cy="70" rx="16" ry="21" fill="${pelle}" stroke="${INK}" stroke-width="1.6"/>
    <path d="M84 68C80 48 89 34 101 34C113 34 121 48 117 68C115 58 111 50 104 46C98 44 90 52 84 68Z" fill="${RAME}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M101 36C98 41 96 44 92 50M108 38C109 42 111 45 114 50M89 42C85 50 84 58 84 66M114 42C118 50 117 58 117 66" fill="none" stroke="${RAME_CHIARO}" stroke-width="1.5" stroke-linecap="round"/>`;

  const lei = `
    <!-- gonna a campana -->
    <path d="M190 190h40l56 142H134z" fill="url(#argento)" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M204 204l-40 126M212 204l-10 128M222 204l14 128M230 204l40 126" stroke="${INK}" stroke-width="1" opacity=".3" fill="none"/>
    <!-- busto stretto in vita -->
    <path d="M184 144C186 134 196 130 210 130S234 134 236 144L231 172C229 182 229 188 230 194H190C191 188 191 182 189 172Z" fill="url(#argento)" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
    <path d="M189 192h42l1 10h-44z" fill="${WINE}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M191 143c8 10 34 10 42 0" fill="none" stroke="${INK}" stroke-width="1.2" opacity=".55"/>
    <!-- collo e perle -->
    <path d="M203 118h14v16c-4 6-10 6-14 0z" fill="${pelle}" stroke="${INK}" stroke-width="1.4"/>
    <path d="M199 134c8 8 20 8 28 0" fill="none" stroke="#fffaf0" stroke-width="3.4" stroke-dasharray="1 3.2" stroke-linecap="round"/>
    <path d="M199 134c8 8 20 8 28 0" fill="none" stroke="${INK}" stroke-width=".8" opacity=".35"/>
    <!-- braccio verso di lui -->
    <path d="M188 148c-10 12-22 22-34 30" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
    <path d="M188 148c-10 12-22 22-34 30" fill="none" stroke="${pelle}" stroke-width="11.5" stroke-linecap="round"/>
    <!-- capelli ricci: grande nuvola dietro, viso, qualche ciocca davanti -->
    ${ammassoRicci(210, 90, 34, 30, 22, 9, 14, 3, CASTAGNA, CASTAGNA_CHIARO)}
    <ellipse cx="210" cy="94" rx="15" ry="19" fill="${pelle}" stroke="${INK}" stroke-width="1.6"/>
    ${ricciolo(197, 80, 7, CASTAGNA, CASTAGNA_CHIARO)}${ricciolo(206, 72, 8, CASTAGNA, CASTAGNA_CHIARO)}${ricciolo(217, 72, 8, CASTAGNA, CASTAGNA_CHIARO)}${ricciolo(225, 80, 7, CASTAGNA, CASTAGNA_CHIARO)}
    ${ricciolo(191, 100, 7, CASTAGNA, CASTAGNA_CHIARO)}${ricciolo(229, 100, 7, CASTAGNA, CASTAGNA_CHIARO)}${ricciolo(189, 114, 6, CASTAGNA, CASTAGNA_CHIARO)}${ricciolo(231, 114, 6, CASTAGNA, CASTAGNA_CHIARO)}`;

  const mani = `<circle cx="154" cy="180" r="8" fill="${pelle}" stroke="${INK}" stroke-width="1.4"/>`;
  return { viewBox: '0 0 300 350', etichetta: 'Due figure a colori, mano nella mano: lui in kilt di tartan con i capelli rossi, lei in abito argento con i ricci castani', corpo: defs + lui + lei + mani };
}

const VARIANTI = { A: varianteA, B: varianteB, C: varianteC };

function chiaveCorrente() {
  const v = new URLSearchParams(location.search).get('variant');
  return CHIAVI.includes(v) ? v : 'A';
}

function disegna(svg, originale, chiave) {
  if (chiave === 'O') {
    svg.setAttribute('viewBox', originale.viewBox);
    svg.setAttribute('aria-label', originale.etichetta);
    svg.innerHTML = originale.html;
    return;
  }
  const { viewBox, etichetta, corpo } = VARIANTI[chiave]();
  svg.setAttribute('viewBox', viewBox);
  svg.setAttribute('aria-label', etichetta);
  svg.innerHTML = corpo;
}

function creaBarra(corrente, vai) {
  const barra = document.createElement('div');
  barra.setAttribute('style',
    'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:99;display:flex;align-items:center;gap:12px;' +
    'padding:8px 14px;border-radius:999px;background:#111;color:#fff;font:600 14px/1 system-ui,sans-serif;' +
    'box-shadow:0 4px 16px rgba(0,0,0,.4)');
  const bottone = (testo, delta) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = testo;
    b.setAttribute('aria-label', delta < 0 ? 'Variante precedente' : 'Variante successiva');
    b.setAttribute('style', 'all:unset;cursor:pointer;padding:2px 8px;font-size:18px');
    b.addEventListener('click', () => vai(delta));
    return b;
  };
  const etichetta = document.createElement('span');
  etichetta.setAttribute('data-prototipo-etichetta', '');
  etichetta.setAttribute('style', 'min-width:170px;text-align:center');
  barra.append(bottone('←', -1), etichetta, bottone('→', 1));
  document.body.append(barra);
  const aggiorna = (chiave) => { etichetta.textContent = `${chiave} (${NOMI[chiave]})`; };
  aggiorna(corrente);
  return aggiorna;
}

function avviaPrototipo() {
  const svg = document.querySelector('.illustrazione svg');
  if (!svg) return;
  const originale = { viewBox: svg.getAttribute('viewBox'), etichetta: svg.getAttribute('aria-label'), html: svg.innerHTML };
  let chiave = chiaveCorrente();
  let aggiornaEtichetta = () => {};
  const mostra = (nuova) => {
    chiave = nuova;
    disegna(svg, originale, chiave);
    aggiornaEtichetta(chiave);
    const url = new URL(location.href);
    url.searchParams.set('variant', chiave);
    history.replaceState(null, '', url);
  };
  const vai = (delta) => mostra(CHIAVI[(CHIAVI.indexOf(chiave) + delta + CHIAVI.length) % CHIAVI.length]);
  aggiornaEtichetta = creaBarra(chiave, vai);
  disegna(svg, originale, chiave);
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (t.matches?.('input, textarea') || t.isContentEditable)) return;
    if (e.key === 'ArrowLeft') vai(-1);
    if (e.key === 'ArrowRight') vai(1);
  });
}

avviaPrototipo();
