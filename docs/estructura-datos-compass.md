# Estructura De Datos COMPASS

Este documento reconstruye el diccionario preliminar de datos COMPASS definido desde la página 25 del documento `PRACTICA CDIA.pdf`.

El objetivo es definir nombres técnicos estables y títulos cortos en español para usar en tablas analíticas, dataframes y documentación del experimento.

La regla general es mantener dos formatos:

- **Formato largo**: una fila por decisión, evento, acción esperada, acción canónica o comparación.
- **Formato ancho**: una fila por usuario/sesión, con features agregadas calculadas desde el formato largo.

Nota transversal sobre identificadores: `session_id` es el **grano** de todas las tablas largas (un participante puede tener varias sesiones). Además, todas las tablas de detalle incluyen `user_id` **denormalizado** (estampado por el normalizador tras reinsertar la sesión), para poder filtrar y extraer por participante sin un JOIN a la tabla de sesiones.

## 1. Datos De Decisiones Explícitas

Estos datos son la base para medir lo que el usuario declara mediante sus elecciones. Permiten sumar puntajes por dimensión del MLQ-5X, excluir botones `NEXT`, revisar decisiones críticas y reconstruir qué competencia estaba siendo medida en cada alternativa.

| Nombre en código | Título corto | Tipo | Uso analítico |
|---|---|---|---|
| `session_id` | Sesión | string | Une todas las tablas de una misma ejecución. |
| `user_id` | Usuario | string | Identifica al participante del experimento. |
| `decision_order` | Orden decisión | number | Reconstruye la trayectoria exacta de decisiones. |
| `sequence_id` | Reunión | string | Agrupa decisiones dentro de una secuencia narrativa. |
| `case_id` | Caso | string | Agrupa decisiones por caso o módulo narrativo. |
| `node_id` | Nodo | string | Identifica el nodo específico de decisión. |
| `node_title` | Título nodo | string | Nombre legible para reportes y revisión humana. |
| `npc_id` | NPC | string | Identificador estable del personaje involucrado. |
| `npc_role` | Rol NPC | string | Permite agrupar por rol, autoridad o tipo de actor. |
| `npc_name` | Nombre NPC | string | Nombre legible del personaje. |
| `day` | Día | number | Ubica la decisión en tiempo simulado. |
| `time_slot` | Bloque horario | string | Bloque temporal: mañana, tarde o noche. |
| `option_id` | Opción | string | Alternativa elegida por el usuario. |
| `option_text` | Texto opción | string | Texto completo elegido, útil para auditoría. |
| `is_decision` | Es decisión | boolean | Distingue decisiones reales de botones `NEXT`. |
| `tag_type` | Tipo etiqueta | string | Tipo de constructo medido, por ejemplo `mlq_dimension`. |
| `tag_value` | Etiqueta | string | Variable específica medida por la alternativa. |
| `tag_score` | Puntaje etiqueta | number | Puntaje de la alternativa, por ejemplo escala 0 a 4. |
| `raw_tags` | Tags crudos | json | Respaldo de tags originales de la opción. |
| `trust_delta` | Cambio confianza | number | Efecto inmediato sobre confianza del NPC. |
| `support_delta` | Cambio apoyo | number | Efecto inmediato sobre apoyo del NPC. |
| `reputation_delta` | Cambio reputación | number | Efecto inmediato sobre reputación global. |
| `budget_delta` | Cambio presupuesto | number | Efecto inmediato sobre presupuesto. |
| `project_progress_delta` | Cambio progreso | number | Efecto inmediato sobre progreso del proyecto. |
| `dialogue_response` | Respuesta NPC | string | Respuesta narrativa posterior a la decisión. |
| `raw_consequences` | Consecuencias crudas | json | Respaldo completo de consecuencias. |

Nota de compatibilidad: si el código usa `tag_variable`, debe mapearse a `tag_value` en la tabla analítica. El significado es el mismo: la variable específica medida por la alternativa.

## 2. Datos De Proceso Y Telemetría

Estos datos no deben ser el scoring principal al inicio. Sirven como variables exploratorias para estudiar deliberación, impulsividad, duda, conflicto entre alternativas y dificultad del ítem.

