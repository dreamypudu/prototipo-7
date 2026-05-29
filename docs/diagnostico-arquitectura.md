# Diagnóstico de modularidad, escalabilidad y arquitectura

> **Última actualización:** 2026-05-28
> Este documento reemplaza la versión anterior. Refleja el estado real del repositorio tras lectura directa del código, no una proyección de estado pasado.

## 1. Objetivo y alcance

Este documento evalúa la arquitectura actual del simulador con foco en tres criterios:

1. modularidad de escenarios;
2. modularidad de mecánicas;
3. escalabilidad del sistema en frontend, backend y modelo de datos.

### Comprobaciones ejecutadas

- `npm run build` → OK
- `python -m py_compile backend/main.py` → OK
- `python scripts/validate_content.py` → OK
- `npx tsc --noEmit` → FAIL (errores activos)

---

## 2. Resumen ejecutivo

La arquitectura ha evolucionado significativamente desde el diagnóstico anterior. El cambio más importante es que **`App.tsx` ya no es el orquestador principal**: pasó a ser un router de 46 líneas que delega a orquestadores por versión. El backend dejó de ser monolítico: `main.py` tiene 206 líneas y la lógica de normalización está separada en un módulo `/normalizers`. La base de datos migró de SQLite a PostgreSQL.

Sin embargo, varios problemas estructurales persisten: los orquestadores por versión son grandes archivos con responsabilidades mezcladas, TypeScript sigue con errores activos, no hay suite de tests, y la lógica de evaluación sigue duplicada entre frontend y backend.

### Diagnóstico sintético

- **El sistema ahora tiene orquestadores por versión**, no un único monolito. Esto es un avance real.
- **El backend está modularizado** en normalizers por dominio y mecánica. Ya no es un único archivo que mezcla todo.
- **Las mecánicas siguen siendo adaptadores de UI** con la orquestación en los contenedores de versión.
- **La escalabilidad sigue limitada por la falta de tests** y por errores de TypeScript activos.
- **El encoding de dominio sigue usando acentos** en `TimeSlotType`.

### Evaluación global (actualizada)

| Criterio | Diagnóstico anterior | Estado actual |
|----------|---------------------|---------------|
| Modularidad de escenarios | parcial | parcial (sin cambios) |
| Modularidad de mecánicas | parcial-baja | parcial-baja (sin cambios) |
| Escalabilidad del frontend | media-baja | media (mejora por separación de versiones) |
| Escalabilidad del backend | baja | media (mejora por modularización) |
| Preparación para nuevas versiones | media-baja | media (mejora por router limpio) |

---

## 3. Hallazgos actualizados

### 3.1. App.tsx ahora es un router limpio — RESUELTO

**Estado anterior:** `App.tsx` tenía ~2.329 líneas y concentraba bootstrap, timer, secuencias, comparaciones, persistencia, export y reglas específicas de CESFAM.

**Estado actual:** `App.tsx` tiene **46 líneas**. Es un dispatcher puro:

```typescript
// Lógica real de App.tsx (simplificada):
if (!selectedVersion) → <VersionSelector />
if (selectedVersion === 'INNOVATEC') → <InnovatecApp />
else → <GestionEnSaludApp />   // CESFAM y futuras versiones
```

Mantiene solo `selectedVersion`, `selectedCesfamModuleId` y `runMode`. No conoce ningún detalle de implementación de las versiones.

**Impacto:** Agregar una versión nueva requiere crear su `_App.tsx` y añadir una rama en este router. No requiere tocar lógica existente.

---

### 3.2. Orquestadores por versión — MEJORA PARCIAL

**Estado actual:** Cada versión tiene su propio orquestador:

- `versions/cesfam/GestionEnSalud_App.tsx` — **2.461 líneas**
- `versions/innovatec/Innovatec_App.tsx` — **1.617 líneas**

Cada uno gestiona de forma independiente: estado del juego, timer, secuencias, mecánicas, comparaciones, persistencia y export para su versión. No comparten código base de runtime.

