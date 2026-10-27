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
  for (const file of ['index.html', 'styles.css', 'src', 'img']) {
    assert.match(yml, new RegExp(`cp -r[^\\n]*\\b${file}\\b`), `${file} non viene copiato nell'artifact`);
  }
  assert.doesNotMatch(yml, /cp [^\n]*\b(test|docs|package\.json|GLOSSARY\.md|\.github)\b/);
  assert.match(yml, /concurrency:[\s\S]*?group:\s*pages/);
});

// Il testo di un blocco di primo livello (workflow) o di un job: dalla sua intestazione alla prossima
// riga con la stessa indentazione.
const blocco = (yml, intestazione, indent) => {
  const righe = yml.split('\n');
  const inizio = righe.findIndex((r) => r === `${' '.repeat(indent)}${intestazione}`);
  assert.ok(inizio >= 0, `manca «${intestazione}»`);
  const resto = righe.slice(inizio + 1);
  const fine = resto.findIndex((r) => r.trim() !== '' && !r.trim().startsWith('#') && r.search(/\S/) <= indent);
  return resto.slice(0, fine < 0 ? undefined : fine).join('\n');
};

test('i permessi minimi: sola lettura per tutto il workflow, scrittura su Pages solo nel job di deploy', () => {
  const yml = read('.github/workflows/deploy.yml');
  const dellWorkflow = blocco(yml, 'permissions:', 0);
  assert.match(dellWorkflow, /contents:\s*read/);
  assert.doesNotMatch(dellWorkflow, /pages:|id-token:/, 'pages e id-token non vanno a livello di workflow');
  const dellDeploy = blocco(yml, 'deploy:', 2);
  assert.match(dellDeploy, /permissions:[\s\S]*?pages:\s*write/);
  assert.match(dellDeploy, /permissions:[\s\S]*?id-token:\s*write/);
  assert.doesNotMatch(blocco(yml, 'test:', 2), /permissions:/, 'il job dei test non ha bisogno di permessi in più');
});

test('una pubblicazione già partita non viene mai annullata a metà da una più recente', () => {
  const yml = read('.github/workflows/deploy.yml');
  assert.match(blocco(yml, 'concurrency:', 0), /cancel-in-progress:\s*false/);
});
