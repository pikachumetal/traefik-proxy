# Operations — traefik-proxy

## Comandos

- **Build**: no aplica (imagen oficial, sin build propio)
- **Arrancar**: `docker compose up -d`
- **Parar**: `docker compose down`
- **Logs**: `docker compose logs -f`

## Testing

> Tests automáticos solo del script de certificados; el resto, suites de comprobación y un smoke manual en la validación.

- **Suites**:
  - `config` · `docker compose config --quiet` · pendiente · unitario
  - `scripts` · `node --test "scripts/*.test.mjs"` · ~0,6 s · unitario · Node 22 o superior
- **Lo afectado**: no aplica; las suites corren enteras
- **Gate de cierre**: `docker compose up -d --wait` · ~17 s · integración (espera al healthcheck `traefik healthcheck --ping`: verifica que Traefik responde)
- **Gate de merge**: `docker compose config --quiet`
- **Sin filtro**: `compose.yaml`, `config/dynamic/**`, `.env.example`, `scripts/**`
- **Lint**: ninguno
- **CI de la base**: ninguna
- **Acceso a la aplicación**: dashboard en `https://dashboard.traefik.localhost/`, sin login; API en `https://dashboard.traefik.localhost/api/` (requiere el certificado de `traefik`: `node scripts/add-project-cert.mjs traefik`)
- **Motor de producción**: no aplica
- **Temporales**: `config` · no declarado; `scripts` · `.temp/tests/` (los borra al acabar); gate · no declarado
- **Camino crítico**: ninguno
