# Diagnostico Backend y Propuesta de Datos COMPASS

## 1. Resumen ejecutivo

El backend actual ya captura datos valiosos para COMPASS, pero todavía los conserva de forma demasiado dependiente de un JSON grande de sesión y con una normalización incompleta. Esto funciona para auditoria y debugging, pero no es una base suficientemente limpia para análisis estadistico, machine learning o reportes psicometricos confiables.

El problema central no es que falten datos. El problema es que los datos estan repartidos en varios canales, con distintos niveles de estructura:

- `sessions.payload`: guarda el paquete completo de sesión como JSON.
- `explicit_decisions`: guarda decisiones elegidas por el usuario.
- `process_logs`: guarda tiempos y eventos de proceso por nodo, pero los eventos quedan anidados como JSON.
- `mechanic_events`: guarda eventos de mecánicas como JSON.
- `expected_actions`: guarda promesas/acciones esperadas.
- `canonical_actions`: guarda acciones reales ejecutadas por mecánicas.
- `comparisons`: guarda resultado de comparar lo esperado contra lo realizado.
- `daily_effects`: guarda resoluciones diarias, también con JSON interno.

Esto genera tres riesgos principales:

1. **Baja calidad analitica**: muchas variables importantes siguen empaquetadas en JSON, lo que dificulta consultas por columna, limpieza, agregaciones, exportacion a CSV y modelamiento estadistico.
2. **Drift entre frontend y backend**: la comparacion frontend quedo unificada en `services/ComparisonEngine.ts`, pero todavía existe una version backend en `backend/main.py`. Si una regla cambia en un lado y no en otro, el resultado puede dejar de ser consistente.
3. **Modelo de datos confuso**: existen tablas creadas por schema que no tienen un productor claro. Esto produce tablas vacias y dificulta entender que datos son reales, legacy o futuros.

La recomendacion es simple: mantener el JSON completo como respaldo/auditoria, pero construir una capa analitica normalizada, con una fila por evento o decision y columnas atomicas. Antes de introducir modelos de IA o dashboards avanzados, COMPASS necesita una base de datos ordenada, trazable y estable.

---

## 2. Mapa del flujo actual

### 2.1. Captura en frontend

Durante la simulacion, el frontend produce varios tipos de datos:

- `decisionLog`: decisiones explicitas tomadas por el usuario en nodos narrativos.
- `processLog`: tiempo de permanencia por nodo y eventos de proceso como `hover_enter` y `hover_leave`.
- `mechanicEvents`: eventos emitidos por mecánicas, por ejemplo lectura de correos, documentos, cambios en agenda o eventos de díalogo.
- `expectedActions`: acciones que el sistema espera que el usuario cumpla despues de una decision.
- `canonicalActions`: acciones reales ejecutadas por el usuario dentro de mecánicas.
- `comparisons`: comparaciones entre expected actions y canonical actions.
- `dailyResolutions`: resoluciones de día con efectos globales y por stakeholder.

La captura ocurre principalmente en:

- `services/MechanicEngine.ts`: registra `mechanic_events`, `canonical_actions` y `expected_actions`.
- `services/Timelogger.ts`: registra proceso por nodo y eventos de hover/focus.
- `services/sessionExport.ts`: construye el `SessionExport` final.
- `services/sessionPersistence.ts`: envia el export a `/sessions`.

### 2.2. Export de sesión

`buildSessionExport()` genera un payload grande con esta forma general:

```ts
{
  comparison_mode,
  session_metadata,
  explicit_decisions,
  expected_actions,
  mechanic_events,
  canonical_actions,
  comparisons,
  daily_resolutions,
  process_log,
  player_actions_log,
  question_log,
  final_state
}
```

Este objeto es util como respaldo completo, pero no deberia ser la fuente principal de análisis. Para investigacion, psicometria y ML, lo importante es que cada unidad analitica quede como fila consultable.

### 2.3. Persistencia backend

El endpoint `/sessions` recibe el payload completo y llama a `normalize_session()` en `backend/main.py`.

