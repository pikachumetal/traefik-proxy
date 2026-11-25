---
id: 20261125-163335-feature-0002-localhost-domains
feature: 0002
title: Plan de implementación — Migrar a dominios .localhost
spec: ./spec.md
status: approved
created: 2026-11-25
---

# Plan de implementación — Migrar a dominios .localhost

## Decisiones que he tomado yo — valida estas

1. Modelo: las tres tasks las hace el hilo (Native); revisión final con los ejes de `sdd-verify` (Spec `sdd-kit:effort-high` + `opus`, Código `sdd-kit:effort-high` + `sonnet`, Arquitectura `sdd-kit:effort-high` + `opus`).
2. Ejecución: native — ver la línea `Ejecución`.
3. La medición del hot-reload (decisión 18 de la spec) va en la Task 2 y no en la 1: necesita el script de la Task 1 y la carpeta `config/dynamic/` sin `tls.yml`. No cambia ningún THEN.
4. El script exporta `validateProjectName`, `registrationYaml` y `main` para que el test los use sin lanzar procesos, salvo en los casos de `PATH` y mkcert, que lanzan el script con `process.execPath`.
5. Para aislar los tests del repo, `main` recibe `rootDir` (por defecto, la carpeta padre de `scripts/`); los tests le pasan un directorio temporal.
6. mkcert falso para los tests: un `.cmd` en Windows y un shell script con permiso de ejecución en el resto, creado por el test en un directorio temporal que se pone como único `PATH`.
7. Riesgo alto: el hot-reload del provider File puede no ver ficheros nuevos en un bind mount de Docker Desktop; mitigación en la Task 2 (medir y, si falla, `docker compose restart` documentado).
8. Coste estimado: 1,25 h de implementación; revisión final con tres ejes, ~0,5 $.
9. Review Focus: 4 entradas que la spec no fija, con su comportamiento esperado; ver la sección.

**Goal**: un comando `node scripts/add-project-cert.mjs <proyecto>` que genera y registra el certificado `*.<proyecto>.localhost`, y el repo pasado de `.local` a `.localhost`.

**Architecture**: un script Node sin dependencias en `scripts/` que llama a mkcert sin shell y escribe un registro por proyecto en `config/dynamic/`, que el provider File ya vigila. El registro y los certificados quedan fuera de git; `tls.yml` y `generate-certs.sh` desaparecen.

**Tech Stack**: Node 22+ (`node:test`, `node:child_process`, `node:fs`, `node:crypto`, `node:tls`), mkcert, Docker Compose y Traefik v3.

**Spec**: `./spec.md`

**Ejecución**: native, porque son 3 tasks encadenadas (la 2 usa el script de la 1 y la 3 documenta lo que dejan la 1 y la 2), un error lo caza el test o la ejecución real de su task y el plan cabe en un contexto. `execution: auto` en `sdd-kit.json`. Si esta sesión se retomó tras una compactación (empieza por «This session is being continued from a previous conversation») y quedan dos o más tasks sin su línea `complete` en el ledger, no las hagas tú: invoca `sdd-implement-subagent` y despacha con él las que quedan sobre el mismo ledger. La sesión que ejecuta va bien en gama media (Sonnet, effort medium); el modelo más capaz se reserva para los ejes Spec y Arquitectura de la revisión final.

**Eje Arquitectura**: sí — módulo nuevo `scripts/` y contrato nuevo entre el script y el provider File (`config/dynamic/<proyecto>.tls.yml`).

## Restricciones globales

### De código

- Node 22 o superior; sin dependencias de npm.
- Nombre de proyecto válido: `/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/` (sin flag `m`).
- mkcert se invoca con `spawnSync('mkcert', [...])`, array de argumentos, sin `shell: true`; ausencia = `error.code === 'ENOENT'`.
- Ficheros: `certs/<p>.localhost.pem`, `certs/<p>.localhost-key.pem`, `config/dynamic/<p>.tls.yml`, relativos a la carpeta padre de `scripts/`, nunca al directorio de trabajo.
- Textos exactos: `uso: node scripts/add-project-cert.mjs <proyecto>` · `nombre de proyecto inválido: <nombre> (usa minúsculas, números y guiones)` · `mkcert no está instalado: https://github.com/FiloSottile/mkcert` · `mkcert falló: <su salida de error>` · `certificado de *.<proyecto>.localhost registrado en config/dynamic/<proyecto>.tls.yml`.
- Errores con código de salida 1 y por `stderr`; éxito con código 0 por `stdout`.
- Identificadores en inglés; mensajes, documentación y comentarios en castellano.
- Sin comentarios que repitan el código ni que citen documentos (constitution, spec, task).

