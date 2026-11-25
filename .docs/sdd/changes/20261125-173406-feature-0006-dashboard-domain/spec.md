---
id: 20261125-173406-feature-0006-dashboard-domain
feature: 0006
title: Dashboard en dashboard.traefik.localhost
mode: full
status: approved
created: 2026-11-25
author: Àngel Delgado
approvers:
  - name: Àngel Delgado
    approved_at: 2026-11-25
---

# Spec — Dashboard en dashboard.traefik.localhost

🦆 El dashboard de Traefik pasa de `http://localhost:8080` a `https://dashboard.traefik.localhost/dashboard/`, con candado, como cualquier proyecto conectado. El puerto 8080 deja de abrirse en tu máquina y el dashboard ya no va en modo «insecure»: lo sirve un router con su certificado. Si el certificado falta o el router está mal, no hay otra puerta: se mira con `docker compose logs`.

Validación: dev-lead — cambia la URL con la que el dev-lead entra al dashboard.

## Capacidades

- Nuevas: `proxy-dashboard` — acceso al dashboard y al API de Traefik

## ✋ Decisiones que he tomado yo — valida estas

```text
Review de spec propuesta: un revisor con los siete puntos — señales: capacidad nueva (`proxy-dashboard`) · tamaño: ~40 líneas en 7 ficheros, sin contrato público ni MODIFIED
- Dominio y técnica (sonnet): si el router con `service: api@internal` y solo `Host` cubre `/dashboard/` y `/api/`, si quitar `api.insecure` y el puerto 8080 deja el healthcheck en pie, y si los documentos que nombran `:8080` quedan todos en el Scope (señal: capacidad nueva)
- Mínimo razonable: sin review — deja sin mirar que el healthcheck siga usando el entrypoint `traefik` sin publicar
```

1. Router en un fichero versionado `config/dynamic/dashboard.yml`: `http.routers.traefik-dashboard` con `rule: Host(\`dashboard.traefik.localhost\`)`, `entryPoints: [websecure]`, `tls: {}` y `service: api@internal` — «Dónde va lo nuevo» de `architecture.md` (configuración dinámica compartida → un fichero de `config/dynamic/` que no acabe en `.tls.yml`). Enfoque: A, frente a B y C (ver Approach).
2. El router lleva el prefijo `traefik-` (`traefik-dashboard`), como pide la regla de nombres `<proyecto>-<servicio>` — el proyecto es `traefik`.
3. El certificado lo genera `node scripts/add-project-cert.mjs traefik` (`*.traefik.localhost`); `README.md` lo añade a la instalación, antes de arrancar, y dice que se regenera en cada máquina nueva — el patrón de la 0002.
4. `compose.yaml`: se quitan `--api.insecure=true` y el puerto `"127.0.0.1:8080:8080"`; se quedan `--api.dashboard=true` (lo necesita `api@internal`) y `--entrypoints.traefik.address=:8080` sin publicar, porque lo usa `/ping` del healthcheck. Su comentario pasa a decirlo.
5. URLs de referencia: dashboard en `https://dashboard.traefik.localhost/` (medido en `:8080`: `/` → 301 a `/dashboard/`; por el router, 302, el mismo handler `api@internal`) y API en `https://dashboard.traefik.localhost/api/`. Sin middleware.
6. Cambios en la constitution, Reglas de producto, que se aprueban con esta spec:
   - Dónde viven los datos: «rutas en las labels del `compose.yaml` de cada proyecto conectado, nunca en este repo» pasa a «rutas de los proyectos conectados en las labels de su `compose.yaml`, nunca en este repo; el router del dashboard del propio proxy, en `config/dynamic/dashboard.yml`».
   - Límites: «los puertos 80, 443 y 8080 del host son del proxy» pasa a «los puertos 80 y 443 del host son del proxy»; «solo se publica lo que lleva `traefik.enable=true`» pasa a «de los proyectos conectados, solo se publica lo que lleva `traefik.enable=true`».
   - Regla ante conflicto: se añade «el nombre de proyecto `traefik` (`*.traefik.localhost`) es del propio proxy».
   Consecuencia literal de las decisiones del dev-lead sobre el dominio y `:8080`.
