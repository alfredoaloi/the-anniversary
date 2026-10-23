// Seam: la pagina pubblicata (index.html) letta come testo, come la vede chi la apre.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contenuti } from '../src/contenuti.js';
import { TESTI_MISSIONE, TESTI_TESTATA } from '../src/testi.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

const metaContent = (attr, name) => {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const key = tag.match(new RegExp(`\\b${attr}\\s*=\\s*"([^"]*)"`, 'i'));
    if (key && key[1].toLowerCase() === name) {
      const content = tag.match(/\bcontent\s*=\s*"([^"]*)"/i);
      return content ? content[1] : undefined;
    }
  }
  return undefined;
};

test('la pagina è in italiano', () => {
  assert.match(html, /<html\b[^>]*\blang="it"/i);
});

test('il titolo è «Un invito, mo chridhe», anche per l\'anteprima del link', () => {
  assert.match(html, /<title>Un invito, mo chridhe<\/title>/);
  assert.equal(metaContent('property', 'og:title'), 'Un invito, mo chridhe');
});

test('la descrizione dell\'anteprima è «Una lettera per voi.» e non rivela altro', () => {
  assert.equal(metaContent('property', 'og:description'), 'Una lettera per voi.');
  assert.equal(metaContent('name', 'description'), 'Una lettera per voi.');
});

test('chiede ai motori di ricerca di non indicizzare la pagina', () => {
  assert.equal(metaContent('name', 'robots'), 'noindex, nofollow');
});

test('solo tema chiaro: color-scheme e theme-color sono chiari', () => {
  assert.equal(metaContent('name', 'color-scheme'), 'light');
  const themeColor = metaContent('name', 'theme-color');
  assert.match(themeColor, /^#[0-9a-f]{6}$/i);
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(themeColor.slice(i, i + 2), 16));
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  assert.ok(luminance > 0.7, `theme-color ${themeColor} non è chiaro`);
});

test('il countdown è un gruppo con nome accessibile statico e non una regione live', () => {
  const gruppo = html.match(/<(\w+)\b[^>]*\brole="group"[^>]*>/i);
  assert.ok(gruppo, 'manca il gruppo del countdown');
  assert.match(gruppo[0], /\bdata-countdown\b/);
  assert.match(gruppo[0], /\baria-label="[^"]{5,}"/);
  // Niente che faccia annunciare ogni secondo ai lettori di schermo.
  assert.doesNotMatch(html, /\baria-live\b/i);
  assert.doesNotMatch(html, /\brole="(status|timer|alert|log|marquee)"/i);
});

test('il markup del countdown ha i punti di aggancio per i numeri, le etichette e il testo', () => {
  for (const nome of ['giorni', 'ore', 'minuti', 'secondi']) {
    assert.match(html, new RegExp(`data-valore="${nome}"`), `manca il valore ${nome}`);
    assert.match(html, new RegExp(`data-etichetta="${nome}"`), `manca l'etichetta ${nome}`);
  }
  assert.match(html, /\bdata-numeri\b/);
  assert.match(html, /\bdata-testo\b/);
});

test('il foglio di stile dichiara solo il tema chiaro, anche se il dispositivo è in modo scuro', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  assert.match(css, /color-scheme:\s*light\b/);
  assert.doesNotMatch(css, /prefers-color-scheme/);
});

// ---- Aspetto: struttura della pagina (variante A, «Pergamena») e accessibilità ----

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('la testata e la chiusura hanno i segnaposto per tutti i testi del file di dati, e nient\'altro', () => {
  const nelMarkup = [...html.matchAll(/\bdata-contenuto="([^"]+)"/g)].map((m) => m[1]).sort();
  assert.deepEqual(nelMarkup, [...TESTI_TESTATA, ...TESTI_MISSIONE].sort());
});

test('i testi della testata non sono copiati nel markup: stanno solo nel file di dati', () => {
  for (const chiave of TESTI_TESTATA) {
    const testo = contenuti[chiave].replaceAll('*', '');
    // Il titolo compare in <title> e nell'anteprima del link, che sono metadati e non il testo in pagina.
    const corpo = html.replace(/<head>[\s\S]*<\/head>/, '');
    assert.ok(!corpo.includes(testo), `«${testo}» è scritto anche nel corpo di index.html`);
  }
});

test('le parti della pagina sono nell\'ordine della spec: testata, countdown, Missione, illustrazione, Preparativi, chiusura, popup dopo <main>', () => {
  const ordine = [
    '<header class="testata"',
    '<p class="riga-countdown"',
    '<section class="countdown"',
    '<section class="missione"',
    '<figure class="illustrazione"',
    '<section class="preparativi"',
    '<footer class="chiusura"',
    '</main>',
    '<dialog class="sarta"',
  ];
  let da = 0;
  for (const pezzo of ordine) {
    const i = html.indexOf(pezzo, da);
    assert.ok(i >= 0, `«${pezzo}» manca o è fuori posto`);
    da = i;
  }
});

test('l\'illustrazione è un SVG inline con un nome accessibile e senza volti', () => {
  const fig = html.match(/<figure class="illustrazione"[\s\S]*?<\/figure>/);
  assert.ok(fig, 'manca la figura dell\'illustrazione');
  assert.match(fig[0], /<svg\b[^>]*\brole="img"[^>]*\baria-label="[^"]{10,}"/);
  assert.doesNotMatch(fig[0], /<(img|image)\b/i);
});

test('prefers-reduced-motion disattiva animazioni e transizioni', () => {
  const blocco = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(blocco, 'manca @media (prefers-reduced-motion: reduce)');
  assert.match(blocco[1], /animation:\s*none/);
  assert.match(blocco[1], /transition:\s*none/);
});

test('gli elementi interattivi hanno il focus visibile', () => {
  assert.match(css, /:focus-visible\s*\{[^}]*outline:[^;}]*var\(--focus\)/);
});

test('niente scroll orizzontale: nessuna larghezza fissa oltre la colonna e il testo va a capo', () => {
  assert.match(css, /box-sizing:\s*border-box/);
  assert.match(css, /overflow-wrap:\s*(anywhere|break-word)/);
  assert.doesNotMatch(css, /(^|[\s;{])width:\s*\d{3,}px/, 'larghezza fissa in px di 100 o più');
});