| Nombre en código | Título corto | Tipo | Uso analítico |
|---|---|---|---|
| `session_id` | Sesión | string | Une eventos de proceso con la sesión. |
| `node_id` | Nodo | string | Nodo donde ocurrió el evento. |
| `option_id` | Opción | string/null | Opción asociada al evento, si aplica. |
| `event_type` | Tipo evento | string | Evento de proceso: `hover_enter`, `hover_leave`, `focus`, etc. |
| `timestamp_ms` | Tiempo evento | number | Momento exacto del evento. |
| `elapsed_from_node_start_ms` | Tiempo desde nodo | number | Tiempo desde que apareció el nodo. |
| `node_total_duration_ms` | Duración nodo | number | Tiempo total antes de decidir. |
| `option_hover_total_ms` | Hover opción | number | Tiempo total del mouse sobre una opción. |
| `option_hover_count` | Veces hover | number | Cantidad de veces que volvió a esa opción. |
| `first_hover_option_id` | Primera opción vista | string/null | Primera opción explorada en el nodo. |
| `last_hover_option_id` | Última opción vista | string/null | Última opción vista antes de elegir. |
| `selected_option_hover_ms` | Hover elegida | number | Tiempo de hover sobre la opción seleccionada. |
| `selected_option_was_most_hovered` | Eligió más vista | boolean | Indica si eligió la opción más revisada. |
| `hover_switch_count` | Cambios hover | number | Cantidad de cambios entre opciones. |
| `raw_metadata` | Metadata cruda | json | Respaldo técnico del evento. |

La tabla anterior (`process_logs`) guarda una fila por **evento** de proceso. Para análisis directo conviene además la siguiente tabla agregada.

## 2.1. Resumen De Hover Por Opción: `option_process_stats`

Tabla agregada derivada de los eventos de proceso: **una fila por `session_id + node_id + option_id`**, con el resumen ya calculado por alternativa (sin duplicar por evento). El conteo es robusto: cuenta un hover solo al entrar desde "no abierto", inmune a flicker o re-render.

| Nombre en código | Título corto | Tipo | Uso analítico |
|---|---|---|---|
| `session_id` | Sesión | string | Une con la sesión. |
| `user_id` | Usuario | string | Participante (denormalizado). |
| `node_id` | Nodo | string | Nodo de decisión. |
| `option_id` | Opción | string | Alternativa evaluada. |
| `hover_count` | Veces hover | number | Cuántas veces el cursor entró a esa opción. |
| `hover_total_ms` | Hover total | number | Tiempo total del cursor sobre esa opción. |
| `is_selected` | Seleccionada | boolean | `true` si fue la alternativa elegida. |

## 3. Datos Implícitos: Acciones Esperadas

Estos datos representan lo que el usuario prometió o dejó comprometido. Son esenciales para medir consistencia entre decisión explícita y conducta posterior.

| Nombre en código | Título corto | Tipo | Uso analítico |
|---|---|---|---|
| `expected_action_id` | Acción esperada | string | Identificador único del compromiso esperado. |
| `session_id` | Sesión | string | Une la acción con el usuario/sesión. |
| `source_node_id` | Nodo origen | string | Nodo donde nació la acción esperada. |
| `source_option_id` | Opción origen | string | Opción que generó el compromiso. |
| `npc_id` | NPC asociado | string/null | NPC vinculado al compromiso, si aplica. |
| `mechanic_id` | Mecánica esperada | string | Mecánica donde debe cumplirse la acción. |
| `action_type` | Tipo acción | string | Tipo de acción esperada. |
| `target_ref` | Objetivo esperado | string | Objetivo de la acción: NPC, sala, recurso o global. |
| `rule_id` | Regla | string | Regla usada por el comparador. |
| `created_at_ms` | Creada en | number | Timestamp de creación del compromiso. |
| `created_day` | Día creación | number | Día simulado de creación. |
| `created_time_slot` | Bloque creación | string | Bloque horario de creación. |
| `due_day` | Día límite | number/null | Día límite calculado, si existe. |
| `due_time_slot` | Bloque límite | string/null | Bloque límite calculado, si existe. |
| `has_expected_action` | Tiene compromiso | boolean | Indica si la opción generó acción esperada. |
| `raw_constraints` | Condiciones crudas | json | Condiciones completas de cumplimiento. |
| `raw_effects` | Efectos crudos | json | Efectos de cumplir o fallar. |

