import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readdirSync, existsSync, readFileSync, writeFileSync, copyFileSync, rmSync, symlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateProjectName, registrationYaml, main } from './add-project-cert.mjs';

const scriptPath = fileURLToPath(new URL('./add-project-cert.mjs', import.meta.url));
const tempBase = join(dirname(scriptPath), '..', '.temp', 'tests');
mkdirSync(tempBase, { recursive: true });
const created = [];
after(() => created.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

function tempDir() {
  const dir = mkdtempSync(join(tempBase, 'apc-'));
  created.push(dir);
  return dir;
}

function fakeMkcert({ fail = false, silent = false } = {}) {
  const dir = tempDir();
  const fake = join(dir, 'fake-mkcert.mjs');
  const body = fail
    ? `${silent ? '' : "process.stderr.write('boom'); "}process.exit(1);`
    : `import { writeFileSync } from 'node:fs';
const args = process.argv.slice(2);
writeFileSync(args[1], 'cert ' + Date.now() + Math.random());
writeFileSync(args[3], 'key');
writeFileSync(${JSON.stringify(join(dir, 'args.json'))}, JSON.stringify(args));`;
  writeFileSync(fake, body);
  return { mkcert: [process.execPath, fake], argsFile: join(dir, 'args.json') };
}

const files = (dir) => (existsSync(dir) ? readdirSync(dir).sort() : []);

test('accepts valid names', () => {
  for (const name of ['demo', 'a', 'a'.repeat(63), 'my-app2']) {
    assert.equal(validateProjectName(name), true, name);
  }
});

test('rejects invalid names', () => {
  for (const name of ['Dev Tools', '../x', '..', 'a\nb', 'demo-', '-demo', 'a'.repeat(64), '']) {
    assert.equal(validateProjectName(name), false, JSON.stringify(name));
  }
});

test('rejects uppercase without normalizing', () => {
  assert.equal(validateProjectName('Demo'), false);
});

test('registration yaml for demo', () => {
  assert.equal(
    registrationYaml('demo'),
    'tls:\n  certificates:\n    - certFile: /certs/demo.localhost.pem\n      keyFile: /certs/demo.localhost-key.pem\n',
  );
});

test('usage without argument', () => {
  const rootDir = tempDir();
  const result = main([], { rootDir });
  assert.equal(result.code, 1);
  assert.match(result.stderr, /uso: node scripts\/add-project-cert\.mjs <proyecto>/);
  assert.deepEqual(files(rootDir), []);
});

test('rejects extra arguments with usage', () => {
  const rootDir = tempDir();
  const result = main(['demo', 'extra'], { rootDir });
  assert.equal(result.code, 1);
  assert.match(result.stderr, /uso: node scripts\/add-project-cert\.mjs <proyecto>/);
  assert.deepEqual(files(rootDir), []);
});

test('invalid name writes nothing', () => {
  for (const name of ['Dev Tools', '../x', '..', 'a\nb', 'demo-', 'a'.repeat(64), 'Demo']) {
    const rootDir = tempDir();
    const result = main([name], { rootDir, ...fakeMkcert() });
    assert.equal(result.code, 1);
    assert.ok(result.stderr.includes(`nombre de proyecto inválido: ${name} (usa minúsculas, números y guiones)`));
    assert.deepEqual(files(rootDir), []);
  }
});

test('without mkcert', () => {
  const rootDir = tempDir();
  mkdirSync(join(rootDir, 'scripts'));
  copyFileSync(scriptPath, join(rootDir, 'scripts', 'add-project-cert.mjs'));
  const emptyDir = tempDir();
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.toUpperCase() !== 'PATH'));
  env.PATH = emptyDir;
  const result = spawnSync(process.execPath, [join(rootDir, 'scripts', 'add-project-cert.mjs'), 'demo'], { env, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /mkcert no está instalado: https:\/\/github\.com\/FiloSottile\/mkcert/);
  assert.deepEqual(files(join(rootDir, 'certs')), []);
  assert.equal(existsSync(join(rootDir, 'config', 'dynamic', 'demo.tls.yml')), false);
});