El backend hace dos cosas:

1. Guarda el payload completo en `sessions.payload`.
2. Normaliza partes del payload en tablas como `explicit_decisions`, `expected_actions`, `canonical_actions`, `mechanic_events`, `comparisons`, `process_logs`, `player_actions_log`, `session_state` y `session_stakeholders`.

Este enfoque es correcto como transicion, pero hoy la normalización no es suficientemente granular para análisis avanzado.

### 2.4. Nota sobre SQLite local

Existe `backend/sessions.db`, pero el backend actual usa Postgres mediante `DATABASE_URL`. La SQLite local parece historica o de desarrollo. Puede servir como evidencia de datos previos, pero la arquitectura activa debe tratar a Postgres como fuente operacional.

En la SQLite local observada habia tablas con datos como `explicit_decisions`, `mechanic_events`, `process_logs`, `expected_actions`, `canonical_actions` y `comparisons`; `reports` aparecia vacia. En el schema actual de Postgres también se crean tablas que probablemente quedaran vacias si no existe productor real.

---

## 3. Diagnostico por punto solicitado

## 3.1. Calidad de datos y JSON gigante

### Estado actual

El sistema guarda un paquete de sesión completo en `sessions.payload`. Esto es util para:

- auditoria;
- reproduccion de bugs;
- respaldo de datos crudos;
- reconstruccion futura si cambia el modelo normalizado.

Pero es problematico como fuente principal de análisis porque:

- mezcla muchos niveles de informacion en un solo campo;
- obliga a parsear JSON para cada consulta relevante;
- dificulta exportar datos limpios a CSV;
- dificulta modelar con una fila por observacion;
- aumenta el riesgo de inconsistencias entre campos normalizados y payload.

### Diagnostico

El JSON grande no deberia eliminarse. Debe mantenerse como `raw payload`, pero con rol secundario: respaldo y auditoria.

La fuente principal para análisis deberia ser una capa normalizada, donde cada tabla tenga una unidad analitica clara:

- una fila por decision;
- una fila por evento de proceso;
- una fila por acción esperada;
- una fila por acción canonica;
- una fila por comparacion;
- una fila por efecto diario o por efecto aplicado.

### Recomendacion

Mantener `sessions.payload`, pero crear una capa `analytics_*` que sea la base para:

- análisis psicometrico;
- exportaciones limpias;
- validacion de instrumentos;
- modelos ML;
- dashboards;
- revision de calidad de datos.

Regla de calidad:

> Toda columna analitica debe contener idealmente un solo valor atomico. JSON solo debe permitirse en columnas `raw_*` o en tablas auxiliares key/value.

---

## 3.2. Telemetria

### Estado actual

La telemetria funciona, pero esta fragmentada:

- `process_logs.events` guarda eventos de proceso por nodo, como `hover_enter` y `hover_leave`.
- `mechanic_events.payload` guarda eventos de mecánicas, como `scenario_presented`, `decision_made`, `read_email`, `read_document`, `schedule_updated`.
- `canonical_actions` guarda acciones efectivas estandarizadas, por ejemplo ejecutar una semana de planificacion o visitar un stakeholder.
- `player_actions_log` guarda acciones del jugador asociadas a flujos especificos, por ejemplo agendar reuniones.

### Diagnostico

La telemetria existe, pero no esta en un formato ideal para análisis. El principal problema es que eventos relevantes quedan anidados dentro de JSON:

- eventos de hover dentro de `process_logs.events`;
- payloads variables dentro de `mechanic_events.payload`;
- valores finales dentro de `canonical_actions.value_final`.

Esto impide responder facilmente preguntas como:

- cuantas veces el usuario hizo hover sobre una opcion antes de elegir;
- cuanto tiempo paso entre ver un nodo y decidir;
- que documentos reviso antes de una decision critica;
- que mecánicas uso antes de ejecutar una acción;
- si hubo patrones de duda o cambio de foco.

### Recomendacion

Crear una tabla analitica de eventos de proceso:

