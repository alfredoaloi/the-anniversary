// Seam 2 (Sarta): il file dei contenuti reale e la pagina, per ciò che riguarda il popup della Sarta.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contenuti } from '../src/contenuti.js';
import { TESTI_SARTA, validaSarta } from '../src/sarta.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

// Il popup, come da spec (sezione Texts), scritto a mano.
const ATTESO = {
  intestazione: 'Sartoria di costumi storici',
  nome: 'Mistress Marie',
  riga: 'dal 1938',
  testo:
    'Quasi novant\'anni d\'ago e filo, abiti d\'epoca su misura, ricami a mano in filo metallico, ' +
    'plissettature a cartuccia e orli di kilt senza un millimetro fuori posto.',
  chiudi: 'Chiudi',
};

const testiSarta = () => [...Object.values(contenuti.sarta), contenuti.linkSarta];

test('il popup della Sarta e il testo del link sono quelli della spec', () => {
  assert.deepEqual(contenuti.sarta, ATTESO);
  assert.equal(contenuti.linkSarta, 'Conoscete la sarta');
});

test('i contenuti reali della Sarta passano il controllo', () => {
  assert.doesNotThrow(() => validaSarta(contenuti));
  assert.deepEqual(Object.keys(contenuti.sarta).sort(), [...TESTI_SARTA].sort());
});

test('nessun testo della Sarta è vuoto', () => {
  for (const t of testiSarta()) assert.notEqual(t.trim(), '');
});

test('nessun testo della Sarta nomina la nonna né contiene un segnaposto', () => {
  for (const t of testiSarta()) {
    assert.doesNotMatch(t, /nonn[ae]/i);
    assert.doesNotMatch(t, /SEGNAPOSTO/i);
  }
});

test('nessun testo della Sarta dice un luogo: né città, né regioni, né indirizzi', () => {
  const luoghi =
    /\b(roma|milano|napoli|torino|firenze|bologna|venezia|genova|palermo|catania|bari|edimburgo|edinburgh|inverness|glasgow|scozia|italia|via|viale|piazza|corso|largo|vicolo|indirizzo|sede|bottega)\b/i;
  for (const t of testiSarta()) assert.doesNotMatch(t, luoghi);
});

test('nessun testo della Sarta contiene cifre di telefono, email o indirizzi web', () => {
  for (const t of testiSarta()) {
    assert.doesNotMatch(t, /@|https?:|www\./i);
    assert.doesNotMatch(t, /\d{5,}/);
  }
});

// ---- Il markup del popup ----

const dialog = html.match(/<dialog\b[^>]*>[\s\S]*?<\/dialog>/);

test('la pagina ha un solo <dialog>, dopo il marcatore del popup e fuori dalla colonna principale', () => {
  assert.ok(dialog, 'manca il <dialog> della Sarta');
  assert.equal((html.match(/<dialog\b/g) ?? []).length, 1);
  assert.ok(html.indexOf('INSERIMENTO: popup della Sarta') < html.indexOf(dialog[0]));
  assert.ok(html.indexOf('</main>') < html.indexOf(dialog[0]));
});

test('il dialog è nominato dal suo titolo (aria-labelledby punta a un id che esiste dentro il dialog)', () => {
  const apertura = dialog[0].match(/<dialog\b[^>]*>/)[0];
  const id = apertura.match(/\baria-labelledby="([^"]+)"/);
  assert.ok(id, 'manca aria-labelledby');
  for (const riferimento of id[1].split(/\s+/)) {
    assert.match(dialog[0], new RegExp(`\\bid="${riferimento}"`), `manca l'id «${riferimento}» nel dialog`);
  }
  assert.doesNotMatch(apertura, /\bopen\b/, 'il dialog deve partire chiuso');
});

test('il dialog ha un solo pulsante, «Chiudi», e nessun altro elemento interattivo', () => {
  assert.equal((dialog[0].match(/<button\b/g) ?? []).length, 1);
  assert.match(dialog[0], /<button\b[^>]*\btype="button"[^>]*\bdata-sarta="chiudi"/);
  assert.doesNotMatch(dialog[0], /<(a|input|select|textarea|summary|details|form)\b/i);
  assert.doesNotMatch(dialog[0], /\b(tabindex|onclick|contenteditable)\b/i);
});

test('il dialog non ha foto né altre immagini, né elementi che svelano chi è la Sarta', () => {
  assert.doesNotMatch(dialog[0], /<(img|picture|svg|image|video|audio|iframe|canvas)\b/i);
  assert.doesNotMatch(dialog[0], /aria-live|role="(status|alert)"/i);
  assert.doesNotMatch(dialog[0], /svel|rivel|nonn/i);
});

test('i segnaposto del dialog sono esattamente i testi del popup, vuoti', () => {
  const chiavi = [...dialog[0].matchAll(/\bdata-sarta="([^"]+)"/g)].map((m) => m[1]).sort();
  assert.deepEqual(chiavi, [...TESTI_SARTA].sort());
  assert.doesNotMatch(dialog[0].replace(/<[^>]*>/g, ''), /\S/, 'il dialog non deve contenere testo scritto a mano');
});

test('i testi della Sarta non sono copiati nel markup: stanno solo nel file di dati', () => {
  for (const t of testiSarta()) assert.ok(!html.includes(t), `«${t}» è scritto anche in index.html`);
});

test('l\'unico ingresso al popup è il link del punto III: nella pagina statica non c\'è nessun altro pulsante', () => {
  const fuori = html.replace(dialog[0], '');
  assert.doesNotMatch(fuori, /<button\b/i);
  assert.doesNotMatch(fuori, /data-apri-sarta/);
  assert.doesNotMatch(fuori, /<a\b[^>]*href="#/i);
});

test('lo stile del popup: sta nello schermo con scorrimento interno, rispetta reduced-motion', () => {
  const regola = css.match(/dialog\.sarta\s*\{([^}]*)\}/);
  assert.ok(regola, 'manca la regola dialog.sarta');
  assert.match(regola[1], /max-height:/);
  assert.match(regola[1], /overflow-y:\s*auto/);
  // L'animazione di apertura, se c'è, sta solo sotto no-preference.
  const senzaBlocchi = css.replace(/@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{[\s\S]*?\n\}/, '');
  assert.doesNotMatch(senzaBlocchi, /dialog\.sarta[^{]*\{[^}]*animation:\s*(?!none)/);
});