7. El script de `project-certificate` se reutiliza para el certificado del propio proxy, fuera de su propósito literal («un proyecto conectado»); su comportamiento no cambia. El nombre `traefik` reservado no lo impide el script: un proyecto ajeno que ejecute `add-project-cert.mjs traefik` sobrescribiría el certificado del dashboard. Queda como regla de la constitution y nota en `README.md` — el script no puede saber desde qué repo lo llaman.
8. El gate de cierre sigue siendo `docker compose up -d --wait` (healthcheck): no cubre el router ni el certificado. Esos comportamientos se comprueban con ejecución real en la validación («Dónde se prueba») — añadir un `curl` al gate obligaría a tener el certificado de `traefik` en cada clon.
9. Decisión estructural en `architecture.md`: el dashboard deja `:8080` y `api.insecure` por un router en `config/dynamic/dashboard.yml`; `:8080` solo dentro del contenedor, para `/ping`.
10. Sin consumidores del API en `:8080` por la red `traefik-public`: comprobado en `dev-tools` (`git grep "traefik-proxy:8080|:8080/api|traefik:8080"` sin resultados); ALC Stronghold ya no existe. Cambio incompatible para quien use `localhost:8080`: lo marcará el `CHANGELOG.md` en la release.
- Repaso de coherencia: `git grep 8080` fuera de `changes/` → todas las apariciones están en «Lo que se retira o cambia de forma». Delta probado en una copia: `capability merge` sin rechazos (se repite tras la review).
- Política de modelos: revisor de la spec, uno sonnet y su segunda ronda sonnet · ejes de la revisión final: Spec opus+high, Código sonnet+high, Arquitectura según el plan · sin otros despachos en paralelo · en paralelo hasta `control.maxParallelAgents`.

### Hallazgos de la review

- **Aceptado** — 1 (Crítico): la constitution dice «rutas nunca en este repo» y «solo se publica lo que lleva `traefik.enable=true`» → decisión 6 amplía los cambios de la constitution y el Scope los lista.
- **Aceptado** — 2: el nombre `traefik` reservado no lo hace cumplir nada → decisión 7: regla en la constitution y nota en `README.md`, sin cambiar `project-certificate`; la regla de la capacidad la cita.
- **Aceptado** — 3: el GIVEN no reiniciaba el proxy → GIVEN con `docker compose restart`.
- **Aceptado** — 4: el escenario de redirección HTTP pasaba sin la feature → sale del delta; queda como regresión en «Dónde se prueba».
- **Aceptado** — 5: decisión 7 y «Dónde se prueba» no casaban → decisión 8 separa el gate de las comprobaciones de la validación.
- **Aceptado** — 6: consumidores del API por la red `traefik-public` → decisión 10, comprobado sin resultados; fila en «Lo que se retira».
- **Aceptado** — 7: «sin certificado» sin escenario y aviso de la constitution que aquí no aplica → escenario «Sin el certificado de `traefik`» y «Avisos» solo con el log.
- **Aceptado** — 8: `--api.dashboard=true` y el nombre reservado fuera de ✋ → decisiones 4 y 7; `/` lo mide la Task 1 (decisión 5).
- **Aceptado** — 9: sin decisión estructural → decisión 9, en el Scope.
- **Aceptado** — 10: dos mecanismos de prueba y el puerto 8080 sin precondición → un solo mecanismo (`https.get` a `127.0.0.1:443` con `servername`, cabecera `Host` y `ca` de mkcert) y el 8080 comprobado libre antes.

Segunda ronda (sonnet):

- **Aceptado** — 1: «Sin el certificado» pasaba sin router → AND con `/dashboard/` 200 sin verificar.
- **Aceptado** — 2: `restart` no aplica `compose.yaml` → GIVEN y precondición con `docker compose up -d`.
- **Aceptado** — 3: Scope incompleto → comentario del provider File, árbol y Proyectos conectados del `README.md`, Piezas y Flujo de `architecture.md`.
- **Aceptado** — 4: `AND healthy` no discriminaba → sale del delta; sigue como regresión.
- **Aceptado** — 5: `constitution.md:50` → `:51`.
- **Aceptado** — 6: `/` sin medir → medido: 301 a `/dashboard/` (decisión 5).
- **Aceptado** — 7: sin Propósito y script fuera de su propósito → Propósito en el delta y decisión 7.
- **Aceptado** — 8: cambio incompatible sin aviso → decisión 10: entrada en el `CHANGELOG.md` de la release.
- **Aceptado** — 9: `curl` por nombre en la regresión HTTP → `http.get` a `127.0.0.1:80` con `Host`.
- **Aceptado** — 10: apartar `traefik.tls.yml` en la máquina real → se mueve al scratchpad y se devuelve al acabar.

