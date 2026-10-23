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