### De proceso

- Native: el hilo implementa; un commit por task.
- Commits: tipo y scope en inglés, título y cuerpo en castellano; `git commit -- <paths>` si hay cosas del usuario staged.
- No se toca `compose.yaml` ni el repo `dev-tools`.

## Review Focus

- Nombre con mayúsculas que pasaría tras un `toLowerCase` (`Demo`) → se rechaza tal cual, sin normalizar · Task 1, `rejects uppercase without normalizing`.
- Argumentos de más (`demo extra`) → se usa solo el primero o se rechaza; se rechaza con el texto de uso · Task 1, `rejects extra arguments with usage`.
- `certs/` sin existir en el `rootDir` → se crea antes de llamar a mkcert · Task 1, `creates certs dir when missing`.
- Registro de otro proyecto presente (`other.tls.yml`) → no se toca al registrar `demo` · Task 1, `leaves other registrations untouched`.

---

## Phase -1 — Pre-Implementation Gates

- [x] **Simplicity gate**: un fichero de ~40 líneas, sin dependencias.
- [x] **YAGNI gate**: tres funciones exportadas, cada una usada por el script y el test.
- [x] **Brownfield gate**: `compose.yaml` no cambia; los montajes existentes sirven.
- [x] **Constitution check**: Art. I (`.gitignore` solo añade una línea), Art. II-V sin tocar; Convenciones de idioma.

---

## 1. Decisiones técnicas

### 1.1 Estructura de ficheros

**Crear**:

- `scripts/add-project-cert.mjs` — genera y registra el certificado de un proyecto.
- `scripts/add-project-cert.test.mjs` — sus tests con `node:test`.
- `config/dynamic/.gitkeep` — mantiene la carpeta montada en un clon nuevo.

**Modificar**:

- `.gitignore` — añade `config/dynamic/*.tls.yml`.
- `README.md`, `CLAUDE.md`, `.docs/sdd/steering/architecture.md`, `.docs/sdd/steering/operations.md` — documentación (Task 3).

**Borrar**:

- `config/dynamic/tls.yml`, `generate-certs.sh` (versionados); `certs/devtools.local*.pem`, `certs/alcstronghold.local*.pem` (locales, último paso de la Task 2).

**NO se tocan**:

- `compose.yaml` — ya monta `./certs:/certs:ro` y `./config/dynamic:/config/dynamic:ro`.
- `certs/.gitkeep` — ya existe.

### 1.6 Dependencias

- mkcert instalado (`C:\Users\pikac\AppData\Local\Microsoft\WinGet\Links\mkcert.exe`) con su CA en `C:\Users\pikac\AppData\Local\mkcert`.

### 1.7 Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
| --- | --- | --- | --- |
| El provider File no ve el registro nuevo en un bind mount de Docker Desktop | media | medio | medirlo en la Task 2; si falla, `docker compose restart` en `README.md` |
| El mkcert falso no se ejecuta en Windows con `PATH` vacío | baja | bajo | `.cmd` y `PATHEXT` heredado en el `env` del test |

### 1.8 Rollout

Directo. `dev-tools` deja de tener certificado válido hasta que migre en su repo.

### 1.9 Excepciones a la constitution

Ninguna.

---

## 2. Tasks

Las tasks se ejecutan en orden, sin paralelo; `Tras` dice de cuál depende cada una.

### Task 1 — Script add-project-cert con sus tests

**Tras**: —
**Modelo**: hilo (Native)
**Tests RED**: hilo principal · `scripts/add-project-cert.test.mjs`
**Superficies**: tooling
**Verificación**: `node --test "scripts/*.test.mjs"` → `ℹ fail 0`
**Se prueba en la aplicación**: no, porque base común: el script se usa en la Task 2 contra el proxy real.