## 3.1. Datos Implícitos: Acciones Canónicas

Estos datos representan lo que el usuario efectivamente hizo. No conviene duplicar su JSON dentro de comparaciones; basta referenciarlo con `canonical_action_id`.

| Nombre en código | Título corto | Tipo | Uso analítico |
|---|---|---|---|
| `canonical_action_id` | Acción real | string | Identificador único de acción efectivamente realizada. |
| `session_id` | Sesión | string | Une la acción con la sesión. |
| `mechanic_id` | Mecánica real | string | Mecánica donde ocurrió la acción. |
| `action_type` | Tipo acción | string | Tipo de acción realizada. |
| `target_ref` | Objetivo real | string | Objetivo afectado por la acción. |
| `target_type` | Tipo objetivo | string/null | Clasifica el objeto afectado: `npc`, `email`, `document`, `schedule`, etc. |
| `target_id` | ID objetivo | string/null | Identificador limpio del objetivo, sin prefijo. |
| `target_label` | Nombre objetivo | string/null | Nombre legible del objetivo. |
| `day` | Día acción | number/null | Día simulado de la acción, si existe. |
| `time_slot` | Bloque acción | string/null | Bloque horario de la acción, si existe. |
| `committed_day` | Día ejecución | number/null | Día en que el usuario realizó la acción. |
| `committed_time_slot` | Bloque ejecución | string/null | Bloque en que el usuario realizó la acción. |
| `source_node_id` | Nodo origen | string/null | Nodo que gatilló la acción, si aplica. |
| `source_option_id` | Opción origen | string/null | Opción que gatilló la acción, si aplica. |
| `summary` | Resumen acción | string/null | Texto corto legible para auditoría. |
| `committed_at_ms` | Realizada en | number | Timestamp de ejecución. |
| `raw_value_final` | Valor final crudo | json | Payload específico de la mecánica. |
| `raw_context` | Contexto crudo | json | Contexto técnico adicional. |

## 3.2. Datos Implícitos: Comparaciones Expected Vs Canonical

Estos datos son la base de los indicadores implícitos. Permiten medir si la persona cumplió lo que prometió, si falló por no actuar o si hizo una acción incorrecta.

| Nombre en código | Título corto | Tipo | Uso analítico |
|---|---|---|---|
| `comparison_id` | Comparación | string/number | Identificador de la comparación. |
| `session_id` | Sesión | string | Une la comparación con la sesión. |
| `expected_action_id` | Acción esperada | string | Compromiso evaluado. |
| `canonical_action_id` | Acción real | string/null | Acción real asociada, si existe. |
| `mechanic_id` | Mecánica | string/null | Mecánica evaluada por la comparación. FK hacia `mechanics`. |
| `outcome` | Cumplió | boolean | `TRUE` si cumplió; `FALSE` si no cumplió. |
| `reason` | Motivo fallo | string/null | Motivo: `not_done`, `wrong_time`, `wrong_day`, `wrong_npc`, `wrong_resource`, `wrong_activity`, `wrong_room`, `late`, `other_rule_failed`. |
| `rule_id` | Regla | string | Regla aplicada. |
| `resolved_day` | Día resolución | number/null | Día simulado en que se resolvió. |
| `resolved_at_ms` | Tiempo resolución | number/null | Timestamp de resolución. |
| `commitment_elapsed_ms` | Tiempo compromiso | number/null | Milisegundos entre activación del compromiso (`expected_actions.created_at_ms`) y resolución/cumplimiento/fallo. |
| `raw_deviation` | Desviación cruda | json | Detalle técnico opcional. |

## 3.3. Eventos De Mecánicas

Estos datos permiten estudiar búsqueda de información, uso de herramientas, preparación antes de decidir y conducta fuera del diálogo principal.

