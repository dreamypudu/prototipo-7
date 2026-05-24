PROTOTIPO-7 - COMPASS
====================================================

Resumen
-------
Este proyecto es un simulador modular para capturar decisiones explicitas
y acciones implícitas (mecánicas), con export de sesión para análisis
psicometrico, estadistico y ML. La comparacion "dijo vs hizo" se resuelve
con ExpectedAction (desde escenarios) y CanonicalAction (desde mecánicas).


Estructura general (frontend)
-----------------------------
Raiz del front:
- App.tsx
  Launcher inicial: seleccion de version y render del simulador elegido.
- versions/cesfam/GestionEnSalud_App.tsx
  Orquestador de Gestion en Salud/CESFAM.
- versions/innovatec/Innovatec_App.tsx
  Orquestador de la version Innovatec.
- types.ts
  Tipos base del simulador (GameState, Scenario, Expected/Canonical, etc).
- constants.ts
  Constantes generales (time slots, objetivos, etc).
- hooks/useMechanicLogSync.ts
  Sincroniza el buffer del motor con el estado de React.

Mecanicas (modularidad):
- mechanics/registry.ts
  Catálogo global de mecánicas disponibles (tab_id, label, Module y reglas asociadas).
- mechanics/MechanicContext.tsx
  Contexto para compartir gameState, engine, dispatch y office state.
- mechanics/modules/*
  Implementaciones de mecánicas (Office, Map, Email, Schedule, Documents,
  ExperimentalMap, DataExport, etc). Cada una es un modulo enchufable.
- mechanics/<mechanic_id>/components/*
  Componentes visuales propios de cada mecanica. Si un visual se comparte
  entre mecánicas, vive en mechanics/shared/components.
- mechanics/<mechanic_id>/services/*
  Servicios propios de cada mecanica, como triggers de inbox, conflictos del
  scheduler o reglas auxiliares del mapa.

Componentes UI:
- components/*
  UI global de la aplicacion (Header, Sidebar, SplashScreen, modales y
  controles compartidos fuera de las mecánicas).

Datos y escenarios:
- data/versions/*
  Contenido versionado por simulador: escenarios, stakeholders, preguntas, correos, documentos, casos y defaults.
- versions/*/configuration.ts
  Configuración por version (mecánicas activas y metadata del simulador).
- versions/*/services/*
  Reglas y resoluciones propias de una version concreta. Por ejemplo,
  CESFAM guarda aqui timing de agenda, resolución del caso 1, efectos globales
  y day review.

Servicios del simulador:
- services/MechanicEngine.ts
  Buffer de MechanicEvent, CanonicalAction y ExpectedAction.
- services/ComparisonEngine.ts
  Motor de comparacion expected vs canonical.
- services/sessionExport.ts
  Construye el paquete de sesión para export y backend.
- services/Timelogger.ts
  Log de tiempos de decision (procesos).
- services/commitments_text_generator.ts
  Genera textos de compromisos desde ExpectedAction. Puede recibir templates
  externos para que las mecánicas sobreescriban textos sin tocar el motor.


Arquitectura de datos (psicometria)
-----------------------------------
1) Decision explicita -> ExpectedAction
   Se registra desde un nodo de escenario.

2) Accion implicita -> CanonicalAction
   Se emite desde la mecanica cuando el usuario realiza la acción.

3) Comparacion
   Se hace en frontend con ComparisonEngine, usando action_type + target_ref + mechanic_id y reglas asociadas a la mecanica.

4) Export
   Se genera session_export.json con:
   - decisiones explicitas
   - expected actions
   - canonical actions
   - events log (mecánicas)
   - comparaciones


Backend
-------
Carpeta: backend/
- main.py
  API FastAPI (recibe sesiones y normaliza datos).
- requirements.txt
  Dependencias del backend.
- rebuild_db.py
  Utilidad de mantenimiento/normalización.


Notas de modularidad
--------------------
- Las mecánicas se activan por config en versions/*/configuration.ts.
- El front renderiza solo mecánicas registradas en el registry.
- Cada mecanica es un modulo independiente, con su propio UI y eventos.
- La comparacion frontend vive en services/ComparisonEngine.ts, que orquesta reglas registradas por mecanica.


Salida de datos (archivos locales de ejemplo)
---------------------------------------------
- expected_actions.json
- canonical_actions.json
- mechanic_events.json
- explicit_decisions.json
- session_export.json

Formatos JSON por mecanica
--------------------------
Formato base:
- MechanicEvent: { event_id, mechanic_id, event_type, timestamp, payload }
- CanonicalAction: { canonical_action_id, mechanic_id, action_type, target_ref, value_final, committed_at, context? }
- ExpectedAction: { expected_action_id, source{node_id, option_id}, mechanic_id?, action_type, target_ref, constraints?, rule_id, created_at }

Mecanicas y payloads:
- map
  - event: staff_clicked -> { staff_id, location_id, day, time_slot }
  - canonical: visit_stakeholder -> target_ref stakeholder:{id}, value_final { day, time_slot, location_id, arrived_at }
- inbox (email)
  - event: read_email -> { email_id, day, time_slot }
  - canonical: read_email -> target_ref email:{email_id}, value_final { email_id, day, time_slot, read_at }
- documents
  - event: read_document -> { doc_id, day, time_slot }
  - canonical: read_document -> target_ref doc:{doc_id}, value_final { doc_id, day, time_slot, read_at }
- scheduler
  - event: schedule_updated -> { assignment_count }
  - canonical: execute_week -> target_ref global, value_final { week_schedule: [{ staff_id, day, block, activity, room_id }] }, context { day, time_slot }
- calendar (innovatec)
  - event: meeting_scheduled -> { stakeholder_id, day, time_slot }
  - canonical: schedule_meeting -> target_ref stakeholder:{id}, value_final { day, time_slot, scheduled_at }
- office
  - event: notes_updated -> { notes_length }
  - event: phone_call -> { stakeholder_id }
- dialogue
  - event: scenario_presented -> { node_id }
  - event: decision_made -> { node_id, option_id }

Expected actions por mecanica (ejemplos):
- map: action_type visit_stakeholder, target_ref stakeholder:{id}
- scheduler: action_type execute_week, target_ref global, constraints con rule_id



Sugerencias de extension
------------------------
- Agregar una mecanica: crear modulo, registrar en registry, activar en config.
- Agregar expected actions: definirlas en escenarios con mechanic_id.
- Agregar reglas de comparacion: definirlas dentro de la mecanica correspondiente y registrarlas en mechanics/registry.ts.