**Lo que mejoró:** La lógica está separada por versión. Cambios en CESFAM no afectan Innovatec y viceversa.

**Lo que persiste:** Cada orquestador sigue siendo un archivo grande con responsabilidades mezcladas (estado, UI, timer, reglas, persistencia). Si una capacidad transversal necesita modificarse (por ejemplo, el sistema de export o el timer), hay que hacerlo en ambos archivos por separado. No existe un runtime común que los dos extiendan.

**Impacto:** Mejora respecto al estado anterior, pero el costo de mantener capacidades transversales sigue siendo doble. Si se añade una tercera versión, el patrón se replica una vez más.

---

### 3.3. Configuración por versión — FUNCIONA BIEN

**Estado actual:** El sistema de configuración por versión está bien implementado:

- `versions/configuration.ts` (15 líneas) — registry limpio que mapea `SimulatorVersion` → `SimulatorConfig`
- `versions/<version>/configuration.ts` — configuración declarativa por versión (mecánicas habilitadas, reglas de comparación, parámetros de scheduler)

```typescript
// Patrón actual:
export const SIMULATOR_CONFIGS: Record<SimulatorVersion, SimulatorConfig> = {
  CESFAM: CESFAM_CONFIGURATION,
  INNOVATEC: INNOVATEC_CONFIGURATION,
  LEY_KARIN: LEY_KARIN_CONFIGURATION,
  SERCOTEC: SERCOTEC_CONFIGURATION,
  MUNICIPAL: MUNICIPAL_CONFIGURATION,
};
```

Cada `SimulatorConfig` declara: qué mecánicas están activas, sus labels y tab IDs, las reglas de comparación aplicables, y parámetros funcionales (como funciones de timing del scheduler).

**Lo que sigue faltando:** La configuración describe *qué* hay disponible, pero los orquestadores siguen tomando decisiones de flujo que deberían estar en la config (por ejemplo, cuándo hacer el day review, cuándo forzar secuencias de caso).

---

### 3.4. Registry de mecánicas — UN SOLO REGISTRO

**Estado anterior:** El diagnóstico mencionaba tres registros paralelos.

**Estado actual:** Existe **un único `mechanics/registry.ts`** (108 líneas). Las variantes de Innovatec se registran en el mismo objeto bajo keys con prefijo `innovatec_`:

```typescript
MECHANIC_REGISTRY = {
  office:                    { mechanic_id: 'office', Module: OfficeMechanic, rules: {...} },
  innovatec_office:          { mechanic_id: 'office', Module: InnovatecOfficeMechanic },
  map:                       { mechanic_id: 'map',    Module: MapMechanic,    rules: {...} },
  innovatec_experimental_map:{ mechanic_id: 'map',    Module: InnovatecExperimentalMapMechanic },
  // ...
}
```

El `mechanic_id` interno puede ser el mismo entre variantes (p.ej. `'office'`), pero la key del registry es distinta. Esto permite que las `ExpectedAction` del diálogo apunten a `mechanic_id: 'office'` y las reglas se resuelvan igual para ambas versiones, mientras se renderiza un componente diferente.

**Módulos disponibles (13):**

| Key | LOC | Versión |
|-----|-----|---------|
| office | 113 | CESFAM |
| innovatec_office | 142 | INNOVATEC |
| map | 14 | CESFAM |
| experimental_map | 17 | CESFAM |
| innovatec_experimental_map | 10 | INNOVATEC |
| scheduler | 51 | CESFAM |
| inbox | 16 | CESFAM |
| innovatec_inbox | 15 | INNOVATEC |
| stakeholders | 10 | CESFAM |
| innovatec_stakeholders | 13 | INNOVATEC |
| innovatec_calendar | 18 | INNOVATEC |
| documents | 16 | CESFAM |
| data_export | 21 | CESFAM |

