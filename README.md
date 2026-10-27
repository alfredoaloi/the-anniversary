# The Anniversary

L'**Invito**: una pagina statica, in italiano, che invita a un cosplay di coppia al Romics dell'autunno 2027. Il vocabolario del progetto è in [`GLOSSARY.md`](GLOSSARY.md).

HTML, CSS e JavaScript puro con moduli ES: nessuna dipendenza, nessun build step, nessuna risorsa esterna. Solo tema chiaro, solo font di sistema, nessun dato salvato.

## Struttura

- `index.html`, `styles.css`: la pagina e il suo stile.
- `src/`: i moduli ES (punto d'ingresso: `src/main.js`).
- `img/`: l'illustrazione della pagina (`jamie-e-claire.webp`), un dipinto generato da un prompt originale, senza riferimenti a persone reali.
- `test/`: i test, con il runner di Node.
- `.github/workflows/deploy.yml`: il workflow di pubblicazione (vedi *Pubblicazione*).

## Dove stanno i contenuti

Tutti i contenuti stanno in un solo file, **`src/contenuti.js`**; per cambiarli non serve toccare altro. Ci sono i testi della testata (sigillo, data, titolo, riga sopra il countdown), la Missione e la sua firma, i dieci Preparativi (titolo e riga), il link e il popup della Sarta, il messaggio del Giorno del Romics, il saluto di chiusura e la chiusura della pagina, oltre alla data e al ritardo descritti qui sotto.

`index.html` ha solo segnaposto vuoti (`data-contenuto="..."`, `data-sarta="..."`): i moduli in `src/` li riempiono una volta sola all'avvio; il tick del countdown non ridisegna altro che i numeri. Nel titolo la parte tra asterischi è in corsivo borgogna. Il capolettera della Missione lo fa il foglio di stile, quindi il testo resta intero.

Dopo una modifica lanciare `npm test`: i test controllano il file (data valida con l'offset giusto, esattamente dieci Preparativi con titolo e riga, nessun testo vuoto o segnaposto).

## Il Giorno del Romics (data provvisoria)

`giornoDelRomics` in `src/contenuti.js` è un'unica data-ora ISO 8601 con l'offset di Roma esplicito: `+02:00` con l'ora legale, `+01:00` con l'ora solare (in autunno 2027 l'ora legale finisce domenica 31 ottobre).

**Il valore attuale è provvisorio**: `2027-09-30T10:00:00+02:00` (30 settembre 2027, ore 10:00). La data ufficiale del Romics d'autunno 2027 non è confermata; l'alternativa plausibile è giovedì 7 ottobre 2027, cioè `2027-10-07T10:00:00+02:00`, **da controllare a mano su romics.it**. Per correggerla basta cambiare quella riga.

`giorniAllaChiusura` (ora 4) è il ritardo, in giorni interi, dopo il quale il messaggio del Giorno del Romics lascia il posto al saluto di chiusura. Conta a partire dallo stesso orario di Roma, anche attraversando un cambio d'ora. Con i valori attuali la chiusura scatta il 4 ottobre 2027 alle 10:00.

## Le tre fasi del countdown

- `attesa`: fino al Giorno del Romics, giorni, ore, minuti e secondi (mai zero né negativi prima del momento).
- `giorno`: dal Giorno del Romics fino alla chiusura, il messaggio al posto dei numeri.
- `dopo`: dalla chiusura in poi, il saluto di chiusura al posto dei numeri.

Cambia solo il riquadro del countdown: la Missione e i Preparativi restano uguali in tutte le fasi.

## Provare le fasi con `?now=`

Con `?now=` si simula l'istante corrente; la pagina parte da lì e avanza di un secondo al secondo.

Valori accettati (ISO 8601):

- data-ora con offset o `Z`: `?now=2027-09-30T10:00:00+02:00`, `?now=2027-09-30T08:00:00Z`
- data-ora senza offset, letta come ora di Roma: `?now=2027-09-30T10:00:00`
- solo la data, letta come mezzanotte di Roma: `?now=2027-10-10`

Ignorato (la pagina usa l'ora vera): qualunque altro valore, come `?now=1`, `?now=2026`, `?now=ciao`, una data che non esiste, un `?now=` vuoto o assente. Un refuso non rompe mai la pagina.

Per provare ogni fase con la data provvisoria:

- `?now=2026-10-28T12:00:00+01:00`: attesa (giorno dell'anniversario)
- `?now=2027-09-30T10:00:00+02:00`: giorno (il messaggio, appena scattato il Giorno del Romics)
- `?now=2027-10-10`: dopo (il saluto di chiusura)

## Provarla in locale e test

I moduli ES non funzionano da `file://`: serve un server HTTP qualsiasi, ad esempio

```
python3 -m http.server 8000
```

e poi `http://localhost:8000/`. I test (il workflow usa Node 22; nessuna dipendenza da installare):

```
npm test
```

## Aspetto

La tavolozza (carta, inchiostro, borgogna, verde muschio, cuoio) è definita come variabili su `:root` in `styles.css`, e solo lì: `test/contrasti.test.js` le legge e fallisce se una coppia scende sotto 4,5:1 (testo) o 3:1 (bordi e anello del focus). Per cambiare un colore si cambia la variabile e si lancia `npm test`. Con `prefers-reduced-motion` le animazioni sono disattivate.

## Pubblicazione

Il sito è pubblicato con GitHub Pages dal workflow `.github/workflows/deploy.yml`, che a ogni push su `master` (o a mano, con *Run workflow*):

1. esegue `npm test`;
2. solo se i test passano, pubblica i soli file statici (`index.html`, `styles.css`, `src/`): niente test, docs, `package.json` o workflow.

Due passi spettano solo al proprietario del repo, una volta sola (**già fatti**, qui documentati per non dimenticarli):

1. rendere pubblico il repository (un account Free ha bisogno che sia pubblico per usare Pages);
2. in *Settings → Pages* impostare *Source* su **GitHub Actions**.

## Repository pubblico

Il repository è pubblico: niente cognomi, indirizzi, numeri di telefono, email né nomi o foto di persone reali. Il personaggio della Sarta resta un'allusione: nei testi pubblici non si dice mai chi è davvero (i test lo controllano).

La pagina chiede ai motori di ricerca di non indicizzarla (`noindex, nofollow`) e non c'è un `robots.txt` (con Pages «di progetto» i crawler leggono solo quello della radice del dominio). L'anteprima del link è generica: titolo «Un invito, mo chridhe», descrizione «Una lettera per voi.».