| Nombre en código | Título corto | Tipo | Uso analítico |
|---|---|---|---|
| `event_id` | Evento | string | Identificador único del evento. |
| `session_id` | Sesión | string | Une el evento con la sesión. |
| `mechanic_id` | Mecánica | string | Mecánica que emitió el evento. |
| `event_type` | Tipo evento | string | Tipo de evento: leer correo, leer documento, actualizar agenda, etc. |
| `timestamp_ms` | Tiempo evento | number | Momento del evento. |
| `node_id` | Nodo asociado | string/null | Nodo asociado, si aplica. |
| `option_id` | Opción asociada | string/null | Opción asociada, si aplica. |
| `target_ref` | Objetivo | string/null | Objeto o recurso afectado. |
| `raw_payload` | Payload crudo | json | Respaldo completo del evento. |

## 3.4. Preguntas A NPC

Estos datos miden búsqueda activa de información interpersonal. Pueden asociarse con toma de perspectiva, consideración individualizada y prudencia decisional.

| Nombre en código | Título corto | Tipo | Uso analítico |
|---|---|---|---|
| `session_id` | Sesión | string | Une la pregunta con la sesión. |
| `npc_id` | NPC preguntado | string | NPC al que se hizo la pregunta. |
| `question_id` | Pregunta | string | Pregunta realizada. |
| `was_locked` | Bloqueada | boolean | Indica si la pregunta estaba bloqueada. |
| `trust_at_ask` | Confianza al preguntar | number | Confianza al momento de preguntar. |
| `support_at_ask` | Apoyo al preguntar | number | Apoyo al momento de preguntar. |
| `reputation_at_ask` | Reputación al preguntar | number | Reputación al momento de preguntar. |
| `timestamp_ms` | Tiempo pregunta | number | Momento de la pregunta. |

## 4. Estado Final

Estos datos resumen el resultado global de la simulación. Sirven como outcomes generales o variables de control.

| Nombre en código | Título corto | Tipo | Uso analítico |
|---|---|---|---|
| `session_id` | Sesión | string | Sesión evaluada. |
| `user_id` | Usuario | string | Participante evaluado. |
| `version_id` | Versión | string | Versión de COMPASS aplicada. |
| `final_day` | Día final | number | Día simulado alcanzado. |
| `final_budget` | Presupuesto final | number | Presupuesto al cierre. |
| `final_reputation` | Reputación final | number | Reputación al cierre. |
| `final_project_progress` | Progreso final | number | Progreso final del proyecto/caso. |
| `completed_sequences_count` | Reuniones completadas | number | Total de secuencias completadas. |
| `completed_scenarios_count` | Nodos completados | number | Total de nodos completados. |
| `player_notes` | Notas del jugador | string/null | Texto libre que el participante escribió en la pestaña de Notas durante la sesión. |
| `raw_final_state` | Estado final crudo | json | Respaldo completo del estado final. |

## 5. Tabla Intermedia: `user_behaviour_analysis`

Esta tabla no reemplaza los datos crudos. Es una tabla de preprocesamiento que cruza decisiones, telemetría, acciones esperadas, acciones canónicas y comparaciones para dejar los datos en una forma más fácil de analizar.

La unidad recomendada es: **una fila por alternativa mostrada dentro de un nodo, por sesión**. Así la alternativa seleccionada se marca con `selected = true`, mientras que las demás quedan como alternativas disponibles no elegidas. Esto permite analizar no solo lo que el usuario eligió, sino también qué opciones tenía disponibles, cuánto las revisó y qué compromiso conductual implicaban.

