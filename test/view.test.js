// Seam 1: computeView(config, now), la funzione pura che decide cosa mostra il countdown.
// Configurazione di prova indipendente dai contenuti reali; gli istanti attesi sono scritti a mano.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeView } from '../src/view.js';

const at = (iso) => Date.parse(iso);

// Giorno del Romics di prova: 15 giugno 2030, 10:00 a Roma (+02:00) = 08:00 UTC.
// Chiusura 3 giorni dopo: 18 giugno 2030, 10:00 a Roma = 08:00 UTC.
const prova = {
  giornoDelRomics: '2030-06-15T10:00:00+02:00',
  giorniAllaChiusura: 3,
  messaggioGiorno: 'Messaggio di prova per il giorno.',
  salutoChiusura: 'Saluto di prova per la chiusura.',
};

test('prima del Giorno del Romics è attesa, con il tempo che manca in giorni, ore, minuti e secondi', () => {
  // 1 giorno, 2 ore, 3 minuti e 4 secondi prima delle 08:00:00 UTC del 15 giugno.
  const view = computeView(prova, at('2030-06-14T05:56:56Z'));
  assert.deepEqual(view, { kind: 'attesa', giorni: 1, ore: 2, minuti: 3, secondi: 4 });
});

test('un secondo prima è ancora attesa e mostra 1 secondo, mai zero', () => {
  const view = computeView(prova, at('2030-06-15T07:59:59Z'));
  assert.deepEqual(view, { kind: 'attesa', giorni: 0, ore: 0, minuti: 0, secondi: 1 });
});

test('i secondi si arrotondano per eccesso: mezzo secondo prima conta ancora 1 secondo', () => {
  assert.deepEqual(computeView(prova, at('2030-06-15T07:59:59Z') + 500), {
    kind: 'attesa', giorni: 0, ore: 0, minuti: 0, secondi: 1,
  });
  // 1 millisecondo prima.
  assert.deepEqual(computeView(prova, at('2030-06-15T08:00:00Z') - 1), {
    kind: 'attesa', giorni: 0, ore: 0, minuti: 0, secondi: 1,
  });
  // 1 secondo e 1 millisecondo prima: 2 secondi.
  assert.deepEqual(computeView(prova, at('2030-06-15T08:00:00Z') - 1001), {
    kind: 'attesa', giorni: 0, ore: 0, minuti: 0, secondi: 2,
  });
});

test('all\'istante esatto del Giorno del Romics la vista è giorno, con il messaggio', () => {
  const view = computeView(prova, at('2030-06-15T08:00:00Z'));
  assert.deepEqual(view, { kind: 'giorno', testo: 'Messaggio di prova per il giorno.' });
});

test('il Giorno del Romics dura fino all\'istante di chiusura: 3 giorni dopo, alla stessa ora di Roma', () => {
  const ultimo = computeView(prova, at('2030-06-18T08:00:00Z') - 1);
  assert.equal(ultimo.kind, 'giorno');
  const chiusura = computeView(prova, at('2030-06-18T08:00:00Z'));
  assert.deepEqual(chiusura, { kind: 'dopo', testo: 'Saluto di prova per la chiusura.' });
});

test('molto tempo dopo la chiusura la vista resta dopo', () => {
  assert.equal(computeView(prova, at('2035-01-01T00:00:00Z')).kind, 'dopo');
});

