// Seam: i Preparativi — controllo della configurazione e numeri romani.
// Configurazione di prova indipendente dai contenuti reali.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NUMERO_PREPARATIVI, numeroRomano, validaPreparativi } from '../src/preparativi.js';

const dieci = () =>
  Array.from({ length: 10 }, (_, i) => ({ titolo: `Titolo ${i + 1}`, riga: `Riga ${i + 1}.` }));
const prova = () => ({ preparativi: dieci() });

test('dieci Preparativi con titolo e riga non lanciano errori', () => {
  assert.equal(NUMERO_PREPARATIVI, 10);
  assert.doesNotThrow(() => validaPreparativi(prova()));
});

test('i numeri romani da 1 a 10 sono I–X', () => {
  const attesi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  assert.deepEqual(attesi.map((_, i) => numeroRomano(i + 1)), attesi);
});

test('manca la configurazione o l\'elenco dei Preparativi: errore chiaro in italiano', () => {
  assert.throws(() => validaPreparativi(null), /contenuti/i);
  assert.throws(() => validaPreparativi({}), /preparativi.*(mancan|elenco)/i);
  assert.throws(() => validaPreparativi({ preparativi: 'dieci' }), /preparativi.*(mancan|elenco)/i);
});

for (const n of [0, 1, 9, 11, 12]) {
  test(`${n} Preparativi invece di dieci: errore chiaro che dice quanti sono`, () => {
    const preparativi = Array.from({ length: n }, (_, i) => ({ titolo: `T${i}`, riga: `R${i}` }));
    assert.throws(
      () => validaPreparativi({ preparativi }),
      (e) => e instanceof Error && /dieci/i.test(e.message) && e.message.includes(String(n)),
    );
  });
}

for (const campo of ['titolo', 'riga']) {
  test(`${campo} vuoto, di soli spazi o mancante dà un errore che dice quale Preparativo`, () => {
    for (const valore of ['', '   ', undefined, 7]) {
      const c = prova();
      c.preparativi[3] = { ...c.preparativi[3], [campo]: valore };
      assert.throws(
        () => validaPreparativi(c),
        (e) => e instanceof Error && e.message.includes(campo) && e.message.includes('IV') && /vuot|mancant/i.test(e.message),
      );
    }
  });
}

test('un Preparativo che non è un oggetto dà un errore chiaro', () => {
  const c = prova();
  c.preparativi[0] = 'Dire di sì';
  assert.throws(() => validaPreparativi(c), /\bI\b.*(titolo|mancant)/i);
});
