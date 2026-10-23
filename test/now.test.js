// Seam 4: il parametro ?now=, che simula l'istante corrente per provare le tre fasi.
// parseNow(search) restituisce i millisecondi dall'epoca, oppure null se il parametro va ignorato.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseNow } from '../src/now.js';

const at = (iso) => Date.parse(iso);

test('una data-ora ISO con offset vale quell\'istante', () => {
  assert.equal(parseNow('?now=2027-09-30T10:00:00%2B02:00'), at('2027-09-30T08:00:00Z'));
  assert.equal(parseNow('?now=2027-12-01T10:00:00%2B01:00'), at('2027-12-01T09:00:00Z'));
  assert.equal(parseNow('?now=2027-09-30T03:00:00-05:00'), at('2027-09-30T08:00:00Z'));
});

test('un «+» non codificato nell\'offset funziona lo stesso (nell\'URL il + diventa uno spazio)', () => {
  assert.equal(parseNow('?now=2027-09-30T10:00:00+02:00'), at('2027-09-30T08:00:00Z'));
});

test('una data-ora ISO con Z è in UTC', () => {
  assert.equal(parseNow('?now=2027-09-30T08:00:00Z'), at('2027-09-30T08:00:00Z'));
  assert.equal(parseNow('?now=2027-09-30T08:00Z'), at('2027-09-30T08:00:00Z'));
  assert.equal(parseNow('?now=2027-09-30T08:00:00.250Z'), at('2027-09-30T08:00:00Z') + 250);
});

test('una data-ora ISO senza offset è l\'ora di Roma, qualunque sia il fuso del dispositivo', () => {
  // D'estate Roma è +02:00, d'inverno +01:00.
  assert.equal(parseNow('?now=2027-09-30T10:00:00'), at('2027-09-30T08:00:00Z'));
  assert.equal(parseNow('?now=2027-12-01T10:00'), at('2027-12-01T09:00:00Z'));
});

test('una sola data ISO è la mezzanotte di quel giorno a Roma', () => {
  assert.equal(parseNow('?now=2027-09-30'), at('2027-09-29T22:00:00Z'));
  assert.equal(parseNow('?now=2027-12-01'), at('2027-11-30T23:00:00Z'));
});

test('il parametro si trova anche fra altri parametri', () => {
  assert.equal(parseNow('?a=1&now=2027-09-30T08:00:00Z&b=2'), at('2027-09-30T08:00:00Z'));
});

test('tutto ciò che non è una data o data-ora ISO 8601 viene ignorato', () => {
  for (const sbagliato of [
    '1',
    '2026',
    '1790000000000',           // millisecondi
    '2027-09',                 // mese solo
    '20270930',                // forma compatta
    '2027-09-30 10:00:00',     // spazio al posto della T
    '2027-02-30',              // data impossibile
    '2027-13-01',
    '2027-09-30T25:00:00Z',
    '2027-09-30T10:00:00+25:00',
    'domani',
    'now',
    'null',
    'undefined',
    '',
    '%',                       // codifica rotta
  ]) {
    assert.equal(parseNow(`?now=${sbagliato}`), null, `non ignorato: «${sbagliato}»`);
  }
});

test('senza il parametro, o senza query, non c\'è nulla da simulare', () => {
  assert.equal(parseNow(''), null);
  assert.equal(parseNow('?'), null);
  assert.equal(parseNow('?altro=2027-09-30'), null);
  assert.equal(parseNow('?now'), null);
  assert.equal(parseNow(undefined), null);
});
