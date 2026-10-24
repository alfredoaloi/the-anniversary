// La Missione: la lettera sotto il countdown. Seam: il controllo dei testi (src/testi.js), il file
// dei contenuti reale (src/contenuti.js) e la pagina (index.html) letta come testo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contenuti } from '../src/contenuti.js';
import { TESTI_MISSIONE, validaTesti } from '../src/testi.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sorgente = readFileSync(new URL('../src/contenuti.js', import.meta.url), 'utf8');

// Il testo della spec (#10, sezione Texts), parola per parola. Fonte di verità indipendente dal codice.
const MISSIONE_SPEC =
  'Sassenach, il 28 ottobre 2026, giorno del nostro anniversario, vi scrivo per farvi una proposta. ' +
  'L\'autunno dell\'anno venturo, a Roma, ci sarà il Romics, e io vorrei andarci con voi: io nei panni di Jamie, ' +
  'voi in quelli di Claire, nel giorno delle loro nozze. Sangue del mio sangue, osso delle mie ossa: ' +
  'per quel giorno non manca che una cosa, il vostro sì. ' +
  'Il resto, dinna fash, lo prepareremo insieme, punto per punto, qui sotto.';

// Configurazione di prova per la validazione, indipendente dai contenuti reali.
const prova = {
  sigillo: 'X·Y',
  dataLine: 'Data di prova',
  titolo: 'Inizio, *parte in corsivo*',
  rigaCountdown: 'Riga di prova.',
  chiusura: 'Chiusura di prova!',
  missione: 'Lettera di prova.',
  firmaMissione: '— Firma di prova',
};

test('i testi della Missione sono la lettera e la firma', () => {
  assert.deepEqual([...TESTI_MISSIONE].sort(), ['firmaMissione', 'missione']);
});

test('testi con la Missione validi non lanciano errori', () => {
  assert.doesNotThrow(() => validaTesti(prova));
});

for (const chiave of ['missione', 'firmaMissione']) {
  test(`${chiave} vuoto, di soli spazi o mancante dà un errore chiaro in italiano`, () => {
    for (const valore of ['', '   ', undefined, 42]) {
      assert.throws(
        () => validaTesti({ ...prova, [chiave]: valore }),
        (e) => e instanceof Error && e.message.includes(chiave) && /vuoto|mancante/i.test(e.message),
      );
    }
  });
}

test('la Missione nel file di dati è il testo della spec, parola per parola', () => {
  assert.equal(contenuti.missione, MISSIONE_SPEC);
});

test('la firma della Missione è «— Il vostro Jamie»', () => {
  assert.equal(contenuti.firmaMissione, '— Il vostro Jamie');
});

test('la Missione reale non è vuota, non nomina la nonna e non ha segnaposto', () => {
  for (const chiave of TESTI_MISSIONE) {
    const testo = contenuti[chiave];
    assert.equal(typeof testo, 'string', `${chiave} non è un testo`);
    assert.notEqual(testo.trim(), '', `${chiave} è vuoto`);
    assert.doesNotMatch(testo, /nonna/i);
    assert.doesNotMatch(testo, /SEGNAPOSTO/i);
  }
  assert.doesNotThrow(() => validaTesti(contenuti));
});

test('la Missione non contiene la data del Romics: la dice il countdown', () => {
  assert.doesNotMatch(contenuti.missione, /2027|settembre/i);
});

test('la pagina ha i segnaposto della Missione tra il countdown e l\'illustrazione, e il testo non è copiato nel markup', () => {
  const ordine = [
    'data-countdown',
    'data-contenuto="missione"',
    'data-contenuto="firmaMissione"',
    'class="illustrazione"',
  ];
  let da = 0;
  for (const pezzo of ordine) {
    const i = html.indexOf(pezzo, da);
    assert.ok(i >= 0, `«${pezzo}» manca o è fuori posto`);
    da = i;
  }
  const corpo = html.replace(/<head>[\s\S]*<\/head>/, '');
  assert.ok(!corpo.includes('Sassenach, il 28 ottobre'), 'la lettera è scritta anche in index.html');
  assert.ok(!corpo.includes('Il vostro Jamie'), 'la firma è scritta anche in index.html');
});

test('il capolettera è in borgogna e la firma è a destra, in corsivo, con i colori della tavolozza', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const capolettera = css.match(/\.lettera::first-letter\s*\{([^}]*)\}/);
  assert.ok(capolettera, 'manca la regola ::first-letter della lettera');
  assert.match(capolettera[1], /color:\s*var\(--wine\)/);
  assert.match(capolettera[1], /float:\s*left/);
  const firma = css.match(/\.firma\s*\{([^}]*)\}/);
  assert.ok(firma, 'manca la regola della firma');
  assert.match(firma[1], /text-align:\s*right/);
  assert.match(firma[1], /font-style:\s*italic/);
});

test('il file di dati non nomina la nonna nemmeno nei commenti', () => {
  assert.doesNotMatch(sorgente, /nonna/i);
});
