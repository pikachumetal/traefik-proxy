# Tasks — Migrar a dominios .localhost

| Task | Título | Estado | Commit |
| --- | --- | --- | --- |
| 1 | Script add-project-cert con sus tests | hecha | 35723ec |
| 2 | Corte a .localhost en el proxy | hecha | 455cad8 |
| 3 | Documentación | hecha | 53cae43 |

Revisión final: Spec opus+high, With fixes, 5 sin verificar · Código sonnet+high, With fixes · Arquitectura opus+high, With fixes, sobre 53cae43
Pasada de fix: juntada en el cierre, 2 hallazgos RED→GREEN
Re-revisión: 53cae43..pasada de fix (juntada en el cierre), sdd-kit:effort-high + opus, All findings addressed (3 Minor nuevos: 2 de docs arreglados en el hilo, 1 ruling)

## Rulings

Ruling: sin worktree — el proyecto trabaja sin worktrees (CLAUDE.md, init); se implementa en el checkout principal sobre feature/0002-localhost-domains y la baseline es el gate de la Task 2 — coste si erróneo: un fallo previo a la rama se atribuiría a la feature.
Task 1: Ruling: main acepta la opción mkcert ([comando, ...prefijo], por defecto ['mkcert']) y el mkcert falso es un .mjs lanzado con process.execPath — en Windows spawnSync sin shell no ejecuta un .cmd, y la decisión 6 del plan (.cmd/.sh) no podía funcionar — coste si erróneo: una opción de test en la firma pública de main.
Task 2: Ruling: el proxy ya estaba levantado por el dev-lead (usado por dev-tools); se mide sobre él sin down y se deja levantado al acabar, en vez del Step 5 «parar el proxy» — coste si erróneo: la regresión de clon nuevo se mide sobre un contenedor ya arrancado, no recién creado.
Task 2: Ruling: medición hot-reload → necesita docker compose restart (tras 20 s el SNI seguía sirviendo el autofirmado; tras restart, authorized true). README lo documenta tras el script — coste si erróneo: un paso de más para el usuario.
Task 2: Ruling: renovación medida en real: serialNumber distinto tras segunda ejecución (cubre el ⚠ del self-review).
Final: Ruling: certs/ se crea antes de saber si mkcert existe (Código Minor 4) — mkcert necesita la carpeta y en el repo ya existe por .gitkeep; queda vacía e inocua — coste si erróneo: una carpeta vacía en un rootDir ajeno.
Final: Ruling: rama result.error distinta de ENOENT sin test (Código Minor 5) — provocar EACCES de forma portable exige permisos por plataforma; el mensaje sale por la misma rama que status≠0 — coste si erróneo: un texto de error sin probar.
Final: Ruling: opción mkcert en main (Arquitectura Minor 1) — ya ledgerada en la Task 1.
Final: Ruling: opción env de main sin uso en tests (eje Spec) — es la interfaz del plan; los tests de PATH lanzan el proceso — coste si erróneo: una opción sin test.
Final: Ruling: spawnSync('mkcert') en Windows busca antes en el directorio actual (eje Spec, declined) — desarrollo local en repos propios del dev-lead; un mkcert.exe plantado exige escribir ya en su repo — coste si erróneo: ejecución de un binario plantado en un repo hermano.
Final: Ruling: mkcert falló: código null si mkcert muere por una señal sin stderr (re-revisión Minor) — caso raro en una CLI local; el mensaje sigue diciendo que mkcert falló — coste si erróneo: un detalle de error poco claro.
