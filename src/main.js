// Punto d'ingresso dell'Invito: collega contenuti, orologio (vero o simulato con ?now=), vista e DOM.
// Tutto ciò che sta fuori dall'area del countdown è markup statico che il tick non ridisegna.

import { contenuti } from './contenuti.js';
import { creaCountdown } from './countdown.js';
import { parseNow } from './now.js';
import { scriviPreparativi, validaPreparativi } from './preparativi.js';
import { collegaSarta, scriviSarta, validaSarta } from './sarta.js';
import { scriviTesti, validaTesti } from './testi.js';
import { computeView } from './view.js';

// L'orologio: l'ora vera, oppure — con ?now= valido — l'istante simulato che avanza di un secondo al secondo.
export function creaOrologio(search, adesso = () => Date.now()) {
  const simulato = parseNow(search);
  if (simulato === null) return adesso;
  const partenza = adesso();
  return () => simulato + (adesso() - partenza);
}

export function avvia(documento = document, finestra = window) {
  // I testi della testata e della chiusura si scrivono una volta sola, qui: il tick non li ridisegna.
  validaTesti(contenuti);
  scriviTesti(documento, contenuti);
  // I Preparativi: dieci punti, scritti una volta sola.
  validaPreparativi(contenuti);
  scriviPreparativi(documento, contenuti);
  // La Sarta: il link va nel punto III appena scritto, quindi dopo i Preparativi; poi si collega il popup.
  validaSarta(contenuti);
  scriviSarta(documento, contenuti);
  collegaSarta(documento);

  const radice = documento.querySelector('[data-countdown]');
  const countdown = creaCountdown(radice);
  const orologio = creaOrologio(finestra.location.search);

  const tick = () => countdown.aggiorna(computeView(contenuti, orologio()));
  tick();
  // Un tick al secondo, allineato al cambio di secondo dell'orologio così i numeri non saltano.
  const rinvia = () => finestra.setTimeout(() => { tick(); rinvia(); }, 1000 - (orologio() % 1000));
  rinvia();
}

if (typeof document !== 'undefined') avvia();
