import { mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PROJECT_NAME = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
const USAGE = 'uso: node scripts/add-project-cert.mjs <proyecto>';
const scriptFile = fileURLToPath(import.meta.url);
const defaultRootDir = resolve(dirname(scriptFile), '..');

export function validateProjectName(name) {
  return PROJECT_NAME.test(name);
}

function certFileNames(project) {
  return { cert: `${project}.localhost.pem`, key: `${project}.localhost-key.pem` };
}

export function registrationYaml(project) {
  const { cert, key } = certFileNames(project);
  return `tls:\n  certificates:\n    - certFile: /certs/${cert}\n      keyFile: /certs/${key}\n`;
}

function runMkcert([command, ...prefix], project, certsDir, env) {
  const { cert, key } = certFileNames(project);
  const result = spawnSync(command, [
    ...prefix,
    '-cert-file', join(certsDir, cert),
    '-key-file', join(certsDir, key),
    `*.${project}.localhost`, `${project}.localhost`,
  ], { env, encoding: 'utf8' });
  if (result.error?.code === 'ENOENT') return 'mkcert no está instalado: https://github.com/FiloSottile/mkcert';
  if (result.error || result.status !== 0) {
    const detail = (result.stderr || result.error?.message || '').trim() || `código ${result.status}`;
    return `mkcert falló: ${detail}`;
  }
  return null;
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
  const error = runMkcert(mkcert, project, certsDir, env);
  if (error) return fail(error);

  const dynamicDir = join(rootDir, 'config', 'dynamic');
  mkdirSync(dynamicDir, { recursive: true });
  writeFileSync(join(dynamicDir, `${project}.tls.yml`), registrationYaml(project));
  return { code: 0, stdout: `certificado de *.${project}.localhost registrado en config/dynamic/${project}.tls.yml`, stderr: '' };
}

function isEntryPoint() {
  try {
    return realpathSync(process.argv[1]) === realpathSync(scriptFile);
  } catch {
    return false;
  }
}

if (isEntryPoint()) {
  const { code, stdout, stderr } = main(process.argv.slice(2));
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
  process.exitCode = code;
}
