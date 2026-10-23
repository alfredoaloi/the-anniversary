// Seam 2: il file dei contenuti reale (src/contenuti.js), per ciò che esiste finora.
// I ticket successivi aggiungono qui i controlli sui loro contenuti (Preparativi, Sarta...).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contenuti } from '../src/contenuti.js';
import { computeView } from '../src/view.js';

const at = (iso) => Date.parse(iso);
const sorgente = readFileSync(new URL('../src/contenuti.js', import.meta.url), 'utf8');

// Tutte le stringhe del file dei contenuti, a qualunque profondità.
const stringhe = (valore) => {
  if (typeof valore === 'string') return [valore];
  if (Array.isArray(valore)) return valore.flatMap(stringhe);
  if (valore && typeof valore === 'object') return Object.values(valore).flatMap(stringhe);
  return [];
};

test('il file dei contenuti avverte, in cima, che il repository è pubblico', () => {
  const inCima = sorgente.split('\n').slice(0, 6).join('\n');
  assert.match(inCima, /^\/\//);
  assert.match(inCima, /pubblic/i);
});

test('il Giorno del Romics è una data-ora ISO con l\'offset giusto di Roma per quella data', () => {
  const m = contenuti.giornoDelRomics.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})([+-]\d{2}:\d{2})$/);
  assert.ok(m, `«${contenuti.giornoDelRomics}» non è ISO 8601 con offset`);
  // Fonte di verità indipendente: il database dei fusi di Node.
  const nome = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', timeZoneName: 'longOffset' })
    .formatToParts(new Date(contenuti.giornoDelRomics))
    .find((p) => p.type === 'timeZoneName').value; // «GMT+02:00»
  assert.equal(m[2], nome.replace('GMT', ''), 'l\'offset non è quello di Roma in quella data');
});

test('il ritardo del saluto di chiusura è un numero intero di giorni', () => {
  assert.ok(Number.isInteger(contenuti.giorniAllaChiusura));
  assert.ok(contenuti.giorniAllaChiusura >= 0);
});

test('il Giorno del Romics provvisorio è il 30 settembre 2027 alle 10:00 di Roma, chiusura 4 giorni dopo', () => {
  assert.equal(contenuti.giornoDelRomics, '2027-09-30T10:00:00+02:00');
  assert.equal(contenuti.giorniAllaChiusura, 4);
});

test('i testi del Giorno del Romics e del saluto di chiusura sono quelli della spec', () => {
  assert.equal(
    contenuti.messaggioGiorno,
    'È il giorno, mo nighean donn! Indossate le nozze di Claire, io metto il plaid: si va al Romics.',
  );
  assert.equal(contenuti.salutoChiusura, 'Il Romics è passato, e che giornata, mo chridhe. Slàinte mhath!');
});

test('le fasi arrivano agli istanti giusti con i contenuti reali', () => {
  // Giorno: giovedì 30 settembre 2027, 10:00 CEST = 08:00 UTC. Chiusura: lunedì 4 ottobre, 10:00 CEST = 08:00 UTC.
  const fase = (iso) => computeView(contenuti, at(iso));
  assert.deepEqual(fase('2027-09-30T07:59:59Z'), { kind: 'attesa', giorni: 0, ore: 0, minuti: 0, secondi: 1 });
  assert.deepEqual(fase('2027-09-29T08:00:00Z'), { kind: 'attesa', giorni: 1, ore: 0, minuti: 0, secondi: 0 });
  assert.deepEqual(fase('2027-09-30T08:00:00Z'), { kind: 'giorno', testo: contenuti.messaggioGiorno });
  assert.equal(fase('2027-10-04T07:59:59.999Z').kind, 'giorno');
  assert.deepEqual(fase('2027-10-04T08:00:00Z'), { kind: 'dopo', testo: contenuti.salutoChiusura });
  // Il 28 ottobre 2026, giorno dell'Invito, si è in attesa.
  assert.equal(fase('2026-10-28T08:00:00Z').kind, 'attesa');
});

test('nessun testo pubblico nomina la nonna: la Sarta resta un\'allusione', () => {
  assert.doesNotMatch(sorgente, /nonna/i);
  for (const testo of stringhe(contenuti)) assert.doesNotMatch(testo, /nonna/i);
});

test('nessun segnaposto (SEGNAPOSTO) rimasto nei contenuti', () => {
  assert.doesNotMatch(sorgente, /SEGNAPOSTO/i);
  for (const testo of stringhe(contenuti)) assert.doesNotMatch(testo, /SEGNAPOSTO/i);
});