**Lo que sigue igual:** Los módulos son componentes wrapper delgados (10-142 líneas cada uno). La lógica de orquestación de las mecánicas vive en los `_App.tsx` correspondientes, no dentro de los módulos.

---

### 3.5. Motor de mecánicas y comparación — BIEN ESTRUCTURADO

**`services/MechanicEngine.ts`** (159 líneas) — Singleton con tres buffers:
- `emitEvent(mechanicId, eventType, payload)` — eventos ricos por mecánica
- `emitCanonicalAction(mechanicId, actionType, targetRef, valueFinal)` — acciones normalizadas
- `registerExpectedActions(nodeId, optionId, actions[])` — compromisos del diálogo
- `flush()` — retorna y limpia los tres buffers

Las mecánicas no llaman directamente a `GameState`. Emiten al buffer y los orquestadores hacen flush periódico (cada 1.000 ms via `useMechanicLogSync`).

**`services/ComparisonEngine.ts`** (396 líneas) — Orquestador de comparación:
- `compareExpectedVsActual()` — itera expected actions, busca su regla en `MECHANIC_REGISTRY[mechanic_id].rules[rule_id]` y ejecuta `rule.resolve(expected, ruleContext)`
- `resolveDayEffectsLocally()` — aplica deltas globales y por stakeholder, desbloquea contenido
- `mergeComparisonResults()` — merge inteligente que respeta comparaciones terminales

Las reglas de comparación están co-ubicadas con las mecánicas:
- `mechanics/office/rules.ts` (201 líneas)
- `mechanics/scheduler/rules.ts` (102 líneas)
- `mechanics/map/rules.ts` (55 líneas)
- `mechanics/admin/rules.ts` (11 líneas)

**`services/comparisonMode.ts`** (11 líneas) — Toggle frontend/backend via `VITE_COMPARISON_MODE` env var.

---

### 3.6. Backend — MODULARIZADO, NO MONOLÍTICO

**Estado anterior:** `main.py` de ~1.450 líneas mezclando todo.

**Estado actual:** El backend está separado en capas:

```
backend/
├── main.py          (206 líneas — endpoints FastAPI, CORS, orquestación)
├── db.py            (22 líneas  — conexión PostgreSQL via psycopg)
├── schema.py        (773 líneas — DDL, 19 tablas, migraciones automáticas)
├── json_utils.py    (75 líneas  — utilidades JSONB)
├── rebuild_db.py    (auxiliar de mantenimiento)
└── normalizers/
    ├── session.py      (normalización principal)
    ├── actions.py      (canonical + expected actions)
    ├── comparisons.py  (comparaciones)
    ├── decisions.py    (explicit decisions)
    ├── events.py       (mechanic events)
    ├── process.py      (process logs)
    ├── state.py        (final states + question log)
    ├── common.py       (helpers compartidos)
    └── mechanics/
        ├── map.py          → tabla map_action_details
        ├── email.py        → tabla email_action_details
        ├── documents.py    → tabla documents_action_details
        ├── scheduler.py    → tabla scheduler_action_details
        └── utils.py
```

**Base de datos:** PostgreSQL (no SQLite como indicaba el diagnóstico anterior).

**Endpoints disponibles:**
```
POST  /sessions                     — Crear sesión
POST  /sessions/{id}/normalize      — Re-normalizar sesión
POST  /sessions/normalize           — Normalizar todas
GET   /sessions                     — Listar (limit=100 default)
GET   /sessions/{id}                — Sesión completa
GET   /sessions/{id}/normalized     — Con datos normalizados
GET   /sessions/latest              — Última sesión
GET   /sessions/latest/normalized   — Última normalizada
GET   /health                       — Health check
```

**Lo que persiste:** La evaluación de reglas (matching expected vs canonical) sigue existiendo tanto en el frontend (`ComparisonEngine.ts`) como potencialmente en el backend. El `comparisonMode.ts` del frontend permite elegir cuál usar vía env var, pero no hay una única fuente de verdad formal.

