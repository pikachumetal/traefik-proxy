<!-- AUTO-GENERADO por sdd estimation log (sdd-kit) — no editar a mano. Regenerar: sdd estimation log --root <proyecto> -->
# Estimation log (estimado vs real)

| Fecha | Id | Tipo | Est (h) | Real (h) | Ratio | Hilo (tokens) | Subagentes (tokens) | Sujetos ($) | Sesión ($) | Carpeta |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-11-25 | 0001 | patch | 0.25 | 0.25 | 1 | — | — | no aplica | — | 20261125-161323-patch-0001-align-compose-constitution |
| 2026-11-25 | 0002 | infra/tooling | 1.25 | 0.65 | 0.52 | 31055k | 2437k | no aplica | 12.8 | 20261125-163335-feature-0002-localhost-domains |
| 2026-11-25 | 0003 | patch | 0.25 | 0.73 | 2.92 | — | — | no aplica | — | 20261125-170745-patch-0003-proxy-healthcheck |
| 2026-11-25 | 0004 | patch | 0.2 | 0.81 | 4.05 | — | — | no aplica | — | 20261125-171707-patch-0004-wire-log-level |
| 2026-11-25 | 0005 | patch | 0.15 | 0.86 | 5.73 | — | — | no aplica | — | 20261125-172505-patch-0005-explicit-dashboard-entrypoint |
| 2026-11-25 | 0006 | infra/tooling | 0.5 | 1.08 | 2.16 | 20259k | 1162k | no aplica | 6.94 | 20261125-173406-feature-0006-dashboard-domain |
| 2026-11-25 | 0007 | patch | 0.2 | 1.16 | 5.8 | — | — | no aplica | — | 20261125-175510-patch-0007-pin-traefik-dependabot |
| 2026-11-25 | 0008 | patch | 0.25 | 1.23 | 4.92 | — | — | no aplica | — | 20261125-180244-patch-0008-container-limits |
| 2026-11-25 | 0009 | infra/tooling | 0.5 | 1.5 | 3 | 22005k | 1240k | no aplica | 7.65 | 20261125-181454-feature-0009-docker-socket-proxy |

**Factor de calibración** (ratio mediano real/estimado, 9 artefactos): **3** · media 3.34

- p25–p75: 2.16–4.92
- p80: 5.25 — para comprometer una fecha, multiplica la estimación por el p80: así cubre 4 de cada 5 artefactos.
- Dentro de ±25 %: 11 % · sobreestimadas: 11 % · infraestimadas: 78 %
- Error absoluto (h): media 0.66 · mediana 0.61
- Tendencia: n insuficiente (hacen falta 20)

| Tramo del ratio | n | % |
| --- | --- | --- |
| <0.5 | 0 | 0 % |
| 0.5–0.8 | 1 | 11 % |
| 0.8–1.25 | 1 | 11 % |
| 1.25–2 | 0 | 0 % |
| ≥2 | 7 | 78 % |

| Tipo | n | Mediana | p25–p75 |
| --- | --- | --- | --- |
| infra/tooling | 3 | 2.16 | — |
| patch | 6 | 4.48 | 3.2–5.53 |

> Con menos de 10 tareas con ratio la calibración es orientativa. Ver `estimation.md`.

## Tiempos por fase

| Fase | n | Agente (h) | Ejecución (h) | Espera (h) | Gate (h) | % del trabajo | Ceremonia | Est (h) | Real (h) | Ratio |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| apertura | 9 | 1.21 | 0.39 | 17.88 | 0 | 19 % | sí | 2 | 1.6 | 0.27 |
| implementación | 9 | 0.25 | 0.2 | 0 | 0.08 | 5 % | no | 2.25 | 0.45 | 0.07 |
| cierre | 9 | 4.12 | 2.1 | 5.33 | 0.41 | 75 % | sí | 0.65 | 6.23 | 3.92 |

Ceremonia: — (0 tareas, 9 fuera por una fase sin eventos).
