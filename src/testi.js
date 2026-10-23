// I testi della testata e della chiusura: controllo e scrittura in pagina, una volta sola all'avvio.
// Il tick del countdown non li ridisegna. I testi stanno solo in src/contenuti.js: il markup ha
// i segnaposto vuoti [data-contenuto="<chiave>"] e li riempie questo modulo.

// Le chiavi dei contenuti che questo modulo controlla e scrive.
export const TESTI_TESTATA = ['sigillo', 'dataLine', 'titolo', 'rigaCountdown', 'chiusura'];

// Lancia un Error in italiano se la configurazione non ha tutti i testi della testata e della chiusura.
export function validaTesti(config) {
  if (config === null || typeof config !== 'object') {
    throw new Error('Mancano i contenuti dell\'Invito.');
  }
  for (const chiave of TESTI_TESTATA) {
    const valore = config[chiave];
    if (typeof valore !== 'string' || valore.trim() === '') {
      throw new Error(`Il testo «${chiave}» è vuoto o mancante in src/contenuti.js.`);
    }
  }
}

// Divide un titolo in parti normali e in corsivo: la parte tra asterischi è in corsivo.
export function partiTitolo(titolo) {
  return titolo
    .split('*')
    .map((testo, i) => ({ testo, corsivo: i % 2 === 1 }))
    .filter((parte) => parte.testo !== '');
}

// Scrive i testi nei segnaposto della pagina. Solo textContent: i testi non sono mai markup.
export function scriviTesti(documento, config) {
  for (const e of documento.querySelectorAll('[data-contenuto]')) {
    const chiave = e.dataset.contenuto;
    if (!TESTI_TESTATA.includes(chiave)) {
      throw new Error(`Nel markup c'è un segnaposto sconosciuto: data-contenuto="${chiave}".`);
    }
    if (chiave === 'titolo') {
      e.replaceChildren(
        ...partiTitolo(config.titolo).map(({ testo, corsivo }) => {
          if (!corsivo) return documento.createTextNode(testo);
          const em = documento.createElement('em');
          em.textContent = testo;
          return em;
        }),
      );
    } else {
      e.textContent = config[chiave];
    }
  }
}
