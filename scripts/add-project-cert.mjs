import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROJECT_NAME = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
const USAGE = 'uso: node scripts/add-project-cert.mjs <proyecto>';
const defaultRootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function validateProjectName(name) {
  return PROJECT_NAME.test(name);
}

export function registrationYaml(project) {
  return `tls:\n  certificates:\n    - certFile: /certs/${project}.localhost.pem\n      keyFile: /certs/${project}.localhost-key.pem\n`;
}

export function main(argv, { rootDir = defaultRootDir, env = process.env, mkcert = ['mkcert'] } = {}) {
  const fail = (stderr) => ({ code: 1, stdout: '', stderr });
  if (argv.length !== 1) return fail(USAGE);
  const [project] = argv;
  if (!validateProjectName(project)) {
    return fail(`nombre de proyecto inválido: ${project} (usa minúsculas, números y guiones)`);
  }

  const certsDir = join(rootDir, 'certs');
  mkdirSync(certsDir, { recursive: true });
  const [command, ...prefix] = mkcert;
  const result = spawnSync(command, [
    ...prefix,
    '-cert-file', join(certsDir, `${project}.localhost.pem`),
    '-key-file', join(certsDir, `${project}.localhost-key.pem`),
    `*.${project}.localhost`, `${project}.localhost`,
  ], { env, encoding: 'utf8' });
  if (result.error?.code === 'ENOENT') return fail('mkcert no está instalado: https://github.com/FiloSottile/mkcert');
  if (result.error || result.status !== 0) {
    return fail(`mkcert falló: ${(result.stderr || result.error?.message || '').trim()}`);
  }

  const dynamicDir = join(rootDir, 'config', 'dynamic');
  mkdirSync(dynamicDir, { recursive: true });
  writeFileSync(join(dynamicDir, `${project}.tls.yml`), registrationYaml(project));
  return { code: 0, stdout: `certificado de *.${project}.localhost registrado en config/dynamic/${project}.tls.yml`, stderr: '' };
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const { code, stdout, stderr } = main(process.argv.slice(2));
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
  process.exitCode = code;
}
