// Seam: la pagina pubblicata (index.html) letta come testo, come la vede chi la apre.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

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
