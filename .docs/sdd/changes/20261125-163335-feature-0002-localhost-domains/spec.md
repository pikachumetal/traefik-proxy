---
id: 20261125-163335-feature-0002-localhost-domains
feature: 0002
title: Migrar a dominios .localhost
mode: full
status: approved
created: 2026-11-25
author: Àngel Delgado
approvers:
  - name: Àngel Delgado
    approved_at: 2026-11-25
---

# Spec — Migrar a dominios .localhost

🦆 Un proyecto nuevo se conecta al proxy con un solo comando y sin tocar `hosts`: `node ../traefik-proxy/scripts/add-project-cert.mjs devtools` y `https://smtp.devtools.localhost` ya sale con candado. El script crea el certificado con mkcert y le dice a Traefik que lo sirva; nada de eso entra en git. Desaparecen los `.local`, ALC Stronghold, `generate-certs.sh` y el `tls.yml` compartido. `dev-tools` deja de verse hasta que migre sus labels en su repo.

Validación: dev-lead — el resultado se comprueba en el navegador y con el comando que usarán los proyectos conectados.

## Capacidades

- Nuevas: `project-certificate` — generar y registrar el certificado wildcard de un proyecto conectado con un solo comando

## ✋ Decisiones que he tomado yo — valida estas

```text
Review de spec propuesta: dos revisores — señales: capacidad nueva (`project-certificate`), contrato público (el comando y su fichero `config/dynamic/<proyecto>.tls.yml` los consumen `dev-tools` y Traefik) · tamaño: ~150 líneas en 7 ficheros
- Dominio (sonnet): si los requisitos de `project-certificate` cubren lo que necesita `dev-tools` para migrar (llamada desde otro repo, renovar) y si el corte deja algún hueco en `README.md` para conectar un proyecto nuevo (señal: capacidad nueva)
- Técnica (sonnet): si el YAML generado lo acepta el provider File de Traefik v3, si `node --test` puede simular «sin mkcert» con el `PATH`, y la validación del nombre frente a rutas e inyección (señal: contrato público)
- Mínimo razonable: un revisor con los siete puntos — deja menos profundidad en la comprobación del YAML contra Traefik y del test sin mkcert
```

