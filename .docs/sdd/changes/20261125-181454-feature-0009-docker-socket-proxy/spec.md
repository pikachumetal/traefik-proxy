---
id: 20261125-181454-feature-0009-docker-socket-proxy
feature: 0009
title: Proxy del socket de Docker
mode: full
status: approved
created: 2026-11-25
author: Àngel Delgado
approvers:
  - name: Àngel Delgado
    approved_at: 2026-11-25
---

# Spec — Proxy del socket de Docker

🦆 Traefik deja de tocar el socket de Docker. En medio se pone un contenedor pequeño, `traefik-socket-proxy`, que solo deja pasar las consultas de lectura que Traefik necesita (qué contenedores hay, sus labels, sus eventos). Si alguien comprometiera Traefik y pidiera a Docker «crea un contenedor privilegiado», recibiría un 403 en vez de quedarse con tu máquina. Para ti nada cambia: los proyectos conectados y el dashboard se ven igual.

Validación: dev-lead — el proxy tiene que seguir descubriendo los contenedores de los proyectos conectados.

## Capacidades

- Ninguna, porque el comportamiento que ve el dev-lead no cambia: es endurecimiento de la infraestructura (`compose.yaml`, constitution, architecture).

## ✋ Decisiones que he tomado yo — valida estas

```text
Review de spec propuesta: un revisor con los siete puntos — señales: dependencia externa (imagen `wollomatic/socket-proxy`) · tamaño: ~45 líneas en 5 ficheros, sin contrato público ni MODIFIED
- Dominio y técnica (sonnet): si la allowlist cubre lo que pide Traefik 3.8 (incluido `HEAD /_ping`), si el usuario del proxy llega al socket en Docker Desktop y en Linux, y si la red interna aísla el API de los proyectos conectados (señal: dependencia externa)
- Mínimo razonable: sin review — deja sin mirar que una allowlist corta rompa el descubrimiento en silencio
```

1. Servicio `socket-proxy` (`container_name: traefik-socket-proxy`) con imagen `wollomatic/socket-proxy:1.14.0` (tag comprobado con `docker manifest inspect`), versión exacta; Dependabot `docker-compose` la vigila junto con la de Traefik (Art. IV ampliado, decisión 10).
2. Monta `/var/run/docker.sock:/var/run/docker.sock:ro`; es el único servicio que lo monta.
3. Allowlist mínima, cada flag entre comillas simples de YAML para que `\.`, `|` y `{}` lleguen intactos (se comprueba con `docker compose config`): `'-allowGET=/v1\..{1,2}/(version|containers/json|containers/[^/]+/json|events)'` y `'-allowHEAD=/_ping'` (nota del README para Traefik ≥ 3.6.1). Deja fuera `archive`, `logs`, `export`, `attach` y `top`. La Task 1 mide con el log del proxy qué rutas pide Traefik 3.8; si alguna recibe 403 y Traefik la necesita, se añade esa ruta exacta y se apunta en el walkthrough.
4. Quién puede conectarse: `-allowfrom=10.231.0.0/29`, la subred fija de la red `traefik-socket-proxy` (`ipam`), en la que solo están Traefik y el proxy. No se usa `-allowfrom=traefik`: el nombre se resuelve al arrancar y fallaría si Traefik aún no existe o cambia de IP al recrearse. Subred comprobada libre entre las redes de Docker de esta máquina; `README.md` la nombra y dice qué hacer si choca en otra máquina. Si el healthcheck del propio proxy (desde `127.0.0.1`) queda fuera de `-allowfrom` y el contenedor no llega a `healthy`, se añade `127.0.0.1/32` (lo mide la Task 1).
5. `-listenip=0.0.0.0`, `-watchdoginterval=3600`, `-stoponwatchdog`, `-shutdowngracetime=5`, `-allowhealthcheck` — el ejemplo del README.
6. Endurecimiento del proxy, como el de Traefik (patch 0008): `user: "65534:${DOCKER_GID:-0}"` (sin root; el grupo dueño del socket: `0` en Docker Desktop, medido `0:0 660`; el GID de `docker` en Linux nativo, que se pone en `.env`), `read_only: true`, `cap_drop: [ALL]`, `no-new-privileges:true`, `mem_limit: 64m` (el del ejemplo del README), `cpus: 0.5`, `restart: unless-stopped`. `.env.example` documenta `DOCKER_GID` y `README.md` avisa de que en Linux nativo es obligatorio: sin él, el proxy no llega al socket, queda `unhealthy` y Traefik no arranca.
7. Healthcheck del proxy: `test: ["CMD", "./healthcheck"]`, `interval: 10s`, `timeout: 5s`, `retries: 2` — el del README; Traefik espera con `depends_on: socket-proxy: condition: service_healthy`.
8. Red `traefik-socket-proxy` (`name: traefik-socket-proxy`, `internal: true`, `ipam` `10.231.0.0/29`) solo para `traefik` y `socket-proxy`: los proyectos conectados, en `traefik-public`, no la ven.
9. Traefik: `--providers.docker.endpoint=tcp://socket-proxy:2375` y fuera el montaje de `docker.sock`. Su `read_only`, `cap_drop`, `cap_add` y límites no cambian: pasa de un socket de fichero a TCP, sin escribir en disco.
10. Constitution, que se aprueba con esta spec:
    - Art. II pasa a «`/var/run/docker.sock` solo lo monta el servicio `socket-proxy`, en solo lectura y sin root; Traefik llega a Docker por él, que solo deja pasar lecturas de la lista de contenedores, de cada contenedor, de eventos y de versión.» · *Por qué*: «el montaje `:ro` no limita el API de Docker: quien llega al socket puede crear contenedores privilegiados; el proxy del socket filtra las peticiones.»
    - Art. IV pasa de «Versión de Traefik exacta» a «Versiones exactas de las imágenes»: «Las imágenes de `compose.yaml` llevan versión exacta (`X.Y.Z` o `vX.Y.Z`, según la publique cada imagen); nunca `latest` ni un tag flotante. …» (el resto igual).
