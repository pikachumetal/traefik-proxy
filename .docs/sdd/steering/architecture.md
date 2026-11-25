# Architecture — traefik-proxy

## Estructura

```text
traefik-proxy/
├── compose.yaml            # servicio traefik (flags de configuración estática), puertos y red traefik-public
├── scripts/
│   └── add-project-cert.mjs  # genera con mkcert y registra el certificado de un proyecto
├── config/
│   └── dynamic/            # dashboard.yml (router del dashboard) y registros <proyecto>.tls.yml (fuera de git)
├── certs/                  # certificados y claves mkcert (fuera de git)
├── .env.example            # variables de entorno de ejemplo (LOG_LEVEL)
├── PRODUCT.md · ROADMAP.md · CHANGELOG.md · CLAUDE.md
└── .docs/sdd/              # documentación SDD
```

## Piezas y responsabilidades

| Pieza | Responsabilidad | Depende de |
| --- | --- | --- |
| `compose.yaml` › `traefik` | Proxy: entrypoints `web` (:80, redirige a `websecure`) y `websecure` (:443); `traefik` (:8080) solo dentro del contenedor, para `/ping`; dashboard y API por `https://dashboard.traefik.localhost` (capacidad `proxy-dashboard`) | imagen `traefik`, `docker.sock` (solo lectura), `config/dynamic/`, `certs/` |
| `compose.yaml` › red `traefik-public` | Red compartida a la que se unen los proyectos conectados | Docker |
| Provider Docker | Descubre los contenedores de `traefik-public` con `traefik.enable=true` y crea sus routers desde las labels | `docker.sock`, labels de cada proyecto conectado |
| Provider File | Carga la configuración dinámica de `config/dynamic/*.yml`: los registros de certificados y el router `traefik-dashboard` de `dashboard.yml` | `config/dynamic/` |
| `scripts/add-project-cert.mjs` | Genera el certificado de un proyecto y escribe su registro; comportamiento en la capacidad `project-certificate` | mkcert, Node |
| `config/dynamic/<proyecto>.tls.yml` | Registro del par certificado/clave que Traefik sirve por SNI para un proyecto; Traefik lo recoge al reiniciar | `certs/<proyecto>.localhost*.pem`, montaje `./certs:/certs` de `compose.yaml` (rutas `/certs/...` del contenedor) |
| `certs/` | Certificados wildcard `*.<proyecto>.localhost` generados por el script | CA local de mkcert |

## Flujo principal

1. El navegador pide `https://<servicio>.<proyecto>.localhost`; el sistema lo resuelve a loopback.
2. Traefik lo recibe en `websecure` (:443); si llega por `web` (:80), lo redirige a HTTPS.
3. Traefik elige el certificado por SNI entre los registros de `config/dynamic/`.
4. El router casa el `Host` (el del provider Docker, desde las labels del proyecto conectado; para `dashboard.traefik.localhost`, el del provider File hacia `api@internal`) y reenvía al contenedor por `traefik-public`, al puerto de `loadbalancer.server.port`, o al dashboard interno.

## Dónde va lo nuevo

- Proyecto conectado nuevo → sus labels en su propio `compose.yaml`; aquí, solo su certificado con `node scripts/add-project-cert.mjs <proyecto>`.
- Middleware o configuración dinámica compartida → un fichero en `config/dynamic/` que no acabe en `.tls.yml`: ese sufijo es exclusivo de los registros del script y está fuera de git.
- Opción de arranque de Traefik → un flag más en `command:` de `compose.yaml`.

## Decisiones estructurales

- 2026-11-25 — Sufijo oficial `*.<proyecto>.localhost` en lugar de `.local` — RFC 6761: resuelve a loopback sin tocar `hosts`; `.local` depende de mDNS y falla en Windows — sdd-init
- 2026-11-25 — Imagen `traefik:v3` en lugar de `latest` — un salto de major rompe las labels de todos los proyectos conectados — sdd-init
- 2026-11-25 — Puertos ligados a `127.0.0.1` — dashboard sin autenticación y servicios de desarrollo no expuestos a la red — sdd-init
- 2026-11-25 — Registro de certificados por proyecto (`config/dynamic/<proyecto>.tls.yml`, fuera de git) en lugar de un `tls.yml` compartido; Traefik lo recoge con `docker compose restart`: en Docker Desktop el bind mount no propaga los eventos de ficheros nuevos al provider File; `--providers.file.watch=true` se mantiene por si el host sí propaga los eventos (no medido fuera de Docker Desktop) — feature 0002
- 2026-11-25 — Dashboard por un router en `config/dynamic/dashboard.yml` hacia `api@internal` (`https://dashboard.traefik.localhost`) en lugar de `api.insecure` en `:8080`; `:8080` deja de publicarse y queda dentro del contenedor solo para `/ping` — feature 0006
- 2026-11-25 — Imagen con versión exacta (`traefik:v3.8.0`) en lugar del tag `v3`, con Dependabot (`.github/dependabot.yml`, `docker-compose`, semanal, PRs a `develop`) — cada cambio de versión queda en git y llega como PR revisable — patch 0007
