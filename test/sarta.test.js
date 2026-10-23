// Seam: il popup della Sarta — controllo dei contenuti e link d'ingresso nel punto III dei Preparativi.
// Configurazione di prova indipendente dai contenuti reali; il dialog in sé si prova a mano (spec).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TESTI_SARTA, scriviSarta, validaSarta } from '../src/sarta.js';

const prova = () => ({
  linkSarta: 'Link di prova',
  sarta: {
    intestazione: 'Intestazione di prova',
    nome: 'Nome di prova',
    riga: 'Riga di prova',
    testo: 'Testo di prova.',
    chiudi: 'Chiudi di prova',
  },
});

test('contenuti della Sarta validi non lanciano errori', () => {
  assert.doesNotThrow(() => validaSarta(prova()));
});

test('i testi del popup sono intestazione, nome, riga, testo e pulsante', () => {
  assert.deepEqual([...TESTI_SARTA].sort(), ['chiudi', 'intestazione', 'nome', 'riga', 'testo']);
});

for (const chiave of ['intestazione', 'nome', 'riga', 'testo', 'chiudi']) {
  test(`${chiave} vuoto, di soli spazi o mancante dà un errore chiaro in italiano`, () => {
    for (const valore of ['', '   ', undefined, 42]) {
      const c = prova();
      c.sarta[chiave] = valore;
      assert.throws(
        () => validaSarta(c),
        (e) => e instanceof Error && e.message.includes(`sarta.${chiave}`) && /vuoto|mancante/i.test(e.message),
      );
    }
  });
}

test('il testo del link vuoto o mancante dà un errore chiaro in italiano', () => {
  for (const valore of ['', '   ', undefined, 42]) {
    const c = { ...prova(), linkSarta: valore };
    assert.throws(
      () => validaSarta(c),
      (e) => e instanceof Error && e.message.includes('linkSarta') && /vuoto|mancante/i.test(e.message),
    );
  }
});

test('manca la configurazione o la voce «sarta»: errore chiaro in italiano', () => {
  assert.throws(() => validaSarta(null), /contenuti/i);
  assert.throws(() => validaSarta({ linkSarta: 'x' }), /popup.*«sarta»/i);
  assert.throws(() => validaSarta({ linkSarta: 'x', sarta: 'Mistress' }), /popup.*«sarta»/i);
});

// ---- Il link d'ingresso nel punto III, su un DOM finto minimo ----

function elemento(tag) {
  const e = {
    tag, figli: [], attributi: {}, className: '', textContent: '', type: '',
    append(...nodi) { e.figli.push(...nodi); },
    setAttribute(nome, valore) { e.attributi[nome] = valore; },
    querySelector(selettore) {
      if (selettore === '[data-apri-sarta]') return e.figli.find((f) => 'data-apri-sarta' in f.attributi) ?? null;
      throw new Error(`selettore non previsto: ${selettore}`);
    },
  };
  return e;
}

function paginaFinta({ conPunto3 = true } = {}) {
  const segnaposto = TESTI_SARTA.map((chiave) => Object.assign(elemento('p'), { dataset: { sarta: chiave } }));
  const corpo = elemento('div');
  const per = {
    '[data-preparativo="3"] .preparativo-corpo': conPunto3 ? corpo : null,
  };
  const documento = {
    createElement: elemento,
    querySelector: (s) => {
      if (!(s in per)) throw new Error(`selettore non previsto: ${s}`);
      return per[s];
    },
    querySelectorAll: (s) => {
      if (s !== '[data-sarta]') throw new Error(`selettore non previsto: ${s}`);
      return segnaposto;
    },
  };
  return { documento, corpo, segnaposto };
}

test('scriviSarta mette nel punto III un solo pulsante-link con il testo del file di dati', () => {
  const { documento, corpo } = paginaFinta();
  scriviSarta(documento, prova());
  assert.equal(corpo.figli.length, 1);
  const [apri] = corpo.figli;
  assert.equal(apri.tag, 'button');
  assert.equal(apri.type, 'button');
  assert.equal(apri.textContent, 'Link di prova');
  assert.ok('data-apri-sarta' in apri.attributi);
});

test('scriviSarta chiamata due volte non duplica il link', () => {
  const { documento, corpo } = paginaFinta();
  scriviSarta(documento, prova());
  scriviSarta(documento, prova());
  assert.equal(corpo.figli.length, 1);
});

test('scriviSarta riempie i segnaposto del popup con i testi del file di dati', () => {
  const { documento, segnaposto } = paginaFinta();
  scriviSarta(documento, prova());
  assert.deepEqual(
    segnaposto.map((e) => [e.dataset.sarta, e.textContent]),
    TESTI_SARTA.map((chiave) => [chiave, prova().sarta[chiave]]),
  );
});

test('se nella pagina manca il punto III dei Preparativi, scriviSarta lo dice con un errore chiaro', () => {
  const { documento } = paginaFinta({ conPunto3: false });
  assert.throws(() => scriviSarta(documento, prova()), /punto III|Preparativ/i);
});

test('un segnaposto sconosciuto nel markup dà un errore chiaro', () => {
  const { documento, segnaposto } = paginaFinta();
  segnaposto[0].dataset.sarta = 'luogo';
  assert.throws(() => scriviSarta(documento, prova()), /luogo/);
});