| Nombre en código | Título corto | Tipo | Uso analítico |
|---|---|---|---|
| `session_id` | Sesión | string | Une la fila con la ejecución completa. |
| `user_id` | Usuario | string | Identifica al participante. |
| `version_id` | Versión | string | Versión de COMPASS aplicada. |
| `case_id` | Caso | string/null | Caso narrativo al que pertenece el nodo. |
| `sequence_id` | Reunión | string/null | Secuencia narrativa donde apareció el nodo. |
| `node_id` | Nodo | string | Nodo de decisión evaluado. |
| `node_title` | Título nodo | string/null | Nombre legible del nodo para reportes. |
| `npc_id` | NPC | string/null | NPC asociado al nodo. |
| `day` | Día | number | Día simulado. |
| `time_slot` | Bloque horario | string | Bloque simulado. |
| `option_id` | Alternativa | string | Alternativa presentada. |
| `option_text` | Texto alternativa | string | Texto completo de la alternativa. |
| `selected` | Seleccionada | boolean | `true` solo para la alternativa elegida. |
| `is_decision` | Es decisión | boolean | Permite excluir botones `NEXT` del scoring. |
| `tag_type` | Tipo etiqueta | string/null | Modelo o competencia medida. |
| `tag_value` | Etiqueta | string/null | Variable específica medida. |
| `tag_score` | Puntaje etiqueta | number/null | Puntaje asociado a la alternativa. |
| `hover_total_ms` | Hover total | number/null | Tiempo total del cursor sobre esa alternativa. |
| `hover_count` | Veces hover | number/null | Cantidad de entradas del cursor a esa alternativa. |
| `was_first_hovered` | Primera vista | boolean/null | Indica si fue la primera alternativa explorada. |
| `was_last_hovered` | Última vista | boolean/null | Indica si fue la última alternativa explorada antes de decidir. |
| `expected_action` | Tiene acción esperada | boolean | Indica si elegir esa alternativa generó un compromiso. |
| `expected_action_id` | Acción esperada | string/null | Compromiso asociado a la alternativa seleccionada. |
| `mechanic_id` | Mecánica | string/null | Mecánica responsable del compromiso. |
| `action_type` | Tipo acción | string/null | Tipo de conducta esperada o ejecutada. |
| `target_ref` | Objetivo | string/null | Objetivo de la acción. |
| `outcome` | Cumplió | boolean/null | Resultado de la comparación expected vs canonical. |
| `reason` | Motivo | string/null | Motivo del fallo cuando `outcome = false`. |
| `canonical_action_id` | Acción real | string/null | Acción canónica asociada, si existe. |
| `raw_value_final` | Valor final crudo | json/null | Detalle autocontenido de la acción real. |
| `raw_context` | Contexto crudo | json/null | Contexto técnico adicional. |

Uso en el pipeline:

1. Las tablas largas guardan datos crudos.
2. `user_behaviour_analysis` une esos datos en una tabla legible por alternativa.
3. El dataframe final agrega esta tabla a una fila por usuario, por ejemplo sumando puntajes por `tag_type + tag_value`, tasas de cumplimiento, tiempos de deliberación y uso de información.

## 5.1. Contrato Para `raw_value_final`

Cada mecánica debe ser responsable de exportar su propio detalle analítico dentro de `value_final`. El backend lo conserva como `raw_value_final` en la tabla de acciones canónicas.

La regla simple es: las columnas generales (`mechanic_id`, `action_type`, `target_ref`, `target_type`, `target_id`, `day`, `time_slot`, `committed_at_ms`) permiten filtrar y unir datos. `raw_value_final` conserva solo el detalle específico de la mecánica.

Campos comunes recomendados en la raíz de cada acción canónica:

| Nombre en código | Título corto | Tipo | Uso analítico |
|---|---|---|---|
| `target_type` | Tipo objetivo | string | Clasifica el objeto afectado: `npc`, `email`, `document`, `schedule`, `case_resolution`, etc. |
| `target_id` | ID objetivo | string/null | Identificador limpio del objetivo, sin prefijo. Ejemplo: `email-001-welcome`. |
| `target_label` | Nombre objetivo | string/null | Nombre legible del objetivo, por ejemplo asunto del correo o nombre del NPC. |
| `day` | Día objetivo | number/null | Día al que apunta la acción, si aplica. |
| `time_slot` | Bloque objetivo | string/null | Bloque al que apunta la acción, si aplica. |
| `committed_day` | Día ejecución | number/null | Día en que el usuario realizó la acción. |
| `committed_time_slot` | Bloque ejecución | string/null | Bloque en que el usuario realizó la acción. |
| `source_node_id` | Nodo origen | string/null | Nodo que gatilló la acción, si aplica. |
| `source_option_id` | Opción origen | string/null | Opción que gatilló la acción, si aplica. |
| `summary` | Resumen acción | string/null | Texto corto legible para auditoría. |
| `value_final` | Payload mecánica | json | Detalle propio de la mecánica. |

