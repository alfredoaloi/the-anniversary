// Il popup della Sarta: controllo dei contenuti, scrittura in pagina (una volta sola all'avvio) e
// collegamento del <dialog> nativo. I testi stanno solo in src/contenuti.js (chiavi «sarta» e «linkSarta»):
// il markup ha i segnaposto vuoti [data-sarta="<chiave>"] e questo modulo li riempie con textContent.
//
// L'unico ingresso al popup è il pulsante-link «Conoscete la sarta», aggiunto in fondo al corpo del
// punto III dei Preparativi. Il popup ha un solo pulsante, «Chiudi»; si chiude anche con Esc (nativo).

// Le chiavi del popup in config.sarta.
export const TESTI_SARTA = ['intestazione', 'nome', 'riga', 'testo', 'chiudi'];

const SELETTORE_PUNTO_III = '[data-preparativo="3"] .preparativo-corpo';

// Lancia un Error in italiano se mancano il testo del link o uno dei testi del popup.
export function validaSarta(config) {
  if (config === null || typeof config !== 'object') {
    throw new Error('Mancano i contenuti dell\'Invito.');
  }
  const vuoto = (valore) => typeof valore !== 'string' || valore.trim() === '';
  if (vuoto(config.linkSarta)) {
    throw new Error('Il testo «linkSarta» è vuoto o mancante in src/contenuti.js.');
  }
  const sarta = config.sarta;
  if (sarta === null || typeof sarta !== 'object') {
    throw new Error('Il popup della Sarta manca in src/contenuti.js: serve la voce «sarta».');
  }
  for (const chiave of TESTI_SARTA) {
    if (vuoto(sarta[chiave])) {
      throw new Error(`Il testo «sarta.${chiave}» è vuoto o mancante in src/contenuti.js.`);
    }
  }
}

// Scrive i testi del popup nei segnaposto e aggiunge il link d'ingresso in fondo al punto III.
// Va chiamata dopo scriviPreparativi (che riscrive l'elenco). Solo textContent. Si può richiamare:
// il link non viene duplicato.
export function scriviSarta(documento, config) {
  const corpo = documento.querySelector(SELETTORE_PUNTO_III);
  if (!corpo) {
    throw new Error('Nel markup manca il punto III dei Preparativi: il link alla Sarta non ha dove stare.');
  }
  for (const e of documento.querySelectorAll('[data-sarta]')) {
    const chiave = e.dataset.sarta;
    if (!TESTI_SARTA.includes(chiave)) {
      throw new Error(`Nel markup c'è un segnaposto sconosciuto: data-sarta="${chiave}".`);
    }
    e.textContent = config.sarta[chiave];
  }
  let apri = corpo.querySelector('[data-apri-sarta]');
  if (!apri) {
    apri = documento.createElement('button');
    apri.type = 'button';
    apri.className = 'link-sarta';
    apri.setAttribute('data-apri-sarta', '');
    apri.setAttribute('aria-haspopup', 'dialog');
    corpo.append(apri);
  }
  apri.textContent = config.linkSarta;
}

// Collega il link al <dialog>: showModal() all'apertura, «Chiudi» che lo chiude (Esc è nativo).
// Alla chiusura il focus torna esplicitamente al link, anche dove la piattaforma non lo fa da sé.
export function collegaSarta(documento) {
  const dialog = documento.querySelector('dialog[data-sarta-dialog]');
  const apri = documento.querySelector('[data-apri-sarta]');
  const chiudi = dialog && dialog.querySelector('[data-sarta="chiudi"]');
  if (!dialog || !apri || !chiudi) {
    throw new Error('Nel markup mancano il popup della Sarta, il suo pulsante «Chiudi» o il link che lo apre.');
  }
  apri.addEventListener('click', () => {
    if (dialog.open) return;
    dialog.showModal();
    dialog.scrollTop = 0;
  });
  chiudi.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => apri.focus());
}
