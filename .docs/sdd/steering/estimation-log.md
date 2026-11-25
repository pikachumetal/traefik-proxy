<!-- AUTO-GENERADO por sdd estimation log (sdd-kit) — no editar a mano. Regenerar: sdd estimation log --root <proyecto> -->
# Estimation log (estimado vs real)

| Fecha | Id | Tipo | Est (h) | Real (h) | Ratio | Hilo (tokens) | Subagentes (tokens) | Sujetos ($) | Sesión ($) | Carpeta |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-11-25 | 0001 | patch | 0.25 | 0.25 | 1 | — | — | no aplica | — | 20261125-161323-patch-0001-align-compose-constitution |
| 2026-11-25 | 0002 | infra/tooling | 1.25 | 0.65 | 0.52 | 31055k | 2437k | no aplica | 12.8 | 20261125-163335-feature-0002-localhost-domains |
| 2026-11-25 | 0003 | patch | 0.25 | 0.73 | 2.92 | — | — | no aplica | — | 20261125-170745-patch-0003-proxy-healthcheck |

**Factor de calibración** (ratio mediano real/estimado, 3 artefactos): **1** · media 1.48

- n insuficiente (hacen falta 5)
- Tendencia: n insuficiente (hacen falta 20)

| Tipo | n | Mediana | p25–p75 |
| --- | --- | --- | --- |
| infra/tooling | 1 | 0.52 | — |
| patch | 2 | 1.96 | — |

> Con menos de 10 tareas con ratio la calibración es orientativa. Ver `estimation.md`.

## Tiempos por fase

| Fase | n | Agente (h) | Ejecución (h) | Espera (h) | Gate (h) | % del trabajo | Ceremonia | Est (h) | Real (h) | Ratio |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| apertura | 3 | 0.4 | 0.13 | 5.96 | 0 | 33 % | sí | 1 | 0.53 | 0.18 |
| implementación | 3 | 0.08 | 0.07 | 0 | 0.03 | 9 % | no | 1.25 | 0.15 | 0.04 |
| cierre | 3 | 0.67 | 0.28 | 0.91 | 0.04 | 58 % | sí | 0.25 | 0.95 | 1.7 |

Ceremonia: — (0 tareas, 3 fuera por una fase sin eventos).