### Decisiones tomadas con el dev-lead

- Host `dashboard.traefik.localhost` — «el dashboard podría ser también un dashboard.traefik.localhost»
- Solo el dominio: fuera `api.insecure` y el puerto 8080 publicado — «1»
- Sin autenticación — «1»
- Hacerlo como feature, después del patch del healthcheck — «haz primero una en patch y la otra luego en feature no?»

## Intent

Hoy el dashboard y el API de Traefik se sirven en `http://localhost:8080` con `api.insecure=true`: sin TLS, sin router y con un puerto más abierto en el host. Se quiere que el dashboard entre por el mismo camino que los proyectos conectados: un dominio `*.localhost`, HTTPS con el certificado de mkcert y un router. Éxito: `https://dashboard.traefik.localhost/dashboard/` carga con candado y `127.0.0.1:8080` ya no responde. Fracaso aunque funcione: que el healthcheck deje de funcionar al dejar de publicar 8080, o que quede algún documento apuntando a `:8080`.

## Scope

- Entra: `config/dynamic/dashboard.yml`; `compose.yaml` (sin `api.insecure`, sin publicar 8080, comentario del entrypoint `traefik` y del provider File, que ya no carga solo certificados); generar el certificado de `traefik` con el script; `README.md` (instalación con el certificado de `traefik` y su regeneración por máquina, URL del dashboard, tabla y frase de puertos, nombre `traefik` reservado, árbol de Estructura con `dashboard.yml` y fila `traefik` en Proyectos conectados); `operations.md` (Acceso a la aplicación); `architecture.md` (pieza `traefik`, pieza Provider File, estructura con `dashboard.yml`, Flujo principal con el router del dashboard, decisión estructural); `PRODUCT.md` (Es: dónde expone el dashboard); `constitution.md` (Reglas de producto: Dónde viven los datos, Límites, Regla ante conflicto — decisión 6).
- No entra: autenticación; un middleware de redirección de `/` a `/dashboard/`; tocar el healthcheck; impedir en el script el nombre `traefik`.

## Lo que se retira o cambia de forma

| Qué | Dónde aparece | Destino |
| --- | --- | --- |
| Dashboard en `http://localhost:8080` | `README.md:47`; `operations.md:23`; `PRODUCT.md:13`; `architecture.md:22` | Scope: pasan a `https://dashboard.traefik.localhost/` (decisión 5) |
| Puerto 8080 del host | `compose.yaml:37`; `README.md:47` y `:106`; `constitution.md:53` | Scope: se retira (decisiones 4 y 6) |
| `--api.insecure=true` | `compose.yaml:9` | Scope: se retira |
| API en `traefik-proxy:8080` por la red `traefik-public` | ningún consumidor (decisión 10) | se retira con `api.insecure` |
| «rutas … nunca en este repo» y «solo se publica lo que lleva `traefik.enable=true`» | `constitution.md:51`, `:53` | Scope: decisión 6 |
| Comentario «File provider (for TLS certificates)» | `compose.yaml:16` | Scope: el provider File también carga el router |
| `:8080` del entrypoint `traefik` y del healthcheck | `compose.yaml:23`, `:30` | se queda: lo usa `/ping` dentro del contenedor (decisión 4) |
| `8080` en el ejemplo de labels y entre servicios | `README.md:83`, `:86` | se queda: es el puerto de un servicio de ejemplo, no el del proxy |
| `8080` en la fila 0001 | `ROADMAP.md:9` | se queda: registro de una fila hecha |

- Filas que implementa: ninguna: la feature no tiene fila en el roadmap (comprobado con `git grep -n "0006" ROADMAP.md`).

## Approach

- A. Router en un fichero `config/dynamic/dashboard.yml` con el provider File — un fichero YAML versionado; sigue «Dónde va lo nuevo» de `architecture.md`.
- B. Router con labels en el propio servicio `traefik` de `compose.yaml` — sin fichero nuevo, pero mezcla configuración dinámica en las labels del proxy y exige `traefik.enable=true` y la red en el contenedor de Traefik.
- C. Mantener `api.insecure` y añadir solo un router con el dominio — lo descartó el dev-lead («1»: solo el dominio).
- Elegido: A — la regla de `architecture.md` ya dice dónde va la configuración dinámica compartida; B la reparte entre dos sitios.

