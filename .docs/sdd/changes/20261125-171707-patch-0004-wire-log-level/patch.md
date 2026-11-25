---
id: 20261125-171707-patch-0004-wire-log-level
task: 0004
title: Patch — LOG_LEVEL de .env llega a Traefik
type: patch
solution: dev-lead
status: done
created: 2026-11-25
branch: patch/0004-wire-log-level
commit: <hash>
---

# Patch 0004 — LOG_LEVEL de .env llega a Traefik

Validación: dev-lead — cambia el nivel de log que ve quien depura el proxy.

## Capacidades

- Ninguna, porque ninguna capacidad describe `compose.yaml`.

## 1. Síntoma

`.env.example` define `LOG_LEVEL=INFO` y el README pide copiarlo a `.env`, pero `compose.yaml:26` fija `--log.level=INFO`: poner `LOG_LEVEL=DEBUG` en `.env` no cambia nada.

## 2. Solución fijada

Fila 0004 de `ROADMAP.md`: «cablear `--log.level=${LOG_LEVEL:-INFO}` o borrar `.env.example`, se decide al proponerlo». El dev-lead eligió cablearlo: «1» (2026-11-25).

Lo que da por existente, comprobado: `compose.yaml:26` `--log.level=INFO`; `.env` local con `LOG_LEVEL=INFO`; `README.md:27` `cp .env.example .env`.

## 3. Fix

- **Fichero(s)**: `compose.yaml`, `README.md`
- **Cambio**: `--log.level=${LOG_LEVEL:-INFO}`; el README dice para qué sirve `.env`.
- **Decisiones**:
  - `--log.level=${LOG_LEVEL:-INFO}` — dev-lead
  - Una frase en `README.md` tras el paso de copiar `.env`: «`LOG_LEVEL` (DEBUG, INFO, WARN, ERROR) fija el nivel de log de Traefik; aplícalo con `docker compose up -d`.» — sin el dev-lead (la fila nombra `README.md` en «Toca» sin fijar el texto; es documentación, no cambia lo que hace el proxy)

## 4. Verificación

Gate: `docker compose config --quiet` · `docker compose up -d --wait` → config: exit 0 · gate: `Container traefik-proxy Healthy`, exit 0

Verificado por el agente (2026-11-25), sobre el proxy del dev-lead, que queda en `INFO` y levantado:

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | `docker compose config` con `.env` (`LOG_LEVEL=INFO`) | ✅ `--log.level=INFO` |
| 2 | `docker compose config` con `LOG_LEVEL=DEBUG` en el entorno | ✅ `--log.level=DEBUG` |
| 3 | `docker compose config` sin `.env` | ✅ `--log.level=INFO` (valor por defecto) |
| 4 | `LOG_LEVEL=DEBUG docker compose up -d --wait` y log de los últimos 30 s | ✅ `Healthy`, 149 líneas de nivel debug |
| 6 | `LOG_LEVEL=` vacío → `docker compose config` | ✅ `--log.level=INFO` |
| 7 | Valor inválido: `docker run traefik:v3 --log.level=FOO` (contenedor aparte, borrado después) | ✅ sigue `running`; log `Unspecified or invalid log level, setting the level to default (ERROR)...` |
| 5 | Vuelta a `INFO` | ✅ argumento del contenedor `--log.level=INFO`; `tls.connect` del certificado de `devtools` → `authorized true` |

Review (sonnet, 2026-11-25):

- Evidencia solo con `DEBUG`; vacío e inválido sin probar — aceptado: casos 6 y 7. El revisor esperaba que un valor inválido impidiera arrancar; medido, Traefik arranca y cae a `ERROR` con un aviso en el log.
- README sin decir qué pasa con un valor inválido — rechazado: el proxy arranca igual, el aviso sale en `docker compose logs` (constitution, Avisos).
- `commit: <hash>` sin rellenar — rechazado: lo escribe el cierre.

## 5. Tiempo (ligero)

- Estimación: 0,2 h + el gate de cierre (`docker compose up -d --wait`, ~17 s)
- Inicio: 2026-11-25T17:17Z