test('mkcert fails', () => {
  const rootDir = tempDir();
  const result = main(['demo'], { rootDir, ...fakeMkcert({ fail: true }) });
  assert.equal(result.code, 1);
  assert.match(result.stderr, /mkcert falló: boom/);
  assert.equal(existsSync(join(rootDir, 'config', 'dynamic', 'demo.tls.yml')), false);
});

test('mkcert fails without stderr reports its exit code', () => {
  const rootDir = tempDir();
  const result = main(['demo'], { rootDir, ...fakeMkcert({ fail: true, silent: true }) });
  assert.equal(result.code, 1);
  assert.match(result.stderr, /mkcert falló: código 1/);
});

test('runs when launched through a junction or symlink', () => {
  const linkDir = join(tempDir(), 'linked-scripts');
  symlinkSync(dirname(scriptPath), linkDir, 'junction');
  const result = spawnSync(process.execPath, [join(linkDir, 'add-project-cert.mjs')], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /uso: node scripts\/add-project-cert\.mjs <proyecto>/);
});

test('creates certs dir when missing', () => {
  const rootDir = tempDir();
  assert.equal(existsSync(join(rootDir, 'certs')), false);
  main(['demo'], { rootDir, ...fakeMkcert() });
  assert.equal(existsSync(join(rootDir, 'certs')), true);
});

test('generates and registers, creating certs dir when missing', () => {
  const rootDir = tempDir();
  const fake = fakeMkcert();
  const result = main(['demo'], { rootDir, ...fake });
  assert.equal(result.code, 0);
  assert.deepEqual(JSON.parse(readFileSync(fake.argsFile, 'utf8')), [
    '-cert-file', join(rootDir, 'certs', 'demo.localhost.pem'),
    '-key-file', join(rootDir, 'certs', 'demo.localhost-key.pem'),
    '*.demo.localhost', 'demo.localhost',
  ]);
  assert.equal(readFileSync(join(rootDir, 'config', 'dynamic', 'demo.tls.yml'), 'utf8'), registrationYaml('demo'));
  assert.match(result.stdout, /certificado de \*\.demo\.localhost registrado en config\/dynamic\/demo\.tls\.yml/);
});

test('accepts 63-char name', () => {
  const rootDir = tempDir();
  const result = main(['a'.repeat(63)], { rootDir, ...fakeMkcert() });
  assert.equal(result.code, 0);
});

test('leaves other registrations untouched', () => {
  const rootDir = tempDir();
  const dynamicDir = join(rootDir, 'config', 'dynamic');
  mkdirSync(dynamicDir, { recursive: true });
  writeFileSync(join(dynamicDir, 'other.tls.yml'), 'other');
  const result = main(['demo'], { rootDir, ...fakeMkcert() });
  assert.equal(result.code, 0);
  assert.equal(existsSync(join(dynamicDir, 'demo.tls.yml')), true);
  assert.equal(readFileSync(join(dynamicDir, 'other.tls.yml'), 'utf8'), 'other');
});

test('rerun regenerates', () => {
  const rootDir = tempDir();
  mkdirSync(join(rootDir, 'certs'));
  writeFileSync(join(rootDir, 'certs', 'demo.localhost.pem'), 'old');
  const result = main(['demo'], { rootDir, ...fakeMkcert() });
  assert.equal(result.code, 0);
  assert.notEqual(readFileSync(join(rootDir, 'certs', 'demo.localhost.pem'), 'utf8'), 'old');
  assert.deepEqual(files(join(rootDir, 'certs')), ['demo.localhost-key.pem', 'demo.localhost.pem']);
  assert.deepEqual(files(join(rootDir, 'config', 'dynamic')), ['demo.tls.yml']);
});