1. Nombre del script `scripts/add-project-cert.mjs` y uso `node <ruta>/scripts/add-project-cert.mjs <proyecto>` — Node por la regla de scripts agnósticos del sistema (Node 22 o superior, por el glob de `node --test`; medido aquí: v26.13.1); el nombre dice lo que hace.
2. Capacidad nueva `project-certificate` — es el comportamiento observable que añade la feature.
3. Ficheros generados: `certs/<proyecto>.localhost.pem`, `certs/<proyecto>.localhost-key.pem` y `config/dynamic/<proyecto>.tls.yml`, resueltos relativos al script, no al directorio de trabajo — por analogía con los nombres actuales; así funciona llamado desde otro repo.
4. Forma del registro: `tls.certificates` con `certFile: /certs/<proyecto>.localhost.pem` y `keyFile: /certs/<proyecto>.localhost-key.pem` — Traefik elige por SNI; no se toca el certificado por defecto (`tls.stores.default`), así que un host sin proyecto sigue recibiendo el autofirmado de Traefik. Las rutas son las del contenedor: dependen de los montajes ya existentes en `compose.yaml` (`./certs:/certs:ro`, línea 32; `./config/dynamic:/config/dynamic:ro`, línea 31; `--providers.file.directory=/config/dynamic` y `watch=true`, líneas 15-16), que esta feature no toca.
5. `config/dynamic/*.tls.yml` fuera de git: se añade esa línea a `.gitignore` sin modificar la exclusión de certificados del Art. I — el registro apunta a certificados que tampoco están en git.
6. Se borra `config/dynamic/tls.yml` y se añade `config/dynamic/.gitkeep` — sin registros a mano, la carpeta tiene que existir en un clon nuevo para el montaje (`certs/.gitkeep` ya existe).
7. Nombre de proyecto válido: `^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$` (una etiqueta DNS: de 1 a 63 caracteres, sin guion al principio ni al final), comprobado sin modo multilínea — entra en rutas y en un nombre DNS; cualquier otra cosa se rechaza antes de escribir nada.
8. mkcert se invoca con `execFile`/`spawnSync` y un array de argumentos, sin shell; su ausencia se detecta por `ENOENT` — nada del nombre llega a un intérprete de comandos.
9. Orden: crear `certs/` si falta, ejecutar mkcert y escribir el `.tls.yml` solo si mkcert sale con 0 — un fallo de mkcert no deja un registro apuntando a ficheros que no existen.
10. Textos del script en castellano (constitution, Convenciones): `uso: node scripts/add-project-cert.mjs <proyecto>`, `nombre de proyecto inválido: <nombre> (usa minúsculas, números y guiones)`, `mkcert no está instalado: https://github.com/FiloSottile/mkcert`, `mkcert falló: <su salida de error>` y, al acabar, `certificado de *.<proyecto>.localhost registrado en config/dynamic/<proyecto>.tls.yml`.
11. Volver a ejecutarlo para el mismo proyecto regenera y sobrescribe sus tres ficheros, también si solo existía alguno — así se renueva un certificado sin pasos extra. Límite: si mkcert falla a medias, puede haber pisado ya los `.pem` previos; el registro no se toca y volver a ejecutar el script lo arregla.
12. El script no comprueba que la CA de mkcert esté instalada: `mkcert -install` queda como requisito previo en `README.md` — mkcert ya avisa por su cuenta y el script no la necesita para generar.
13. Retirar un proyecto es borrar a mano sus tres ficheros, escrito en `README.md` — no hay comando de borrado (No entra); un registro huérfano hace que Traefik registre un error por fichero que falta.
14. No se detecta que dos repos usen el mismo nombre de proyecto: el segundo sobrescribe al primero — límite declarado; la regla de la constitution (cada proyecto es dueño exclusivo de su sufijo) lo hace un error de configuración.
15. Se borran de `certs/` los ficheros locales `devtools.local*.pem` y `alcstronghold.local*.pem`, como último paso y después de generar el de `devtools.localhost` — tras el corte nadie los sirve; no se recuperan sin regenerarlos con mkcert.
16. Suite nueva `scripts` en `operations.md`: `node --test "scripts/*.test.mjs"` · unitario · Node 22 o superior — el script necesita su test y Node ya trae runner. Los tests usan el proyecto inventado `demo` y un directorio temporal, no `certs/` ni `config/dynamic/` del repo.
17. Sin script `setup-hosts` — `*.localhost` resuelve a loopback sin `hosts` (medido en esta máquina: `sonar.devtools.localhost` → `::1`, `127.0.0.1`); solo haría falta en Linux sin `systemd-resolved` para clientes que no son navegador, y el dev-lead trabaja en Windows. Respuesta a su pregunta «el script de setup-host también tendríamos que tenerlo?».
18. El hot-reload del provider File sobre un bind mount en Docker Desktop (Windows) no está medido: lo mide la primera task del plan; si no recoge el fichero nuevo, `README.md` añade `docker compose restart` tras el script y el THEN de «Traefik sirve el certificado» se comprueba tras ese reinicio — la spec no puede afirmarlo sin medirlo. `certs/` y `config/dynamic/` existen en un clon por sus `.gitkeep` versionados.
- Repaso de coherencia: Scope amplía `architecture.md` (flujo y dónde va lo nuevo) y añade la regla de `CLAUDE.md` que nombra `tls.yml`, encontrados con `git grep`. Delta probado en una copia: `capability merge` → 6 requisitos y 5 reglas añadidos a `project-certificate.md`, sin rechazos; repetido tras la review: 6 requisitos (sale «Clon nuevo», entra «mkcert falla») y 5 reglas, sin rechazos.
- Política de modelos: revisores de la spec dos sonnet (confirmado: «1») y una segunda ronda sonnet · ejes de la revisión final: Spec opus+high, Código sonnet+high, Arquitectura según el plan · sin otros despachos en paralelo · en paralelo hasta `control.maxParallelAgents`.

### Hallazgos de la review

