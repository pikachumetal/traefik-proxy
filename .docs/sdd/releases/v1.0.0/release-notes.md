---
release: v1.0.0
title: Traefik Proxy v1.0.0 — Tus proyectos locales por HTTPS, sin tocar hosts
created: 2026-11-25
---

# Traefik Proxy v1.0.0 — Tus proyectos locales por HTTPS, sin tocar hosts

*25 de noviembre de 2026*

## Resumen

Cada proyecto de desarrollo se abre ahora en `https://<servicio>.<proyecto>.localhost`, con candado y sin editar el fichero `hosts`. Conectar un proyecto nuevo es un solo comando. El proxy es además más seguro: solo se ve desde tu máquina y ya no tiene acceso libre a Docker.

## Novedades

- **Para quien conecta un proyecto**: `node ../traefik-proxy/scripts/add-project-cert.mjs <proyecto>` crea y registra su certificado; con reiniciar el proxy, el proyecto responde por HTTPS. Ya no hace falta gestionar certificados a mano ni scripts por proyecto.
- **Para quien usa el navegador**: los dominios `*.localhost` funcionan sin configurar nada en el sistema.
- **Para quien revisa el proxy**: el panel de Traefik está en `https://dashboard.traefik.localhost`, con candado.
- **Para quien depura**: `LOG_LEVEL=DEBUG` en `.env` sube el detalle del log sin tocar la configuración.
- **Para la estabilidad**: Docker sabe si el proxy está sano y lo marca si deja de responder; la versión de Traefik queda fija y cada actualización llega como propuesta revisable.
- **Para la seguridad**: el proxy solo escucha en tu máquina, corre con permisos mínimos y solo puede consultar Docker, no darle órdenes.

## Problemas conocidos

- Cambiar de versión obliga a ajustar los proyectos ya conectados: sus dominios pasan de `.local` a `.localhost` y deben registrar su certificado con el script nuevo.
- El panel deja de estar en `http://localhost:8080`.
- En Linux nativo hay que indicar en `.env` el grupo de Docker (`DOCKER_GID`); sin él, el proxy no arranca. En Docker Desktop no hace falta.
- Tras registrar un certificado hay que reiniciar el proxy (`docker compose restart`) para que lo use.

## Fuera de alcance de esta entrega

- Autenticación del panel: solo se accede desde tu máquina.
- Plugins de Traefik y uso fuera de desarrollo local.

## Próximos pasos

- Por nuestra parte: comprobar que el aviso semanal de versiones nuevas de las imágenes funciona una vez publicada la versión.
- Por vuestra parte: migrar cada proyecto conectado a `.localhost` (dominios en sus labels, certificado con el script) y, en Linux nativo, añadir `DOCKER_GID` a `.env`.