**Interfaces**:
- Consume: nada.
- Produce: `scripts/add-project-cert.mjs` con `export function validateProjectName(name: string): boolean`, `export function registrationYaml(project: string): string`, `export function main(argv: string[], { rootDir?: string, env?: NodeJS.ProcessEnv } = {}): { code: number, stdout: string, stderr: string }`; al ejecutarse como script, llama a `main(process.argv.slice(2))`, escribe `stdout`/`stderr` y sale con `code`.

**Ficheros**: crear `scripts/add-project-cert.mjs`, `scripts/add-project-cert.test.mjs`

- [ ] **Step 1: Tests RED** en `scripts/add-project-cert.test.mjs`, cada uno con un `rootDir` temporal:
  - `accepts valid names`: `validateProjectName('demo')`, `('a')`, `('a'.repeat(63))`, `('my-app2')` → `true`.
  - `rejects invalid names`: `'Dev Tools'`, `'../x'`, `'..'`, `'a\nb'`, `'demo-'`, `'-demo'`, `'a'.repeat(64)`, `''` → `false`.
  - `rejects uppercase without normalizing`: `validateProjectName('Demo')` → `false`.
  - `registration yaml for demo`: `registrationYaml('demo')` === `"tls:\n  certificates:\n    - certFile: /certs/demo.localhost.pem\n      keyFile: /certs/demo.localhost-key.pem\n"`.
  - `usage without argument`: `main([], { rootDir })` → `code 1`, `stderr` contiene `uso: node scripts/add-project-cert.mjs <proyecto>`, `rootDir` vacío.
  - `rejects extra arguments with usage`: `main(['demo', 'extra'], { rootDir })` → `code 1`, texto de uso, `rootDir` vacío.
  - `invalid name writes nothing`: para `'Dev Tools'` y `'../x'` → `code 1`, `stderr` contiene `nombre de proyecto inválido: <nombre> (usa minúsculas, números y guiones)`, `rootDir` vacío.
  - `without mkcert`: lanza `process.execPath scripts/add-project-cert.mjs demo` con `env: { ...process.env, PATH: <dir vacío>, Path: <dir vacío> }` y `cwd` = `rootDir` copia del script → `status 1`, `stderr` contiene `mkcert no está instalado: https://github.com/FiloSottile/mkcert`, sin `certs/*.pem` ni `config/dynamic/demo.tls.yml`.
  - `mkcert fails`: mkcert falso que escribe `boom` en stderr y sale con 1 → `code 1`, `stderr` contiene `mkcert falló: boom`, sin `config/dynamic/demo.tls.yml`.
  - `creates certs dir when missing` y `generates and registers`: mkcert falso que crea los ficheros de `-cert-file` y `-key-file` y anota sus argumentos → existe `certs/`, los argumentos son `['-cert-file', <rootDir>/certs/demo.localhost.pem, '-key-file', <rootDir>/certs/demo.localhost-key.pem, '*.demo.localhost', 'demo.localhost']`, `config/dynamic/demo.tls.yml` === `registrationYaml('demo')`, `stdout` contiene `certificado de *.demo.localhost registrado en config/dynamic/demo.tls.yml`, `code 0`.
  - `accepts 63-char name`: con el mkcert falso, `main(['a'.repeat(63)])` → `code 0`.
  - `leaves other registrations untouched`: con `config/dynamic/other.tls.yml` previo, tras registrar `demo` su contenido no cambia.
  - `rerun regenerates`: con solo `certs/demo.localhost.pem` previo, segunda ejecución → existen los tres ficheros y ningún otro en `certs/` y `config/dynamic/`.
- [ ] **Step 2: Implementación** — `scripts/add-project-cert.mjs` con las firmas de Interfaces; `rootDir` por defecto `path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')`; `spawnSync('mkcert', [...], { env, encoding: 'utf8' })`; `fs.mkdirSync(<rootDir>/certs, { recursive: true })` antes de mkcert; registro escrito solo con `status === 0`.
- [ ] **Step 3: Verificación** — `node --test "scripts/*.test.mjs"` → `ℹ fail 0`.
- [ ] **Step 4: Commit de la task** — `feat(scripts): añadir add-project-cert para generar y registrar certificados`.

### Task 2 — Corte a .localhost en el proxy

