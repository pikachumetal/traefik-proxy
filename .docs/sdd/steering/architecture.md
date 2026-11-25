# Architecture — traefik-proxy

## Estructura

```text
traefik-proxy/
├── compose.yaml            # servicio traefik (flags de configuración estática), puertos y red traefik-public
├── config/
│   └── dynamic/
│       └── tls.yml         # registro de certificados por proyecto (provider File, vigilado en caliente)
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
| `config/dynamic/tls.yml` | Lista los pares certificado/clave que Traefik sirve por SNI | `certs/*.pem` |
| `certs/` | Certificados wildcard por dominio de proyecto, generados con mkcert por cada proyecto | CA local de mkcert |

## Flujo principal

1. El navegador pide `https://<servicio>.<proyecto>.localhost`; el sistema lo resuelve a loopback.
2. Traefik lo recibe en `websecure` (:443); si llega por `web` (:80), lo redirige a HTTPS.
3. Traefik elige el certificado por SNI entre los de `tls.yml`.
4. El router que creó el provider Docker desde las labels del proyecto conectado casa el `Host` y reenvía al contenedor por `traefik-public`, al puerto de `loadbalancer.server.port`.

## Dónde va lo nuevo

- Proyecto conectado nuevo → sus labels en su propio `compose.yaml`; aquí, solo su par certificado/clave en `config/dynamic/tls.yml`.
- Middleware o configuración dinámica compartida → un fichero en `config/dynamic/`.
- Opción de arranque de Traefik → un flag más en `command:` de `compose.yaml`.

## Decisiones estructurales

- 2026-11-25 — Sufijo oficial `*.<proyecto>.localhost` en lugar de `.local` — RFC 6761: resuelve a loopback sin tocar `hosts`; `.local` depende de mDNS y falla en Windows — sdd-init
- 2026-11-25 — Imagen `traefik:v3` en lugar de `latest` — un salto de major rompe las labels de todos los proyectos conectados — sdd-init
- 2026-11-25 — Puertos ligados a `127.0.0.1` — dashboard sin autenticación y servicios de desarrollo no expuestos a la red — sdd-init
