# Traefik Proxy

## Users

- **Desarrollador (único usuario)**: levanta el proxy en su máquina y conecta sus proyectos de desarrollo local para acceder a ellos por HTTPS con un dominio propio, sin pelearse por los puertos.

## Product Purpose

Punto de entrada HTTP/HTTPS único para todos los proyectos de desarrollo local. Evita los conflictos de puertos entre proyectos y centraliza los certificados TLS. Funciona si cada proyecto conectado responde en `https://<servicio>.<proyecto>.localhost` con un certificado válido y sin publicar puertos propios en el host.

## Capabilities and Constraints

- **Es**: un Traefik en Docker Compose que crea la red compartida `traefik-public`, enruta los contenedores que llevan labels de Traefik, sirve los certificados wildcard de mkcert de cada proyecto, redirige HTTP a HTTPS y expone el dashboard en `:8080`.
- **No es**: un proxy para producción ni para máquinas compartidas. Solo sirve para el desarrollo local en la máquina del usuario.

## Terminology

**Proyecto conectado**:
Un repo cuyo `compose.yaml` declara `traefik-public` como red externa y publica sus servicios a través del proxy.
_Evitar_: cliente, app externa

**Dominio de proyecto**:
El sufijo `<proyecto>.localhost` que pertenece en exclusiva a un proyecto conectado. Sus servicios cuelgan de él como `<servicio>.<proyecto>.localhost`.
_Evitar_: `.local`, dominio `.localhost` sin el proyecto

**Red compartida**:
La red Docker `traefik-public`, que crea este proxy y a la que se unen los proyectos conectados.
_Evitar_: red pública, red de Traefik
