# CLAUDE.md

Traefik centralizado para el desarrollo local: punto de entrada HTTP/HTTPS único para los proyectos conectados.

## Documentos

- Producto, usuarios y glosario: `PRODUCT.md`
- Reglas no negociables y reglas de producto: `.docs/sdd/steering/constitution.md`
- Comandos y cómo se prueba: `.docs/sdd/steering/operations.md`
- Estructura, piezas y dónde va lo nuevo: `.docs/sdd/steering/architecture.md`
- Trabajo pendiente: `ROADMAP.md` · Historial: `CHANGELOG.md`
- Cómo conectar un proyecto (labels, red, certificados): `README.md`

## Reglas críticas

- Nunca commitear `certs/*.pem`, `*.key` ni `*.crt`.
- Un cambio aquí afecta a todos los proyectos conectados: antes de cerrar, `docker compose config --quiet` y `docker compose up -d --wait`.
- Las rutas de cada proyecto viven en las labels de su propio `compose.yaml`; aquí solo se registra su certificado en `config/dynamic/tls.yml`.
- Sin gestor de tickets: el trabajo vive en `ROADMAP.md`. Sin worktrees: se trabaja en ramas sobre el checkout principal.
