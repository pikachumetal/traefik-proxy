---
id: 20261125-172505-patch-0005-explicit-dashboard-entrypoint
task: 0005
title: Patch — Entrypoint del dashboard explícito en el healthcheck
type: patch
solution: dev-lead
status: done
created: 2026-11-25
branch: patch/0005-explicit-dashboard-entrypoint
commit: <hash>
---

# Patch 0005 — Entrypoint del dashboard explícito en el healthcheck

Validación: dev-lead — el proxy tiene que seguir `healthy` y el dashboard en `:8080`.

## Capacidades

- Ninguna, porque ninguna capacidad describe `compose.yaml`.

## 1. Síntoma

`traefik healthcheck --ping` (`compose.yaml:28`) es un proceso aparte que no lee el `command:` de Traefik: llama a `/ping` en el entrypoint `traefik` con su puerto por defecto (`:8080`). Hoy coincide porque el entrypoint `traefik` tampoco se declara y usa el mismo valor por defecto, pero si alguien lo mueve en `command:`, el healthcheck sigue llamando a `:8080` y marca `unhealthy` sin motivo (hallazgo de la review del patch 0003).

## 2. Solución fijada

Propuesta del agente aceptada por el dev-lead (2026-11-25, «haz primero una en patch»): declarar `--entrypoints.traefik.address=:8080` en `command:` y pasar el mismo flag a `traefik healthcheck`.

Lo que da por existente, comprobado: `compose.yaml` sin `--entrypoints.traefik.address` y con `test: ["CMD", "traefik", "healthcheck", "--ping"]` (línea 28).

## 3. Fix

- **Fichero(s)**: `compose.yaml`
- **Cambio**: `--entrypoints.traefik.address=:8080` en `command:` (bloque Entrypoints) y en el `test:` del healthcheck.
- **Decisiones**:
  - El puerto del dashboard declarado en `command:` y en el healthcheck — dev-lead

## 4. Verificación

Gate: `docker compose config --quiet` · `docker compose up -d --wait` → config: exit 0 · gate: `Container traefik-proxy Healthy`, exit 0, 17 s

Verificado por el agente (2026-11-25), sobre el proxy del dev-lead, que queda levantado:

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | Estado de salud tras recrear | ✅ `healthy`, `OK: http://:8080/ping` |
| 2 | Dashboard: `http://localhost:8080/dashboard/` | ✅ 200 |
| 4 | `docker compose config --quiet` tras añadir el comentario de la review | ✅ exit 0 |
| 3 | El healthcheck usa el flag que se le pasa: `traefik healthcheck --ping --entrypoints.traefik.address=:9999` dentro del contenedor | ✅ exit 1, `Head "http://:9999/ping"` — el puerto ya no es un valor por defecto implícito |

Review (sonnet, 2026-11-25):

- El puerto queda en dos sitios sin nota — aceptado: comentario en `compose.yaml` sobre el flag de `command:` (caso 4).
- No se prueba mover el entrypoint en `command:` — aceptado como límite: el caso 3 prueba que el healthcheck usa el flag que recibe; los casos 1 y 2, que no hay regresión.
- El hash del commit sin rellenar — rechazado: lo escribe el cierre.

## 5. Tiempo (ligero)

- Estimación: 0,15 h + el gate de cierre (`docker compose up -d --wait`, ~17 s)
- Inicio: 2026-11-25T17:25Z
