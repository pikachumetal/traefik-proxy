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

**Factor de calibración** (ratio mediano real/estimado, 6 artefactos): **2.54** · media 2.73

- p25–p75: 1.29–3.77
- p80: 4.05 — para comprometer una fecha, multiplica la estimación por el p80: así cubre 4 de cada 5 artefactos.
- Dentro de ±25 %: 17 % · sobreestimadas: 17 % · infraestimadas: 67 %
- Error absoluto (h): media 0.5 · mediana 0.59
- Tendencia: n insuficiente (hacen falta 20)

| Tramo del ratio | n | % |
| --- | --- | --- |
| <0.5 | 0 | 0 % |
| 0.5–0.8 | 1 | 17 % |
| 0.8–1.25 | 1 | 17 % |
| 1.25–2 | 0 | 0 % |
| ≥2 | 4 | 67 % |

| Tipo | n | Mediana | p25–p75 |
| --- | --- | --- | --- |
| infra/tooling | 2 | 1.34 | — |
| patch | 4 | 3.49 | — |

> Con menos de 10 tareas con ratio la calibración es orientativa. Ver `estimation.md`.

## Tiempos por fase

| Fase | n | Agente (h) | Ejecución (h) | Espera (h) | Gate (h) | % del trabajo | Ceremonia | Est (h) | Real (h) | Ratio |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| apertura | 6 | 0.81 | 0.26 | 11.92 | 0 | 24 % | sí | 1.5 | 1.07 | 0.24 |
| implementación | 6 | 0.17 | 0.13 | 0 | 0.06 | 7 % | no | 1.75 | 0.3 | 0.06 |
| cierre | 6 | 2.03 | 0.99 | 2.73 | 0.18 | 69 % | sí | 0.45 | 3.02 | 2.83 |

Ceremonia: — (0 tareas, 6 fuera por una fase sin eventos).