test('attorno ai confini nessun valore è negativo o fuori scala', () => {
  const confine = at('2030-06-15T08:00:00Z');
  for (let delta = 1; delta <= 200_000; delta += 997) {
    const v = computeView(prova, confine - delta);
    assert.equal(v.kind, 'attesa');
    assert.ok(v.giorni >= 0 && Number.isInteger(v.giorni));
    assert.ok(v.ore >= 0 && v.ore <= 23, `ore ${v.ore}`);
    assert.ok(v.minuti >= 0 && v.minuti <= 59, `minuti ${v.minuti}`);
    assert.ok(v.secondi >= 0 && v.secondi <= 59, `secondi ${v.secondi}`);
    assert.ok(v.giorni + v.ore + v.minuti + v.secondi > 0, 'mai tutto a zero prima dell\'istante');
  }
  // Esattamente alla soglia di un minuto, di un'ora e di un giorno.
  assert.deepEqual(computeView(prova, confine - 60_000), { kind: 'attesa', giorni: 0, ore: 0, minuti: 1, secondi: 0 });
  assert.deepEqual(computeView(prova, confine - 3_600_000), { kind: 'attesa', giorni: 0, ore: 1, minuti: 0, secondi: 0 });
  assert.deepEqual(computeView(prova, confine - 86_400_000), { kind: 'attesa', giorni: 1, ore: 0, minuti: 0, secondi: 0 });
});

test('l\'istante corrente in millisecondi o come Date dà la stessa vista', () => {
  for (const iso of ['2030-06-14T05:56:56Z', '2030-06-15T08:00:00Z', '2030-06-18T08:00:00Z']) {
    assert.deepEqual(computeView(prova, new Date(iso)), computeView(prova, at(iso)));
  }
});

const adesso = at('2030-06-01T00:00:00Z');

test('un Giorno del Romics che non è ISO 8601 con offset fa fallire con un errore chiaro in italiano', () => {
  for (const sbagliato of [
    '2030-06-15T10:00:00',        // senza offset
    '2030-06-15',                 // solo data
    '15/06/2030 10:00',
    'domani alle dieci',
    '2030-02-30T10:00:00+01:00',  // il 30 febbraio non esiste
    '2030-06-15T25:00:00+02:00',  // le 25 non esistono
    '',
    undefined,
    null,
    1_900_000_000_000,
  ]) {
    assert.throws(
      () => computeView({ ...prova, giornoDelRomics: sbagliato }, adesso),
      /Giorno del Romics.*ISO 8601.*offset/,
      `accettato ${String(sbagliato)}`,
    );
  }
});

test('un ritardo di chiusura che non è un numero intero di giorni fa fallire con un errore chiaro', () => {
  for (const sbagliato of [1.5, '4', NaN, Infinity, -1, undefined, null]) {
    assert.throws(
      () => computeView({ ...prova, giorniAllaChiusura: sbagliato }, adesso),
      /giorni.*chiusura.*numero intero/,
      `accettato ${String(sbagliato)}`,
    );
  }
});

test('un messaggio o un saluto vuoti fanno fallire con un errore chiaro', () => {
  for (const vuoto of ['', '   ', undefined, null, 42]) {
    assert.throws(
      () => computeView({ ...prova, messaggioGiorno: vuoto }, adesso),
      /messaggio.*Giorno del Romics.*vuoto/i,
      `accettato ${String(vuoto)}`,
    );
    assert.throws(
      () => computeView({ ...prova, salutoChiusura: vuoto }, adesso),
      /saluto.*chiusura.*vuoto/i,
      `accettato ${String(vuoto)}`,
    );
  }
});

test('la configurazione non valida fa fallire in ogni fase, non solo quando il testo serve', () => {
  const rotta = { ...prova, salutoChiusura: '' };
  assert.throws(() => computeView(rotta, at('2030-06-01T00:00:00Z')), /vuoto/);
  assert.throws(() => computeView(rotta, at('2030-06-15T08:00:00Z')), /vuoto/);
  assert.throws(() => computeView(rotta, at('2031-01-01T00:00:00Z')), /vuoto/);
  assert.throws(() => computeView(undefined, adesso), /configurazione/i);
});

test('un istante corrente che non è un numero né una Date fa fallire con un errore chiaro', () => {
  for (const sbagliato of [undefined, null, NaN, '2030-06-01', new Date('non è una data')]) {
    assert.throws(() => computeView(prova, sbagliato), /istante corrente/i, `accettato ${String(sbagliato)}`);
  }
});

