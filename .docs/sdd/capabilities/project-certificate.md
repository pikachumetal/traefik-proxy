# Capacidad — project-certificate

## Propósito

generar y registrar el certificado wildcard de un proyecto conectado con un solo comando

## Requisitos

### Generar y registrar el certificado de un proyecto

- GIVEN mkcert instalado y su CA local instalada con `mkcert -install` (requisito previo)
- WHEN se ejecuta `node traefik-proxy/scripts/add-project-cert.mjs devtools` desde el directorio padre del repo
- THEN existen `traefik-proxy/certs/devtools.localhost.pem` y `traefik-proxy/certs/devtools.localhost-key.pem`, y el SAN del certificado lista `*.devtools.localhost` y `devtools.localhost`
- AND `traefik-proxy/config/dynamic/devtools.tls.yml` registra `certFile: /certs/devtools.localhost.pem` y `keyFile: /certs/devtools.localhost-key.pem`
- AND no se crea ningún fichero en el directorio desde el que se llamó
- AND sale `certificado de *.devtools.localhost registrado en config/dynamic/devtools.tls.yml` con código 0

### Renovar el certificado de un proyecto

- GIVEN `demo` ya registrado, o con solo `certs/demo.localhost.pem` presente
- WHEN se vuelve a ejecutar `node scripts/add-project-cert.mjs demo`
- THEN existen sus tres ficheros, el número de serie del certificado es distinto del anterior y no aparece ningún fichero más

### Rechazar un nombre de proyecto inválido

- GIVEN cualquier estado
- WHEN se ejecuta con `Dev Tools`, `../x`, `..`, `a\nb`, `demo-` o un nombre de 64 caracteres
- THEN sale `nombre de proyecto inválido: <nombre> (usa minúsculas, números y guiones)` con código 1
- AND sin argumento sale `uso: node scripts/add-project-cert.mjs <proyecto>` con código 1
- AND no se escribe ningún fichero

### Sin mkcert

- GIVEN mkcert no está en el `PATH`
- WHEN se ejecuta `node scripts/add-project-cert.mjs demo`
- THEN sale `mkcert no está instalado: https://github.com/FiloSottile/mkcert` con código 1 y no se escribe ningún fichero

### mkcert falla

- GIVEN mkcert sale con un código distinto de 0
- WHEN se ejecuta `node scripts/add-project-cert.mjs demo`
- THEN sale `mkcert falló: <su salida de error>` con código 1
- AND no se escribe `config/dynamic/demo.tls.yml`

### Traefik sirve el certificado del proyecto

- GIVEN el proxy levantado, `devtools` registrado con el script y el proxy reiniciado con `docker compose restart` (sin reiniciar, el provider File no recoge el registro nuevo en Docker Desktop)
- WHEN se abre una conexión TLS a `127.0.0.1:443` con SNI `smtp.devtools.localhost`, verificando contra `rootCA.pem` de mkcert
- THEN la conexión sale verificada (`authorized: true`) y el certificado presentado es el de `*.devtools.localhost`

## Reglas de la capacidad

- **Dónde viven los datos**: certificados en `certs/` y su registro en `config/dynamic/<proyecto>.tls.yml`, ambos fuera de git (constitution, Reglas de producto: certificados en `certs/`, configuración dinámica en `config/dynamic/*.yml`).
- **Idioma de los nombres**: ficheros e identificadores en inglés; mensajes del script en castellano.
- **Límites**: nombre de proyecto `^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$`.
- **Avisos**: los del script: falta de argumento, nombre inválido, falta de mkcert y fallo de mkcert, cada uno con su texto y código 1; y los de Traefik según la constitution: un registro cuyo certificado falta → error en el log y certificado autofirmado por defecto (aviso del navegador).
- **Regla ante conflicto**: la de la constitution: cada proyecto es dueño exclusivo de `*.<proyecto>.localhost` y de su certificado. Volver a ejecutar el script para un proyecto sobrescribe solo los suyos; dos repos con el mismo nombre no se detectan, y el último sobrescribe al anterior.