El fichero no acaba en `.tls.yml`, así que entra en git. Traefik lo recoge al reiniciar (medido en la 0002: el provider File no ve ficheros nuevos en Docker Desktop).

## Dónde se prueba

Un solo mecanismo para lo HTTPS: `https.get` de Node a `127.0.0.1:443` con `servername` y cabecera `Host` `dashboard.traefik.localhost` y `ca` = `rootCA.pem` de `mkcert -CAROOT`, sin desactivar la verificación. Precondiciones: el contenedor recreado con `docker compose up -d` tras cambiar `compose.yaml` (`restart` no aplica los cambios de `compose.yaml`; solo recoge registros nuevos de `config/dynamic/`); nada más escucha en `127.0.0.1:8080` (comprobado antes con `Get-NetTCPConnection`).

- Dashboard por el dominio: ejecución real, `/dashboard/` → 200 y `authorized: true`.
- API por el dominio: ejecución real, `/api/overview` → 200.
- Sin certificado de `traefik`: ejecución real, con `traefik.tls.yml` movido al scratchpad y el proxy reiniciado → la verificación falla y, sin verificación, `/dashboard/` responde 200; después se devuelve el fichero y se reinicia.
- Puerto 8080 cerrado: ejecución real, `curl http://127.0.0.1:8080/` → conexión rechazada.
- Regresión, redirección HTTP: ejecución real, `http.get` a `127.0.0.1:80` con cabecera `Host: dashboard.traefik.localhost` → 301/308 a `https://`.
- Regresión, healthcheck: ejecución real, `docker compose up -d --wait` → `Healthy` y `.State.Health` con `OK: http://:8080/ping`.

## Términos y ADR

- Términos resueltos: ninguno
- ADR candidatas: ninguna (la decisión estructural va a `architecture.md`, decisión 9)

## Delta de comportamiento

### Capacidad: `proxy-dashboard`

Propósito: cómo entra el dev-lead al dashboard y al API del propio proxy.

#### ADDED — Dashboard por su dominio

- GIVEN el contenedor recreado con `docker compose up -d` y el certificado de `traefik` registrado con `node scripts/add-project-cert.mjs traefik` antes de recrearlo (o después, con `docker compose restart`)
- WHEN se abre `https://dashboard.traefik.localhost/dashboard/`
- THEN responde 200 con el dashboard de Traefik y un certificado verificable contra la CA de mkcert
- AND `https://dashboard.traefik.localhost/api/overview` responde 200

#### ADDED — Sin el certificado de traefik

- GIVEN el proxy reiniciado sin `config/dynamic/traefik.tls.yml`
- WHEN se abre `https://dashboard.traefik.localhost/dashboard/`
- THEN el certificado presentado no es verificable contra la CA de mkcert (Traefik sirve su certificado por defecto)
- AND sin verificar el certificado, `/dashboard/` responde 200: el router existe y solo falta el certificado

#### ADDED — El puerto 8080 no se publica

- GIVEN el contenedor recreado con `docker compose up -d` y nada más escuchando en `127.0.0.1:8080`
- WHEN se conecta a `http://127.0.0.1:8080/`
- THEN la conexión se rechaza

#### Reglas de la capacidad — proxy-dashboard

- **Dónde viven los datos**: el router en `config/dynamic/dashboard.yml` (en git); el certificado de `*.traefik.localhost` en `certs/` y su registro en `config/dynamic/traefik.tls.yml` (fuera de git: se regenera en cada máquina con el script).
- **Idioma de los nombres**: router `traefik-dashboard`, en inglés.
- **Límites**: los puertos 80 y 443 del host son del proxy; 8080 solo existe dentro del contenedor.
- **Avisos**: sin el certificado de `traefik`, el navegador avisa (certificado por defecto de Traefik); un router mal escrito solo se ve en `docker compose logs`.
- **Regla ante conflicto**: la de la constitution: el nombre de proyecto `traefik` es del propio proxy.

## Enmiendas

- 2026-11-25 — «Lo que se retira»: el destino del dashboard pasa a la raíz `https://dashboard.traefik.localhost/`, como ya fijaba la decisión 5; la decisión 5 anota el 302 medido por el router — incoherencia interna hallada por el eje Spec — pasada de fix — sin aprobar (alinea la tabla con una decisión aprobada)

## Aprobaciones

| Nombre | Fecha | Estado |
| --- | --- | --- |
| Àngel Delgado | 2026-11-25 | aprobada (opción «Apruebo») |
