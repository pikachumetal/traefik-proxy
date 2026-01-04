# CLAUDE.md

Informacion del proyecto para Claude Code.

## Descripcion

Traefik Proxy centralizado para todos los proyectos de desarrollo local. Actua como unico punto de entrada HTTP/HTTPS evitando conflictos de puertos entre proyectos.

## Arquitectura

### Red Docker

- **traefik-public**: Red externa compartida por todos los proyectos
  - Nombre fijo: `traefik-public`
  - Los proyectos la declaran como `external: true`

### Puertos

- 80: HTTP
- 443: HTTPS (con certificados TLS)
- 8080: Dashboard de Traefik

### Providers

- **Docker**: Autodescubrimiento de servicios via labels
- **File**: Configuracion dinamica desde `config/dynamic/`

## Archivos importantes

| Archivo | Proposito |
|---------|-----------|
| `compose.yaml` | Definicion del servicio Traefik |
| `config/dynamic/tls.yml` | Configuracion de certificados TLS |
| `certs/` | Carpeta de certificados (ignorada por git) |

## Proyectos conectados

- **dev-tools**: SonarQube, smtp4dev
- **ALC Stronghold Platform**: Directus CMS

## Comandos utiles

```bash
# Iniciar
docker compose up -d

# Ver logs
docker compose logs -f

# Reiniciar
docker compose restart

# Ver estado
docker ps | grep traefik
```

## Configuracion de otros proyectos

Para conectar un proyecto a este Traefik:

```yaml
# En docker-compose.yml del proyecto

networks:
  traefik-public:
    external: true

services:
  mi-servicio:
    networks:
      - traefik-public
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.xxx.rule=Host(`xxx.localhost`)"
      - "traefik.http.services.xxx.loadbalancer.server.port=PUERTO"
```

## Certificados TLS disponibles

- `alcstronghold.local.pem` - Wildcard para *.alcstronghold.local