**Tras**: Task 1
**Modelo**: hilo (Native)
**Tests RED**: no aplica (configuración y ejecución real); los THEN de esta task se observan con los comandos de «Verificación».
**Superficies**: tooling, configuración
**Verificación**:
- `git check-ignore certs/devtools.localhost.pem certs/devtools.localhost-key.pem config/dynamic/devtools.tls.yml` → las tres rutas.
- `git status --porcelain` tras ejecutar el script → sin líneas de `certs/` ni `config/dynamic/*.tls.yml`.
- SAN: `node -e "const {X509Certificate}=require('crypto');console.log(new X509Certificate(require('fs').readFileSync('certs/devtools.localhost.pem')).subjectAltName)"` → `DNS:*.devtools.localhost, DNS:devtools.localhost`.
- TLS: `node -e` con `tls.connect({host:'127.0.0.1',port:443,servername:'smtp.devtools.localhost',ca:fs.readFileSync(<CAROOT>/rootCA.pem)})` → imprime `authorized true` y el `subjectaltname` del certificado del par.
- Regresión clon nuevo: con `config/dynamic/` sin `*.tls.yml`, `docker compose up -d --wait`, `curl -fsS http://127.0.0.1:8080/api/overview` → 200, `docker compose logs` sin `level=error` ni ` ERR `.
**Se prueba en la aplicación**: `https://smtp.devtools.localhost` presenta el certificado de `*.devtools.localhost` sin aviso del navegador.

**Interfaces**:
- Consume: `node scripts/add-project-cert.mjs <proyecto>` de la Task 1.
- Produce: resultado de la medición del hot-reload (`recoge sin reiniciar` | `necesita docker compose restart`), que usa la Task 3.

**Ficheros**: crear `config/dynamic/.gitkeep`; modificar `.gitignore`; borrar `config/dynamic/tls.yml`, `generate-certs.sh` y, al final, `certs/devtools.local.pem`, `certs/devtools.local-key.pem`, `certs/alcstronghold.local.pem`, `certs/alcstronghold.local-key.pem`.

- [ ] **Step 1**: `.gitignore` añade `config/dynamic/*.tls.yml` bajo `# Certificates (sensitive)`; crear `config/dynamic/.gitkeep`; borrar `config/dynamic/tls.yml` y `generate-certs.sh`.
- [ ] **Step 2**: regresión del clon nuevo (comando de «Verificación»), con el proxy recién levantado.
- [ ] **Step 3**: con el proxy levantado, desde la carpeta padre del repo, `node traefik-proxy/scripts/add-project-cert.mjs devtools`; comprobar que no aparece nada en la carpeta padre; esperar 5 s y lanzar la conexión TLS. Si `authorized` es `false` o el certificado es el autofirmado, `docker compose restart` y repetir; anotar el resultado de la medición en el ledger.
- [ ] **Step 4**: SAN, `git check-ignore` y `git status --porcelain`.
- [ ] **Step 5**: borrar los cuatro `.pem` `.local` de `certs/`; parar el proxy (`docker compose down`).
- [ ] **Step 6: Commit de la task** — `feat(certs): pasar a registros por proyecto en .localhost y retirar tls.yml`.

### Task 3 — Documentación

**Tras**: Task 2
**Modelo**: hilo (Native)
**Tests RED**: no aplica (documentación).
**Superficies**: docs
**Verificación**: `git grep -nE "tls\.yml|generate-certs|alcstronghold|setup-hosts|\.local\b" -- README.md CLAUDE.md .docs/sdd/steering` → solo líneas de `.gitignore`-like (`.env.local`, `settings.local.json`, `sdd-kit.local.json`) y la línea `_Evitar_` de `PRODUCT.md` fuera de esta búsqueda; ninguna de `README.md`.
**Se prueba en la aplicación**: no, porque documentación.

**Interfaces**:
- Consume: el resultado de la medición del hot-reload de la Task 2.
- Produce: nada.

**Ficheros**: modificar `README.md`, `CLAUDE.md`, `.docs/sdd/steering/architecture.md`, `.docs/sdd/steering/operations.md`.