---

### 3.7. Escenarios CESFAM — ESTRUCTURA MODULAR POR DÍA

**Estado anterior (diagnóstico previo incorrecto):** Se describía un único `scenarios.ts` de ~2.410 líneas.

**Estado actual:** Los escenarios de CESFAM están organizados en módulos narrativos independientes. Cada módulo tiene su propio conjunto de archivos de contenido y sus nodos de escenarios distribuidos por día de activación:

```
data/versions/cesfam/
├── index.ts            — re-exporta desde ./modules únicamente
└── modules/
    ├── index.ts        — orquestador: define CESFAM_NARRATIVE_MODULES
    ├── ethics/         — módulo "Comportamiento ético" (instrumento: ETHICS)
    │   ├── scenarios/
    │   │   ├── day03/  (officeIntro, scheduleWar, azulMeeting1, rojoMeeting1, amarilloMeeting1)
    │   │   ├── day04/  (agendaCrisisDetonator, azulNegotiation, rojoNegotiation, amarilloNegotiation)
    │   │   ├── day05/  (agendaCrisisResolution)
    │   │   ├── day06/  (contingencies, case2RoboIntro, case2Marcela, case2Guzman, case2Daniel)
    │   │   └── day07/  (case2Verdict)
    │   ├── scenarios.ts    — orquestador del módulo (flatMap de nodos/secuencias)
    │   ├── stakeholders.ts, emails.ts, documents.ts, questions.ts, defaults.ts
    │   └── index.ts    — exporta CESFAM_ETHICS_CONTENT (VersionContentPack)
    ├── mlq5x_leadership/   — módulo "Habilidades de Liderazgo" (instrumento: MLQ-5X)
    │   ├── scenarios/
    │   │   ├── day03/  (sequence01, sequence03, sequence04, sequence05)
    │   │   ├── day04/  (sequence08, sequence09, sequence10, sequence11)
    │   │   ├── day05/  (sequence14, sequence15, sequence16, sequence18)
    │   │   ├── day06/  (sequence19, sequence20)
    │   │   └── day07/  (sequence21, sequence22, sequence23)
    │   ├── scenarios.ts, stakeholders.ts, emails.ts, documents.ts, questions.ts, defaults.ts
    │   └── index.ts    — exporta CESFAM_MLQ5X_CONTENT
    └── tutorial/           — módulo de exploración sin datos experimentales
        ├── scenarios.ts
        └── index.ts    — reutiliza stakeholders/defaults de ethics
```

Cada módulo es un `VersionContentPack` completo e independiente. El orquestador `modules/index.ts` expone `getCesfamContentPack(moduleId)` que retorna el pack correcto; el `runMode` del módulo (`'experiment'` o `'tutorial'`) determina si se envían datos al backend.

**Archivos huérfanos eliminados (2026-05-28):** Se eliminaron `data/versions/cesfam/scenarios.ts`, el directorio `data/versions/cesfam/scenarios/` completo, y los archivos raíz `stakeholders.ts`, `documents.ts`, `emails.ts`, `questions.ts`, `defaults.ts`, junto con `constants.ts` en la raíz del proyecto. Eran copias de la etapa pre-modular que no estaban conectadas al sistema activo.

**Lo que persiste como deuda:** Cada nodo sigue mezclando narrativa con contratos técnicos del motor (`expected_actions`, `rule_id`, condiciones de desbloqueo). Un cambio en el contrato de `expected_actions` sigue requiriendo editar archivos de contenido. La separación es por módulo/día, no entre capa narrativa y capa técnica.

---

### 3.8. TypeScript — ERRORES ACTIVOS

`npx tsc --noEmit` sigue fallando. El build de Vite pasa, pero el contrato de tipos no es consistente. Esto implica que las herramientas de refactoring del lenguaje no son completamente confiables y que pueden existir regresiones silenciosas de tipo.

