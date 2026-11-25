---
id: 20261125-170745-patch-0003-proxy-healthcheck
task: 0003
title: Patch — Healthcheck del proxy
type: patch
solution: dev-lead
status: done
created: 2026-11-25
branch: patch/0003-proxy-healthcheck
commit: b148e38
---

# Patch 0003 — Healthcheck del proxy

Validación: dev-lead — cambia lo que muestra `docker ps` y cuándo el gate de cierre da el proxy por listo.

## Capacidades

- Ninguna, porque ninguna capacidad describe `compose.yaml` (`project-certificate` describe el script de certificados).

## 1. Síntoma

`docker inspect traefik-proxy --format '{{json .State.Health}}'` → `null`: la imagen `traefik:v3` no define healthcheck, así que `docker compose up -d --wait` da el proxy por `Healthy` en cuanto arranca, sin comprobar que Traefik responde, y `docker ps` nunca marca `unhealthy`.

## 2. Solución fijada

Fila 0003 de `ROADMAP.md`, aprobada por el dev-lead en la init (2026-11-25): «`--ping=true` y `healthcheck:` con `traefik healthcheck --ping`».

Lo que da por existente, comprobado: `docker run --rm traefik:v3 healthcheck --help` → «Calls Traefik /ping endpoint (disabled by default) to check the health of Traefik.»

## 3. Fix

- **Fichero(s)**: `compose.yaml`, `.docs/sdd/steering/operations.md`
- **Cambio**: `--ping=true` en `command:` y un `healthcheck:` con `traefik healthcheck --ping`; `operations.md` deja de pedir el `curl` a mano en el gate de cierre.
- **Decisiones**:
  - `--ping=true` y `test: ["CMD", "traefik", "healthcheck", "--ping"]` — dev-lead
  - `interval: 10s`, `timeout: 3s`, `retries: 3`: con los valores por defecto de Docker (30 s) `up --wait` tardaría 30 s en dar el proxy por listo; no cambia lo que ve el usuario más allá de esa espera — sin el dev-lead

## 4. Verificación

Gate: `docker compose config --quiet` · `docker compose up -d --wait` → config: exit 0 · gate: `Container traefik-proxy Healthy`, exit 0, 17 s (el primer chequeo llega tras el `interval` de 10 s)

Verificado por el agente (2026-11-25), sobre el proxy levantado del dev-lead, que queda levantado:

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | Estado de salud: `docker inspect traefik-proxy` → `.State.Health` | ✅ `healthy`, último chequeo exit 0, `OK: http://:8080/ping` (antes del fix: `null`) |
| 2 | `docker ps` | ✅ `Up 11 seconds (healthy)` |
| 3 | `/ping` desde el host: `curl http://127.0.0.1:8080/ping` | ✅ `OK`, 200 |
| 4 | El chequeo falla si Traefik no responde: `docker run --rm traefik:v3 healthcheck --ping` (contenedor sin Traefik arrancado) | ✅ exit 1, `connect: connection refused` |
| 5 | Regresión: el certificado de `devtools` se sigue sirviendo tras recrear el contenedor (`tls.connect` con la CA de mkcert) | ✅ `authorized true` |

`operations.md`: el gate de cierre ya no pide el `curl` a mano y la suite `smoke` se retira, porque su orden es la del gate.

No probado: el paso a `unhealthy` del contenedor real; parar Traefik dentro del contenedor lo para entero. El caso 4 prueba que el chequeo falla sin servidor.

Review (sonnet, 2026-11-25):

- `commit` sin hash y §5 sin real — rechazado: el hash y el esfuerzo real los escribe el cierre (`sdd-archive`).
- El caso 4 no prueba `unhealthy` en el contenedor real — aceptado: anotado arriba como no probado.
- `smoke` sigue en la spec y el plan de la 0002 — rechazado: son registros de una feature cerrada.
- El gate solo comprueba `/ping`, no la API ni los providers — aceptado como límite: es lo que pide la fila 0003.
- Riesgo latente: `traefik healthcheck` usa el entrypoint `traefik` por defecto (:8080); si se mueve, hay que pasárselo al healthcheck — anotado, sin cambio hoy.

Validado: 2026-11-25 · «validado» · no detalló qué probó

## 5. Tiempo (ligero)

- Estimación: 0,25 h + el gate de cierre (`docker compose up -d --wait`, ~2 s medido en la 0002; con healthcheck, hasta un intervalo más)
- Inicio: 2026-11-25T17:07Z
- Esfuerzo real: 0,73 h — reloj de la sesión 3,13 h desde 2026-11-25T14:03Z, sin 144 min de espera al dev-lead (58 esperas)
- Coste de sujetos: no aplica
