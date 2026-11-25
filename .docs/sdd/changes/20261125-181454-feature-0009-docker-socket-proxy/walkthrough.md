---
id: 20261125-181454-feature-0009-docker-socket-proxy
feature: 0009
title: Walkthrough — Proxy del socket de Docker
spec: ./spec.md
plan: ./plan.md
status: done
created: 2026-11-25
---

# Walkthrough — Proxy del socket de Docker

## 1. Cambios realizados

- Servicio `socket-proxy` (`wollomatic/socket-proxy:1.14.0`) con `docker.sock` en solo lectura, sin root y con allowlist de lecturas; red interna `traefik-socket-proxy` (`10.231.0.0/29`); Traefik por `tcp://socket-proxy:2375` sin montar el socket; `DOCKER_GID` en `.env.example` — `ee729e8`.
- Constitution (Art. II tras un proxy de solo lectura, Art. IV para todas las imágenes), `architecture.md` y `README.md` — `c9a6c27`.
- Pasada de fix de la revisión final (docs) — juntada en el cierre.

## 2. Tiempo y coste: estimado vs real

- Tipo: infra/tooling
- Estimación de implementación (del plan): 0,5h
- Esfuerzo real: 1,50 h — reloj de la sesión 4,45 h desde 2026-11-25T14:03Z, sin 177 min de espera al dev-lead (85 esperas)
- Desviación: +1,0h (+200 %)
- Causa de la desviación: el reloj de la sesión cuenta desde la init (14:03Z) y suma el trabajo activo de la init, los patches 0001, 0003, 0004, 0005, 0007 y 0008 y las features 0002 y 0006 de esta misma sesión; la herramienta no separa por rama. La feature en sí ocupó ~45 min entre 18:14Z y la validación.
- Compactación: no
- Modelo del hilo: Opus 5.5, effort no registrado
- Tokens del hilo: 22.004.964 — claude-opus-5-5 22.004.964
- Tokens de subagentes: 1.239.660 en 6 despachos — Review spec 0009 claude-sonnet-5-5 176.429 / 1 min; Leer README de wollomatic socket-proxy claude-haiku-5-5 51.428 / 0 min; Segunda ronda review spec 0009 claude-sonnet-5-5 116.190 / 1 min; Final review 0009 — Code axis claude-sonnet-5-5 189.734 / 1 min; Final review 0009 — Architecture axis claude-opus-5-5 264.222 / 1 min; Final review 0009 — Spec axis claude-opus-5-5 441.657 / 2 min
- Coste de la sesión: 7,65 $ (hilo 5,77 $ + subagentes 1,88 $)
- Coste de sujetos: no aplica
- Review de spec: 1 revisor y segunda ronda · hallazgos 20, aceptados 20

## 3. Desviaciones del plan

- `'-loglevel=info'` en el proxy, que el plan no listaba: está en el ejemplo del README de la imagen.
- El «flujo» de `architecture.md` no cambia: describe el camino de una petición HTTP, no el descubrimiento.

### Decisiones tomadas sin el dev-lead

- Sin worktree: checkout principal sobre la rama de la feature — un fallo previo se atribuiría a la feature.
- Allowlist sin ampliar: Traefik 3.8 no pidió rutas fuera de ella — una ruta que pida en otro escenario recibiría 403 y saldría en el log.
- `'-loglevel=info'` se queda — ninguno.
- Subred escrita en `ipam` y en `-allowfrom`, sin variable — 403 si se cambia solo una (el README avisa).
- «Flujo» de `architecture.md` sin cambios — ninguno.

## 4. Verificación

### 4.1 Builds

- Gate: `docker compose config --quiet` · `docker compose up -d --wait` → config: exit 0 · gate: `traefik-proxy` y `traefik-socket-proxy` `Healthy` · sobre el commit de cierre

### 4.2 Smoke / tests

Verificado por el agente (2026-11-25):

| Comprobación | Evidencia | Resultado |
| --- | --- | --- |
| Arranque en frío (`down` + `up -d --wait`) | ejecución real | los dos `healthy` en 40 s, sin añadir `127.0.0.1/32` a `-allowfrom` |
| Descubrimiento dinámico | ejecución real | `probe-test@docker` aparece al arrancar el contenedor de prueba y desaparece al pararlo |
| Traefik recreado con otra IP | ejecución real | `ip-holder` en `10.231.0.3`; Traefik pasa a `10.231.0.4`; `probe-test@docker` aparece; 0 bloqueos |
| Escritura bloqueada | ejecución real | desde Traefik: `GET /v1.47/containers/json` 200 · `POST /v1.47/containers/create` 405 («method not allowed») · `GET /v1.47/containers/<id>/logs` 403 («path not allowed») |
| Aislamiento | ejecución real | desde `traefik-public`: `socket-proxy` no resuelve; `10.231.0.2:2375` timeout |
| Montajes | ejecución real | Traefik sin `docker.sock`; proxy con `docker.sock` `rw=false`; red `internal=true` |
| Logs | ejecución real | Traefik 0 errores; proxy solo con los bloqueos provocados |
| Regresión | ejecución real | dashboard 200 |

Revisión final: Spec opus+high With fixes · Código sonnet+high Yes · Arquitectura opus+high Yes, sobre c9a6c27; pasada de fix (docs y la prueba de IP) revisada en el hilo.

Validado: 2026-11-25 · «validado» · no detalló qué probó

### 4.3 Residuales / deuda generada

- En Linux nativo, `DOCKER_GID` pasa a ser obligatorio en `.env`: el `CHANGELOG.md` de la release lo avisa (principio 4).
- No medido fuera de Docker Desktop.

## 5. Aprendizajes

- `wollomatic/socket-proxy` responde 405 a un método no permitido y 403 a una ruta no permitida, y lo registra como `blocked request` con su motivo → `README.md` (diagnóstico) y `architecture.md` («Dónde va lo nuevo»).
- `-allowfrom` por nombre de servicio se resuelve al arrancar; una subred fija de una red interna no depende del orden de arranque ni de la IP → `architecture.md` (decisión estructural).

Retro: sin señales

## 6. Adendas
