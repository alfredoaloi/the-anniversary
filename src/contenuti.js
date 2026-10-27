// ATTENZIONE: questo repository è PUBBLICO. Qui non vanno cognomi, indirizzi, numeri di telefono,
// email né nomi o foto di persone reali: solo i testi dell'Invito.
//
// Tutti i contenuti dell'Invito stanno in questo file; per cambiarli non serve toccare altro.

export const contenuti = {
  // Testata e chiusura della pagina. Nel titolo, la parte tra asterischi va in corsivo borgogna.
  sigillo: 'J·C',
  dataLine: 'Anno Domini 2026 · 28 d\'ottobre',
  titolo: 'Un invito, *mo chridhe*',
  rigaCountdown: 'Il tempo che resta al Giorno del Romics.',
  chiusura: 'Slàinte mhath!',

  // La Missione: la lettera sotto il countdown, un unico paragrafo, e la sua firma. Il capolettera lo
  // fa il foglio di stile. Nessuna data precisa del Romics qui dentro: la dice il countdown.
  missione:
    'Sassenach, il 28 ottobre 2026, giorno del nostro anniversario, vi scrivo per farvi una proposta. ' +
    'L\'autunno dell\'anno venturo, a Roma, ci sarà il Romics, e io vorrei andarci con voi: io nei panni di Jamie, ' +
    'voi in quelli di Claire, nel giorno delle loro nozze. Sangue del mio sangue, ossa delle mie ossa: ' +
    'per quel giorno non manca che una cosa, il vostro sì. ' +
    'Il resto, dinna fash, lo prepareremo insieme, punto per punto, qui sotto.',
  firmaMissione: '— Il vostro Jamie',

  // Il Giorno del Romics: una sola data-ora ISO 8601 con l'offset di Roma esplicito
  // (+02:00 con l'ora legale, +01:00 con l'ora solare).
  // PROVVISORIO: 30 settembre 2027, ore 10:00. La data ufficiale del Romics d'autunno 2027 non è
  // ancora confermata (alternativa plausibile: giovedì 7 ottobre 2027). Per correggerla basta
  // cambiare questa riga.
  giornoDelRomics: '2027-09-30T10:00:00+02:00',

  // Quanti giorni interi dopo il Giorno del Romics il countdown lascia il posto al saluto di chiusura
  // (alla stessa ora di Roma, anche attraversando un cambio d'ora).
  giorniAllaChiusura: 4,

  // Cosa compare al posto dei numeri dal Giorno del Romics fino alla chiusura.
  messaggioGiorno: 'È il giorno, mo nighean donn! Indossate le nozze di Claire, io metto il plaid: si va al Romics.',

  // Cosa compare al posto dei numeri dalla chiusura in poi.
  salutoChiusura: 'Il Romics è passato, e che giornata, mo chridhe. Slàinte mhath!',

  // La Sarta: il link in fondo al punto III dei Preparativi (l'unico ingresso al popup) e il popup.
  // Nessun luogo, nessuna foto, nessuna riga che dica chi è davvero: lo riconosce chi la conosce.
  linkSarta: 'Conoscete la sarta',
  sarta: {
    intestazione: 'Sartoria di costumi storici',
    nome: 'Mistress Marie',
    riga: 'dal 1938',
    testo:
      'Quasi novant\'anni d\'ago e filo, abiti d\'epoca su misura, ricami a mano in filo metallico, ' +
      'plissettature a cartuccia e orli di kilt senza un millimetro fuori posto.',
    chiudi: 'Chiudi',
  },

  // I Preparativi: esattamente dieci punti, in ordine cronologico; la pagina li numera I–X.
  // Ognuno ha un titolo e una riga. Nessuna spunta, scadenza, data o stato.
  preparativi: [
    { titolo: 'Dire di sì', riga: 'Il primo passo è il più arduo, Sassenach: rispondere di sì.' },
    { titolo: 'Rivedere le nozze', riga: 'Rivediamo insieme l\'episodio, mo chridhe, con carta e penna: i fermagli non si improvvisano.' },
    { titolo: 'Conoscere la sarta', riga: 'Dinna fash: tra le mie conoscenze ce n\'è una abilissima.' },
    { titolo: 'Il kilt e il plaid', riga: 'Otto iarde di tartan Fraser: non si lesina sulla stoffa.' },
    { titolo: 'La camicia e la spilla', riga: 'Una camicia di lino, polsini ricamati d\'argento e un luccichio sul colletto.' },
    { titolo: 'L\'abito di Claire', riga: 'Argento, non bianco: l\'abito più luminoso a lume di candela.' },
    { titolo: 'Perle, anello e il resto', riga: 'Un filo di perle, mo nighean donn, e un anello d\'argento.' },
    { titolo: 'I capelli', riga: 'Rosso per lui, ricci per lei: la natura fa il resto.' },
    { titolo: 'I trucchi', riga: 'Pelle luminosa e labbra naturali: niente di moderno, Sassenach.' },
    { titolo: 'La prova generale', riga: 'Un mese prima, vestiti di tutto punto, con tanto di foto.' },
  ],
};
