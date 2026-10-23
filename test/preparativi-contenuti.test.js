// Seam 2 (Preparativi): il file dei contenuti reale e la pagina, per ciò che riguarda i dieci Preparativi.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contenuti } from '../src/contenuti.js';
import { validaPreparativi } from '../src/preparativi.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

// I dieci Preparativi della spec (sezione Texts), scritti a mano: titolo e riga.
const ATTESI = [
  ['Dire di sì', 'Il primo passo è il più arduo, Sassenach: rispondere di sì.'],
  ['Rivedere le nozze', 'Rivediamo insieme l\'episodio, mo chridhe, con carta e penna: i fermagli non si improvvisano.'],
  ['Conoscere la sarta', 'Dinna fash: tra le mie conoscenze ce n\'è una abilissima.'],
  ['Il kilt e il plaid', 'Otto iarde di tartan Fraser: non si lesina sulla stoffa.'],
  ['La camicia e la spilla', 'Una camicia di lino, polsini ricamati d\'argento e un luccichio sul colletto.'],
  ['L\'abito di Claire', 'Argento, non bianco: l\'abito più luminoso a lume di candela.'],
  ['Perle, anello e il resto', 'Un filo di perle, mo nighean donn, e un anello d\'argento.'],
  ['I capelli', 'Rosso per lui, ricci per lei: la natura fa il resto.'],
  ['I trucchi', 'Pelle luminosa e labbra naturali: niente di moderno, Sassenach.'],
  ['La prova generale', 'Un mese prima, vestiti di tutto punto, con tanto di foto.'],
];

test('i dieci Preparativi sono quelli della spec, nell\'ordine indicato', () => {
  assert.deepEqual(
    contenuti.preparativi.map(({ titolo, riga }) => [titolo, riga]),
    ATTESI,
  );
});

test('ogni Preparativo ha titolo e riga, e sono solo questi due campi: nessuna spunta, scadenza, data o stato', () => {
  assert.equal(contenuti.preparativi.length, 10);
  for (const p of contenuti.preparativi) {
    assert.deepEqual(Object.keys(p).sort(), ['riga', 'titolo']);
    assert.notEqual(p.titolo.trim(), '');
    assert.notEqual(p.riga.trim(), '');
  }
});

test('nessun testo dei Preparativi nomina la nonna né contiene un segnaposto', () => {
  for (const p of contenuti.preparativi) {
    for (const testo of [p.titolo, p.riga]) {
      assert.doesNotMatch(testo, /nonna/i);
      assert.doesNotMatch(testo, /SEGNAPOSTO/i);
    }
  }
});

test('i Preparativi reali passano il controllo', () => {
  assert.doesNotThrow(() => validaPreparativi(contenuti));
});

test('la pagina ha la sezione «Preparativi» con un elenco ordinato vuoto da riempire, tra illustrazione e chiusura', () => {
  const sezione = html.match(/<section\b[^>]*class="preparativi"[^>]*>[\s\S]*?<\/section>/);
  assert.ok(sezione, 'manca la sezione dei Preparativi');
  assert.match(sezione[0], /<h2\b[^>]*>Preparativi<\/h2>/);
  assert.match(sezione[0], /<ol\b[^>]*\bdata-preparativi\b[^>]*>\s*<\/ol>/);
  const i = html.indexOf(sezione[0]);
  assert.ok(html.indexOf('class="illustrazione"') < i && i < html.indexOf('data-contenuto="chiusura"'));
});

test('i testi dei Preparativi non sono copiati nel markup: stanno solo nel file di dati', () => {
  for (const p of contenuti.preparativi) {
    assert.ok(!html.includes(p.titolo), `«${p.titolo}» è scritto anche in index.html`);
    assert.ok(!html.includes(p.riga), `«${p.riga}» è scritta anche in index.html`);
  }
});

test('nessuna spunta nella pagina: niente caselle né input', () => {
  assert.doesNotMatch(html, /<input\b/i);
  assert.doesNotMatch(html, /type="checkbox"/i);
});

test('i Preparativi non memorizzano nulla', () => {
  const sorgente = readFileSync(new URL('../src/preparativi.js', import.meta.url), 'utf8');
  assert.doesNotMatch(sorgente, /localStorage|sessionStorage|indexedDB|document\.cookie/);
});

test('lo stile dei Preparativi lascia andare a capo il testo: niente scroll orizzontale a 390 px', () => {
  assert.match(css, /\.preparativo-corpo\s*\{[^}]*min-width:\s*0/);
});
