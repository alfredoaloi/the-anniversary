# Date ufficiali del Romics autunno 2027

Ticket: [#3](https://github.com/alfredoaloi/the-anniversary/issues/3), figlio della mappa [#2](https://github.com/alfredoaloi/the-anniversary/issues/2).
Data di consultazione di tutte le fonti: **2026-10-23**.

## Risposta in breve

**Le date ufficiali del Romics autunno 2027 non risultano confermate da nessuna fonte primaria che io abbia potuto leggere.** Il valore provvisorio da usare in `config.js` è:

```
2027-09-30T10:00:00+02:00
```

Grado di certezza: **basso**. È il valore indicato dal ticket (30 settembre-3 ottobre 2027), ma io non sono riuscito a riscontrarlo. Una seconda ipotesi plausibile è giovedì 7 ottobre 2027 (vedi sotto). L'offset `+02:00` è corretto per entrambe: l'ora legale in Europa termina domenica 31 ottobre 2027.

Ricontrollare su romics.it alla chiusura dell'edizione di aprile 2027 (comunicato finale) e, in ogni caso, prima di dare per buona una data nel sito.

## Cosa è certo e cosa no

### Accertato, ma solo tramite motori di ricerca (fonti secondarie)

- Edizione autunno 2026 (37a): 1-4 ottobre 2026, Fiera Roma. Riportata da [RomaToday](https://www.romatoday.it/eventi/romics-1-4-ottobre-2026.html), [Lazio Innova](https://www.lazioinnova.it/eventi/e/romics-autunno-2026/) e altri.
- Edizione primavera 2026 (36a): 9-12 aprile 2026 ([Turismo Roma](https://www.turismoroma.it/it/eventi/romics-2026-36esima-edizione)).
- Edizione autunno 2025 (35a): 2-5 ottobre 2025 (riportata dai risultati di ricerca su [fieraroma.it](https://www.fieraroma.it/en/evento/romics-ottobre-2025/)).
- Orario di apertura 2026: 10:00-20:00, orario continuato ([Turismo Roma](https://www.turismoroma.it/it/eventi/romics-2026-36esima-edizione), [blog Italo](https://blog.italotreno.com/idee-di-viaggio/romics-2026-programma-e-date/)). Un'altra fonte indica chiusura degli ingressi alle 19:00. Questo non dice nulla sull'orario del 2027.
- Schema ricorrente: tutte le edizioni citate iniziano di giovedì e durano quattro giorni (giovedì-domenica).

### Non verificato o contraddittorio

- **Elenco AEFI** ([pagina Romics 2027](https://www.aefi.it/it/manifestazione/romics-2027/)). Le mie ricerche hanno dato risposte contrastanti sul suo contenuto. Una ricerca ha riferito 30 settembre-3 ottobre 2027, come dice il ticket. Due ricerche successive, più mirate al dominio aefi.it, hanno invece riferito **una sola voce 2027, dall'8 all'11 aprile 2027**, organizzata da Fiera Roma S.r.l., e nessuna voce per l'autunno. Non ho potuto aprire la pagina per risolvere la discrepanza. AEFI dichiara inoltre che il calendario è aggiornato mensilmente, quindi le date non sono necessariamente definitive. **Non va dato per buono che l'AEFI indichi il 30 settembre-3 ottobre.**
- **Blog theredheadsdiaries.it** ([Romics aprile 2027](https://www.theredheadsdiaries.it/romics-aprile-2027-date/)). Indica la 38a edizione l'8-11 aprile 2027 a Fiera Roma, senza citare un comunicato ufficiale e rimandando ai canali ufficiali per il programma. Riguarda la primavera, non l'autunno.
- **EventsEye** ([scheda Romics](https://www.eventseye.com/fairs/f-romics-4596-1.html)). Indica "ottobre 2027" a Fiera Roma con un punto interrogativo, cioè non confermato. Anche per la primavera 2027 mette il punto interrogativo.
- **romics.it e fieraroma.it**. Nei risultati di ricerca che ho visto non compare nessun annuncio di date 2027. La pagina stampa di romics.it rimanda solo ai comunicati delle edizioni passate. Nessun comunicato ufficiale sulla 38a edizione o sull'autunno 2027.

### Ragionamento sulla data provvisoria

Il solo schema disponibile sull'autunno è: 2 ottobre 2025 (giovedì), 1 ottobre 2026 (giovedì). Per il 2027 i giovedì candidati sono il **30 settembre** (valore del ticket) e il **7 ottobre**. Lo schema non basta a scegliere: dipende dalla regola interna del calendario di Fiera Roma, che non conosco. Questa è un'inferenza, non un fatto. Per la primavera il giovedì dell'8 aprile 2027 è coerente con il 9 aprile 2026.

## Limiti di questa ricerca

Non ho potuto leggere nessuna pagina primaria. Il fetch diretto ha fallito: DNS non risolto per lo strumento WebFetch, e il proxy di rete della sessione ha risposto 403 alla connessione verso `www.aefi.it`, `romics.it`, `www.romics.it`, `www.fieraroma.it`, `www.romatoday.it`, `www.theredheadsdiaries.it` e `www.eventseye.com`. Non ho aggirato il blocco. Tutto quello che è riportato sopra proviene da riassunti di risultati di ricerca web, che in questa sessione sono risultati incoerenti tra loro. Vanno trattati come indizi.

## Come chiudere il dubbio (azione per una persona con accesso web)

1. Aprire la [pagina AEFI](https://www.aefi.it/it/manifestazione/romics-2027/) e il [calendario AEFI](https://aefi.it/it/calendario/) e leggere quante voci Romics ci sono per il 2027 e con quali date.
2. Aprire [romics.it](https://romics.it/it) e la pagina [Ufficio stampa](https://www.romics.it/it/ufficio-stampa) e cercare l'annuncio delle date dell'edizione autunnale 2027.
3. Aprire la pagina Romics su [fieraroma.it](https://www.fieraroma.it/), dove gli eventi correlati riportano le edizioni future.
4. Se romics.it non ha ancora annunciato, tenere `2027-09-30T10:00:00+02:00` come provvisorio e ricontrollare al comunicato finale dell'edizione di aprile 2027, poi prima di ogni modifica importante al sito.
