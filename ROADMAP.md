# Roadmap — traefik-proxy

## Now

Perfil de control: delegate

| Id | Externo | Tarea | Estado | Tras | Tamaño |
| --- | --- | --- | --- | --- | --- |
| 0001 | — | **Alinear compose.yaml con la constitution**<br>*Puertos ligados a 127.0.0.1 e imagen traefik:v3*<details><summary>Brief</summary>**Carril:** patch<br>**Requisitos:** `.docs/sdd/steering/constitution.md` Art. III y Art. IV<br>**Decisiones ya tomadas:** `"127.0.0.1:<p>:<p>"` en 80, 443 y 8080; `traefik:v3`<br>**Salda:** nada<br>**Toca:** `compose.yaml`</details> | ✅ | — | S |
| 0002 | — | **Migrar a dominios .localhost**<br>*Sufijo oficial `*.<proyecto>.localhost` en certificados, tls.yml y documentación*<details><summary>Brief</summary>**Carril:** feature<br>**Requisitos:** `.docs/sdd/steering/architecture.md` § Decisiones estructurales; `PRODUCT.md` § Terminology<br>**Decisiones ya tomadas:** `*.<proyecto>.localhost`; sin `hosts` ni scripts `setup-hosts`; los servicios que se llaman entre sí usan el nombre del servicio en `traefik-public`, no el dominio del proxy; las labels y scripts de dev-tools y ALC Stronghold se cambian en sus repos, no aquí<br>**Salda:** nada<br>**Toca:** `config/dynamic/tls.yml`, `README.md`, `certs/` (regenerar con mkcert)</details> | ✅ | 0001 | M |

## Next

| Id | Externo | Tarea | Estado | Tras | Tamaño |
| --- | --- | --- | --- | --- | --- |
| 0003 | — | **Healthcheck del proxy**<br>*`docker ps` marca unhealthy si Traefik no responde, y el gate de cierre lo verifica solo*<details><summary>Brief</summary>**Carril:** patch<br>**Requisitos:** `.docs/sdd/steering/operations.md` § Testing (Gate de cierre)<br>**Decisiones ya tomadas:** `--ping=true` y `healthcheck:` con `traefik healthcheck --ping`<br>**Salda:** nada<br>**Toca:** `compose.yaml`, `.docs/sdd/steering/operations.md`</details> | ⏳ | 0001 | S |
| 0004 | — | **.env sin efecto**<br>*LOG_LEVEL de .env.example no llega a Traefik: cablearlo o quitar .env*<details><summary>Brief</summary>**Carril:** patch<br>**Requisitos:** `.docs/sdd/steering/constitution.md` § Reglas de producto (Dónde viven los datos)<br>**Decisiones ya tomadas:** ninguna (cablear `--log.level=${LOG_LEVEL:-INFO}` o borrar `.env.example`, se decide al proponerlo)<br>**Salda:** nada<br>**Toca:** `compose.yaml`, `.env.example`, `README.md`</details> | ⏳ | 0002, 0003 | S |

## Later

| Id | Externo | Tarea | Estado | Tras | Tamaño |
| --- | --- | --- | --- | --- | --- |