- **Aceptado** — Dominio 1 (Crítico): no se fija que, llamado desde otro repo, los ficheros caen en este → AND en «Generar y registrar» y decisión 3.
- **Aceptado** — Dominio 2 y Técnica 7 (Crítico/Importante): sin requisito para un fallo de mkcert ni orden de escritura → requisito «mkcert falla» y decisión 9.
- **Aceptado** — Dominio 3: renovar con ficheros a medias y cuándo renovar → decisión 11 y contenido mínimo de `README.md` (renovar al caducar o cambiar de CA).
- **Aceptado** — Dominio 4 y Técnica 3 (Crítico): contrato de montajes no citado y hot-reload sin medir → decisiones 4 y 18; paso real sin reiniciar en «Dónde se prueba».
- **Aceptado** — Dominio 5: contenido mínimo de `README.md` sin fijar → listado en Scope.
- **Aceptado** — Dominio 6: «servicios entre sí por su nombre» sin destino → en el contenido mínimo de `README.md`.
- **Aceptado** — Dominio 7: conflicto real (mismo nombre desde dos repos) → decisión 14 y «Regla ante conflicto».
- **Aceptado** — Dominio 8 y Técnica 6: nombre admitía guion final y longitud sin tope → patrón de la decisión 7 y casos `demo-`, 64 caracteres, `a\nb` y `..` en el test.
- **Aceptado en parte** — Dominio 9: dato real `devtools` en tests → los tests usan `demo` (decisión 16); `devtools` se queda en la ejecución real y en `README.md`, porque es el proyecto que este repo sirve, no un dato de terceros.
- **Aceptado** — Dominio 10: «Clon nuevo» no es del script → sale del delta y queda como regresión en «Dónde se prueba».
- **Aceptado** — Técnica 1 (Crítico): «sin aviso del navegador» se comprobaba a ojo → THEN con conexión TLS verificada contra `rootCA.pem` de mkcert y SAN leído, sin desactivar la verificación.
- **Aceptado** — Técnica 2 (Crítico): «válidos para…» sin comprobación → AND con el SAN leído del `.pem`.
- **Aceptado** — Técnica 4: carpeta `config/dynamic/` vacía en un clon y check del log sin patrón → decisión 6 y patrón `level=error`/`ERR` en «Dónde se prueba». Además: la imagen `traefik:v3` no define healthcheck (`docker image inspect` → `null`), así que `--wait` solo espera a que arranque; la regresión usa el `curl` de la suite `smoke`.
- **Aceptado** — Técnica 5: simular «sin mkcert» con `PATH` → detección por `ENOENT` (decisión 8) y test con `process.execPath` y `PATH`/`Path` apuntando a un directorio vacío.
- **Aceptado** — Técnica 8: decisiones del cuerpo fuera de ✋ → decisiones 4, 13 y la forma del registro.
- **Aceptado** — Técnica 9: CA no instalada → decisión 12; el GIVEN lo nombra como requisito previo.
- **Aceptado** — Técnica 10: `.gitignore` frente al Art. I y versión de Node → decisiones 5 y 16; `git check-ignore` en «Dónde se prueba».

Segunda ronda (sonnet):

- **Aceptado** — 1 (Crítico): el THEN daba por hecho el hot-reload sin medir → la primera task del plan lo mide y el GIVEN admite `docker compose restart` según el resultado (decisión 18); `certs/` y `config/dynamic/` existen por sus `.gitkeep`.
- **Aceptado** — 2 (Crítico): «Avisos» no recogía los de Traefik de la constitution → añadido el del registro con certificado ausente.
- **Aceptado** — 3: «Renovar» pasaba sin regenerar → THEN con número de serie distinto y caso concreto «solo el `.pem`», con `demo`.
- **Aceptado** — 4: `..` y `a\nb` faltaban en el WHEN → añadidos.
- **Aceptado** — 5: sin caso de 63 caracteres aceptado → añadido en «Dónde se prueba».
- **Aceptado como límite** — 6: mkcert puede pisar los `.pem` previos al fallar a medias → límite en la decisión 11; el registro no se toca y repetir lo arregla. Escribir a temporales y renombrar añade código para un fallo que mkcert casi solo da sin CA o sin permisos.
- **Aceptado** — 7: éxito ambiguo frente a los ficheros versionados que edita la feature → Intent dice «al ejecutarlo» y `git status --porcelain` limpio en «Dónde se prueba».
- **Aceptado** — 8: el borrado de los `.local` sin orden → último paso, irreversible sin mkcert (decisión 15).
- **Aceptado** — 9: `node --test scripts/` cambia entre versiones → `node --test "scripts/*.test.mjs"` y Node 22+ (medido v26.13.1).
- **Rechazado** — 10: `dev-tools` y `sonar.devtools.localhost` como dato de terceros → `dev-tools` es otro repo del mismo dev-lead (`pikachumetal/dev-tools`) y el único proyecto que sirve este proxy; no es un dato ajeno.

