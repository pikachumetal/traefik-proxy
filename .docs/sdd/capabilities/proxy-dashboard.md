# Capacidad — proxy-dashboard

## Propósito

acceso al dashboard y al API de Traefik

## Requisitos

### Dashboard por su dominio

- GIVEN el contenedor recreado con `docker compose up -d` y el certificado de `traefik` registrado con `node scripts/add-project-cert.mjs traefik` antes de recrearlo (o después, con `docker compose restart`)
- WHEN se abre `https://dashboard.traefik.localhost/dashboard/`
- THEN responde 200 con el dashboard de Traefik y un certificado verificable contra la CA de mkcert
- AND `https://dashboard.traefik.localhost/api/overview` responde 200

### Sin el certificado de traefik

- GIVEN el proxy reiniciado sin `config/dynamic/traefik.tls.yml`
- WHEN se abre `https://dashboard.traefik.localhost/dashboard/`
- THEN el certificado presentado no es verificable contra la CA de mkcert (Traefik sirve su certificado por defecto)
- AND sin verificar el certificado, `/dashboard/` responde 200: el router existe y solo falta el certificado

### El puerto 8080 no se publica

- GIVEN el contenedor recreado con `docker compose up -d` y nada más escuchando en `127.0.0.1:8080`
- WHEN se conecta a `http://127.0.0.1:8080/`
- THEN la conexión se rechaza

## Reglas de la capacidad

- **Dónde viven los datos**: el router en `config/dynamic/dashboard.yml` (en git); el certificado de `*.traefik.localhost` en `certs/` y su registro en `config/dynamic/traefik.tls.yml` (fuera de git: se regenera en cada máquina con el script).
- **Idioma de los nombres**: router `traefik-dashboard`, en inglés.
- **Límites**: los puertos 80 y 443 del host son del proxy; 8080 solo existe dentro del contenedor.
- **Avisos**: sin el certificado de `traefik`, el navegador avisa (certificado por defecto de Traefik); un router mal escrito solo se ve en `docker compose logs`.
- **Regla ante conflicto**: la de la constitution: el nombre de proyecto `traefik` es del propio proxy.