11. Decisión estructural en `architecture.md` y piezas nuevas (`socket-proxy`, red `traefik-socket-proxy`).
- Política de modelos: revisor de la spec, uno sonnet y su segunda ronda sonnet · ejes de la revisión final: Spec opus+high, Código sonnet+high, Arquitectura según el plan · sin otros despachos en paralelo · en paralelo hasta `control.maxParallelAgents`.

### Hallazgos de la review

- **Aceptado** — 1 (Crítico): `-allowfrom=traefik` se resuelve al arrancar y puede bloquear el arranque → `-allowfrom` con la subred fija de la red interna (decisión 4) y arranque en frío en «Dónde se prueba».
- **Aceptado** — 2: la IP de Traefik cambia al recrearlo → la misma subred fija; prueba de `up -d --force-recreate traefik` con descubrimiento posterior.
- **Aceptado** — 3: el montaje del socket en el proxy no era decisión → decisión 2 y su comprobación.
- **Aceptado** — 4: `65534:0` no llega al socket en Linux nativo → `user: "65534:${DOCKER_GID:-0}"` y `DOCKER_GID` en `.env.example`.
- **Aceptado** — 5: `containers/.*` deja leer ficheros y logs de cualquier contenedor → allowlist mínima (decisión 3) medida con el log del proxy.
- **Aceptado** — 6: el descubrimiento dinámico (eventos) no se probaba → contenedor de prueba que aparece y desaparece.
- **Aceptado** — 7: el Art. IV solo hablaba de Traefik → ampliado a las imágenes del compose (decisión 10).
- **Aceptado** — 8: red y contenedor sin nombre fijo y sin límite de CPU → `name`, `container_name` y `cpus: 0.5`.
- **Aceptado** — 9: aislamiento sin prueba real → conexión desde el contenedor de prueba en `traefik-public`; decisión 9 dice que el endurecimiento de Traefik no cambia.
- **Aceptado** — 10: `smtp4dev` como oráculo → contenedor de prueba propio.

Segunda ronda (sonnet):

- **Aceptado** — 1: el Art. IV pedía `vX.Y.Z` y la imagen es `1.14.0` → «`X.Y.Z` o `vX.Y.Z`»; tag comprobado.
- **Aceptado** — 2: «403» no probaba la allowlist → control positivo 200, 403 o 405, y motivo en el log.
- **Aceptado** — 3: el aislamiento pasaba con el proxy caído → control positivo desde Traefik y prueba por nombre e IP desde el contenedor de prueba.
- **Aceptado** — 4: el healthcheck desde `127.0.0.1` podía quedar fuera de `-allowfrom` → lo mide la Task 1, con `127.0.0.1/32` como salida.
- **Aceptado** — 5: «sin denegadas» pasaba con el log vacío → evidencia positiva (router que aparece y desaparece) y log de Traefik sin errores del provider.
- **Aceptado** — 6: sin `DOCKER_GID` en Linux el proxy queda `unhealthy` → aviso en `README.md`.
- **Aceptado** — 7: subred fija comprobada solo aquí → `README.md` la nombra.
- **Aceptado** — 8: comentario `Lee docker.sock` obsoleto → en la tabla. `CLAUDE.md` no nombra providers ni puertos (ya reescrito en la init): no entra.
- **Aceptado** — 9: la regex en YAML → comillas simples y `docker compose config`.
- **Aceptado** — 10: contenedor de prueba sin puerto y sin limpieza → label de puerto y `docker rm -f`.

