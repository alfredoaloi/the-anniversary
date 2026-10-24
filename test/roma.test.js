// Le regole dell'ora di Roma scritte a mano in src/roma.js, confrontate con un'altra fonte di verità:
// il database dei fusi orari di Node (Intl), usato solo qui nei test (il sito non lo usa).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { offsetRoma } from '../src/roma.js';

const formato = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', timeZoneName: 'longOffset' });
const offsetIntl = (ms) => {
  const nome = formato.formatToParts(new Date(ms)).find((p) => p.type === 'timeZoneName').value;
  return nome === 'GMT' ? 0 : (nome[3] === '-' ? -1 : 1) * (Number(nome.slice(4, 6)) * 60 + Number(nome.slice(7, 9)));
};

test('lo scarto di Roma coincide con quello del database dei fusi, ogni mezz\'ora dal 2024 al 2040', () => {
  const mezzOra = 30 * 60_000;
  for (let ms = Date.UTC(2024, 0, 1); ms < Date.UTC(2041, 0, 1); ms += mezzOra) {
    if (offsetRoma(ms) !== offsetIntl(ms)) {
      assert.fail(`${new Date(ms).toISOString()}: atteso ${offsetIntl(ms)}, calcolato ${offsetRoma(ms)}`);
    }
  }
});

test('i cambi d\'ora del 2027 e 2028 cadono alle 01:00 UTC dell\'ultima domenica di ottobre e marzo', () => {
  assert.equal(offsetRoma(Date.parse('2027-10-31T00:59:59Z')), 120);
  assert.equal(offsetRoma(Date.parse('2027-10-31T01:00:00Z')), 60);
  assert.equal(offsetRoma(Date.parse('2028-03-26T00:59:59Z')), 60);
  assert.equal(offsetRoma(Date.parse('2028-03-26T01:00:00Z')), 120);
});
