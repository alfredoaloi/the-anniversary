// Lettura di date e date-ora ISO 8601, senza dipendenze.
// Forme accettate: «2027-09-30», «2027-09-30T10:00», «2027-09-30T10:00:00», con frazione di secondo
// facoltativa e con offset facoltativo («Z», «+02:00», «-05:00»). Ogni altra stringa vale null.
//
// Una data o una data-ora senza offset si legge come ora di Roma: il risultato non dipende dal fuso
// del dispositivo che apre la pagina.

import { istanteDaMuroRoma } from './roma.js';

const ISO = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-]\d{2}:\d{2})?)?$/;

// Restituisce i millisecondi dall'epoca dell'istante indicato, o null se il testo non è valido.
// Con `offsetObbligatorio` accetta solo date-ora con offset esplicito.
export function istanteDaIso(testo, { offsetObbligatorio = false } = {}) {
  if (typeof testo !== 'string') return null;
  const lettura = ISO.exec(testo);
  if (!lettura) return null;

  const [anno, mese, giorno] = [lettura[1], lettura[2], lettura[3]].map(Number);
  const ore = Number(lettura[4] ?? 0);
  const minuti = Number(lettura[5] ?? 0);
  const secondi = Number(lettura[6] ?? 0);
  const millisecondi = Number(((lettura[7] ?? '') + '000').slice(0, 3));
  const offset = lettura[8];

  if (offsetObbligatorio && offset === undefined) return null;
  if (mese < 1 || mese > 12 || ore > 23 || minuti > 59 || secondi > 59) return null;
  const giorniDelMese = new Date(Date.UTC(anno, mese, 0)).getUTCDate();
  if (giorno < 1 || giorno > giorniDelMese) return null;

  // I campi letti come se fossero UTC: l'ora "del muro".
  const muro = Date.UTC(anno, mese - 1, giorno, ore, minuti, secondi, millisecondi);

  if (offset === undefined) return istanteDaMuroRoma(muro);
  if (offset === 'Z') return muro;
  const segno = offset[0] === '-' ? -1 : 1;
  const [oreOffset, minutiOffset] = offset.slice(1).split(':').map(Number);
  if (oreOffset > 23 || minutiOffset > 59) return null;
  return muro - segno * (oreOffset * 60 + minutiOffset) * 60_000;
}
