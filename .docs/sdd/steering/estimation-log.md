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

**Factor de calibración** (ratio mediano real/estimado, 7 artefactos): **2.92** · media 3.17

- p25–p75: 1.58–4.89
- p80: 5.4 — para comprometer una fecha, multiplica la estimación por el p80: así cubre 4 de cada 5 artefactos.
- Dentro de ±25 %: 14 % · sobreestimadas: 14 % · infraestimadas: 71 %
- Error absoluto (h): media 0.56 · mediana 0.6
- Tendencia: n insuficiente (hacen falta 20)

| Tramo del ratio | n | % |
| --- | --- | --- |
| <0.5 | 0 | 0 % |
| 0.5–0.8 | 1 | 14 % |
| 0.8–1.25 | 1 | 14 % |
| 1.25–2 | 0 | 0 % |
| ≥2 | 5 | 71 % |

| Tipo | n | Mediana | p25–p75 |
| --- | --- | --- | --- |
| infra/tooling | 2 | 1.34 | — |
| patch | 5 | 4.05 | 2.92–5.73 |

> Con menos de 10 tareas con ratio la calibración es orientativa. Ver `estimation.md`.

## Tiempos por fase

| Fase | n | Agente (h) | Ejecución (h) | Espera (h) | Gate (h) | % del trabajo | Ceremonia | Est (h) | Real (h) | Ratio |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| apertura | 7 | 0.94 | 0.3 | 13.91 | 0 | 22 % | sí | 1.5 | 1.24 | 0.24 |
| implementación | 7 | 0.19 | 0.16 | 0 | 0.06 | 6 % | no | 1.75 | 0.35 | 0.06 |
| cierre | 7 | 2.65 | 1.3 | 3.5 | 0.24 | 71 % | sí | 0.45 | 3.95 | 2.83 |

Ceremonia: — (0 tareas, 7 fuera por una fase sin eventos).
