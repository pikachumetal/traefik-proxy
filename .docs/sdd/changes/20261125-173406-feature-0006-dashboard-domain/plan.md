---
id: 20261125-173406-feature-0006-dashboard-domain
feature: 0006
title: Plan de implementación — Dashboard en dashboard.traefik.localhost
spec: ./spec.md
status: approved
created: 2026-11-25
---

# Plan de implementación — Dashboard en dashboard.traefik.localhost

## Decisiones que he tomado yo — valida estas

1. Modelo: las dos tasks las hace el hilo (Native); revisión final con Spec `sdd-kit:effort-high` + `opus` y Código `sdd-kit:effort-high` + `sonnet`.
2. Ejecución: native — ver la línea `Ejecución`.
3. Sin tests automáticos: el cambio es configuración (`compose.yaml`, un YAML dinámico) y documentación; cada THEN se observa con ejecución real, como fija «Dónde se prueba».
4. Riesgo alto: recrear el proxy deja sin dashboard en `:8080` al instante; la URL nueva solo funciona con el certificado de `traefik` generado antes.
5. Coste estimado: 0,5 h de implementación; revisión final con dos ejes, ~0,3 $.
6. Review Focus: 2 entradas; ver la sección.

**Goal**: servir el dashboard y el API en `https://dashboard.traefik.localhost` con un router, sin `api.insecure` ni el puerto 8080 publicado.

**Architecture**: un router del provider File en `config/dynamic/dashboard.yml` hacia `api@internal`; `compose.yaml` deja de publicar 8080 y conserva el entrypoint `traefik` interno para `/ping`.

**Tech Stack**: Docker Compose, Traefik v3, mkcert y `scripts/add-project-cert.mjs`.

**Spec**: `./spec.md`

**Ejecución**: native, porque son 2 tasks (la documentación describe lo que deja la primera), un error lo caza la ejecución real de su task y el plan cabe en un contexto. `execution: auto` en `sdd-kit.json`. Si esta sesión se retomó tras una compactación (empieza por «This session is being continued from a previous conversation») y quedan dos o más tasks sin su línea `complete` en el ledger, no las hagas tú: invoca `sdd-implement-subagent` y despacha con él las que quedan sobre el mismo ledger. La sesión que ejecuta va bien en gama media (Sonnet, effort medium); el modelo más capaz se reserva para los ejes Spec y Arquitectura de la revisión final.

**Eje Arquitectura**: no — no añade módulo, dependencia ni contrato nuevo: un fichero más en `config/dynamic/`, como ya prevé `architecture.md` («Dónde va lo nuevo»).

## Restricciones globales

### De código

- Router `traefik-dashboard` en `config/dynamic/dashboard.yml`: `rule: Host(\`dashboard.traefik.localhost\`)`, `entryPoints: [websecure]`, `tls: {}`, `service: api@internal`.
- `compose.yaml`: sin `--api.insecure=true` ni `"127.0.0.1:8080:8080"`; con `--api.dashboard=true` y `--entrypoints.traefik.address=:8080`.
- Comentarios en castellano; sin comentarios que repitan el código ni que citen documentos.

### De proceso

- Native: el hilo implementa; un commit por task.
- Commits: tipo y scope en inglés, título y cuerpo en castellano.
- No se toca el healthcheck ni `scripts/`.

## Review Focus

- `https://dashboard.traefik.localhost/` (raíz) → redirige a `/dashboard/` · Task 1, ejecución real `GET /`.
- `traefik.tls.yml` del proyecto `traefik` dentro de git por error → ignorado · Task 1, `git check-ignore config/dynamic/traefik.tls.yml`.

---

## Phase -1 — Pre-Implementation Gates

- [x] **Simplicity gate**: un YAML y dos líneas menos en `compose.yaml`.
- [x] **YAGNI gate**: sin middleware ni autenticación.
- [x] **Brownfield gate**: el patrón de `config/dynamic/` ya existe.
- [x] **Constitution check**: Art. III (loopback) se mantiene; las Reglas de producto cambian con la spec aprobada (decisión 6).

---

## 1. Decisiones técnicas

### 1.1 Estructura de ficheros

**Crear**:

- `config/dynamic/dashboard.yml` — router del dashboard.

**Modificar**:

- `compose.yaml` — sin `api.insecure` ni 8080 publicado; comentarios del provider File y del entrypoint `traefik`.
- `README.md`, `PRODUCT.md`, `.docs/sdd/steering/constitution.md`, `.docs/sdd/steering/architecture.md`, `.docs/sdd/steering/operations.md` — Task 2.

**NO se tocan**:

- `scripts/add-project-cert.mjs` — se reutiliza tal cual.
- El `healthcheck:` de `compose.yaml`.

### 1.7 Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
| --- | --- | --- | --- |
| Recrear el proxy deja el dashboard sin entrada si falla el router | baja | medio | generar el certificado y el router antes de recrear; `docker compose logs` |

### 1.8 Rollout

Directo. Quien use `localhost:8080` lo pierde: el `CHANGELOG.md` de la release lo marca como cambio incompatible.

### 1.9 Excepciones a la constitution

Ninguna: los cambios de las Reglas de producto van aprobados con la spec.

---

## 2. Tasks

### Task 1 — Router del dashboard y compose sin 8080