- [ ] **Step 1**: `README.md` con este contenido mínimo: requisitos previos (Docker, mkcert y `mkcert -install` una vez, Node 22+); conectar un proyecto: `node ../traefik-proxy/scripts/add-project-cert.mjs <proyecto>` (y `docker compose restart` si la Task 2 lo midió necesario), la red externa y un ejemplo de labels con router `<proyecto>-<servicio>`, `Host(\`<servicio>.<proyecto>.localhost\`)`, `entrypoints=websecure` y `tls=true`; que los servicios se llaman entre sí por su nombre en `traefik-public`; renovar (volver a ejecutar el script al caducar o al cambiar la CA); retirar (borrar `certs/<p>.localhost.pem`, `certs/<p>.localhost-key.pem` y `config/dynamic/<p>.tls.yml`); puertos solo en `127.0.0.1`; estructura; proyectos conectados: solo `dev-tools` con `*.devtools.localhost`. Fuera: hosts, scripts por proyecto, `.local` y ALC Stronghold.
- [ ] **Step 2**: `CLAUDE.md`, regla 3: «Las rutas de cada proyecto viven en las labels de su propio `compose.yaml`; aquí solo se registra su certificado con `node scripts/add-project-cert.mjs <proyecto>`.»
- [ ] **Step 3**: `architecture.md`: Estructura (`scripts/add-project-cert.mjs`, `config/dynamic/<proyecto>.tls.yml` fuera de git), Piezas (fila del script y de los registros en lugar de `tls.yml`; enlaza la capacidad `project-certificate`), Flujo principal paso 3 («entre los registros de `config/dynamic/`»), Dónde va lo nuevo (proyecto nuevo → el script).
- [ ] **Step 4**: `operations.md` › Suites: `scripts` · `node --test "scripts/*.test.mjs"` · <duración medida en la Task 1> · unitario · Node 22 o superior.
- [ ] **Step 5**: Verificación (`git grep`).
- [ ] **Step 6: Commit de la task** — `docs: documentar add-project-cert y el sufijo .localhost`.

---

## Estimación y esfuerzo

- Tipo: infra/tooling
- Esfuerzo spec + plan: 1h
- Estimación de implementación: 1,25h
- Estimación de revisión: 0,25h
- Estimación de cierre: 0,25h
- Base de la estimación: 3 tasks; incertidumbre en el hot-reload y en el mkcert falso de Windows; sin referencia previa de features en el estimation-log (solo el patch 0001).
- Confianza: media

---

## 3. Validación final

- [ ] Gate de cierre, una vez y en el hilo principal: `docker compose up -d --wait` (con el healthcheck del roadmap, verifica también que Traefik responde; hasta entonces, el `curl` de `smoke` a mano)
- [ ] Verificación de los criterios de éxito de la spec (Intent)
- [ ] Spec satisfecha: cada requisito tiene su task (ver Self-review)
- [ ] Cierre de rama según el flujo del proyecto (`sdd-archive`)

---

## 4. Self-review (cobertura spec → tasks)

- Generar: existen los dos `.pem` → Task 1 `generates and registers` (mkcert falso) y Task 2 Step 3 (real). ✓
- Generar: SAN `*.devtools.localhost` y `devtools.localhost` → Task 2, comando SAN. ✓
- Generar AND registro con `certFile`/`keyFile` → Task 1 `registration yaml for demo` y `generates and registers`. ✓
- Generar AND nada en el directorio de llamada → Task 2 Step 3 (carpeta padre sin ficheros nuevos). ✓
- Generar AND texto y código 0 → Task 1 `generates and registers`. ✓
- Renovar: tres ficheros, ninguno más → Task 1 `rerun regenerates`. ✓
- Renovar: número de serie distinto → Task 2 Step 3 no lo ejercita; sin observar con el mkcert falso. Se observa a mano en la validación (dos ejecuciones reales y `X509Certificate.serialNumber`). ⚠
- Rechazar: los seis nombres → Task 1 `rejects invalid names` y `invalid name writes nothing`. ✓
- Rechazar AND uso sin argumento → Task 1 `usage without argument`. ✓
- Rechazar AND nada escrito → Task 1, `rootDir` vacío. ✓
- Sin mkcert → Task 1 `without mkcert`. ✓
- mkcert falla y sin registro → Task 1 `mkcert fails`. ✓
- Traefik sirve el certificado (`authorized: true`, SAN) → Task 2, comando TLS. ✓
- Regresión clon nuevo → Task 2 Step 2. ✓
- `git check-ignore` y `git status` → Task 2 Step 4. ✓
- Tabla «se retira o cambia de forma» → Task 2 (ficheros) y Task 3 (`git grep`). ✓
- Review Focus → Task 1, sus cuatro tests. ✓
