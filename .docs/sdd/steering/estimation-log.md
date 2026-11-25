<!-- AUTO-GENERADO por sdd estimation log (sdd-kit) — no editar a mano. Regenerar: sdd estimation log --root <proyecto> -->
# Estimation log (estimado vs real)

| Fecha | Id | Tipo | Est (h) | Real (h) | Ratio | Hilo (tokens) | Subagentes (tokens) | Sujetos ($) | Sesión ($) | Carpeta |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-11-25 | 0001 | patch | 0.25 | 0.25 | 1 | — | — | no aplica | — | 20261125-161323-patch-0001-align-compose-constitution |
| 2026-11-25 | 0002 | infra/tooling | 1.25 | 0.65 | 0.52 | 31055k | 2437k | no aplica | 12.8 | 20261125-163335-feature-0002-localhost-domains |
| 2026-11-25 | 0003 | patch | 0.25 | 0.73 | 2.92 | — | — | no aplica | — | 20261125-170745-patch-0003-proxy-healthcheck |
| 2026-11-25 | 0004 | patch | 0.2 | 0.81 | 4.05 | — | — | no aplica | — | 20261125-171707-patch-0004-wire-log-level |
| 2026-11-25 | 0005 | patch | 0.15 | 0.86 | 5.73 | — | — | no aplica | — | 20261125-172505-patch-0005-explicit-dashboard-entrypoint |

**Factor de calibración** (ratio mediano real/estimado, 5 artefactos): **2.92** · media 2.84

- p25–p75: 1–4.05
- p80: 4.39 — para comprometer una fecha, multiplica la estimación por el p80: así cubre 4 de cada 5 artefactos.
- Dentro de ±25 %: 20 % · sobreestimadas: 20 % · infraestimadas: 60 %
- Error absoluto (h): media 0.48 · mediana 0.6
- Tendencia: n insuficiente (hacen falta 20)

| Tramo del ratio | n | % |
| --- | --- | --- |
| <0.5 | 0 | 0 % |
| 0.5–0.8 | 1 | 20 % |
| 0.8–1.25 | 1 | 20 % |
| 1.25–2 | 0 | 0 % |
| ≥2 | 3 | 60 % |

| Tipo | n | Mediana | p25–p75 |
| --- | --- | --- | --- |
| infra/tooling | 1 | 0.52 | — |
| patch | 4 | 3.49 | — |

> Con menos de 10 tareas con ratio la calibración es orientativa. Ver `estimation.md`.

## Tiempos por fase

| Fase | n | Agente (h) | Ejecución (h) | Espera (h) | Gate (h) | % del trabajo | Ceremonia | Est (h) | Real (h) | Ratio |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| apertura | 5 | 0.67 | 0.22 | 9.93 | 0 | 27 % | sí | 1 | 0.89 | 0.18 |
| implementación | 5 | 0.14 | 0.11 | 0 | 0.05 | 8 % | no | 1.25 | 0.25 | 0.04 |
| cierre | 5 | 1.46 | 0.71 | 2 | 0.13 | 66 % | sí | 0.25 | 2.17 | 1.7 |

Ceremonia: — (0 tareas, 5 fuera por una fase sin eventos).
