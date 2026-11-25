# Constitution — traefik-proxy

## Principios

1. Solo para desarrollo local: nada se diseña pensando en producción ni en máquinas compartidas.
2. Un único punto de entrada: todo el HTTP/HTTPS de los proyectos conectados pasa por este proxy.
3. Cada proyecto conectado es dueño de sus rutas (labels en su propio `compose.yaml`), de su dominio de proyecto y de su certificado.
4. No romper por sorpresa a los proyectos conectados: un cambio aquí afecta a todos.

## Artículos

### Art. I — Claves y certificados fuera de git

`certs/*.pem`, `*.key` y `*.crt` nunca se commitean; `.gitignore` los excluye y no se toca esa exclusión.

*Por qué*: son claves privadas firmadas por la CA local de mkcert del usuario.

### Art. II — Socket de Docker tras un proxy de solo lectura

`/var/run/docker.sock` solo lo monta el servicio `socket-proxy`, en solo lectura y sin root; Traefik llega a Docker por él, que solo deja pasar lecturas de la lista de contenedores, de cada contenedor, de eventos y de versión.

*Por qué*: el montaje `:ro` no limita el API de Docker: quien llega al socket puede crear contenedores privilegiados; el proxy del socket filtra las peticiones.

### Art. III — Escucha solo en loopback

Los puertos del proxy se publican ligados a `127.0.0.1` (`"127.0.0.1:443:443"`), nunca a todas las interfaces.

*Por qué*: el dashboard no tiene autenticación y los servicios de desarrollo no deben verse desde la red local.

### Art. IV — Versiones exactas de las imágenes

Las imágenes de `compose.yaml` llevan versión exacta (`X.Y.Z` o `vX.Y.Z`, según la publique cada imagen); nunca `latest` ni un tag flotante. Las versiones nuevas llegan como PR de Dependabot a `develop`; un PR de major no se fusiona tal cual: es el aviso para abrir su feature.

*Por qué*: cada cambio de versión queda en git y se revisa; un salto de major cambia la sintaxis de las labels y deja sin rutas a todos los proyectos conectados.

### Art. V — Los proyectos conectados no publican puertos HTTP en el host

Sus servicios HTTP entran solo por el proxy; puertos no HTTP (bases de datos, TCP) quedan fuera de esta regla.

*Por qué*: publicar puertos HTTP en el host trae de vuelta los conflictos que el proxy elimina.

## Convenciones

- **Idioma**: identificadores, nombres de fichero, servicios, redes, routers y services en inglés y kebab-case; documentación y comentarios de los YAML en castellano.
- **Ramas**: git-flow: `main` estable (releases), `develop` de integración, `feature/<id>-<slug>` y `patch/<id>-<slug>` desde `develop`.
- **Commits**: tipo y scope en inglés; título y cuerpo en castellano, términos técnicos en inglés (`fix(tls): registrar certificado de devtools`).
- **Proyecto de referencia**: no aplica

## Reglas de producto

- **Dónde viven los datos**: configuración estática en los flags `command:` de `compose.yaml`; configuración dinámica en `config/dynamic/*.yml` (vigilada en caliente); rutas de los proyectos conectados en las labels de su `compose.yaml`, nunca en este repo; el router del dashboard del propio proxy, en `config/dynamic/dashboard.yml`; certificados en `certs/` (fuera de git, generados con mkcert); variables en `.env` (fuera de git) con `.env.example` versionado.
- **Idioma de los nombres**: inglés; routers y services de las labels con prefijo de proyecto: `<proyecto>-<servicio>`.
- **Límites**: los puertos 80 y 443 del host son del proxy; una sola instancia por máquina (`container_name: traefik-proxy`, red `traefik-public`); de los proyectos conectados, solo se publica lo que lleva `traefik.enable=true`.
- **Avisos**: los de Traefik: certificado ausente o inválido → log y certificado autofirmado por defecto (aviso del navegador); router mal configurado → en rojo en el dashboard y en `docker compose logs`; puerto ocupado → falla `docker compose up`.
- **Regla ante conflicto**: cada proyecto conectado es dueño exclusivo de `*.<proyecto>.localhost` y de su certificado; si dos proyectos reclaman el mismo host, manda el dueño del sufijo y lo del otro es un bug a corregir; el nombre de proyecto `traefik` (`*.traefik.localhost`) es del propio proxy.