**Tras**: —
**Modelo**: hilo (Native)
**Tests RED**: no aplica (configuración); los THEN se observan con los comandos de «Verificación».
**Superficies**: configuración
**Verificación**:
- `docker compose config --quiet` → exit 0.
- `docker compose up -d --wait` → `Healthy`.
- Node `https.get` a `127.0.0.1:443`, `servername`/`Host` `dashboard.traefik.localhost`, `ca` de mkcert: `/dashboard/` → 200 `authorized true`; `/api/overview` → 200; `/` → 301/302 a `/dashboard/`.
- Sin `traefik.tls.yml` (movido al scratchpad) y `docker compose restart`: verificación falla; con `rejectUnauthorized: false`, `/dashboard/` → 200. Se devuelve el fichero y se reinicia.
- `curl http://127.0.0.1:8080/` → conexión rechazada.
- Node `http.get` a `127.0.0.1:80` con `Host: dashboard.traefik.localhost` → 301/308 a `https://`.
- `git check-ignore config/dynamic/traefik.tls.yml certs/traefik.localhost.pem` → las dos rutas.
**Se prueba en la aplicación**: `https://dashboard.traefik.localhost/` abre el dashboard con candado.

**Interfaces**:
- Consume: `node scripts/add-project-cert.mjs traefik`.
- Produce: URL `https://dashboard.traefik.localhost/` y API `https://dashboard.traefik.localhost/api/`.

**Ficheros**: crear `config/dynamic/dashboard.yml`; modificar `compose.yaml`.

- [ ] **Step 1**: `node scripts/add-project-cert.mjs traefik`.
- [ ] **Step 2**: `config/dynamic/dashboard.yml` con el router de las restricciones.
- [ ] **Step 3**: `compose.yaml`: quitar `--api.insecure=true` y `"127.0.0.1:8080:8080"`; comentario del provider File («certificados y router del dashboard»); comentario del entrypoint `traefik` («solo dentro del contenedor, para /ping; debe coincidir con el healthcheck»).
- [ ] **Step 4**: comprobar `127.0.0.1:8080` libre de otros procesos tras recrear; `docker compose up -d --wait`; los comandos de «Verificación».
- [ ] **Step 5: Commit** — `feat(compose): servir el dashboard en dashboard.traefik.localhost sin api.insecure`.

### Task 2 — Documentación y constitution

**Tras**: Task 1
**Modelo**: hilo (Native)
**Tests RED**: no aplica (documentación).
**Superficies**: docs
**Verificación**: `git grep -n "localhost:8080\|8080:8080\|api.insecure" -- README.md PRODUCT.md .docs/sdd/steering CLAUDE.md` → sin resultados.
**Se prueba en la aplicación**: no, porque documentación.

**Interfaces**:
- Consume: las URLs de la Task 1.
- Produce: nada.

**Ficheros**: modificar `README.md`, `PRODUCT.md`, `.docs/sdd/steering/constitution.md`, `.docs/sdd/steering/architecture.md`, `.docs/sdd/steering/operations.md`.

- [ ] **Step 1**: `README.md`: instalación con `node scripts/add-project-cert.mjs traefik` antes de arrancar (se regenera en cada máquina); Dashboard `https://dashboard.traefik.localhost/`; puertos 80 y 443 solo en `127.0.0.1`; tabla de puertos sin 8080; nota «el nombre de proyecto `traefik` es del propio proxy»; árbol con `config/dynamic/dashboard.yml`; fila `traefik` en Proyectos conectados (`*.traefik.localhost`, dashboard).
- [ ] **Step 2**: `constitution.md` › Reglas de producto: los tres cambios de la decisión 6 de la spec, literales.
- [ ] **Step 3**: `architecture.md`: Estructura con `dashboard.yml`; pieza `traefik` (dashboard y API por `dashboard.traefik.localhost`, `:8080` interno solo para `/ping`); pieza Provider File (también el router del dashboard); Flujo principal (el router puede venir del provider Docker o, para el dashboard, del File); decisión estructural (decisión 9 de la spec).
- [ ] **Step 4**: `operations.md` › Acceso a la aplicación: dashboard `https://dashboard.traefik.localhost/`, API `https://dashboard.traefik.localhost/api/`, sin login; `PRODUCT.md` › Es: «expone el dashboard en `https://dashboard.traefik.localhost`».
- [ ] **Step 5**: Verificación (`git grep`).
- [ ] **Step 6: Commit** — `docs: documentar el dashboard en dashboard.traefik.localhost`.

---

## Estimación y esfuerzo

- Tipo: infra/tooling
- Esfuerzo spec + plan: 0,5h
- Estimación de implementación: 0,5h
- Estimación de revisión: 0,2h
- Estimación de cierre: 0,2h
- Base de la estimación: 2 tasks de configuración y documentación; referencia 0002 (0,65 h real frente a 1,25 h estimada).
- Confianza: media

---

## 3. Validación final

- [ ] Gate de cierre, una vez y en el hilo principal: `docker compose up -d --wait` · ~17 s · integración (espera al healthcheck `traefik healthcheck --ping`: verifica que Traefik responde)
- [ ] Verificación de los criterios de éxito de la spec (Intent)
- [ ] Spec satisfecha: cada requisito tiene su task (ver Self-review)
- [ ] Cierre de rama según el flujo del proyecto (`sdd-archive`)

---

## 4. Self-review (cobertura spec → tasks)

- Dashboard por su dominio: 200 y certificado verificable → Task 1, `https.get` `/dashboard/`. ✓
- AND `/api/overview` 200 → Task 1, `https.get` `/api/overview`. ✓
- Sin certificado: no verificable → Task 1, `traefik.tls.yml` movido. ✓
- AND sin verificar, `/dashboard/` 200 → Task 1, `rejectUnauthorized: false`. ✓
- Puerto 8080: conexión rechazada → Task 1, `curl 127.0.0.1:8080`. ✓
- Regresiones (redirección HTTP, healthcheck) → Task 1. ✓
- Tabla «Lo que se retira» → Task 1 (`compose.yaml`) y Task 2 (docs, `git grep`). ✓
- Review Focus → Task 1. ✓