```txt
analytics_process_events
- session_id
- node_id
- event_index
- event_type
- option_id
- timestamp_ms
- elapsed_from_node_start_ms
- raw_metadata
```

Crear una tabla analitica de eventos de mecanica:

```txt
analytics_mechanic_events
- event_id
- session_id
- mechanic_id
- event_type
- timestamp_ms
- node_id
- option_id
- target_ref
- raw_payload
```

El campo `raw_payload` puede conservar el JSON completo, pero las columnas frecuentes deben promoverse a columnas atomicas.

---

## 3.3. Opciones seleccionadas por el usuario

### Estado actual

Las opciones seleccionadas se guardan en `explicit_decisions` con campos utiles:

- `session_id`
- `node_id`
- `option_id`
- `option_text`
- `stakeholder`
- `day`
- `time_slot`
- `consequences`

Esto confirma que la eleccion principal del usuario queda registrada.

### Problema

`consequences` se guarda como JSON completo. Esto contiene informacion relevante para análisis, pero no es directamente consultable por columna:

- cambios de confianza;
- cambios de apoyo;
- cambios de reputacion;
- cambios de presupuesto;
- tags de decision;
- efectos visibles;
- expected actions creadas por la decision.

Ademas, el nombre `stakeholder` parece guardar nombre visible, no necesariamente `stakeholder_id`. Para análisis longitudinal conviene guardar identificadores estables.

### Recomendacion

Crear una tabla analitica de decisiones:

```txt
analytics_decisions
- decision_id
- session_id
- sequence_id
- node_id
- option_id
- option_text
- stakeholder_id
- stakeholder_name
- day
- time_slot
- decision_order
- trust_delta
- support_delta
- reputation_delta
- budget_delta
- project_progress_delta
- dialogue_response
- raw_consequences
```

Crear una tabla auxiliar para tags:

```txt
analytics_decision_tags
- decision_id
- tag_key
- tag_value
```

Esto permite que cada columna tenga un solo valor y que las etiquetas variables no ensucien la tabla principal.

---

## 3.4. Tablas vacias

### Estado actual

El schema de `backend/main.py` crea tablas que no parecen tener un flujo de poblamiento claro:

- `reports`
- `bridge_responses`
- `objectives`
- `scenarios`
- `decision_nodes`

Tambien existen tablas que se poblan solo si ciertos datos vienen en `final_state`, como `questions` y `question_requirements`.

### Diagnostico

Las tablas vacias probablemente se explican por una de estas razones:

1. **Tablas futuras**: fueron creadas pensando en capacidades que todavía no estan implementadas.
2. **Tablas legacy**: pertenecen a una version anterior del modelo.
3. **Tablas de catalogo no conectadas**: deberian cargarse desde contenido versionado, pero no hay importador.
4. **Tablas sin productor**: no existe endpoint, normalizador ni proceso batch que inserte filas en ellas.

El problema no es que una tabla este vacia durante desarrollo. El problema es que no este documentado si es una tabla activa, futura o deprecada.

### Recomendacion

Clasificar cada tabla en una de tres categorias:

```txt
ACTIVE: tiene productor real y se usa en consultas.
FUTURE: se conserva, pero no se espera que tenga datos todavía.
LEGACY: existe por compatibilidad o debe eliminarse en una migracion futura.
```

Propuesta inicial:

| Tabla | Estado sugerido | Motivo |
|---|---|---|
| `reports` | FUTURE o LEGACY | No hay generador de reportes persistidos. |
| `bridge_responses` | LEGACY | No hay flujo actual que inserte respuestas puente por decision. |
| `objectives` | FUTURE | Podria servir para objetivos por stakeholder, pero no hay importador actual. |
| `scenarios` | FUTURE | Podria ser catalogo de contenido, pero hoy los escenarios viven en archivos TS. |
| `decision_nodes` | FUTURE | Depende de poblar `scenarios`; hoy no hay sincronizacion. |

No se recomienda eliminarlas sin migracion revisada. Si se mantienen, deben documentarse como no activas.

---

## 3.5. Comparador expected/canonical

