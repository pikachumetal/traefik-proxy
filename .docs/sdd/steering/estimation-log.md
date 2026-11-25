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

**Factor de calibración** (ratio mediano real/estimado, 8 artefactos): **3.49** · media 3.39

- p25–p75: 1.87–5.12
- p80: 5.41 — para comprometer una fecha, multiplica la estimación por el p80: así cubre 4 de cada 5 artefactos.
- Dentro de ±25 %: 13 % · sobreestimadas: 13 % · infraestimadas: 75 %
- Error absoluto (h): media 0.62 · mediana 0.61
- Tendencia: n insuficiente (hacen falta 20)

| Tramo del ratio | n | % |
| --- | --- | --- |
| <0.5 | 0 | 0 % |
| 0.5–0.8 | 1 | 13 % |
| 0.8–1.25 | 1 | 13 % |
| 1.25–2 | 0 | 0 % |
| ≥2 | 6 | 75 % |

| Tipo | n | Mediana | p25–p75 |
| --- | --- | --- | --- |
| infra/tooling | 2 | 1.34 | — |
| patch | 6 | 4.48 | 3.2–5.53 |

> Con menos de 10 tareas con ratio la calibración es orientativa. Ver `estimation.md`.

## Tiempos por fase

| Fase | n | Agente (h) | Ejecución (h) | Espera (h) | Gate (h) | % del trabajo | Ceremonia | Est (h) | Real (h) | Ratio |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| apertura | 8 | 1.08 | 0.35 | 15.89 | 0 | 21 % | sí | 1.5 | 1.42 | 0.24 |
| implementación | 8 | 0.22 | 0.18 | 0 | 0.07 | 6 % | no | 1.75 | 0.4 | 0.06 |
| cierre | 8 | 3.31 | 1.65 | 4.37 | 0.31 | 73 % | sí | 0.45 | 4.96 | 2.83 |

Ceremonia: — (0 tareas, 8 fuera por una fase sin eventos).
