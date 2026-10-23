// Il parametro ?now=, che simula l'istante corrente per provare le tre fasi senza aspettare.
// Accetta solo una data o una data-ora ISO 8601 (con offset o Z, senza offset, o solo la data);
// qualunque altro valore, o la sua assenza, viene ignorato: un refuso non rompe mai la pagina.

import { istanteDaIso } from './iso.js';

// `search` è la parte dell'URL che comincia con «?» (location.search).
// Restituisce i millisecondi dall'epoca, oppure null se non c'è nulla da simulare.
export function parseNow(search) {
  if (typeof search !== 'string') return null;
  let valore = new URLSearchParams(search).get('now');
  if (valore === null) return null;
  // Nell'URL un «+» non codificato diventa uno spazio: «…T10:00:00+02:00» arriva come «…T10:00:00 02:00».
  valore = valore.replace(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?) (\d{2}:\d{2})$/, '$1+$2');
  return istanteDaIso(valore);
}
