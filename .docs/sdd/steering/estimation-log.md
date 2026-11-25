<!-- AUTO-GENERADO por sdd estimation log (sdd-kit) — no editar a mano. Regenerar: sdd estimation log --root <proyecto> -->
# Estimation log (estimado vs real)

| Fecha | Id | Tipo | Est (h) | Real (h) | Ratio | Hilo (tokens) | Subagentes (tokens) | Sujetos ($) | Sesión ($) | Carpeta |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-11-25 | 0001 | patch | 0.25 | 0.25 | 1 | — | — | no aplica | — | 20261125-161323-patch-0001-align-compose-constitution |
| 2026-11-25 | 0002 | infra/tooling | 1.25 | 0.65 | 0.52 | 31055k | 2437k | no aplica | 12.8 | 20261125-163335-feature-0002-localhost-domains |
| 2026-11-25 | 0003 | patch | 0.25 | 0.73 | 2.92 | — | — | no aplica | — | 20261125-170745-patch-0003-proxy-healthcheck |
| 2026-11-25 | 0004 | patch | 0.2 | 0.81 | 4.05 | — | — | no aplica | — | 20261125-171707-patch-0004-wire-log-level |

**Factor de calibración** (ratio mediano real/estimado, 4 artefactos): **1.96** · media 2.12

- n insuficiente (hacen falta 5)
- Tendencia: n insuficiente (hacen falta 20)

| Tipo | n | Mediana | p25–p75 |
| --- | --- | --- | --- |
| infra/tooling | 1 | 0.52 | — |
| patch | 3 | 2.92 | — |

> Con menos de 10 tareas con ratio la calibración es orientativa. Ver `estimation.md`.

## Tiempos por fase

| Fase | n | Agente (h) | Ejecución (h) | Espera (h) | Gate (h) | % del trabajo | Ceremonia | Est (h) | Real (h) | Ratio |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| apertura | 4 | 0.54 | 0.17 | 7.95 | 0 | 29 % | sí | 1 | 0.71 | 0.18 |
| implementación | 4 | 0.11 | 0.09 | 0 | 0.04 | 8 % | no | 1.25 | 0.2 | 0.04 |
| cierre | 4 | 1.05 | 0.48 | 1.42 | 0.08 | 63 % | sí | 0.25 | 1.54 | 1.7 |

Ceremonia: — (0 tareas, 4 fuera por una fase sin eventos).
