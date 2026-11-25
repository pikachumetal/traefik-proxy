# Changelog — traefik-proxy

Formato: [Keep a Changelog 1.1.0](https://keepachangelog.com/). Changelog técnico del proyecto, backward-looking: `roadmap.md` es el forward-looking.

## [Unreleased]

## [1.0.0] - 2026-11-25

smoke: 2026-11-25 · 0 hallazgos (suites `config`, `scripts` 16/16 y gate `Healthy` sobre `develop`; validación del dev-lead en cada cambio; 0 corregidos en la release)

### Added

- **0003** — Healthcheck del proxy con `traefik healthcheck --ping`: `docker ps` marca `unhealthy` y `docker compose up -d --wait` espera a que Traefik responda. → [ref](.docs/sdd/changes/20261125-170745-patch-0003-proxy-healthcheck/)

### Changed

- **0002** — **Incompatible:** dominios `*.<proyecto>.localhost` en lugar de `.local`, sin tocar `hosts`; `scripts/add-project-cert.mjs` genera y registra el certificado de cada proyecto, y desaparecen `config/dynamic/tls.yml` y `generate-certs.sh`. → [ref](.docs/sdd/changes/20261125-163335-feature-0002-localhost-domains/)
- **0005** — El entrypoint `traefik` (`:8080`) queda declarado en `command:` y se pasa al healthcheck, en vez de depender de su valor por defecto. → [ref](.docs/sdd/changes/20261125-172505-patch-0005-explicit-dashboard-entrypoint/)
- **0006** — **Incompatible:** el dashboard pasa a `https://dashboard.traefik.localhost` con un router propio; `localhost:8080` y `api.insecure` desaparecen. → [ref](.docs/sdd/changes/20261125-173406-feature-0006-dashboard-domain/)
- **0007** — Imagen fijada en `traefik:v3.8.0` y Dependabot semanal sobre las imágenes de `compose.yaml`, con PRs a `develop`. → [ref](.docs/sdd/changes/20261125-175510-patch-0007-pin-traefik-dependabot/)

### Fixed

- **0004** — `LOG_LEVEL` de `.env` llega a Traefik (`--log.level=${LOG_LEVEL:-INFO}`); antes el nivel estaba fijo. → [ref](.docs/sdd/changes/20261125-171707-patch-0004-wire-log-level/)

### Security

- **0001** — Los puertos del proxy solo escuchan en `127.0.0.1` y la imagen deja `latest` por `traefik:v3`. → [ref](.docs/sdd/changes/20261125-161323-patch-0001-align-compose-constitution/)
- **0008** — Límites de 256 MiB y 1 CPU, y contenedor endurecido: `read_only`, `no-new-privileges` y solo la capability `NET_BIND_SERVICE`. → [ref](.docs/sdd/changes/20261125-180244-patch-0008-container-limits/)
- **0009** — **Incompatible en Linux nativo (`DOCKER_GID` obligatorio en `.env`):** Traefik deja de montar `docker.sock` y llega a Docker por `socket-proxy`, que solo deja pasar lecturas. → [ref](.docs/sdd/changes/20261125-181454-feature-0009-docker-socket-proxy/)