Regla de limpieza: los campos específicos de cada mecánica no deben repetirse en la raíz de la acción canónica. Por ejemplo, en correos `email_id`, `opened_count`, `read_duration_ms` y `reopened` deben ir dentro de `value_final`, no al mismo nivel que `target_type`.

Ejemplos:

- Mapa: `value_final` puede incluir `origin_room`, `destination_room`, `npc_id`, `npc_role`, `sector_id`, `location_sector`, `available_proactive_meeting`, `arrived_at_ms`.
- Correos: `value_final` puede incluir `email_id`, `subject`, `from`, `opened_count`, `read_duration_ms`, `reopened`.
- Documentos: `value_final` puede incluir `document_id`, `title`, `content_length`, `read_duration_ms`, `scroll_depth`.
- Planificación: `value_final` puede incluir `week_schedule`, `assignment_count`, `conflict_count`, `load_summary`.

Esto mantiene la base simple: una tabla general de acciones canónicas, columnas comunes para análisis transversal y JSON autocontenido solo donde la mecánica necesita flexibilidad.

## 5.2. Tablas Detalle Por Mecánica

Cuando una mecánica genera datos con columnas estables y repetibles, el backend puede extraerlos desde `raw_value_final` y guardarlos en una tabla detalle. La mayoría de estas tablas dependen de `canonical_actions` por `canonical_action_id`. Las tablas de telemetría agregada del mapa (`map_hover_stats`, `map_block_latency`) son una excepción: derivan de `mechanic_events` (hover y entrada al mapa), no de una acción canónica.

### `map_action_details`

Click-stream de visitas: **una fila por visita** (acción canónica `visit_stakeholder`). Base para orden de atención, amplitud, equidad por sector y % de visitas proactivas.

| Nombre en código | Título corto | Tipo | Uso analítico |
|---|---|---|---|
| `canonical_action_id` | Acción real | string | Une el detalle con `canonical_actions`. |
| `session_id` | Sesión | string | Une con la sesión. |
| `user_id` | Usuario | string | Participante (denormalizado). |
| `origin_room` | Sala origen | string/null | Lugar desde donde partió el desplazamiento. |
| `destination_room` | Sala destino | string | Sala/NPC visitado. |
| `npc_id` | NPC visitado | string | NPC asociado a la visita. |
| `npc_role` | Rol NPC | string/null | Rol del funcionario visitado. |
| `sector_id` | Sector | string/null | Sector del funcionario o sala (Azul, Rojo, Amarillo). |
| `day` | Día | number/null | Día simulado de la visita. |
| `time_slot` | Bloque horario | string/null | Bloque de la visita. |
| `available_proactive_meeting` | Reunión proactiva disponible | boolean/null | Si había una reunión proactiva disponible con ese NPC al momento de visitarlo. |
| `arrived_at_ms` | Tiempo llegada | number/null | Timestamp del click/visita. |
| `visit_order` | Orden visita | number/null | Secuencia de la visita dentro de la sesión, ordenada por `arrived_at_ms`. |

### `map_hover_stats`

Telemetría de consideración en el mapa, derivada de los eventos de hover (no de `canonical_actions`): **una fila por `session_id + day + time_slot + npc_id`**. Mide a quién consideró el director antes de elegir, incluida la consideración sin acción (hovereó pero no visitó). Conteo robusto: un hover por entrada desde "no abierto".

| Nombre en código | Título corto | Tipo | Uso analítico |
|---|---|---|---|
| `session_id` | Sesión | string | Une con la sesión. |
| `user_id` | Usuario | string | Participante (denormalizado). |
| `day` | Día | number | Día simulado. |
| `time_slot` | Bloque horario | string | Bloque simulado. |
| `npc_id` | NPC | string | Funcionario sobre el que se pasó el cursor. |
| `hover_count` | Veces hover | number | Cuántas veces consideró a ese NPC en el bloque. |
| `hover_total_ms` | Hover total | number | Tiempo total del cursor sobre ese NPC en el bloque. |
| `was_visited` | Terminó visitándolo | boolean | `true` si ese NPC terminó siendo visitado en ese bloque. |

### `map_block_latency`

Latencia de decisión por bloque en el mapa, derivada de los eventos del mapa: **una fila por `session_id + day + time_slot`**. Mide deliberación al inicio del bloque.

