// Il renderer del tempo che manca (src/countdown.js), provato contro un DOM finto minimo:
// quello che conta è cosa viene scritto e dove, non la struttura del markup.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { creaCountdown } from '../src/countdown.js';

// Un elemento finto che conta le scritture (anche quelle che non cambiano nulla).
function elemento(testo = '', nascosto = false) {
  const e = { scritture: 0, _testo: testo, _nascosto: nascosto };
  Object.defineProperty(e, 'textContent', {
    get: () => e._testo,
    set: (v) => { e._testo = String(v); e.scritture += 1; },
  });
  Object.defineProperty(e, 'hidden', {
    get: () => e._nascosto,
    set: (v) => { e._nascosto = Boolean(v); e.scritture += 1; },
  });
  return e;
}

// Un countdown finto con gli stessi punti di aggancio di index.html.
function paginaFinta() {
  const el = {
    numeri: elemento('', false),
    testo: elemento('', true),
    giorni: elemento('–'), ore: elemento('–'), minuti: elemento('–'), secondi: elemento('–'),
    etGiorni: elemento('giorni'), etOre: elemento('ore'), etMinuti: elemento('minuti'), etSecondi: elemento('secondi'),
  };
  const per = {
    '[data-numeri]': el.numeri,
    '[data-testo]': el.testo,
    '[data-valore="giorni"]': el.giorni,
    '[data-valore="ore"]': el.ore,
    '[data-valore="minuti"]': el.minuti,
    '[data-valore="secondi"]': el.secondi,
    '[data-etichetta="giorni"]': el.etGiorni,
    '[data-etichetta="ore"]': el.etOre,
    '[data-etichetta="minuti"]': el.etMinuti,
    '[data-etichetta="secondi"]': el.etSecondi,
  };
  const radice = { querySelector: (selettore) => per[selettore] ?? null };
  const scritture = () => Object.values(el).reduce((somma, e) => somma + e.scritture, 0);
  return { el, radice, scritture };
}

const attesa = (giorni, ore, minuti, secondi) => ({ kind: 'attesa', giorni, ore, minuti, secondi });

test('mostra giorni, ore, minuti e secondi con il singolare e il plurale giusti', () => {
  const { el, radice } = paginaFinta();
  const { aggiorna } = creaCountdown(radice);

  aggiorna(attesa(1, 1, 1, 1));
  assert.deepEqual(
    [el.giorni, el.ore, el.minuti, el.secondi].map((e) => e.textContent),
    ['1', '1', '1', '1'],
  );
  assert.deepEqual(
    [el.etGiorni, el.etOre, el.etMinuti, el.etSecondi].map((e) => e.textContent),
    ['giorno', 'ora', 'minuto', 'secondo'],
  );

  aggiorna(attesa(2, 23, 59, 59));
  assert.deepEqual(
    [el.giorni, el.ore, el.minuti, el.secondi].map((e) => e.textContent),
    ['2', '23', '59', '59'],
  );
  assert.deepEqual(
    [el.etGiorni, el.etOre, el.etMinuti, el.etSecondi].map((e) => e.textContent),
    ['giorni', 'ore', 'minuti', 'secondi'],
  );

  // Zero è plurale: «0 ore».
  aggiorna(attesa(0, 0, 0, 1));
  assert.deepEqual(
    [el.giorni, el.ore, el.minuti, el.secondi].map((e) => e.textContent),
    ['0', '0', '0', '1'],
  );
  assert.deepEqual(
    [el.etGiorni, el.etOre, el.etMinuti, el.etSecondi].map((e) => e.textContent),
    ['giorni', 'ore', 'minuti', 'secondo'],
  );
});

test('in attesa i numeri si vedono e il testo è nascosto', () => {
  const { el, radice } = paginaFinta();
  creaCountdown(radice).aggiorna(attesa(5, 4, 3, 2));
  assert.equal(el.numeri.hidden, false);
  assert.equal(el.testo.hidden, true);
});

test('nelle fasi giorno e dopo compare il testo al posto dei numeri', () => {
  for (const kind of ['giorno', 'dopo']) {
    const { el, radice } = paginaFinta();
    const { aggiorna } = creaCountdown(radice);
    aggiorna(attesa(1, 2, 3, 4));
    aggiorna({ kind, testo: 'Un testo di prova.' });
    assert.equal(el.testo.hidden, false);
    assert.equal(el.testo.textContent, 'Un testo di prova.');
    assert.equal(el.numeri.hidden, true);
  }
});

test('si torna ai numeri quando la vista torna in attesa (per esempio cambiando ?now=)', () => {
  const { el, radice } = paginaFinta();
  const { aggiorna } = creaCountdown(radice);
  aggiorna({ kind: 'giorno', testo: 'Un testo di prova.' });
  aggiorna(attesa(0, 0, 0, 9));
  assert.equal(el.numeri.hidden, false);
  assert.equal(el.testo.hidden, true);
  assert.equal(el.secondi.textContent, '9');
});

test('scrive nel DOM solo ciò che è cambiato', () => {
  const { el, radice, scritture } = paginaFinta();
  const { aggiorna } = creaCountdown(radice);

  aggiorna(attesa(3, 4, 5, 6));
  const dopoLaPrima = scritture();

  // Stessa vista: nessuna scrittura.
  aggiorna(attesa(3, 4, 5, 6));
  assert.equal(scritture(), dopoLaPrima);

  // Cambiano solo i secondi: una sola scrittura (l'etichetta «secondi» non cambia).
  aggiorna(attesa(3, 4, 5, 5));
  assert.equal(scritture(), dopoLaPrima + 1);
  assert.equal(el.secondi.scritture >= 2, true);
  assert.equal(el.giorni.scritture, 1);
  assert.equal(el.minuti.scritture, 1);

  // Passa un minuto: cambiano minuti e secondi.
  const prima = scritture();
  aggiorna(attesa(3, 4, 4, 59));
  assert.equal(scritture(), prima + 2);

  // Stesso testo di giorno ripetuto a ogni secondo: nessuna scrittura dopo la prima.
  aggiorna({ kind: 'giorno', testo: 'Un testo di prova.' });
  const conTesto = scritture();
  aggiorna({ kind: 'giorno', testo: 'Un testo di prova.' });
  assert.equal(scritture(), conTesto);
});

test('se manca un punto di aggancio nel markup, fallisce subito con un errore chiaro', () => {
  const { radice } = paginaFinta();
  const senzaTesto = { querySelector: (s) => (s === '[data-testo]' ? null : radice.querySelector(s)) };
  assert.throws(() => creaCountdown(senzaTesto), /countdown.*\[data-testo\]/i);
});
