// I Preparativi: controllo e scrittura in pagina, una volta sola all'avvio (il tick non li ridisegna).
// I testi stanno solo in src/contenuti.js (chiave «preparativi»: un elenco di dieci {titolo, riga}).
// Nessuna spunta, nessuna scadenza, nessuno stato: la pagina non memorizza nulla.

export const NUMERO_PREPARATIVI = 10;

const ROMANI = [['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]];

// 1 → «I», 4 → «IV», 10 → «X» (basta fino a 39, più del necessario).
export function numeroRomano(n) {
  let resto = n;
  let romano = '';
  for (const [simbolo, valore] of ROMANI) {
    while (resto >= valore) { romano += simbolo; resto -= valore; }
  }
  return romano;
}

// Lancia un Error in italiano se i Preparativi non sono esattamente dieci o se un titolo o una riga è vuoto.
export function validaPreparativi(config) {
  if (config === null || typeof config !== 'object') {
    throw new Error('Mancano i contenuti dell\'Invito.');
  }
  const elenco = config.preparativi;
  if (!Array.isArray(elenco)) {
    throw new Error('I Preparativi mancano in src/contenuti.js: serve l\'elenco «preparativi».');
  }
  if (elenco.length !== NUMERO_PREPARATIVI) {
    throw new Error(
      `I Preparativi devono essere esattamente dieci, ma in src/contenuti.js ce ne sono ${elenco.length}.`,
    );
  }
  elenco.forEach((p, i) => {
    for (const campo of ['titolo', 'riga']) {
      const valore = p !== null && typeof p === 'object' ? p[campo] : undefined;
      if (typeof valore !== 'string' || valore.trim() === '') {
        throw new Error(
          `Nel Preparativo ${numeroRomano(i + 1)} il testo «${campo}» è vuoto o mancante in src/contenuti.js.`,
        );
      }
    }
  });
}

// Scrive i Preparativi nell'elenco ordinato [data-preparativi] della pagina. Solo textContent.
// Ogni punto è un <li class="preparativo" data-preparativo="N"> con il numero romano come testo vero
// e un corpo (.preparativo-corpo) che contiene titolo e riga: scriviSarta (src/sarta.js) aggiunge il
// suo link in fondo al corpo del punto 3.
export function scriviPreparativi(documento, config) {
  const lista = documento.querySelector('[data-preparativi]');
  if (!lista) throw new Error('Nel markup manca l\'elenco [data-preparativi] dei Preparativi.');
  const testo = (tag, classe, contenuto) => {
    const e = documento.createElement(tag);
    e.className = classe;
    e.textContent = contenuto;
    return e;
  };
  lista.replaceChildren(
    ...config.preparativi.map(({ titolo, riga }, i) => {
      const li = documento.createElement('li');
      li.className = 'preparativo';
      li.dataset.preparativo = String(i + 1);
      const corpo = documento.createElement('div');
      corpo.className = 'preparativo-corpo';
      corpo.append(testo('b', 'preparativo-titolo', titolo), testo('i', 'preparativo-riga', riga));
      li.append(testo('span', 'preparativo-numero', numeroRomano(i + 1)), corpo);
      return li;
    }),
  );
}
