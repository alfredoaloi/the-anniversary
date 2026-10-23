# The Anniversary

L'**Invito**: una pagina statica, in italiano, che invita a un cosplay di coppia al Romics dell'autunno 2027. Il vocabolario del progetto è in [`GLOSSARY.md`](GLOSSARY.md).

HTML, CSS e JavaScript puro con moduli ES: nessuna dipendenza, nessun build step, nessuna risorsa esterna.

## Struttura

- `index.html`, `styles.css`: la pagina e il suo stile (solo tema chiaro, solo font di sistema).
- `src/`: i moduli ES (punto d'ingresso: `src/main.js`).
- `test/`: i test, con il runner di Node.
- `.github/workflows/deploy.yml`: esegue i test e, solo se passano, pubblica i soli file statici (`index.html`, `styles.css`, `src/`) su GitHub Pages.

## Provarla in locale

I moduli ES non funzionano da `file://`: serve un server HTTP qualsiasi, ad esempio

```
python3 -m http.server 8000
```

e poi `http://localhost:8000/`.

## Test

```
npm test
```

## Pubblicazione

Ogni push su `master` esegue il workflow. Due passi spettano solo al proprietario del repo, una volta sola:

1. Rendere pubblico il repository (un account Free ha bisogno che sia pubblico per usare Pages).
2. In *Settings → Pages* impostare *Source* su **GitHub Actions**.

Il repository è pubblico: niente cognomi, indirizzi o dati di contatto nei file.
