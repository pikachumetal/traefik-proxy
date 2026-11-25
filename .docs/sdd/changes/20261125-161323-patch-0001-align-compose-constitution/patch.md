---
id: 20261125-161323-patch-0001-align-compose-constitution
task: 0001
title: Patch — Alinear compose.yaml con la constitution
type: patch
solution: dev-lead
status: done
created: 2026-11-25
branch: patch/0001-align-compose-constitution
commit: <hash>
---

# Patch 0001 — Alinear compose.yaml con la constitution

Validación: dev-lead — cambia desde dónde se alcanza el proxy y qué versión de Traefik corre; lo nota quien usa los proyectos conectados.

## Capacidades

- Ninguna, porque ninguna capacidad describe `compose.yaml` (no existe `.docs/sdd/capabilities/`).

## 1. Síntoma

`compose.yaml` incumple dos artículos de la constitution:

- Art. III: `ports` publica `"80:80"`, `"443:443"` y `"8080:8080"` en todas las interfaces; el dashboard sin autenticación (`--api.insecure=true`) queda visible desde la red local.
- Art. IV: `image: traefik:latest`; un salto de major romperá las labels de todos los proyectos conectados.

## 2. Solución fijada

Fila 0001 de `ROADMAP.md`, aprobada por el dev-lead en la init (2026-11-25): «`"127.0.0.1:<p>:<p>"` en 80, 443 y 8080; `traefik:v3`».

Lo que da por existente, comprobado: `compose.yaml` › `services.traefik` tiene `image: traefik:latest` y los tres `ports` sin IP.

## 3. Fix

- **Fichero(s)**: `compose.yaml`
- **Cambio**: los tres puertos se ligan a `127.0.0.1` y la imagen pasa a `traefik:v3`.
- **Decisiones**:
  - Puertos `127.0.0.1:80`, `127.0.0.1:443` y `127.0.0.1:8080` — dev-lead
  - Imagen `traefik:v3` — dev-lead
- **Efecto buscado**: lo que llegaba al proxy por la IP del host o desde otra máquina de la red local deja de llegar (Art. III).

## 4. Verificación

Gate: `docker compose config --quiet` → exit 0 · `docker compose up -d --wait` → `Container traefik-proxy Healthy`, exit 0, 30 s (incluye descargar la imagen)

Verificado por el agente (2026-11-25), con el proxy levantado y parado después:

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | Imagen y puertos del contenedor (`docker inspect`, `docker port`) | ✅ `traefik:v3` (resuelve a v3.8.0); `80/tcp -> 127.0.0.1:80`, `443/tcp -> 127.0.0.1:443`, `8080/tcp -> 127.0.0.1:8080` |
| 2 | API desde loopback: `curl -fsS http://127.0.0.1:8080/api/overview` | ✅ 200 |
| 3 | API desde la IP de la red local: `curl http://10.196.26.35:8080/api/overview` | ✅ rechazada: `Could not connect to server` |
| 4 | Un `*.localhost` resuelve primero a `::1`, que ya no escucha: `curl http://whoami.test.localhost/` (nombre sin router ni contenedor detrás; responde la redirección del entrypoint `web`) | ✅ 301 a HTTPS vía `127.0.0.1`; `::1` rechaza en 2 ms y el cliente cae a IPv4 sin espera |

Los puertos 80 y 443 desde la red local se dan por cerrados con la evidencia del caso 1 (`docker port`), sin `curl` desde la IP de la red local; el rechazo con `curl` solo se probó en el 8080.

Review (sonnet, 2026-11-25):

- Cobertura de 80/443 desde la red local — aceptado: rebajado a «por `docker port`», arriba; contenedor `whoami` aclarado en el caso 4 (no existió).
- `status: done` con `commit: <hash>` y sin fin — rechazado: la plantilla nace con `status: done`, el hash y el esfuerzo real los escribe el cierre (`sdd-archive`); la estimación y el inicio se escribieron antes del fix.
- Línea en blanco antes de §5 — aceptado.
- `README.md` (dashboard y tabla de puertos sin mencionar loopback) — rechazado aquí: fuera del «Toca» de la 0001; lo cubre la 0002, que reescribe `README.md`.
- Clientes por la IP del host dejan de llegar — aceptado: «Efecto buscado» en §3.
- Working tree con cambios ajenos — aceptado: el commit va con rutas explícitas.
## 5. Tiempo (ligero)

- Estimación: 0,25 h + el gate de cierre (`docker compose up -d --wait`), sin duración medida todavía
- Inicio: 2026-11-25T16:13Z