| Nombre en código | Título corto | Tipo | Uso analítico |
|---|---|---|---|
| `session_id` | Sesión | string | Une con la sesión. |
| `user_id` | Usuario | string | Participante (denormalizado). |
| `day` | Día | number | Día simulado. |
| `time_slot` | Bloque horario | string | Bloque simulado. |
| `block_entered_ms` | Entrada al mapa | number/null | Timestamp en que se abrió el mapa en ese bloque (el primero si se reabrió). |
| `first_click_ms` | Primer click | number/null | Timestamp del primer click sobre un NPC en el bloque. |
| `ms_to_first_click` | Latencia primer click | number/null | Tiempo desde que se abrió el mapa hasta el primer click. |
| `visit_count` | Visitas en el bloque | number | Cantidad de visitas realizadas en ese bloque. |

### `email_action_details`

| Nombre en código | Título corto | Tipo | Uso analítico |
|---|---|---|---|
| `canonical_action_id` | Acción real | string | Une el detalle con `canonical_actions`. |
| `email_id` | Correo | string | Correo abierto o leído. |
| `opened_count` | Veces abierto | number | Número acumulado de aperturas del correo durante la sesión. |
| `read_duration_ms` | Tiempo lectura | number | Tiempo que el correo estuvo abierto. |
| `reopened` | Reabierto | boolean | Indica si el usuario volvió a abrir un correo ya visto. |

### `document_action_details`

| Nombre en código | Título corto | Tipo | Uso analítico |
|---|---|---|---|
| `canonical_action_id` | Acción real | string | Une el detalle con `canonical_actions`. |
| `document_id` | Documento | string | Documento abierto o leído. |
| `read_duration_ms` | Tiempo lectura | number | Tiempo que el documento estuvo abierto. |
| `scroll_depth` | Profundidad scroll | number | Porcentaje máximo de scroll alcanzado, de 0 a 100. |

### `scheduler_action_details`

| Nombre en código | Título corto | Tipo | Uso analítico |
|---|---|---|---|
| `canonical_action_id` | Acción real | string | Une el detalle con `canonical_actions`. |
| `schedule_scope` | Alcance agenda | string | Indica si la planificacion corresponde a una semana, dia u otro alcance. |
| `week_schedule` | Agenda semanal | json estructurado | Lista de asignaciones con `staff_id`, `day`, `block`, `activity` y `room_id`. |
| `assignment_count` | Asignaciones | number | Cantidad total de asignaciones enviadas. |
| `conflict_count` | Conflictos | number | Cantidad de conflictos fisicos detectados. |
| `conflicts` | Detalle conflictos | json estructurado | Lista de conflictos con sala, bloque, dia y funcionarios involucrados. |
| `load_summary` | Carga funcionarios | json estructurado | Resumen por funcionario con horas asignadas, bloques por actividad y sobre/subcarga. |
| `submitted_at_ms` | Tiempo envio | number | Timestamp en que se envio la planificacion. |

## 6. Post-Procesamiento De Datos

Estas variables se calculan después del preprocesamiento. No son datos crudos, sino indicadores derivados para análisis por usuario.

Estas features permiten construir el dataframe ancho, con una fila por usuario. Son útiles para análisis factorial, correlaciones con MLQ-5X, clustering, regresiones y modelos predictivos.