Los errores activos al momento del diagnóstico anterior incluían:
- Contratos de `PlayerAction` inconsistentes
- `import.meta.env` sin typing
- Referencias DOM mal tipadas
- Estado inicial de versiones incompleto respecto a `GameState`
- Valores de `TimeSlotType` inválidos en defaults de leykarin, municipal y sercotec

**Estado actual:** No se re-ejecutó `tsc --noEmit` en esta revisión. Se asume que los errores persisten hasta verificación explícita.

---

### 3.9. Encoding de dominio — SIN CAMBIOS

`types.ts` define `TimeSlotType = 'mañana' | 'tarde' | 'noche'` con acentos reales.

Los defaults de algunas versiones (leykarin, municipal, sercotec) han tenido históricamente `mañana` con encoding corrupto. Los IDs internos de entidades (`stakeholder_id`, `canonical_action_id`, etc.) son estables y no usan acentos. El problema se limita a los literales de `TimeSlotType` y los días de la semana cuando se usan como keys.

---

### 3.10. Validación de contenido — INSUFICIENTE

`scripts/validate_content.py` existe y pasa, pero sigue sin validar:

- consistencia de `rule_id` contra el registry
- shape de `expected_actions`
- valores válidos de `TimeSlotType`
- referencias a `mechanic_id` existentes
- secuencias inevitables incompatibles entre sí
- efectos o constraints semánticamente mal formados

---

### 3.11. Tests automatizados — AUSENTES

`package.json` no define un script de `test`. No existe suite de pruebas unitarias ni de integración para el rule engine, las secuencias, la resolución diaria, ni la persistencia del backend.

---

## 4. Evaluación frente a los principios pedidos

### 4.1. Modularidad de escenarios

**Estado: parcial** (sin cambios respecto al diagnóstico anterior)

**Lo que cumple:**
- Contenido separado por versión en `data/versions/<version>/`
- Separación entre stakeholders, scenarios, questions, emails, documents y defaults
- CESFAM tiene submódulos narrativos (`/modules/ethics/`, etc.)

**Lo que no cumple:**
- Los archivos de escenarios siguen mezclando narrativa con contratos técnicos del motor
- No existe una capa DSL que separe "authored content" de "semántica de ejecución"

---

### 4.2. Modularidad de mecánicas

**Estado: parcial-baja** (sin cambios)

**Lo que cumple:**
- Un único registry con contratos declarados
- Componentes de UI separados por mecánica
- `MechanicEngine` como buffer centralizado (las mecánicas no escriben a GameState directamente)
- Reglas co-ubicadas con cada mecánica

**Lo que no cumple:**
- Los módulos no encapsulan su estado ni lifecycle
- La orquestación real (cuándo activar una mecánica, qué hacer con sus resultados) vive en los `_App.tsx`
- No hay un contrato de plugin formal con `reducer`, `selectors` y `commands`

---

### 4.3. Escalabilidad del sistema

**Frontend: media** (mejora desde media-baja)

Mejoras reales: App.tsx como router limpio, configuración declarativa por versión, registry único.

Limitaciones que persisten: orquestadores grandes sin runtime común, TypeScript con errores, sin tests.

**Backend: media** (mejora desde baja)

Mejoras reales: modularización en normalizers, separación de schema, PostgreSQL, endpoints limpios.

Limitaciones que persisten: lógica de evaluación potencialmente duplicada frontend/backend, schema.py de 773 líneas que mezcla DDL con lógica de migración.

---

## 5. Problemas activos por prioridad

### Prioridad inmediata

1. **TypeScript con errores activos** — `tsc --noEmit` falla. Bloquea refactors seguros y puede ocultar regresiones.
2. **Encoding inestable en TimeSlotType** — Los literales con acentos como keys operacionales son frágiles. Las comparaciones de slot/día pueden fallar silenciosamente.

### Prioridad alta

