# Traefik Proxy

Proxy inverso centralizado para todos los proyectos de desarrollo local.

## Descripción

Este Traefik actúa como punto de entrada único para todos los proyectos de desarrollo, evitando conflictos de puertos y centralizando los certificados TLS. Cada proyecto se sirve en `https://<servicio>.<proyecto>.localhost`: los dominios `*.localhost` resuelven a tu máquina sin tocar el fichero `hosts`.

## Requisitos

- Docker Desktop (o Docker con Compose)
- [mkcert](https://github.com/FiloSottile/mkcert), con su CA instalada una vez: `mkcert -install`
- Node 22 o superior (para el script de certificados)

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/pikachumetal/traefik-proxy.git
   cd traefik-proxy
   ```

2. Copia el archivo de configuración:

   ```bash
   cp .env.example .env
   ```

   `LOG_LEVEL` (DEBUG, INFO, WARN, ERROR) fija el nivel de log de Traefik; aplícalo con `docker compose up -d`.

3. Arranca el proxy:

   ```bash
   docker compose up -d
   ```

## Uso

```bash
docker compose up -d       # iniciar
docker compose down        # detener
docker compose logs -f     # ver logs
docker compose restart     # reiniciar (necesario tras registrar o renovar un certificado)
```

Dashboard: [http://localhost:8080](http://localhost:8080). Los puertos 80, 443 y 8080 solo escuchan en `127.0.0.1`.

## Conectar un proyecto

1. **Genera y registra su certificado** desde el repo del proyecto (con `traefik-proxy` como repo hermano):

   ```bash
   node ../traefik-proxy/scripts/add-project-cert.mjs <proyecto>
   docker compose -f ../traefik-proxy/compose.yaml restart
   ```

   El script crea `certs/<proyecto>.localhost.pem` y `certs/<proyecto>.localhost-key.pem` para `*.<proyecto>.localhost`, y los registra en `config/dynamic/<proyecto>.tls.yml`. Nada de eso entra en git. Traefik no recoge el registro nuevo hasta reiniciarlo.

   El nombre del proyecto admite minúsculas, números y guiones (sin guion al principio ni al final, hasta 63 caracteres).

2. **Declara la red externa** en su `compose.yaml`:

   ```yaml
   networks:
     traefik-public:
       external: true
   ```

3. **Conecta cada servicio** con labels de Traefik. El router y el service llevan el prefijo del proyecto (`<proyecto>-<servicio>`) y el servicio no publica su puerto HTTP en el host:

   ```yaml
   services:
     mi-servicio:
       networks:
         - traefik-public
       labels:
         - "traefik.enable=true"
         - "traefik.docker.network=traefik-public"
         - "traefik.http.routers.miproyecto-mi-servicio.rule=Host(`mi-servicio.miproyecto.localhost`)"
         - "traefik.http.routers.miproyecto-mi-servicio.entrypoints=websecure"
         - "traefik.http.routers.miproyecto-mi-servicio.tls=true"
         - "traefik.http.services.miproyecto-mi-servicio.loadbalancer.server.port=8080"
   ```

Entre contenedores, los servicios se llaman por su nombre en la red `traefik-public` (`http://mi-servicio:8080`), no por su dominio `*.localhost`: dentro de un contenedor, `localhost` es el propio contenedor.

### Renovar un certificado

Vuelve a ejecutar el script con el mismo proyecto cuando caduque el certificado o cambie la CA de mkcert, y reinicia el proxy.

### Retirar un proyecto

Borra sus tres ficheros y reinicia el proxy:

- `certs/<proyecto>.localhost.pem`
- `certs/<proyecto>.localhost-key.pem`
- `config/dynamic/<proyecto>.tls.yml`

## Puertos

| Puerto | Descripción             |
| ------ | ----------------------- |
| 80     | HTTP (redirige a HTTPS) |
| 443    | HTTPS                   |
| 8080   | Dashboard               |

## Estructura

```text
traefik-proxy/
├── compose.yaml
├── scripts/
│   └── add-project-cert.mjs      # genera y registra el certificado de un proyecto
├── config/
│   └── dynamic/                  # registros <proyecto>.tls.yml (ignorados por git)
├── certs/                        # certificados mkcert (ignorados por git)
├── .env.example
└── .gitignore
```

## Proyectos conectados

| Proyecto  | Dominios               | Certificado               |
| --------- | ---------------------- | ------------------------- |
| dev-tools | `*.devtools.localhost` | `devtools.localhost.pem`  |

## Licencia

MIT License - ver archivo [LICENSE](LICENSE)