### Decisiones tomadas con el dev-lead

- Corte directo a `.localhost`, sin convivencia con `.local`; `dev-tools` deja de funcionar hasta migrar en su repo — «2, estamos empezando de cero»
- ALC Stronghold sale del proxy — «alcstronghold ahora ya no existe de momento así que se va fuera, solo devtools»
- Se borra `generate-certs.sh`: cada proyecto genera su certificado — «1»
- Script listo para que lo usen los proyectos, que genera y registra — «1» (a la pregunta del script `add-project-cert.mjs`)
- Dos revisores sonnet para la spec — «1»
- Sufijo `*.<proyecto>.localhost`, sin `hosts` ni `setup-hosts`; servicios entre sí por su nombre en `traefik-public`; labels y scripts de los proyectos se cambian en sus repos — fila 0002 del roadmap, aprobada en la init

## Intent

Hoy cada proyecto conectado necesita entradas en `hosts` (con `gsudo`) para su dominio `.local`, y registrar su certificado es un paso a mano en un `tls.yml` versionado que apunta a ficheros que no están en git. Se quiere que un proyecto nuevo quede servido por HTTPS en `https://<servicio>.<proyecto>.localhost` sin tocar el sistema y con un solo comando para su certificado. Éxito: al ejecutarlo, `node scripts/add-project-cert.mjs devtools` deja Traefik sirviendo un certificado verificable contra la CA de mkcert para `*.devtools.localhost`, sin editar ningún fichero versionado. Fracaso aunque funcione: que el repo vuelva a guardar en git rutas a certificados locales, o que el script escriba algo con un nombre inválido o tras un fallo de mkcert.

## Scope

- Entra: `scripts/add-project-cert.mjs` y su test `scripts/add-project-cert.test.mjs`; `.gitignore` con `config/dynamic/*.tls.yml`; borrar `config/dynamic/tls.yml` y añadir `config/dynamic/.gitkeep`; borrar `generate-certs.sh`; borrar los certificados `.local` locales de `certs/`; generar el certificado de `devtools` con el script; suite `scripts` en `operations.md`; `architecture.md` (estructura, piezas, flujo principal y dónde va lo nuevo); la regla de `CLAUDE.md` que nombra `tls.yml`.
- Entra, `README.md` con este contenido mínimo: requisitos previos (mkcert y `mkcert -install` una vez, Node 22+); conectar un proyecto: el comando `node ../traefik-proxy/scripts/add-project-cert.mjs <proyecto>` (ruta relativa desde un repo hermano), la red externa y un ejemplo de labels con router `<proyecto>-<servicio>`, `Host(\`<servicio>.<proyecto>.localhost\`)`, `entrypoints=websecure` y `tls=true`; que los servicios se llaman entre sí por su nombre en `traefik-public`, no por el dominio del proxy; renovar (volver a ejecutar el script al caducar el certificado o al cambiar la CA); retirar un proyecto (borrar sus tres ficheros); estructura y proyectos conectados (solo `dev-tools`, `*.devtools.localhost`). Se quitan las secciones de hosts, de scripts por proyecto y todo lo `.local` y de ALC Stronghold.
- No entra: cambios en el repo `dev-tools` (labels, `generate-certs.ps1`, `setup-hosts`); un comando para quitar el certificado de un proyecto; ALC Stronghold; un script `setup-hosts` en este repo (decisión 17); cambios en `compose.yaml`.

## Lo que se retira o cambia de forma

| Qué | Dónde aparece | Destino |
| --- | --- | --- |
| `config/dynamic/tls.yml` | `README.md` § Registrar certificados y § Estructura; `.docs/sdd/steering/architecture.md` (Estructura, Piezas, Flujo principal paso 3, Dónde va lo nuevo); `CLAUDE.md` (Reglas críticas) | Scope: se reescriben con `config/dynamic/<proyecto>.tls.yml` y el script |
| `generate-certs.sh` | raíz del repo | Scope: se borra (decisión con el dev-lead) |
| Sufijo `.local` | `README.md` (certificados, hosts, ejemplo de labels, proyectos conectados); `PRODUCT.md` § Terminology (`_Evitar_`) | Scope: `README.md` pasa a `.localhost`; `PRODUCT.md` ya lo marca como a evitar |
| Proyecto ALC Stronghold | `README.md` (certificados, scripts, hosts, proyectos conectados) | Scope: se retira |
| Scripts `setup-hosts` y `generate-certs` de cada proyecto | `README.md` § Usar scripts de los proyectos y § Configuración de Hosts | Scope: se sustituyen por `add-project-cert.mjs` |

