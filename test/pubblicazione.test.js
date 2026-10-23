// Seam: ciò che viene pubblicato (i file statici) e il workflow che lo pubblica.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const read = (rel) => readFileSync(join(root, rel), 'utf8');

// I file statici che finiscono su Pages: la pagina, il foglio di stile e src/.
const filesUnder = (dir) =>
  readdirSync(join(root, dir)).flatMap((name) => {
    const rel = join(dir, name);
    return statSync(join(root, rel)).isDirectory() ? filesUnder(rel) : [rel];
  });
const staticFiles = ['index.html', 'styles.css', ...filesUnder('src')];

test('nessuna richiesta a domini esterni: solo risorse locali e font di sistema', () => {
  for (const file of staticFiles) {
    // Il namespace dell'SVG inline è un identificatore, non una richiesta di rete.
    const text = read(file).replace(/xmlns(:\w+)?="[^"]*"/g, '');
    assert.doesNotMatch(text, /https?:\/\//i, `${file} nomina un dominio esterno`);
    assert.doesNotMatch(text, /(^|[\s"'(=])\/\/[a-z0-9.-]+\.[a-z]{2,}/i, `${file} usa un URL senza protocollo`);
    assert.doesNotMatch(text, /@import|@font-face/i, `${file} carica font o fogli di stile`);
  }
});

test('non c\'è un robots.txt (con Pages "di progetto" i crawler leggono solo quello della radice)', () => {
  assert.equal(existsSync(join(root, 'robots.txt')), false);
});

test('il progetto non ha dipendenze e i test girano con il runner di Node', () => {
  const pkg = JSON.parse(read('package.json'));
  for (const campo of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    assert.deepEqual(Object.keys(pkg[campo] ?? {}), [], `package.json ha ${campo}`);
  }
  assert.equal(pkg.scripts.test, 'node --test');
  assert.equal(existsSync(join(root, 'package-lock.json')), false);
});

test('nel repo non compaiono dati di contatto (email, telefoni)', () => {
  const tracked = [
    ...staticFiles,
    'README.md',
    'package.json',
    '.github/workflows/deploy.yml',
    ...filesUnder('test'),
  ];
  for (const file of tracked) {
    const text = read(file);
    assert.doesNotMatch(text, /[\w.+-]+@[\w-]+\.[\w.-]+/, `${file} contiene un indirizzo email`);
    assert.doesNotMatch(text, /(\+|\b00)\d[\d\s().-]{7,}\d/, `${file} contiene un numero di telefono`);
  }
});

test('il workflow gira a ogni push sul ramo principale', () => {
  const yml = read('.github/workflows/deploy.yml');
  assert.match(yml, /^on:\s*\n\s+push:\s*\n\s+branches:\s*\[\s*master\s*\]/m);
});

test('il workflow esegue i test e pubblica solo se passano', () => {
  const yml = read('.github/workflows/deploy.yml');
  assert.match(yml, /run:\s*npm test/);
  // Il job di deploy dipende dal job dei test: se un test fallisce, non parte.
  assert.match(yml, /deploy:[\s\S]*?needs:\s*test/);
});

test('il workflow pubblica solo i file statici, con le azioni ufficiali e i permessi minimi', () => {
  const yml = read('.github/workflows/deploy.yml');
  for (const action of ['checkout', 'configure-pages', 'upload-pages-artifact', 'deploy-pages']) {
    assert.match(yml, new RegExp(`uses:\\s*actions/${action}@v\\d+`), `manca actions/${action}`);
  }
  // L'artifact non è mai la radice del repo (che contiene test, docs, package.json...).
  const path = yml.match(/upload-pages-artifact@[\s\S]*?path:\s*(\S+)/)?.[1];
  assert.ok(path && path !== '.' && path !== './', 'l\'artifact non deve essere la radice del repo');
  for (const file of ['index.html', 'styles.css', 'src']) {
    assert.match(yml, new RegExp(`cp -r[^\\n]*\\b${file}\\b`), `${file} non viene copiato nell'artifact`);
  }
  assert.doesNotMatch(yml, /cp [^\n]*\b(test|docs|package\.json|GLOSSARY\.md|\.github)\b/);
  assert.match(yml, /permissions:[\s\S]*?pages:\s*write/);
  assert.match(yml, /permissions:[\s\S]*?id-token:\s*write/);
  assert.match(yml, /concurrency:[\s\S]*?group:\s*pages/);
});
