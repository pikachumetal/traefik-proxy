# Traefik Proxy

Proxy inverso centralizado para todos los proyectos de desarrollo local.

## Descripcion

Este Traefik actua como punto de entrada unico para todos los proyectos de desarrollo, evitando conflictos de puertos y centralizando la gestion de certificados TLS.

## Requisitos

- Docker Desktop
- Docker Compose
- [mkcert](https://github.com/FiloSottile/mkcert) (para generar certificados TLS)

## Instalacion

1. Clona el repositorio:

   ```bash
   git clone https://github.com/pikachumetal/traefik-proxy.git
   cd traefik-proxy
   ```

2. Copia el archivo de configuracion:

   **Bash:**
   ```bash
   cp .env.example .env
   ```

   **PowerShell:**
   ```powershell
   Copy-Item .env.example .env
   ```

3. Genera los certificados TLS (ver seccion "Certificados TLS")

4. Configura el archivo hosts (ver seccion "Configuracion de Hosts")

## Uso

### Iniciar Traefik

```bash
docker compose up -d
```

### Detener Traefik

```bash
docker compose down
```

### Ver logs

```bash
docker compose logs -f
```

## Dashboard

Accede al dashboard de Traefik en: http://localhost:8080

## Certificados TLS

Este proxy centraliza los certificados TLS para todos los proyectos. Los certificados se generan con [mkcert](https://github.com/FiloSottile/mkcert).

### Instalar mkcert

**Windows (Chocolatey):**
```powershell
choco install mkcert
mkcert -install
```

**macOS (Homebrew):**
```bash
brew install mkcert
mkcert -install
```

**Linux:**
```bash
# Ver instrucciones en https://github.com/FiloSottile/mkcert
```

### Generar certificados manualmente

```bash
cd certs

# Para *.devtools.local (dev-tools)
mkcert -cert-file devtools.local.pem -key-file devtools.local-key.pem "*.devtools.local" devtools.local

# Para *.alcstronghold.local (ALC Platform)
mkcert -cert-file alcstronghold.local.pem -key-file alcstronghold.local-key.pem "*.alcstronghold.local" alcstronghold.local
```

### Usar scripts de los proyectos

Cada proyecto tiene un script para generar sus certificados:

**dev-tools:**
```powershell
# PowerShell
.\scripts\generate-certs.ps1

# Bash
./scripts/generate-certs.sh
```

**ALC Stronghold Platform:**
```powershell
# PowerShell
.\scripts\generate-certs.ps1

# Bash
./scripts/generate-certs.sh
```

### Registrar certificados

Los certificados se registran en `config/dynamic/tls.yml`:

```yaml
tls:
  certificates:
    - certFile: /certs/devtools.local.pem
      keyFile: /certs/devtools.local-key.pem
    - certFile: /certs/alcstronghold.local.pem
      keyFile: /certs/alcstronghold.local-key.pem
```

## Configuracion de Hosts

Los dominios `.local` requieren configuracion en el archivo hosts del sistema.

### Usar script (recomendado)

**Windows (PowerShell como Administrador):**
```powershell
.\scripts\setup-hosts.ps1
```

**Linux/macOS:**
```bash
sudo ./scripts/setup-hosts.sh
```

### Para eliminar las entradas

**Windows:**
```powershell
.\scripts\setup-hosts.ps1 -Remove
```

**Linux/macOS:**
```bash
sudo ./scripts/setup-hosts.sh --remove
```

### Configuracion manual

Edita el archivo hosts:
- **Windows:** `C:\Windows\System32\drivers\etc\hosts`
- **Linux/macOS:** `/etc/hosts`

Añade las siguientes lineas:

```
# Local Development Domains (traefik-proxy)
127.0.0.1	devtools.local
127.0.0.1	sonarqube.devtools.local
127.0.0.1	smtp.devtools.local
127.0.0.1	alcstronghold.local
127.0.0.1	backend.alcstronghold.local
```

## Conectar otros proyectos

Para que otros proyectos usen este Traefik:

1. **Declarar la red externa** en su `compose.yaml`:
   ```yaml
   networks:
     traefik-public:
       external: true
   ```

2. **Conectar servicios a la red** con labels de Traefik:
   ```yaml
   services:
     mi-servicio:
       networks:
         - traefik-public
       labels:
         - "traefik.enable=true"
         - "traefik.docker.network=traefik-public"
         - "traefik.http.routers.mi-servicio.rule=Host(`mi-servicio.devtools.local`)"
         - "traefik.http.routers.mi-servicio.entrypoints=websecure"
         - "traefik.http.routers.mi-servicio.tls=true"
         - "traefik.http.services.mi-servicio.loadbalancer.server.port=8080"
   ```

## Puertos

| Puerto | Descripcion |
|--------|-------------|
| 80     | HTTP        |
| 443    | HTTPS       |
| 8080   | Dashboard   |

## Estructura

```
traefik-proxy/
├── compose.yaml
├── config/
│   └── dynamic/
│       └── tls.yml              # Configuracion de certificados
├── certs/                       # Certificados TLS (ignorados por git)
│   ├── devtools.local.pem
│   ├── devtools.local-key.pem
│   ├── alcstronghold.local.pem
│   └── alcstronghold.local-key.pem
├── scripts/
│   ├── setup-hosts.ps1          # Configurar hosts (Windows)
│   └── setup-hosts.sh           # Configurar hosts (Linux/macOS)
├── .env.example
└── .gitignore
```

## Proyectos conectados

| Proyecto | Dominios | Certificado |
|----------|----------|-------------|
| dev-tools | `*.devtools.local` | `devtools.local.pem` |
| ALC Stronghold | `*.alcstronghold.local` | `alcstronghold.local.pem` |

## Licencia

MIT License - ver archivo [LICENSE](LICENSE)