- Filas que implementa: 0002 → `ROADMAP.md` (su fila; el cierre la marca) | la 0004 nombra `README.md` en «Toca»: sigue aplicando.

## Approach

- A. Script en este repo que genera con mkcert y escribe un fichero de registro por proyecto en `config/dynamic/` — un fichero nuevo (~40 líneas) con su test; ningún YAML compartido que editar.
- B. Script que genera y añade la entrada al `tls.yml` compartido — tiene que leer y reescribir YAML (o parsearlo a mano) y `tls.yml` sigue versionado con rutas locales.
- C. Solo documentar los dos comandos en `README.md` — sin código; el registro sigue a mano y el problema del clon nuevo sigue.
- Elegido: A — lo eligió el dev-lead: «1»; frente a B, evita editar un fichero compartido y deja fuera de git todo lo local.

El script: valida el nombre (decisión 7), resuelve `certs/` y `config/dynamic/` relativos a su propia ubicación, crea `certs/` si falta, ejecuta sin shell `mkcert -cert-file <certs>/<p>.localhost.pem -key-file <certs>/<p>.localhost-key.pem *.<p>.localhost <p>.localhost` y, solo si sale con 0, escribe `config/dynamic/<p>.tls.yml` con la forma de la decisión 4.

## Dónde se prueba

- Validación del nombre y uso: `node --test "scripts/*.test.mjs"`, unitario; casos `Dev Tools`, `../x`, `demo-`, 64 caracteres, `a\nb`, `..` y sin argumento, comprobando texto, código 1 y que no se escribe nada en el directorio temporal; y un nombre de 63 caracteres aceptado (con un `mkcert` falso).
- Contenido del registro: `node --test "scripts/*.test.mjs"`, unitario; el YAML generado para `demo` comparado con el esperado.
- Sin mkcert: `node --test "scripts/*.test.mjs"`, lanzando el script con `process.execPath` y `PATH`/`Path` apuntando a un directorio vacío; texto, código 1 y ningún fichero escrito.
- mkcert falla: `node --test "scripts/*.test.mjs"`, con un `mkcert` falso en el `PATH` del test que sale con 1; texto, código 1 y sin `.tls.yml`.
- Llamada desde otro directorio, SAN y certificado servido: ejecución real. Desde el directorio padre, `node traefik-proxy/scripts/add-project-cert.mjs devtools`; después, el SAN leído con `crypto.X509Certificate` de Node sobre `certs/devtools.localhost.pem`; con el proxy levantado y sin reiniciarlo, una conexión `tls.connect` de Node a `127.0.0.1:443` con `servername: smtp.devtools.localhost` y `ca` = `rootCA.pem` de `mkcert -CAROOT`, que debe salir `authorized: true` (sin desactivar la verificación). El certificado sale por SNI aunque no haya router para ese host.
- Ficheros fuera de git: ejecución real, `git check-ignore` sobre los tres ficheros generados y `git status --porcelain` sin cambios tras ejecutar el script.
- Regresión, clon nuevo sin registros: ejecución real, `docker compose up -d --wait` sin ningún `*.tls.yml`, el `curl` de la suite `smoke` responde 200 y `docker compose logs` no contiene `level=error` ni `ERR`.

## Términos y ADR

- Términos resueltos: registro de certificado — el fichero `config/dynamic/<proyecto>.tls.yml` que dice a Traefik qué certificado sirve para un proyecto; se evita «tls.yml».
- ADR candidatas: ninguna

## Delta de comportamiento

### Capacidad: `project-certificate`

#### ADDED — Generar y registrar el certificado de un proyecto

- GIVEN mkcert instalado y su CA local instalada con `mkcert -install` (requisito previo)
- WHEN se ejecuta `node traefik-proxy/scripts/add-project-cert.mjs devtools` desde el directorio padre del repo
- THEN existen `traefik-proxy/certs/devtools.localhost.pem` y `traefik-proxy/certs/devtools.localhost-key.pem`, y el SAN del certificado lista `*.devtools.localhost` y `devtools.localhost`
- AND `traefik-proxy/config/dynamic/devtools.tls.yml` registra `certFile: /certs/devtools.localhost.pem` y `keyFile: /certs/devtools.localhost-key.pem`
- AND no se crea ningún fichero en el directorio desde el que se llamó
- AND sale `certificado de *.devtools.localhost registrado en config/dynamic/devtools.tls.yml` con código 0

