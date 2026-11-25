---
id: 20261125-175510-patch-0007-pin-traefik-dependabot
task: 0007
title: Patch — Versión exacta de Traefik y Dependabot
type: patch
solution: dev-lead
status: done
created: 2026-11-25
branch: patch/0007-pin-traefik-dependabot
commit: 75a4eba
---

# Patch 0007 — Versión exacta de Traefik y Dependabot

Validación: dev-lead — cambia qué versión de Traefik corre y cómo se entera el dev-lead de que hay una nueva.

## Capacidades

- Ninguna, porque ninguna capacidad describe la imagen de `compose.yaml` ni la configuración de GitHub.

## 1. Síntoma

`compose.yaml:3` usa `traefik:v3`: cada `docker compose pull` puede traer otra minor sin que quede rastro en git, y nada avisa de que hay versión nueva. `dev-tools` ya usa Dependabot para lo mismo.

## 2. Solución fijada

Frase literal del dev-lead (2026-11-25): «pues pon la versión concreta y el dependabot para saber cuando cambia».

Lo que da por existente, comprobado: `traefik:v3` resuelve hoy a `v3.8.0` (`docker image inspect` → `org.opencontainers.image.version`), la misma imagen que corre `traefik-proxy` (`sha256:00c97349…`); `dev-tools/.github/dependabot.yml` usa `package-ecosystem: "docker-compose"` con `interval: "weekly"`.

## 3. Fix

- **Fichero(s)**: `compose.yaml`, `.github/dependabot.yml`, `.docs/sdd/steering/constitution.md`, `.docs/sdd/steering/architecture.md`, `.docs/sdd/steering/operations.md`
- **Cambio**: imagen `traefik:v3.8.0`; Dependabot semanal sobre `docker-compose` con PRs a `develop`; Art. IV de la constitution pasa a versión exacta actualizada por Dependabot; decisión estructural en `architecture.md`.
- **Decisiones**:
  - Versión exacta `traefik:v3.8.0` y Dependabot — dev-lead
  - `package-ecosystem: "docker-compose"`, `directory: "/"`, `interval: "weekly"` — dev-lead (como en `dev-tools`)
  - `target-branch: "develop"` — dev-lead: la constitution fija git-flow (`develop` de integración) y el dev-lead no eligió la opción sin `target-branch`
  - Art. IV: «Versión de Traefik exacta» — «La imagen lleva versión exacta (`traefik:vX.Y.Z`); nunca `latest` ni un tag flotante. Las versiones nuevas llegan como PR de Dependabot a `develop`; un PR de major no se fusiona tal cual: es el aviso para abrir su feature.» — consecuencia literal de la frase del dev-lead

## 4. Verificación

Gate: `docker compose config --quiet` · `docker compose up -d --wait` → config: exit 0 · gate: `Healthy`, exit 0

Verificado por el agente (2026-11-25), sobre el proxy del dev-lead, que queda levantado:

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | Imagen del contenedor tras `up -d --wait` | ✅ `traefik:v3.8.0`, `sha256:00c97349…`: la misma que servía `traefik:v3`, sin cambio de comportamiento |
| 2 | Dashboard tras el cambio | ✅ `https://dashboard.traefik.localhost/dashboard/` 200 |
| 3 | `.github/dependabot.yml` | ✅ `package-ecosystem: "docker-compose"`, `target-branch: "develop"`, `interval: "weekly"`; misma estructura que el de `dev-tools` más `target-branch` |

No probado: la sintaxis del YAML con un parser (no hay PyYAML y el entorno denegó lanzar una imagen `yq`), que el ecosistema `docker-compose` reconozca el nombre `compose.yaml` (la documentación de GitHub no lista los nombres de fichero) ni que Dependabot abra PRs. Dependabot solo lee `.github/dependabot.yml` de la rama por defecto (`main`): se comprueba tras la release, en Insights › Dependency graph › Dependabot.

Review (sonnet, 2026-11-25):

- Sin `ignore` de major, Dependabot abrirá PRs a `v4` que chocan con el Art. IV — rechazado: el dev-lead pidió «saber cuándo cambia»; el Art. IV pasa a decir que un PR de major es el aviso para abrir su feature, no se fusiona tal cual.
- «Lo valida GitHub al subir» era falso: Dependabot lee la rama por defecto — aceptado: texto corregido arriba; la comprobación va a la release.
- `compose.yaml` sin confirmar como nombre que reconoce `docker-compose` — aceptado como no probado, arriba.
- `operations.md` sin el proceso de actualización — aceptado: línea «Actualizar Traefik».
- El hash del commit sin rellenar — rechazado: lo escribe el cierre.
- Sin fila 0007 en el roadmap — rechazado: patch pedido directamente, como la 0005.

Validado: 2026-11-25 · «validado» · no detalló qué probó

## 5. Tiempo (ligero)

- Estimación: 0,2 h + el gate de cierre (`docker compose up -d --wait`, ~17 s)
- Inicio: 2026-11-25T17:55Z
- Esfuerzo real: 1,16 h — reloj de la sesión 3,92 h desde 2026-11-25T14:03Z, sin 165 min de espera al dev-lead (75 esperas)
- Coste de sujetos: no aplica