// Cambio d'ora a Roma: l'ora legale finisce l'ultima domenica di ottobre alle 03:00 locali
// (01:00 UTC) e comincia l'ultima domenica di marzo alle 02:00 locali (01:00 UTC).
// La chiusura cade sempre alla stessa ora del muro di Roma, non dopo 24 ore esatte per giorno.
const verificaChiusura = (giornoDelRomics, giorniAllaChiusura, chiusuraAttesa) => {
  const config = { ...prova, giornoDelRomics, giorniAllaChiusura };
  assert.equal(computeView(config, at(chiusuraAttesa) - 1).kind, 'giorno', `un attimo prima di ${chiusuraAttesa}`);
  assert.equal(computeView(config, at(chiusuraAttesa)).kind, 'dopo', `a ${chiusuraAttesa}`);
};

test('chiusura attraverso la fine dell\'ora legale (domenica 31 ottobre 2027): resta alle 10:00 di Roma', () => {
  // Venerdì 29 ottobre 2027, 10:00 CEST (08:00 UTC) + 4 giorni
  // = martedì 2 novembre 2027, 10:00 CET = 09:00 UTC (un'ora di UTC in più).
  verificaChiusura('2027-10-29T10:00:00+02:00', 4, '2027-11-02T09:00:00Z');
});

test('chiusura attraverso l\'inizio dell\'ora legale (domenica 26 marzo 2028): resta alle 10:00 di Roma', () => {
  // Giovedì 23 marzo 2028, 10:00 CET (09:00 UTC) + 5 giorni
  // = martedì 28 marzo 2028, 10:00 CEST = 08:00 UTC (un'ora di UTC in meno).
  verificaChiusura('2028-03-23T10:00:00+01:00', 5, '2028-03-28T08:00:00Z');
});

test('chiusura il giorno stesso del cambio d\'ora: 10:00 di Roma, 1 giorno dopo', () => {
  // Sabato 30 ottobre 2027, 10:00 CEST (08:00 UTC) + 1 giorno = domenica 31, 10:00 CET = 09:00 UTC.
  verificaChiusura('2027-10-30T10:00:00+02:00', 1, '2027-10-31T09:00:00Z');
});

test('chiusura attraverso la mezzanotte e il cambio d\'ora: 00:30 di Roma', () => {
  // Sabato 30 ottobre 2027, 00:30 CEST (venerdì 29 alle 22:30 UTC) + 2 giorni
  // = lunedì 1 novembre 2027, 00:30 CET = domenica 31 alle 23:30 UTC.
  verificaChiusura('2027-10-30T00:30:00+02:00', 2, '2027-10-31T23:30:00Z');
});

test('se l\'ora locale non esiste (salto in avanti), la chiusura slitta alla prima ora che esiste', () => {
  // Sabato 25 marzo 2028, 02:30 CET (01:30 UTC) + 1 giorno: la domenica 26 alle 02:30 a Roma non
  // esiste (alle 02:00 si passa alle 03:00); si chiude alle 03:30 CEST = 01:30 UTC.
  verificaChiusura('2028-03-25T02:30:00+01:00', 1, '2028-03-26T01:30:00Z');
});

test('se l\'ora locale ricorre due volte (salto indietro), la chiusura è alla prima', () => {
  // Sabato 30 ottobre 2027, 02:30 CEST (00:30 UTC) + 1 giorno: domenica 31 alle 02:30 a Roma c'è
  // due volte (00:30 UTC in ora legale e 01:30 UTC in ora solare); si chiude alla prima.
  verificaChiusura('2027-10-30T02:30:00+02:00', 1, '2027-10-31T00:30:00Z');
});

test('il tempo che manca attraversando il cambio d\'ora è quello reale, non quello del muro', () => {
  // Da sabato 30 ottobre 2027 08:00 UTC a lunedì 1 novembre 2027 08:00 UTC passano 48 ore reali
  // (il muro di Roma ne segna 49 perché alle 03:00 tornano le 02:00).
  const config = { ...prova, giornoDelRomics: '2027-11-01T09:00:00+01:00' };
  assert.deepEqual(computeView(config, at('2027-10-30T08:00:00Z')), {
    kind: 'attesa', giorni: 2, ore: 0, minuti: 0, secondi: 0,
  });
});