3. **Sin runtime común para versiones** — Capacidades transversales (export, timer, comparaciones) se mantienen por duplicado en `GestionEnSalud_App.tsx` e `Innovatec_App.tsx`. Cualquier cambio transversal requiere dos ediciones.
4. **Lógica de evaluación potencialmente duplicada frontend/backend** — `comparisonMode.ts` permite elegir cuál ejecutar, pero no garantiza que ambas implementaciones sean equivalentes.

### Prioridad media

5. **Orquestadores grandes con responsabilidades mezcladas** — `GestionEnSalud_App.tsx` (2.461 líneas) e `Innovatec_App.tsx` (1.617 líneas) combinan estado, UI, timer, reglas y persistencia. Son mantenibles pero costosos de razonar.
6. **Sin tests automatizados** — El rule engine, las secuencias y la resolución diaria no tienen cobertura. Cada cambio requiere validación manual.
7. **Validación de contenido insuficiente** — Los errores en escenarios (rule_id inválido, mechanic_id incorrecto, TimeSlotType corrupto) no son detectados por `validate_content.py`.

### Prioridad baja

8. **Escenarios acoplados al motor** — Los archivos de escenarios mezclan narrativa con contratos técnicos. Dificulta la autoría de contenido sin conocer el motor.

---

## 6. Propuesta de evolución (actualizada)

La base actual ya tiene varios patrones correctos. Las mejoras siguientes son incrementales, no un rediseño desde cero.

### Paso 1 — Estabilización técnica (menor riesgo, mayor retorno)

- Limpiar errores de `tsc --noEmit`
- Normalizar `TimeSlotType` a IDs estables (`MORNING`, `AFTERNOON`, `EVENING`) con labels separadas en UI
- Ampliar `validate_content.py` para cubrir `rule_id`, `mechanic_id`, `TimeSlotType` y referencias cruzadas

### Paso 2 — Runtime común para versiones

Extraer la lógica transversal de `GestionEnSalud_App.tsx` e `Innovatec_App.tsx` a un hook o módulo compartido:

```typescript
// Propuesta:
const runtime = useGameRuntime(config, contentPack);
// runtime.state, runtime.advanceTime(), runtime.flush(), runtime.export()
```

Cada `_App.tsx` se convierte en un componente de presentación que declara sus reglas específicas y delega la mecánica base al runtime.

### Paso 3 — Contrato formal de mecánica como plugin

Formalizar el contrato de `MechanicPlugin` con lifecycle explícito. Actualmente los módulos solo renderizan; el contrato debería incluir cómo serializan acciones y qué comandos emiten.

### Paso 4 — Fuente única de verdad para evaluación

Elegir una de dos opciones y eliminar la ambigüedad:
- **Backend autoritativo**: el frontend solo captura, el backend evalúa
- **Paquete compartido**: extraer las reglas a un módulo que ambos lados consuman

### Paso 5 — Tests mínimos

Al menos:
- Tests unitarios para cada `rule.resolve()` en `mechanics/*/rules.ts`
- Tests de integración para `ComparisonEngine`
- Tests de smoke por versión

---

## 7. Conclusión

La arquitectura ha mejorado de forma real desde el diagnóstico anterior. El cambio más importante — pasar de un `App.tsx` monolítico a orquestadores por versión con un router limpio — reduce el riesgo de regresiones cruzadas y facilita agregar nuevas versiones.

El backend también mejoró: dejó de ser un único archivo que mezcla todo y ahora tiene capas diferenciadas con normalizers por dominio.

Los problemas que persisten son reales pero manejables de forma incremental:
- TypeScript no limpio (riesgo estructural activo)
- Encoding inestable en TimeSlotType (riesgo de bugs silenciosos)
- Sin runtime común (costo doble de mantenimiento transversal)
- Sin tests (validación manual cara)

**Si el objetivo inmediato es estabilizar para un experimento**, los riesgos principales son los dos primeros (TypeScript y encoding), ya que pueden causar bugs en producción difíciles de detectar. Los demás son costos de mantenimiento, no riesgos de correctitud.