### Decisiones tomadas con el dev-lead

- Hacerlo ya, como feature, antes de la release — «2»
- Imagen `wollomatic/socket-proxy` — «1»

## Intent

Hoy Traefik monta `/var/run/docker.sock`. El `:ro` solo impide tocar el fichero: las peticiones al API pasan todas, así que quien comprometa Traefik controla Docker y, con un contenedor privilegiado, el host. Se quiere que Traefik solo pueda leer lo que necesita para descubrir contenedores. Éxito: Traefik sigue creando y quitando los routers de los contenedores con labels y una petición de escritura al API desde el contenedor de Traefik recibe 403. Fracaso aunque funcione: que la allowlist corta haga que Traefik deje de ver contenedores sin que nada lo diga.

## Scope

- Entra: `compose.yaml` (servicio `socket-proxy`, red `traefik-socket-proxy`, endpoint y `depends_on` de Traefik, fuera el montaje del socket en Traefik); `.env.example` (`DOCKER_GID`); `constitution.md` (Art. II y Art. IV, decisión 10); `architecture.md` (estructura, piezas, flujo, decisión estructural); `README.md` (estructura y `DOCKER_GID` en Linux).
- No entra: Traefik como usuario no root; cambios en los proyectos conectados; el CI.

## Lo que se retira o cambia de forma

| Qué | Dónde aparece | Destino |
| --- | --- | --- |
| Montaje `/var/run/docker.sock:ro` en `traefik` | `compose.yaml` (volumes de `traefik`) | Scope: pasa al servicio `socket-proxy` |
| Art. II «se monta siempre con `:ro`» y su «por qué» | `constitution.md` | Scope: decisión 10 |
| Art. IV «Versión de Traefik exacta» | `constitution.md` | Scope: decisión 10 |
| «`docker.sock` (solo lectura)» como dependencia de `traefik` y del provider Docker | `architecture.md` (Piezas) | Scope: pasa a `socket-proxy` |

- Filas que implementa: ninguna (sin fila en el roadmap).

## Approach

- A. `wollomatic/socket-proxy` con allowlist por método y ruta — elegido por el dev-lead («1»).
- B. `tecnativa/docker-socket-proxy` con variables por grupo — descartado: control más grueso.
- C. Seguir montando el socket en Traefik — descartado: es lo que la feature corrige.
- Elegido: A — lo eligió el dev-lead: «1».

## Dónde se prueba

Contenedor de prueba: `traefik:v3.8.0` arrancado con `--ping` en `traefik-public` y labels `traefik.enable=true`, `traefik.http.routers.probe-test.rule=Host(\`probe.test.localhost\`)` y `traefik.http.services.probe-test.loadbalancer.server.port=80` (imagen ya presente; tiene `wget`). Se borra con `docker rm -f` al acabar y `docker ps` queda sin él.

- Arranque en frío: ejecución real, `docker compose down` y `docker compose up -d --wait` → los dos servicios `healthy`.
- Descubrimiento dinámico: ejecución real, con el proxy arriba se arranca el contenedor de prueba → `GET https://dashboard.traefik.localhost/api/http/routers` contiene `probe-test@docker`; se para → desaparece.
- Tras recrear Traefik: ejecución real, `docker compose up -d --force-recreate traefik` y de nuevo el contenedor de prueba → su router aparece.
- Allowlist: ejecución real, tras lo anterior: log del proxy sin peticiones de Traefik bloqueadas y log de Traefik sin errores del provider Docker; la evidencia positiva es el router que aparece y desaparece.
- Escritura bloqueada: ejecución real, desde `traefik-proxy`: control positivo `GET http://socket-proxy:2375/v1.47/containers/json` → 200; `POST /v1.47/containers/create` → 403 o 405; `GET /v1.47/containers/<id>/logs` → 403; el motivo, en el log del proxy.
- Aislamiento: ejecución real; control positivo: desde `traefik-proxy`, `socket-proxy:2375` responde; desde el contenedor de prueba (en `traefik-public`), `socket-proxy` no resuelve y la IP del proxy en `10.231.0.0/29` no conecta.
- Traefik sin el socket y proxy con él: ejecución real, `docker inspect` de los dos contenedores (montajes).
- Regresión: dashboard 200 por su dominio.

## Términos y ADR

- Términos resueltos: ninguno
- ADR candidatas: ninguna (la decisión estructural va a `architecture.md`)

## Enmiendas

## Aprobaciones

| Nombre | Fecha | Estado |
| --- | --- | --- |
| Àngel Delgado | 2026-11-25 | aprobada (opción «Apruebo») |
