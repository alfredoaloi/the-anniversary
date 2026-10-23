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
};
