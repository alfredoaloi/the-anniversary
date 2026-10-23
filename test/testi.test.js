// Seam: i testi della testata e della chiusura che la pagina scrive una volta sola all'avvio.
// Configurazione di prova indipendente dai contenuti reali.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TESTI_TESTATA, partiTitolo, validaTesti } from '../src/testi.js';

const prova = {
  sigillo: 'X·Y',
  dataLine: 'Data di prova',
  titolo: 'Inizio, *parte in corsivo*',
  rigaCountdown: 'Riga di prova.',
  chiusura: 'Chiusura di prova!',
  missione: 'Lettera di prova.',
  firmaMissione: '— Firma di prova',
};

test('testi validi non lanciano errori', () => {
  assert.doesNotThrow(() => validaTesti(prova));
});

test('i testi controllati sono sigillo, data, titolo, riga sopra il countdown e chiusura', () => {
  assert.deepEqual([...TESTI_TESTATA].sort(), ['chiusura', 'dataLine', 'rigaCountdown', 'sigillo', 'titolo']);
});

for (const chiave of ['sigillo', 'dataLine', 'titolo', 'rigaCountdown', 'chiusura']) {
  test(`${chiave} vuoto, di soli spazi o mancante dà un errore chiaro in italiano`, () => {
    for (const valore of ['', '   ', undefined, 42]) {
      assert.throws(
        () => validaTesti({ ...prova, [chiave]: valore }),
        (e) => e instanceof Error && e.message.includes(chiave) && /vuoto|mancante/i.test(e.message),
      );
    }
  });
}

test('manca la configurazione: errore chiaro', () => {
  assert.throws(() => validaTesti(null), /contenuti/i);
});

test('il titolo si divide in parti normali e in corsivo: la parte tra asterischi è in corsivo', () => {
  assert.deepEqual(partiTitolo('Un invito, *mo chridhe*'), [
    { testo: 'Un invito, ', corsivo: false },
    { testo: 'mo chridhe', corsivo: true },
  ]);
});

test('un titolo senza asterischi è tutto normale', () => {
  assert.deepEqual(partiTitolo('Solo testo'), [{ testo: 'Solo testo', corsivo: false }]);
});
