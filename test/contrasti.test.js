// Seam 3: i contrasti. Legge le variabili colore della tavolozza da styles.css (:root) e fallisce
// se una coppia testo/sfondo, bordo/sfondo o anello del focus/sfondo scende sotto soglia (WCAG 2.x).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

// Soglie: testo normale 4,5:1; testo grande (da 24px, o 18,66px in grassetto), bordi e anello del focus 3:1.
const SOGLIA = { testo: 4.5, grande: 3, bordo: 3 };

// Le variabili della tavolozza: tutte le «--nome: #rrggbb;» del blocco :root.
function tavolozza() {
  const root = css.match(/:root\s*\{([^}]*)\}/);
  assert.ok(root, 'manca il blocco :root in styles.css');
  const colori = {};
  for (const [, nome, esa] of root[1].matchAll(/--([\w-]+)\s*:\s*#([0-9a-fA-F]{6})\s*;/g)) colori[nome] = esa;
  return colori;
}

// Luminanza relativa e rapporto di contrasto, come da definizione WCAG 2.x.
function luminanza(esa) {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(esa.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrasto(a, b) {
  const [chiaro, scuro] = [luminanza(a), luminanza(b)].sort((x, y) => y - x);
  return (chiaro + 0.05) / (scuro + 0.05);
}

// Ogni coppia che la pagina usa davvero: [primo piano, sfondo, tipo].
// Gli sfondi possibili della carta: foglio, cartiglio, riflesso in alto.
const CARTE = ['paper', 'paper-2', 'paper-hi'];
const COPPIE = [
  ...CARTE.flatMap((carta) => [
    ['ink', carta, 'testo'],     // testo principale
    ['wine', carta, 'testo'],    // titolo in corsivo, numeri romani, titoli, pulsanti: accento su carta usato come testo
    ['moss', carta, 'testo'],    // data, etichette, sottotitoli: accento su carta usato come testo
  ]),
  ['line', 'paper', 'bordo'],    // filetti, cornice del cartiglio, linee dei Preparativi
  ['line', 'paper-2', 'bordo'],
  ['line', 'paper-hi', 'bordo'],
  ['focus', 'paper', 'bordo'],   // anello del focus
  ['focus', 'paper-2', 'bordo'],
  ['focus', 'paper-hi', 'bordo'],
  ['paper-hi', 'wine', 'testo'], // «Chiudi» del popup della Sarta: carta chiara su fondo borgogna
  ['seal-text', 'seal-hi', 'testo'], // monogramma sul sigillo, dove la cera è più chiara
  ['seal-text', 'seal-lo', 'testo'],
  ['seal-text', 'wine', 'testo'],
];

test('il calcolo del contrasto coincide con valori noti', () => {
  assert.equal(contrasto('000000', 'ffffff').toFixed(2), '21.00');
  assert.equal(contrasto('ffffff', 'ffffff').toFixed(2), '1.00');
  // #777777 su bianco: 4,48:1, il caso classico appena sotto 4,5.
  assert.equal(contrasto('777777', 'ffffff').toFixed(2), '4.48');
  assert.equal(contrasto('767676', 'ffffff').toFixed(2), '4.54');
});

test('la tavolozza è definita come variabili su :root, solo tema chiaro', () => {
  const colori = tavolozza();
  for (const nome of ['paper', 'paper-2', 'paper-hi', 'ink', 'wine', 'moss', 'line', 'focus', 'seal-text']) {
    assert.ok(colori[nome], `manca la variabile --${nome}`);
  }
  assert.match(css, /color-scheme:\s*light\b/);
  assert.ok(luminanza(colori.paper) > 0.5, 'la carta deve essere chiara');
});

test('ogni coppia di colori usata dalla pagina rispetta la soglia di contrasto', () => {
  const colori = tavolozza();
  const sotto = [];
  for (const [fg, bg, tipo] of COPPIE) {
    assert.ok(colori[fg], `manca la variabile --${fg}`);
    assert.ok(colori[bg], `manca la variabile --${bg}`);
    const rapporto = contrasto(colori[fg], colori[bg]);
    if (rapporto < SOGLIA[tipo]) {
      sotto.push(`--${fg} su --${bg} (${tipo}): ${rapporto.toFixed(2)}:1, serve ${SOGLIA[tipo]}:1`);
    }
  }
  assert.deepEqual(sotto, []);
});

test('ogni colore della tavolozza compare in almeno una coppia controllata', () => {
  const usati = new Set(COPPIE.flat());
  const fuori = Object.keys(tavolozza()).filter((nome) => !usati.has(nome));
  assert.deepEqual(fuori, [], 'colori della tavolozza che nessun controllo di contrasto copre');
});

test('fuori da :root i colori si scrivono solo con var(): nessun colore sfugge al controllo', () => {
  const senzaRoot = css.replace(/:root\s*\{[^}]*\}/, '').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(senzaRoot, /#[0-9a-fA-F]{3,8}\b/, 'colore esadecimale fuori da :root');
  assert.doesNotMatch(senzaRoot, /\b(rgb|rgba|hsl|hsla)\(/i, 'colore rgb/hsl fuori da :root');
});