### Estado actual

Antes habia tres lugares relevantes:

- `services/ComparisonEngine.ts`: comparador simple para expected/canonical.
- `services/localDayResolution.ts`: comparador y aplicador de efectos diarios mas completo, incluyendo `execute_week`, visitas y reglas CESFAM.
- `backend/main.py`: contiene reglas backend, resolución de día y efectos.

Estado implementado en frontend:

- `services/ComparisonEngine.ts` es ahora el unico comparador frontend.
- `services/localDayResolution.ts` fue eliminado.
- `services/comparisonRules.ts` fue eliminado.
- El outcome analitico frontend es booleano: `true` si cumplio, `false` si no cumplio.

Ademas, `services/comparisonMode.ts` usa por defecto:

```ts
VITE_COMPARISON_MODE=frontend
```

Por lo tanto, aunque el README mencione que la comparacion vive en backend, el comportamiento por defecto actual privilegia resolución frontend.

### Problemas detectados

1. **Duplicacion de reglas**
   - La misma idea de negocio vive en TypeScript y Python.
   - Esto aumenta el riesgo de resultados diferentes.

2. **Outcomes mezclados**
   - Frontend usa `true/false` como resultado analitico.
   - Backend usa internamente `TRUE` y `FALSE` en algunas rutas de efectos.
   - Esto obliga a traducciones y puede confundir análisis.

3. **Cobertura desigual**
   - Antes `ComparisonEngine.ts` ignoraba `execute_week`.
   - Ahora `ComparisonEngine.ts` cubre comparacion generica por constraints, visitas y `execute_week`.
   - Backend también tiene su propia version.

4. **Autoridad ambigua**
   - No queda claro si el resultado final psicometrico viene del frontend o del backend.

### Recomendacion

Elegir una sola fuente de verdad.

Para el experimento actual, la opcion mas simple es:

> Frontend autoritativo para comparacion final dentro del simulador, usando una sola implementacion en `services/ComparisonEngine.ts`.

Esto implica:

- el frontend muestra feedback inmediato y genera comparaciones finales;
- el backend debe persistir el payload y normalizarlo sin recalcular reglas por ahora;
- los outcomes analiticos deben ser booleanos: `true` o `false`;
- los motivos de fallo deben guardarse en `reason` y el detalle tecnico en `raw_deviation`.

A futuro, si COMPASS escala a muchos usuarios o necesita auditoria centralizada, se puede mover la misma logica al backend, pero manteniendo un solo contrato de datos.

---

## 4. Propuesta simple, modular y escalable

La propuesta busca el minimo cambio conceptual para mejorar calidad de datos sin rehacer todo el backend.

## 4.1. Separar backend en cuatro capas

Actualmente `backend/main.py` mezcla:

- configuracion;
- conexion DB;
- schema;
- normalización;
- reglas de comparacion;
- endpoints;
- mantenimiento de datos.

Separacion minima recomendada:

```txt
backend/
  app.py
  db.py
  schema.py
  routes/
    health.py
    sessions.py
  services/
    normalization.py
    comparison.py
```

Responsabilidades:

- `db`: conexion, transacciones y helpers de JSON.
- `schema`: creacion/migracion minima de tablas.
- `normalization`: convertir `SessionExport` en filas normalizadas.
- `comparison`: reglas expected/canonical.
- `routes`: endpoints FastAPI delgados.

No hace falta introducir ORM de inmediato. La prioridad es separar responsabilidades.

## 4.2. Mantener raw JSON como auditoria

No eliminar `sessions.payload`.

Debe quedar como:

- respaldo completo;
- fuente de reconstruccion;
- material de debugging;
- evidencia cruda si cambia el normalizador.

Pero el análisis debe consumir tablas normalizadas.

Regla:

> Si una variable sera usada para análisis frecuente, debe existir como columna o fila normalizada, no solo dentro de JSON.

## 4.3. Capa analitica tidy

Crear tablas analiticas con unidades claras.

### `analytics_decisions`

Una fila por opcion elegida.

Campos base:

