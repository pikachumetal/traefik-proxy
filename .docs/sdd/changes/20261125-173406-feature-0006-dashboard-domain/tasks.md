# Tasks — Dashboard en dashboard.traefik.localhost

| Task | Título | Estado | Commit |
| --- | --- | --- | --- |
| 1 | Router del dashboard y compose sin 8080 | hecha | 2ed9790 |
| 2 | Documentación y constitution | hecha | f0bb492 |

Revisión final: Spec opus+high, Yes · Código sonnet+high, Yes · Arquitectura no (plan), sobre f0bb492
Pasada de fix: juntada en el cierre, 0 hallazgos RED→GREEN (4 Minor de docs y comentarios, revisados en el hilo)

## Rulings

Ruling: sin worktree — el proyecto trabaja sin worktrees; checkout principal sobre feature/0006-dashboard-domain — coste si erróneo: un fallo previo se atribuiría a la feature.
Task 2: Ruling: git grep de la verificación encuentra architecture.md:49, la decisión estructural que describe la retirada de api.insecure y :8080 — es el registro, no una referencia viva — coste si erróneo: ninguno.
Task 2: Ruling: architecture.md › .env.example decía «hoy sin uso» (desmentido por la 0004) y pasa a «(LOG_LEVEL)» — una línea fuera del Scope en un documento que la task ya toca — coste si erróneo: ninguno.
Final: Ruling: CLAUDE.md con :8080 (Código Minor 1) — el CLAUDE.md actual no lo menciona; el revisor leyó la versión previa a la init — coste si erróneo: ninguno
