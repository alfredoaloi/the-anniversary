// I controlli condivisi dai moduli che leggono src/contenuti.js e scrivono in pagina.

// Vero se `valore` è una stringa con almeno un carattere che non sia spazio.
export function testoNonVuoto(valore) {
  return typeof valore === 'string' && valore.trim() !== '';
}

// Lancia un Error in italiano se non c'è un oggetto di contenuti.
export function contenutiPresenti(config) {
  if (config === null || typeof config !== 'object') {
    throw new Error('Mancano i contenuti dell\'Invito.');
  }
}

// I segnaposto [data-<nome>] della pagina, uno alla volta, come coppie [elemento, chiave].
// Lancia un Error in italiano appena incontra una chiave che non è tra quelle ammesse.
export function* segnaposti(documento, nome, chiaviAmmesse) {
  for (const e of documento.querySelectorAll(`[data-${nome}]`)) {
    const chiave = e.dataset[nome];
    if (!chiaviAmmesse.includes(chiave)) {
      throw new Error(`Nel markup c'è un segnaposto sconosciuto: data-${nome}="${chiave}".`);
    }
    yield [e, chiave];
  }
}