```txt
decision_id
session_id
decision_order
node_id
option_id
option_text
stakeholder_id
stakeholder_name
day
time_slot
trust_delta
support_delta
reputation_delta
budget_delta
project_progress_delta
dialogue_response
raw_consequences
```

### `analytics_decision_tags`

Una fila por tag de decision.

```txt
decision_id
tag_key
tag_value
```

### `analytics_process_events`

Una fila por microevento de proceso.

```txt
session_id
node_id
event_index
event_type
option_id
timestamp_ms
elapsed_from_node_start_ms
raw_metadata
```

### `analytics_mechanic_events`

Una fila por evento emitido por mecánicas.

```txt
event_id
session_id
mechanic_id
event_type
timestamp_ms
node_id
option_id
target_ref
raw_payload
```

### `analytics_expected_actions`

Una fila por acción esperada.

```txt
expected_action_id
session_id
source_node_id
source_option_id
mechanic_id
action_type
target_ref
rule_id
created_at_ms
created_day
created_time_slot
stakeholder_id
raw_constraints
raw_effects
```

### `analytics_canonical_actions`

Una fila por acción canonica.

```txt
canonical_action_id
session_id
mechanic_id
action_type
target_ref
committed_at_ms
day
time_slot
raw_value_final
raw_context
```

### `analytics_comparisons`

Una fila por comparacion.

```txt
comparison_id
session_id
expected_action_id
canonical_action_id
rule_id
outcome
resolved_day
raw_deviation
```

## 4.4. No hacer una migracion grande inicial

La ruta mas segura:

1. Documentar el estado actual.
2. Agregar normalizador analitico incremental.
3. Probarlo con sesiones nuevas.
4. Comparar conteos contra tablas actuales.
5. Reprocesar sesiones antiguas solo cuando el normalizador este estable.

Esto evita romper persistencia actual.

---

## 5. Recomendacion sobre el comparador

## 5.1. Decision recomendada

Usar backend como fuente autoritativa para comparaciones finales.

Motivos:

- es donde se persisten datos;
- permite reproducibilidad;
- evita que un cambio de UI altere resultados analiticos;
- facilita tests de integracion;
- permite recalcular sesiones antiguas si mejora una regla.

## 5.2. Rol del frontend

El frontend debe seguir capturando:

- explicit decisions;
- process logs;
- mechanic events;
- expected actions;
- canonical actions.

Tambien puede calcular feedback visual inmediato, pero ese resultado debe marcarse como provisional si el backend sera autoritativo.

## 5.3. Outcomes unificados

Usar solo este outcome persistido:

```txt
true
false
```

Interpretacion:

- `true`: el usuario realizo una acción canonica compatible con la esperada.
- `false`: no realizo la acción o la acción real no cumplio la regla/constraints.

El motivo especifico debe vivir en `reason`, por ejemplo `not_done`, `wrong_time`, `wrong_day`, `wrong_npc`, `wrong_resource`, `wrong_activity`, `wrong_room`, `late` u `other_rule_failed`.

## 5.4. Casos minimos que el comparador debe cubrir

- Expected action sin canonical action -> `false`, `reason = not_done`.
- Expected action con canonical compatible -> `true`.
- Expected action con canonical incorrecta -> `false`, con `reason` especifico.
- Visita a stakeholder con día/slot correcto.
- Visita fuera de ventana.
- `execute_week` con scheduler correcto.
- `execute_week` con scheduler incompleto o constraints no cumplidas.

---

## 6. Cambios o interfaces propuestas

Estos cambios son de propuesta; no deben implementarse todos de una vez.

### 6.1. Entrada

Mantener `SessionExport` como payload de entrada:

```txt
POST /sessions
```

El contrato actual sigue siendo valido.

### 6.2. Salida normalizada por sesión

Agregar una vista o endpoint analitico futuro:

```txt
GET /sessions/{session_id}/analytics
```

Debe devolver:

- decisiones atomicas;
- eventos de proceso atomicos;
- eventos de mecanica atomicos;
- acciones esperadas;
- acciones canónicas;
- comparaciones;
- resumen de calidad de datos.