#### ADDED — Renovar el certificado de un proyecto

- GIVEN `demo` ya registrado, o con solo `certs/demo.localhost.pem` presente
- WHEN se vuelve a ejecutar `node scripts/add-project-cert.mjs demo`
- THEN existen sus tres ficheros, el número de serie del certificado es distinto del anterior y no aparece ningún fichero más

#### ADDED — Rechazar un nombre de proyecto inválido

- GIVEN cualquier estado
- WHEN se ejecuta con `Dev Tools`, `../x`, `..`, `a\nb`, `demo-` o un nombre de 64 caracteres
- THEN sale `nombre de proyecto inválido: <nombre> (usa minúsculas, números y guiones)` con código 1
- AND sin argumento sale `uso: node scripts/add-project-cert.mjs <proyecto>` con código 1
- AND no se escribe ningún fichero

#### ADDED — Sin mkcert

- GIVEN mkcert no está en el `PATH`
- WHEN se ejecuta `node scripts/add-project-cert.mjs demo`
- THEN sale `mkcert no está instalado: https://github.com/FiloSottile/mkcert` con código 1 y no se escribe ningún fichero

#### ADDED — mkcert falla

- GIVEN mkcert sale con un código distinto de 0
- WHEN se ejecuta `node scripts/add-project-cert.mjs demo`
- THEN sale `mkcert falló: <su salida de error>` con código 1
- AND no se escribe `config/dynamic/demo.tls.yml`

#### ADDED — Traefik sirve el certificado del proyecto

- GIVEN el proxy levantado, `devtools` registrado con el script y el proxy reiniciado con `docker compose restart` (sin reiniciar, el provider File no recoge el registro nuevo en Docker Desktop)
- WHEN se abre una conexión TLS a `127.0.0.1:443` con SNI `smtp.devtools.localhost`, verificando contra `rootCA.pem` de mkcert
- THEN la conexión sale verificada (`authorized: true`) y el certificado presentado es el de `*.devtools.localhost`

#### Reglas de la capacidad — project-certificate

- **Dónde viven los datos**: certificados en `certs/` y su registro en `config/dynamic/<proyecto>.tls.yml`, ambos fuera de git (constitution, Reglas de producto: certificados en `certs/`, configuración dinámica en `config/dynamic/*.yml`).
- **Idioma de los nombres**: ficheros e identificadores en inglés; mensajes del script en castellano.
- **Límites**: nombre de proyecto `^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$`.
- **Avisos**: los del script: falta de argumento, nombre inválido, falta de mkcert y fallo de mkcert, cada uno con su texto y código 1; y los de Traefik según la constitution: un registro cuyo certificado falta → error en el log y certificado autofirmado por defecto (aviso del navegador).
- **Regla ante conflicto**: la de la constitution: cada proyecto es dueño exclusivo de `*.<proyecto>.localhost` y de su certificado. Volver a ejecutar el script para un proyecto sobrescribe solo los suyos; dos repos con el mismo nombre no se detectan, y el último sobrescribe al anterior.

## Enmiendas

- 2026-11-25 — Scope: «Node 18+» del contenido mínimo de `README.md` pasa a «Node 22+» — contradicción interna con la decisión 16 y las restricciones del plan, hallada por el eje Spec de la revisión final — pasada de fix — sin aprobar (alinea el Scope con una decisión ya aprobada)
- 2026-11-25 — GIVEN de «Traefik sirve el certificado del proyecto»: queda la rama «tras `docker compose restart`» — aplica el resultado de la medición prevista en la decisión 18 (Task 2: tras 20 s sin reiniciar seguía el autofirmado; tras reiniciar, `authorized: true`) y quita la referencia a la decisión que rechaza `capability merge` — medido en la Task 2, escrito en el cierre (borrador de capacidades) — sin aprobar (aplica una rama ya aprobada de la spec)

## Aprobaciones

| Nombre | Fecha | Estado |
| --- | --- | --- |
| Àngel Delgado | 2026-11-25 | aprobada (opción «Apruebo») |
