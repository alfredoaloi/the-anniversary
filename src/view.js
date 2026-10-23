// Vista del countdown: funzione pura, senza DOM, orologio o storage.
// computeView(config, now) restituisce una di tre viste, distinte dal campo `kind`:
//   { kind: 'attesa', giorni, ore, minuti, secondi }  fino all'istante del Giorno del Romics
//   { kind: 'giorno', testo }                         dal Giorno del Romics fino alla chiusura
//   { kind: 'dopo', testo }                           dalla chiusura in poi
//
// La configurazione è { giornoDelRomics, giorniAllaChiusura, messaggioGiorno, salutoChiusura }
// (vedi src/contenuti.js). Se non è valida, computeView lancia un Error con un messaggio in italiano.

import { istanteDaIso } from './iso.js';
import { aggiungiGiorniRoma } from './roma.js';
import { testoNonVuoto } from './valida.js';

const SECONDI_GIORNO = 86_400;
const SECONDI_ORA = 3_600;

// Controlla la configurazione e ne ricava i due istanti che separano le fasi.
function leggiConfig(config) {
  if (config === null || typeof config !== 'object') {
    throw new Error('Manca la configurazione del countdown.');
  }

  const giorno = istanteDaIso(config.giornoDelRomics, { offsetObbligatorio: true });
  if (giorno === null) {
    throw new Error(
      `Il Giorno del Romics non è valido (${JSON.stringify(config.giornoDelRomics) ?? 'mancante'}): ` +
        'serve una data e ora ISO 8601 con offset, ad esempio 2027-09-30T10:00:00+02:00.',
    );
  }

  const giorni = config.giorniAllaChiusura;
  if (!Number.isInteger(giorni) || giorni < 0) {
    throw new Error(
      `I giorni dal Giorno del Romics al saluto di chiusura non sono validi (${String(giorni)}): ` +
        'serve un numero intero di giorni, zero o più.',
    );
  }

  if (!testoNonVuoto(config.messaggioGiorno)) {
    throw new Error('Il messaggio del Giorno del Romics è vuoto o mancante.');
  }
  if (!testoNonVuoto(config.salutoChiusura)) {
    throw new Error('Il saluto di chiusura è vuoto o mancante.');
  }

  // La chiusura è alla stessa ora del muro di Roma, anche attraversando un cambio d'ora.
  return { giorno, chiusura: aggiungiGiorniRoma(giorno, giorni) };
}

function leggiIstante(now) {
  const ms = now instanceof Date ? now.getTime() : now;
  if (typeof ms !== 'number' || Number.isNaN(ms)) {
    throw new Error('L\'istante corrente non è valido: servono millisecondi o una Date.');
  }
  return ms;
}

export function computeView(config, now) {
  const { giorno, chiusura } = leggiConfig(config);
  const adesso = leggiIstante(now);

  if (adesso >= chiusura) return { kind: 'dopo', testo: config.salutoChiusura };
  if (adesso >= giorno) return { kind: 'giorno', testo: config.messaggioGiorno };

  // Secondi per eccesso: prima dell'istante non si mostra mai zero.
  const totale = Math.ceil((giorno - adesso) / 1000);
  return {
    kind: 'attesa',
    giorni: Math.floor(totale / SECONDI_GIORNO),
    ore: Math.floor((totale % SECONDI_GIORNO) / SECONDI_ORA),
    minuti: Math.floor((totale % SECONDI_ORA) / 60),
    secondi: totale % 60,
  };
}
