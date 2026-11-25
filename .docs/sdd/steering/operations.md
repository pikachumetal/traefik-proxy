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
  - `smoke` · `docker compose up -d --wait` y después `curl -fsS http://127.0.0.1:8080/api/overview` · pendiente · integración
- **Lo afectado**: no aplica; las suites corren enteras
- **Gate de cierre**: `docker compose up -d --wait` (con el healthcheck del roadmap, verifica también que Traefik responde; hasta entonces, el `curl` de `smoke` a mano)
- **Gate de merge**: `docker compose config --quiet`
- **Sin filtro**: `compose.yaml`, `config/dynamic/**`, `.env.example`, `scripts/**`
- **Lint**: ninguno
- **CI de la base**: ninguna
- **Acceso a la aplicación**: dashboard en `http://localhost:8080`, sin login; API en `http://127.0.0.1:8080/api/`
- **Motor de producción**: no aplica
- **Temporales**: `config` · no declarado; `scripts` · `.temp/tests/` (los borra al acabar); `smoke` · no declarado
- **Camino crítico**: ninguno
