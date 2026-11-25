---
id: 20261125-180244-patch-0008-container-limits
task: 0008
title: Patch — Límites y endurecimiento del contenedor
type: patch
solution: dev-lead
status: done
created: 2026-11-25
branch: patch/0008-container-limits
commit: 99946d6
---

# Patch 0008 — Límites y endurecimiento del contenedor

Validación: dev-lead — el proxy tiene que seguir sirviendo el dashboard y los proyectos conectados con los límites y el endurecimiento puestos.

## Capacidades

- Ninguna, porque ninguna capacidad describe los recursos ni los permisos del contenedor.

## 1. Síntoma

El contenedor `traefik-proxy` corre sin límites de CPU ni memoria, como root con todas las capabilities por defecto, con el sistema de ficheros escribible y montando `docker.sock` (`docker inspect`: `ReadonlyRootfs=false`, `SecurityOpt=[]`).

## 2. Solución fijada

Frases literales del dev-lead (2026-11-25): «dame el gusto los quiero limitar y si me dices que usa poco pues bueno. dale lo que necesita» y «y haz lo que me dijiste arriba del docker.sock» — las tres medidas propuestas por el agente: `no-new-privileges`, `read_only: true` y `cap_drop: [ALL]` con `cap_add: [NET_BIND_SERVICE]`.

Lo que da por existente, comprobado: consumo medido con `docker stats` → 0,08-0,27 % de CPU y ~25 MiB de memoria (pico de 18,67 % de CPU al arrancar); driver de logs `local` (rotación propia).

## 3. Fix

- **Fichero(s)**: `compose.yaml`, `.docs/sdd/steering/architecture.md`
- **Cambio**: `mem_limit`, `cpus`, `security_opt`, `read_only`, `cap_drop` y `cap_add` en el servicio `traefik`.
- **Decisiones**:
  - Limitar CPU y memoria — dev-lead
  - `mem_limit: 256m` y `cpus: 1.0`: unas 10 veces la memoria medida y un núcleo entero, para que el límite no se alcance ni con `LOG_LEVEL=DEBUG` — sin el dev-lead (delegado: «dale lo que necesita»)
  - `security_opt: ["no-new-privileges:true"]`, `read_only: true`, `cap_drop: [ALL]`, `cap_add: [NET_BIND_SERVICE]` — dev-lead

## 4. Verificación

Gate: `docker compose config --quiet` · `docker compose up -d --wait` → config: exit 0 · gate: `Healthy`, exit 0

Verificado por el agente (2026-11-25), sobre el proxy del dev-lead, que queda levantado:

| # | Caso | Resultado |
| --- | --- | --- |
| 1 | Configuración aplicada (`docker inspect`) | ✅ `Memory=268435456`, `NanoCpus=1000000000`, `ReadonlyRootfs=true`, `SecurityOpt=[no-new-privileges:true]`, `CapDrop=[ALL]`, `CapAdd=[CAP_NET_BIND_SERVICE]` |
| 2 | Healthcheck con el endurecimiento | ✅ `healthy` |
| 3 | Log tras recrear | ✅ sin `level=error`, `ERR`, `permission` ni `read-only` |
| 4 | Dashboard por su dominio | ✅ 200, `authorized true` |
| 5 | Certificado de `devtools` por SNI | ✅ `authorized true` (404: `dev-tools` aún sin migrar) |
| 6 | Consumo con los límites (`docker stats`) | ✅ 0,34 % CPU, 21,02 MiB / 256 MiB |

No probado: el consumo bajo carga ni con `LOG_LEVEL=DEBUG`; un servicio de un proyecto conectado de punta a punta (`dev-tools` aún no ha migrado sus labels).

Review (sonnet, 2026-11-25):

- Comentario de recursos con datos medidos que caducan — aceptado: queda solo el motivo del margen.
- Comentario de endurecimiento con razonamiento flojo — aceptado: dice qué amenaza limita.
- `architecture.md` sin los límites ni el endurecimiento — aceptado: fila de `compose.yaml` › `traefik`, con el aviso de ACME y plugins.
- El hash del commit sin rellenar — rechazado: lo escribe el cierre.
- «No probado» sin `LOG_LEVEL=DEBUG` ni proyecto real — ya estaba declarado.

Validado: 2026-11-25 · «validado» · no detalló qué probó

## 5. Tiempo (ligero)

- Estimación: 0,25 h + el gate de cierre (`docker compose up -d --wait`, ~17 s)
- Inicio: 2026-11-25T18:02Z
- Esfuerzo real: 1,23 h — reloj de la sesión 4,09 h desde 2026-11-25T14:03Z, sin 171 min de espera al dev-lead (78 esperas)
- Coste de sujetos: no aplica
