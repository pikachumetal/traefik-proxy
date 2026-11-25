---
id: 20261125-181454-feature-0009-docker-socket-proxy
feature: 0009
title: Plan de implementación — Proxy del socket de Docker
spec: ./spec.md
status: approved
created: 2026-11-25
---

# Plan de implementación — Proxy del socket de Docker

## Decisiones que he tomado yo — valida estas

1. Modelo: las dos tasks las hace el hilo (Native); revisión final con Spec `sdd-kit:effort-high` + `opus`, Código `sdd-kit:effort-high` + `sonnet` y Arquitectura `sdd-kit:effort-high` + `opus`.
2. Sin tests automáticos: configuración de Compose y documentación; cada comportamiento se observa con ejecución real («Dónde se prueba» de la spec).
3. Riesgo alto: un `docker compose down` deja a los proyectos conectados sin proxy unos segundos.
4. Review Focus: 2 entradas; ver la sección.

**Goal**: Traefik llega a Docker solo por `socket-proxy`, que filtra el API a lecturas.

**Architecture**: servicio `socket-proxy` con el socket en solo lectura, en una red interna con subred fija; Traefik usa `tcp://socket-proxy:2375`.

**Tech Stack**: Docker Compose, Traefik v3.8.0, `wollomatic/socket-proxy` 1.14.0.

**Spec**: `./spec.md`

**Ejecución**: native, porque son 2 tasks (los docs describen lo que deja la primera), un error lo caza la ejecución real de la Task 1 y el plan cabe en un contexto. `execution: auto` en `sdd-kit.json`. Si esta sesión se retomó tras una compactación (empieza por «This session is being continued from a previous conversation») y quedan dos o más tasks sin su línea `complete` en el ledger, no las hagas tú: invoca `sdd-implement-subagent` y despacha con él las que quedan sobre el mismo ledger. La sesión que ejecuta va bien en gama media (Sonnet, effort medium); el modelo más capaz se reserva para los ejes Spec y Arquitectura de la revisión final.

**Eje Arquitectura**: sí — servicio y red nuevos en `compose.yaml` y contrato nuevo Traefik → API de Docker por TCP.

## Restricciones globales

### De código

- Imagen `wollomatic/socket-proxy:1.14.0`; `container_name: traefik-socket-proxy`; red `traefik-socket-proxy` con `internal: true` e `ipam` `10.231.0.0/29`.
- Flags entre comillas simples: `'-allowGET=/v1\..{1,2}/(version|containers/json|containers/[^/]+/json|events)'`, `'-allowHEAD=/_ping'`, `'-allowfrom=10.231.0.0/29'`, `'-listenip=0.0.0.0'`, `'-watchdoginterval=3600'`, `'-stoponwatchdog'`, `'-shutdowngracetime=5'`, `'-allowhealthcheck'`.
- Proxy: `user: "65534:${DOCKER_GID:-0}"`, `read_only: true`, `cap_drop: [ALL]`, `no-new-privileges:true`, `mem_limit: 64m`, `cpus: 0.5`, healthcheck `["CMD", "./healthcheck"]` 10s/5s/2.
- Traefik: `--providers.docker.endpoint=tcp://socket-proxy:2375`, sin montaje de `docker.sock`, `depends_on` con `service_healthy`.
- Comentarios en castellano; sin comentarios que repitan el código ni que citen documentos.

### De proceso

- Native: un commit por task. Borrar el contenedor de prueba al acabar.

## Review Focus

- Traefik recreado con otra IP → sigue llegando al proxy (subred fija) · Task 1, `up -d --force-recreate traefik` + contenedor de prueba.
- Healthcheck del proxy desde `127.0.0.1` con `-allowfrom` de la subred → `healthy` · Task 1, `docker compose up -d --wait`.

---

## 2. Tasks

### Task 1 — socket-proxy en compose y Traefik por TCP

**Tras**: —
**Modelo**: hilo (Native)
**Tests RED**: no aplica (configuración).
**Superficies**: configuración
**Verificación**: `docker compose config` (regex intacta) · `docker compose down` + `docker compose up -d --wait` → los dos `healthy` · contenedor de prueba: router `probe-test@docker` aparece y desaparece; tras `up -d --force-recreate traefik`, aparece · desde `traefik-proxy`: `GET /v1.47/containers/json` 200, `POST /v1.47/containers/create` 403/405, `GET /v1.47/containers/<id>/logs` 403 · desde el contenedor de prueba: `socket-proxy` no resuelve y su IP no conecta · `docker inspect` de montajes · logs sin bloqueos a Traefik ni errores del provider · dashboard 200.
**Ficheros**: modificar `compose.yaml`, `.env.example`.

- [ ] **Step 1**: `compose.yaml` con las restricciones; `.env.example` con `DOCKER_GID` comentado.
- [ ] **Step 2**: Verificación; si el proxy no llega a `healthy` por `-allowfrom`, añadir `127.0.0.1/32` y anotarlo; si Traefik pide otra ruta, añadirla exacta y anotarla.
- [ ] **Step 3: Commit** — `feat(compose): filtrar el API de Docker con socket-proxy`.

### Task 2 — Constitution, architecture y README

**Tras**: Task 1
**Modelo**: hilo (Native)
**Tests RED**: no aplica (documentación).
**Superficies**: docs
**Verificación**: `git grep -n "docker.sock" -- .docs/sdd/steering README.md` → solo menciones al proxy.
**Ficheros**: modificar `.docs/sdd/steering/constitution.md`, `.docs/sdd/steering/architecture.md`, `README.md`.

- [ ] **Step 1**: Art. II y Art. IV (decisión 10 de la spec, literales).
- [ ] **Step 2**: `architecture.md`: estructura, piezas (`socket-proxy`, red, Traefik sin socket), flujo, decisión estructural.
- [ ] **Step 3**: `README.md`: `DOCKER_GID` obligatorio en Linux, la subred `10.231.0.0/29` y qué hacer si choca, estructura.
- [ ] **Step 4: Commit** — `docs: documentar el proxy del socket de Docker`.

---

## Estimación y esfuerzo

- Tipo: infra/tooling
- Esfuerzo spec + plan: 0,5h
- Estimación de implementación: 0,5h
- Estimación de revisión: 0,25h
- Estimación de cierre: 0,2h
- Base de la estimación: 2 tasks; referencia 0006.
- Confianza: media

---

## 3. Validación final

- [ ] Gate de cierre, una vez y en el hilo principal: `docker compose up -d --wait` · ~17 s · integración (espera al healthcheck `traefik healthcheck --ping`: verifica que Traefik responde)
- [ ] Cierre de rama según el flujo del proyecto (`sdd-archive`)

---

## 4. Self-review (cobertura spec → tasks)

- Cada línea de «Dónde se prueba» → Task 1, su comando de Verificación. ✓
- Tabla «Lo que se retira» → Task 1 (`compose.yaml`) y Task 2 (docs). ✓
- Review Focus → Task 1. ✓
