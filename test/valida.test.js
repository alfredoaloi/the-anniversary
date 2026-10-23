// Seam: i controlli condivisi dai moduli che leggono i contenuti (src/valida.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contenutiPresenti, segnaposti, testoNonVuoto } from '../src/valida.js';

test('testoNonVuoto: vero solo per una stringa con almeno un carattere che non sia spazio', () => {
  assert.equal(testoNonVuoto('ciao'), true);
  assert.equal(testoNonVuoto('  ciao  '), true);
  for (const valore of ['', '   ', '\n\t', undefined, null, 42, {}, []]) {
    assert.equal(testoNonVuoto(valore), false, `«${String(valore)}» non è un testo non vuoto`);
  }
});

test('contenutiPresenti: accetta un oggetto, rifiuta il resto con un errore in italiano', () => {
  assert.doesNotThrow(() => contenutiPresenti({}));
  for (const config of [null, undefined, 'testo', 42]) {
    assert.throws(() => contenutiPresenti(config), { message: 'Mancano i contenuti dell\'Invito.' });
  }
});

test('segnaposti: elenca gli elementi [data-<nome>] con la loro chiave, e rifiuta le chiavi sconosciute', () => {
  const elementi = [
    { dataset: { prova: 'uno' } },
    { dataset: { prova: 'due' } },
    { dataset: { prova: 'tre' } },
  ];
  const documento = { querySelectorAll: (selettore) => (selettore === '[data-prova]' ? elementi : []) };

  assert.deepEqual([...segnaposti(documento, 'prova', ['uno', 'due', 'tre'])], [
    [elementi[0], 'uno'], [elementi[1], 'due'], [elementi[2], 'tre'],
  ]);

  // L'errore arriva quando si arriva al segnaposto sbagliato: i precedenti sono già stati consegnati.
  const visti = [];
  assert.throws(
    () => { for (const [, chiave] of segnaposti(documento, 'prova', ['uno', 'due'])) visti.push(chiave); },
    { message: 'Nel markup c\'è un segnaposto sconosciuto: data-prova="tre".' },
  );
  assert.deepEqual(visti, ['uno', 'due']);
});