| Nombre en código | Título corto | Tipo | Uso analítico |
|---|---|---|---|
| `user_id` | Usuario | string | Unidad final de análisis. |
| `session_id` | Sesión | string | Sesión analizada. |
| `version_id` | Versión | string | Versión aplicada. |
| `total_decisions` | Total decisiones | number | Decisiones reales, excluyendo `NEXT`. |
| `total_next_events` | Total NEXT | number | Avances narrativos excluidos del scoring. |
| `avg_decision_time_ms` | Tiempo promedio decisión | number | Promedio de duración por decisión. |
| `median_decision_time_ms` | Mediana decisión | number | Mediana de duración por decisión. |
| `total_hover_count` | Total hovers | number | Cantidad total de hovers. |
| `avg_hover_switch_count` | Cambios promedio | number | Promedio de cambios entre opciones. |
| `avg_selected_option_hover_ms` | Hover promedio elegida | number | Tiempo promedio sobre opción elegida. |
| `info_review_count` | Información revisada | number | Total de correos, documentos y preguntas revisadas. |
| `documents_read_count` | Documentos leídos | number | Cantidad de documentos leídos. |
| `emails_read_count` | Correos leídos | number | Cantidad de correos leídos. |
| `questions_asked_count` | Preguntas realizadas | number | Cantidad de preguntas hechas a NPCs. |
| `expected_action_count` | Compromisos creados | number | Total de acciones esperadas creadas. |
| `completed_expected_action_count` | Compromisos cumplidos | number | Acciones esperadas cumplidas. |
| `failed_expected_action_count` | Compromisos fallidos | number | Acciones esperadas no cumplidas. |
| `promise_completion_rate` | Tasa cumplimiento | number | Proporción de compromisos cumplidos. |
| `late_count` | Cumplimientos tardíos | number | Cantidad de razones `late`. |
| `wrong_time_count` | Fallos horario | number | Cantidad de fallos por tiempo. |
| `wrong_npc_count` | Fallos NPC | number | Cantidad de fallos por NPC incorrecto. |
| `wrong_resource_count` | Fallos recurso | number | Cantidad de fallos por recurso incorrecto. |
| `mlq_idealized_influence_score` | Influencia idealizada | number | Suma o promedio de tags MLQ asociados. |
| `mlq_inspirational_motivation_score` | Motivación inspiradora | number | Suma o promedio de tags MLQ asociados. |
| `mlq_intellectual_stimulation_score` | Estimulación intelectual | number | Suma o promedio de tags MLQ asociados. |
| `mlq_individualized_consideration_score` | Consideración individual | number | Suma o promedio de tags MLQ asociados. |
| `mlq_contingent_reward_score` | Recompensa contingente | number | Suma o promedio si se mide liderazgo transaccional. |
| `mlq_management_by_exception_score` | Gestión por excepción | number | Suma o promedio si se mide esa dimensión. |
| `ethical_reasoning_score` | Razonamiento ético | number | Puntaje derivado si se usan tags Kohlberg. |
| `consistency_score` | Consistencia | number | Indicador de coherencia promesa/acción. |
| `deliberation_score` | Deliberación | number | Indicador exploratorio basado en tiempo y hover. |
| `information_seeking_score` | Búsqueda información | number | Indicador de revisión de información antes de decidir. |
| `final_reputation` | Reputación final | number | Resultado global final. |
| `final_project_progress` | Progreso final | number | Resultado global final. |

## 7. Reglas De Calidad

- Toda columna analítica debe contener un solo valor atómico cuando sea posible.
- El JSON queda permitido como respaldo, especialmente en columnas `raw_*`.
- Los datos crudos no deben sobrescribirse por datos procesados.
- Las decisiones `NEXT` deben registrarse, pero excluirse del scoring principal mediante `is_decision = false`.
- Las comparaciones deben usar `outcome` booleano y `reason` para explicar el motivo del fallo.
- Los datos agregados por usuario deben calcularse desde las tablas largas, no escribirse manualmente durante la simulación.
- Los tags de competencias deben vivir en las alternativas de escenario, no en el pipeline.
- El pipeline solo agrega lo que el escenario ya declaró como variable medida.
- Cada mecánica debe exportar en `value_final` los datos necesarios para interpretar su acción canónica sin depender de lógica externa.

## 8. Formato Modular De Tags

Cada alternativa puede declarar tags con esta forma:

```ts
tags: [
  {
    tag_type: 'MLQ_5X',
    tag_value: 'inspirational_motivation',
    tag_score: 4
  }
]
```

Para agregar una nueva competencia o modelo teórico:

1. Definir `tag_type`, por ejemplo `KOHLBERG`, `BIG_FIVE` o `SEGURIDAD_CLINICA`.
2. Definir `tag_value`, por ejemplo `orientacion_etica`, `responsabilidad` o `adherencia_protocolo`.
3. Asignar `tag_score` en cada alternativa.
4. El pipeline agrega por `tag_type + tag_value` sin cambiar la estructura base.