### 6.3. Regla de calidad de columnas

Politica propuesta:

- una columna = un valor;
- JSON solo en `raw_*`;
- payloads variables deben ir a tablas key/value si se vuelven analiticamente importantes;
- todo evento debe tener `session_id`, timestamp y tipo;
- toda decision debe tener `node_id` y `option_id`;
- toda expected action debe tener `source_node_id` y `source_option_id`;
- toda canonical action debe tener `mechanic_id`, `action_type` y `target_ref`.

---

## 7. Estructura de datos crudos y procesados

El diccionario de datos crudos, formato modular de tags y features agregadas por usuario fue movido a un documento independiente para evitar duplicar definiciones:

- [estructura-datos-compass.md](./estructura-datos-compass.md)

Este diagnóstico mantiene el foco en arquitectura, ingesta, normalización y riesgos del backend.
## 8. Plan de validacion

## 8.1. Ingesta

Caso:

- cargar una sesión fixture con N decisiones.

Criterio:

- `analytics_decisions` debe tener exactamente N filas.
- cada fila debe tener `session_id`, `node_id`, `option_id`, `decision_order`.

## 8.2. Telemetria

Caso:

- una sesión con hover sobre opciones y decision final.

Criterio:

- deben existir eventos `hover_enter` y `hover_leave` en `analytics_process_events`.
- debe existir duracion total por nodo.
- los timestamps deben ser ordenables.

## 8.3. Opciones seleccionadas

Caso:

- una sesión con decisiones narrativas.

Criterio:

- cada `node_id + option_id` elegido debe aparecer en `explicit_decisions`.
- el mismo evento debe aparecer en `analytics_decisions`.
- no debe haber decisiones sin `node_id` o sin `option_id`.

## 8.4. Tablas vacias

Caso:

- inspeccionar schema completo.

Criterio:

- cada tabla debe tener clasificacion `ACTIVE`, `FUTURE` o `LEGACY`.
- ninguna tabla vacia debe quedar sin explicacion.
- toda tabla `ACTIVE` debe tener productor identificado.

## 8.5. Comparador

Caso fixture:

- expected action cumplida;
- expected action no cumplida;
- expected action desviada;
- `execute_week` cumplida;
- `execute_week` desviada.

Criterio:

- resultados esperados: `true` y `false`.
- el motivo debe persistirse en `reason`, no mezclarse dentro de `outcome`.

## 8.6. Consistencia frontend/backend

Caso:

- ejecutar el mismo fixture por frontend y backend.

Criterio:

- mientras exista comparacion frontend, debe coincidir con backend para los casos cubiertos.
- si no coincide, backend debe considerarse resultado autoritativo para persistencia analitica.

---

## 9. Prioridad de implementacion recomendada

### Fase 1: orden y trazabilidad

- Documentar tablas activas, futuras y legacy.
- Agregar tests de normalización con fixture de sesión.
- Crear normalizador analitico para decisiones y process events.

### Fase 2: comparador autoritativo

- Consolidar reglas en backend.
- Alinear outcomes.
- Cubrir `execute_week`, visitas y reglas principales con tests.

### Fase 3: capa analitica completa

- Normalizar mechanic events.
- Normalizar expected/canonical actions.
- Normalizar comparisons.
- Crear endpoint o export analitico por sesión.

### Fase 4: preparacion para investigacion y ML

- Export CSV/tidy.
- Reporte de calidad de datos.
- Diccionario de variables.
- Versionado de reglas y contenido.

---

## 10. Supuestos

- Este documento no implementa migraciones ni cambios de codigo.
- `SessionExport` sigue siendo el payload de entrada.
- `sessions.payload` se conserva como respaldo completo.
- La propuesta prioriza normalización y calidad de datos antes de introducir modelos ML.
- Las tablas vacias no deben eliminarse automaticamente; primero deben clasificarse y documentarse.
- El backend debe convertirse gradualmente en fuente autoritativa para resultados analiticos finales.
