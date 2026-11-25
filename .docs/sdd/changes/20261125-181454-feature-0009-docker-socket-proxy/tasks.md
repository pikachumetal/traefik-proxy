# Tasks — Proxy del socket de Docker

| Task | Título | Estado | Commit |
| --- | --- | --- | --- |
| 1 | socket-proxy en compose y Traefik por TCP | hecha | ee729e8 |
| 2 | Constitution, architecture y README | hecha | c9a6c27 |

Revisión final: Spec opus+high, With fixes · Código sonnet+high, Yes · Arquitectura opus+high, Yes, sobre c9a6c27
Pasada de fix: juntada en el cierre, 0 hallazgos RED→GREEN (Minor de docs y una prueba de Review Focus, revisados en el hilo)

## Rulings

Ruling: sin worktree — checkout principal sobre feature/0009-docker-socket-proxy — coste si erróneo: un fallo previo se atribuiría a la feature.
Task 1: Ruling: Traefik 3.8 no pidió rutas fuera de la allowlist (sin bloqueos a sus peticiones en el log) — no se amplía la regex — coste si erróneo: una ruta que Traefik pida en otro escenario recibiría 403 y saldría en el log del proxy.
Final: Ruling: '-loglevel=info' no pedido (Spec Minor 2) — está en el ejemplo del README de la imagen y deja el nivel visible en compose; inocuo — coste si erróneo: ninguno
Final: Ruling: subred escrita en dos sitios (Arquitectura Minor 3) — el README avisa de cambiar las dos; una variable sería YAGNI mientras no choque — coste si erróneo: 403 si se cambia solo una
Final: Ruling: «flujo» de architecture.md sin cambios (Spec Minor 4) — describe el camino de una petición HTTP, no el descubrimiento — coste si erróneo: ninguno
Final: Ruling: evidencia de la Task 2 (Spec Minor 5) — git grep docker.sock ejecutado en la sesión: todas las menciones son al proxy (architecture 23 y 53, constitution 20, README 32 y 48)
