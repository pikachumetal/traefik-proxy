---
id: 20261125-163335-feature-0002-localhost-domains
feature: 0002
title: Walkthrough — Migrar a dominios .localhost
spec: ./spec.md
plan: ./plan.md
status: done
created: 2026-11-25
---

# Walkthrough — Migrar a dominios .localhost

## 1. Cambios realizados

- Script `scripts/add-project-cert.mjs` y sus 13 tests en `scripts/add-project-cert.test.mjs`: genera con mkcert `*.<proyecto>.localhost` y escribe `config/dynamic/<proyecto>.tls.yml` — `35723ec`.
- Corte a `.localhost`: `.gitignore` ignora `config/dynamic/*.tls.yml`; `config/dynamic/.gitkeep`; se borran `config/dynamic/tls.yml` y `generate-certs.sh`; certificado de `devtools` generado con el script y los cuatro `.pem` `.local` locales borrados — `455cad8`.
- Documentación: `README.md` (requisitos, conectar, renovar, retirar, sin hosts ni ALC), `CLAUDE.md`, `architecture.md` y `operations.md` (suite `scripts`) — `53cae43`.
- Capacidad nueva `project-certificate` fusionada desde el delta.
- Pasada de fix de la revisión final (guarda por junction, `certFileNames`, `runMkcert`, tests del Review Focus por `main`, docs) — juntada en el cierre.

## 2. Tiempo y coste: estimado vs real

- Tipo: infra/tooling
- Estimación de implementación (del plan): 1,25h
- Esfuerzo real: 0,65 h — reloj de la sesión 3,02 h desde 2026-11-25T14:03Z, sin 142 min de espera al dev-lead (55 esperas)
- Desviación: -0,6h (-48 %)
- Causa de la desviación: la estimación contaba con incertidumbre en el hot-reload y en el mkcert falso de Windows; las dos se resolvieron en minutos (medición directa y un `.mjs` lanzado con `process.execPath`). El reloj de la sesión incluye la init y el patch 0001 de esta misma sesión, descontados como esperas y huecos.
- Compactación: no
- Modelo del hilo: Opus 5.5, effort no registrado
- Tokens del hilo: 31.054.725 — claude-opus-5-5 31.054.725
- Tokens de subagentes: 2.437.004 en 7 despachos — Review spec 0002 técnica claude-sonnet-5-5 112.459 / 1 min; Re-review fix pass 0002 claude-opus-5-5 574.029 / 1 min; Final review — Spec axis claude-opus-5-5 616.098 / 2 min; Review spec 0002 dominio claude-sonnet-5-5 109.576 / 0 min; Final review — Code axis claude-sonnet-5-5 273.144 / 1 min; Segunda ronda review spec 0002 claude-sonnet-5-5 114.064 / 0 min; Final review — Architecture axis claude-opus-5-5 637.634 / 2 min
- Coste de la sesión: 12,80 $ (hilo 9,86 $ + subagentes 2,94 $)
- Coste de sujetos: no aplica
- Review de spec: 2 revisores y segunda ronda · hallazgos 30, aceptados 28

## 3. Desviaciones del plan

- `main` acepta la opción `mkcert` y el mkcert falso de los tests es un `.mjs` lanzado con `process.execPath`, no un `.cmd`/`.sh`: en Windows `spawnSync` sin shell no ejecuta un `.cmd`.
- La regresión de clon nuevo y la medición se hicieron sobre el proxy que ya estaba levantado (lo usaba `dev-tools`), y se dejó levantado al acabar en vez de pararlo.
- El hot-reload no recoge el registro nuevo en Docker Desktop: `README.md` documenta `docker compose restart` tras el script; el GIVEN del requisito «Traefik sirve el certificado del proyecto» queda con esa rama (Enmiendas de la spec).

### Decisiones tomadas sin el dev-lead

- Sin worktree: el proyecto trabaja sin worktrees; implementación en el checkout principal sobre la rama de la feature — un fallo previo a la rama se atribuiría a la feature.
- Opción `mkcert` en `main` y mkcert falso en `.mjs` — una opción de test en la firma pública de `main`.
- Medición sobre el proxy ya levantado, sin pararlo — la regresión de clon nuevo se midió sobre un contenedor ya arrancado, no recién creado.
- Hot-reload medido: necesita `docker compose restart` — un paso de más para el usuario si la medición fallara por otro motivo.
- Renovación medida en real: `serialNumber` distinto tras la segunda ejecución.

## 4. Verificación

### 4.1 Builds

- Gate: `docker compose config --quiet` · `node --test "scripts/*.test.mjs"` · `docker compose up -d --wait` → config: exit 0 · scripts: corrió 16/16 (sin filtro: cambia el build) · gate: Healthy, overview 200 · ~2 s · sobre el commit de cierre

### 4.2 Smoke / tests

Verificado por el agente (2026-11-25):

| THEN | Evidencia | Resultado |
| --- | --- | --- |
| Generar y registrar desde el directorio padre | ejecución real | exit 0, `certificado de *.devtools.localhost registrado en config/dynamic/devtools.tls.yml`, padre sin ficheros nuevos |
| SAN | ejecución real | `DNS:*.devtools.localhost, DNS:devtools.localhost` |
| Renovar | ejecución real + suite | `serialNumber` distinto; `rerun regenerates` |
| Nombre inválido | ejecución real + suite | `nombre de proyecto inválido: Demo (usa minúsculas, números y guiones)`, exit 1 |
| Sin mkcert | suite | `without mkcert` |
| mkcert falla | suite | `mkcert fails`, `mkcert fails without stderr reports its exit code` |
| Traefik sirve el certificado | ejecución real | `tls.connect` con la CA de mkcert → `authorized true` |
| Clon sin registros (regresión) | ejecución real | contenedor recreado: overview 200, 0 errores en el log |

Revisión final: Spec, Código y Arquitectura With fixes sobre 53cae43; pasada de fix y su re-revisión (All findings addressed) juntadas en el cierre; los arreglos de docs de la re-revisión, revisados en el hilo.

Validado: 2026-11-25 · «validado, pero el 404 page not found es corretco entonces?» · no detalló qué probó

### 4.3 Residuales / deuda generada

- `dev-tools` sigue con labels `*.devtools.local`, su `generate-certs.ps1` y su `setup-hosts`: migra en su repo (ya informado a su sesión).

## 5. Aprendizajes

- En Docker Desktop (Windows) el provider File no ve ficheros nuevos de un bind mount: hace falta `docker compose restart` → `.docs/sdd/steering/architecture.md` (Decisiones estructurales) y `README.md`.
- En Windows `spawnSync` sin shell no ejecuta un `.cmd`: un ejecutable falso para tests se escribe como `.mjs` y se lanza con `process.execPath` → `scripts/add-project-cert.test.mjs` (`fakeMkcert`).
- Comparar `process.argv[1]` con `import.meta.url` sin `realpath` falla por junctions → `scripts/add-project-cert.mjs` (`isEntryPoint`) y su test.

Retro: documento o skill desmentido → ticket del kit: `merge.push: true` en `sdd-kit.json` no publica si `sdd merge` no lleva `--push` (patch 0001, misma sesión)

## 6. Adendas
