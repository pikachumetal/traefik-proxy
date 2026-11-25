# Architecture — traefik-proxy

## Estructura

```text
traefik-proxy/
├── compose.yaml            # servicio traefik (flags de configuración estática), puertos y red traefik-public
├── scripts/
│   └── add-project-cert.mjs  # genera con mkcert y registra el certificado de un proyecto
├── config/
│   └── dynamic/            # registros <proyecto>.tls.yml, uno por proyecto (provider File; fuera de git)
├── certs/                  # certificados y claves mkcert (fuera de git)
├── .env.example            # variables de entorno de ejemplo (hoy sin uso en compose.yaml)
├── PRODUCT.md · ROADMAP.md · CHANGELOG.md · CLAUDE.md
└── .docs/sdd/              # documentación SDD
```

## Piezas y responsabilidades

| Pieza | Responsabilidad | Depende de |
| --- | --- | --- |
| `compose.yaml` › `traefik` | Proxy: entrypoints `web` (:80, redirige a `websecure`) y `websecure` (:443), dashboard y API en :8080 | imagen `traefik`, `docker.sock` (solo lectura), `config/dynamic/`, `certs/` |
| `compose.yaml` › red `traefik-public` | Red compartida a la que se unen los proyectos conectados | Docker |
| Provider Docker | Descubre los contenedores de `traefik-public` con `traefik.enable=true` y crea sus routers desde las labels | `docker.sock`, labels de cada proyecto conectado |
| Provider File | Carga la configuración dinámica de `config/dynamic/*.yml` | `config/dynamic/` |
| `scripts/add-project-cert.mjs` | Genera el certificado de un proyecto y escribe su registro; comportamiento en la capacidad `project-certificate` | mkcert, Node |
| `config/dynamic/<proyecto>.tls.yml` | Registro del par certificado/clave que Traefik sirve por SNI para un proyecto; Traefik lo recoge al reiniciar | `certs/<proyecto>.localhost*.pem` |
| `certs/` | Certificados wildcard `*.<proyecto>.localhost` generados por el script | CA local de mkcert |

## Flujo principal

1. El navegador pide `https://<servicio>.<proyecto>.localhost`; el sistema lo resuelve a loopback.
2. Traefik lo recibe en `websecure` (:443); si llega por `web` (:80), lo redirige a HTTPS.
3. Traefik elige el certificado por SNI entre los registros de `config/dynamic/`.
4. El router que creó el provider Docker desde las labels del proyecto conectado casa el `Host` y reenvía al contenedor por `traefik-public`, al puerto de `loadbalancer.server.port`.

## Dónde va lo nuevo

- Proyecto conectado nuevo → sus labels en su propio `compose.yaml`; aquí, solo su certificado con `node scripts/add-project-cert.mjs <proyecto>`.
- Middleware o configuración dinámica compartida → un fichero en `config/dynamic/`.
- Opción de arranque de Traefik → un flag más en `command:` de `compose.yaml`.

## Decisiones estructurales

- 2026-11-25 — Sufijo oficial `*.<proyecto>.localhost` en lugar de `.local` — RFC 6761: resuelve a loopback sin tocar `hosts`; `.local` depende de mDNS y falla en Windows — sdd-init
- 2026-11-25 — Imagen `traefik:v3` en lugar de `latest` — un salto de major rompe las labels de todos los proyectos conectados — sdd-init
- 2026-11-25 — Puertos ligados a `127.0.0.1` — dashboard sin autenticación y servicios de desarrollo no expuestos a la red — sdd-init
