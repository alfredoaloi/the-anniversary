// L'ora di Roma (Europe/Rome), senza dipendenze e senza dati di fuso del browser.
// Regola dell'Unione Europea: l'ora legale (+02:00) va dalle 01:00 UTC dell'ultima domenica di marzo
// (alle 02:00 locali si passa alle 03:00) alle 01:00 UTC dell'ultima domenica di ottobre
// (alle 03:00 locali si torna alle 02:00); il resto dell'anno vale l'ora solare (+01:00).

const MS_MINUTO = 60_000;
const MS_GIORNO = 86_400_000;
const MS_ORA = 3_600_000;

// 01:00 UTC dell'ultima domenica del mese (mese 0-11).
function ultimaDomenica(anno, mese) {
  const ultimoDelMese = Date.UTC(anno, mese + 1, 0);
  const giornoSettimana = new Date(ultimoDelMese).getUTCDay();
  return ultimoDelMese - giornoSettimana * MS_GIORNO + MS_ORA;
}

// Scarto di Roma da UTC, in minuti, all'istante `ms` (millisecondi dall'epoca): 120 o 60.
export function offsetRoma(ms) {
  const anno = new Date(ms).getUTCFullYear();
  const inizioOraLegale = ultimaDomenica(anno, 2);
  const fineOraLegale = ultimaDomenica(anno, 9);
  return ms >= inizioOraLegale && ms < fineOraLegale ? 120 : 60;
}

// L'ora del muro di Roma all'istante `ms`, come millisecondi "UTC" dei suoi campi
// (si leggono con getUTC*; si ricompone con istanteDaMuroRoma).
export function muroRoma(ms) {
  return ms + offsetRoma(ms) * MS_MINUTO;
}

// L'istante in cui il muro di Roma segna `muro` (campi letti come UTC).
// Un'ora che ricorre due volte (salto indietro) vale la prima; un'ora che non esiste
// (salto in avanti) slitta in avanti, alla prima ora che esiste.
export function istanteDaMuroRoma(muro) {
  for (const offset of [120, 60]) {
    const istante = muro - offset * MS_MINUTO;
    if (offsetRoma(istante) === offset) return istante;
  }
  return muro - 60 * MS_MINUTO;
}

// Lo stesso muro di Roma di `ms`, `giorni` giorni di calendario dopo.
export function aggiungiGiorniRoma(ms, giorni) {
  return istanteDaMuroRoma(muroRoma(ms) + giorni * MS_GIORNO);
}
