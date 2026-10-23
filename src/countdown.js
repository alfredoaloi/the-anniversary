// Il tempo che manca, in pagina: giorni, ore, minuti e secondi con singolare e plurale corretti,
// oppure un testo al posto dei numeri (fasi `giorno` e `dopo`).
//
// Scrive nel DOM solo ciò che è cambiato. Il nome accessibile è statico e sta nel markup
// (role="group" con aria-label): l'area non è una regione live, quindi i lettori di schermo
// non annunciano ogni secondo.
//
// Punti di aggancio nel markup della radice:
//   [data-numeri]                      il contenitore dei numeri
//   [data-valore="giorni|ore|minuti|secondi"]     il numero
//   [data-etichetta="giorni|ore|minuti|secondi"]  la parola accanto al numero
//   [data-testo]                       il testo che sostituisce i numeri

const UNITA = [
  ['giorni', 'giorno', 'giorni'],
  ['ore', 'ora', 'ore'],
  ['minuti', 'minuto', 'minuti'],
  ['secondi', 'secondo', 'secondi'],
];

function trova(radice, selettore) {
  const e = radice.querySelector(selettore);
  if (!e) throw new Error(`Nel markup del countdown manca l'elemento ${selettore}.`);
  return e;
}

const scriviTesto = (e, valore) => { if (e.textContent !== valore) e.textContent = valore; };
const scriviNascosto = (e, valore) => { if (e.hidden !== valore) e.hidden = valore; };

// Collega il renderer al markup e restituisce { aggiorna(view) }, dove `view` è quella di computeView.
export function creaCountdown(radice) {
  const numeri = trova(radice, '[data-numeri]');
  const testo = trova(radice, '[data-testo]');
  const unita = UNITA.map(([nome, singolare, plurale]) => ({
    nome,
    singolare,
    plurale,
    valore: trova(radice, `[data-valore="${nome}"]`),
    etichetta: trova(radice, `[data-etichetta="${nome}"]`),
  }));

  function aggiorna(view) {
    if (view.kind === 'attesa') {
      for (const u of unita) {
        const n = view[u.nome];
        scriviTesto(u.valore, String(n));
        scriviTesto(u.etichetta, n === 1 ? u.singolare : u.plurale);
      }
      scriviNascosto(testo, true);
      scriviNascosto(numeri, false);
    } else {
      scriviTesto(testo, view.testo);
      scriviNascosto(testo, false);
      scriviNascosto(numeri, true);
    }
  }

  return { aggiorna };
}
