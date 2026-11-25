---
id: 20261125-173406-feature-0006-dashboard-domain
feature: 0006
title: Walkthrough — Dashboard en dashboard.traefik.localhost
spec: ./spec.md
plan: ./plan.md
status: done
created: 2026-11-25
---

# Walkthrough — Dashboard en dashboard.traefik.localhost

## 1. Cambios realizados

- Router `traefik-dashboard` en `config/dynamic/dashboard.yml` hacia `api@internal`; `compose.yaml` sin `--api.insecure=true` ni el puerto 8080 publicado, con el entrypoint `traefik` interno para `/ping`; certificado `*.traefik.localhost` generado con el script — `2ed9790`.
- Documentación: `README.md` (certificado de `traefik` en la instalación, URL, puertos, nombre reservado, estructura), `constitution.md` (Reglas de producto: Dónde viven los datos, Límites, Regla ante conflicto), `architecture.md`, `operations.md`, `PRODUCT.md` — `f0bb492`.
- Capacidad nueva `proxy-dashboard` fusionada desde el delta; pasada de fix de la revisión final (tabla del README, comentarios de `compose.yaml` en castellano, enmienda de la spec) — juntada en el cierre.

## 2. Tiempo y coste: estimado vs real

- Tipo: infra/tooling
- Estimación de implementación (del plan): 0,5h
- Esfuerzo real: 1,08 h — reloj de la sesión 3,79 h desde 2026-11-25T14:03Z, sin 163 min de espera al dev-lead (70 esperas)
- Desviación: +0,58h (+116 %)
- Causa de la desviación: el reloj de la sesión cuenta desde la init (14:03Z) y suma el trabajo activo de la init y de los patches 0001, 0003, 0004 y 0005 de esta misma sesión, que la herramienta no separa por rama; la feature en sí (spec, dos rondas de review, dos tasks y revisión final) ocupó ~35 min entre 17:33Z y la validación.
- Compactación: no
- Modelo del hilo: Opus 5.5, effort no registrado
- Tokens del hilo: 20.258.721 — claude-opus-5-5 20.258.721
- Tokens de subagentes: 1.162.045 en 4 despachos — Final review 0006 — Code axis claude-sonnet-5-5 191.772 / 1 min; Review spec 0006 claude-sonnet-5-5 260.322 / 1 min; Final review 0006 — Spec axis claude-opus-5-5 445.016 / 1 min; Segunda ronda review spec 0006 claude-sonnet-5-5 264.935 / 1 min
- Coste de la sesión: 6,94 $ (hilo 5,47 $ + subagentes 1,46 $)
- Coste de sujetos: no aplica
- Review de spec: 1 revisor y segunda ronda · hallazgos 20, aceptados 20

## 3. Desviaciones del plan

- _Ninguna_ en el código; la pasada de fix tocó también los comentarios en inglés de `compose.yaml` que la task no había cambiado.

### Decisiones tomadas sin el dev-lead

- Sin worktree: checkout principal sobre la rama de la feature — un fallo previo se atribuiría a la feature.
- La coincidencia de `architecture.md:49` en el `git grep` es el registro de la decisión, no una referencia viva — ninguno.
- `architecture.md` › `.env.example` pasa de «hoy sin uso» a «(LOG_LEVEL)» — ninguno.
- El hallazgo de `CLAUDE.md` con `:8080` se rechaza: el `CLAUDE.md` actual no lo menciona — ninguno.

## 4. Verificación

### 4.1 Builds

- Gate: `docker compose config --quiet` · `docker compose up -d --wait` → config: exit 0 · gate: `Healthy` · sobre el commit de cierre

### 4.2 Smoke / tests

Verificado por el agente (2026-11-25), `https.get` a `127.0.0.1:443` con `servername`/`Host` `dashboard.traefik.localhost` y la CA de mkcert:

| THEN | Evidencia | Resultado |
| --- | --- | --- |
| Dashboard por su dominio | ejecución real | `/dashboard/` 200 `authorized=true`; `/` → 302 `/dashboard/` |
| AND `/api/overview` | ejecución real | 200 |
| Sin el certificado de `traefik` | ejecución real | `DEPTH_ZERO_SELF_SIGNED_CERT`; sin verificar, `/dashboard/` 200 |
| El puerto 8080 no se publica | ejecución real | sin listeners en 8080; `ECONNREFUSED` |
| Regresión: redirección HTTP | ejecución real | `:80` → 301 `https://dashboard.traefik.localhost/dashboard/` |
| Regresión: healthcheck | ejecución real | `healthy`, `OK: http://:8080/ping` |
| Ficheros fuera de git | ejecución real | `git check-ignore config/dynamic/traefik.tls.yml certs/traefik.localhost.pem` |

Revisión final: Spec opus+high Yes · Código sonnet+high Yes, sobre f0bb492; pasada de fix (docs y comentarios) revisada en el hilo.

Validado: 2026-11-25 · «validado» · no detalló qué probó

### 4.3 Residuales / deuda generada

- El `CHANGELOG.md` de la próxima release marca como incompatible la retirada de `localhost:8080` (decisión 10 de la spec).

## 5. Aprendizajes

- `api@internal` redirige `/` a `/dashboard/` (301 en `:8080`, 302 por el router) → `README.md` enlaza la raíz.

Retro: sin señales

## 6. Adendas
