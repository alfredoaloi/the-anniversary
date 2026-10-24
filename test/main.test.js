// Seam: il ciclo dei tick di src/main.js, con un finto setTimeout che il test fa scattare a mano.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { programmaTick } from '../src/main.js';

// Una finestra finta: setTimeout registra la richiesta, `scatta()` esegue quella in attesa.
function finestraFinta() {
  const attese = [];
  return {
    setTimeout: (fn, ms) => { attese.push({ fn, ms }); },
    inAttesa: () => attese.length,
    scatta: () => attese.shift().fn(),
    prossimaAttesa: () => attese[0]?.ms,
  };
}

test('un tick al secondo, allineato al cambio di secondo dell\'orologio', () => {
  const finestra = finestraFinta();
  let chiamate = 0;
  programmaTick(finestra, () => 5_250, () => { chiamate += 1; });
  assert.equal(finestra.prossimaAttesa(), 750);
  assert.equal(chiamate, 0);
  finestra.scatta();
  assert.equal(chiamate, 1);
  assert.equal(finestra.inAttesa(), 1, 'il tick successivo è già programmato');
});

test('se un tick lancia un errore, l\'errore viene segnalato e il countdown non si ferma', () => {
  const finestra = finestraFinta();
  const segnalati = [];
  let chiamate = 0;
  const tick = () => {
    chiamate += 1;
    if (chiamate === 1) throw new Error('tick rotto');
  };
  programmaTick(finestra, () => 0, tick, (errore) => segnalati.push(errore.message));

  finestra.scatta();
  assert.deepEqual(segnalati, ['tick rotto']);
  assert.equal(finestra.inAttesa(), 1, 'il tick dopo l\'errore è stato comunque programmato');

  finestra.scatta();
  assert.equal(chiamate, 2);
  assert.equal(finestra.inAttesa(), 1);
});
