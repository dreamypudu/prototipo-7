# Diagnostico de modularidad, escalabilidad y arquitectura

## 1. Objetivo y alcance

Este documento evalua la arquitectura actual del simulador con foco en tres criterios:

1. modularidad de escenarios;
2. modularidad de mecánicas;
3. escalabilidad del sistema en frontend, backend y modelo de datos.

La revision se basa en inspeccion directa del repositorio, lectura de los modulos principales y verificacion técnica minima del estado actual.

### Comprobaciones ejecutadas

- `npm run build` -> OK
- `python -m py_compile backend/main.py backend/rebuild_db.py` -> OK
- `python scripts/validate_content.py` -> OK
- `npx tsc --noEmit` -> FAIL

La compilacion de Vite pasa, pero el chequeo estricto de TypeScript falla. Eso ya indica una brecha entre "funciona en runtime" y "el contrato del sistema es consistente".

---

## 2. Resumen ejecutivo

La base actual tiene una idea arquitectonica valida: separar contenido por version (`data/versions/*`), desacoplar mecánicas por registro (`mechanics/registry.ts`) y capturar eventos/acciones estandarizadas para comparacion y persistencia (`services/MechanicEngine.ts`).

El problema es que esa idea no se completa de forma consistente en la implementacion.

### Diagnostico sintetico

- **El sistema no esta realmente guiado por configuracion**. Existen content packs y registros de mecánicas, pero el flujo principal sigue gobernado por condicionales y reglas hardcodeadas en `App.tsx` y `games/InnovatecGame.tsx`.
- **Los escenarios no son plenamente modulares**. El contenido esta separado por archivo/version, pero sigue mezclando narrativa, reglas, UI, efectos y contratos tecnicos en archivos TS gigantes.
- **Las mecánicas no son plenamente modulares**. Los modulos de mecanica renderizan UI, pero la mayor parte de la orquestacion de estado, timing, transiciones y reglas sigue centralizada en el contenedor principal.
- **La escalabilidad esta comprometida por duplicacion y drift**. La logica se duplica entre frontend/backend, entre `App.tsx` e `InnovatecGame.tsx`, y entre tipos declarados y estructuras reales.
- **La calidad estructural esta por debajo de lo exigible para crecimiento sostenido**. Hay problemas de encoding, ausencia de tests automatizados y errores de TypeScript activos.

### Evaluacion global

- **Modularidad de escenarios:** parcial
- **Modularidad de mecánicas:** parcial-baja
- **Escalabilidad del frontend:** media-baja
- **Escalabilidad del backend:** baja
- **Preparacion para agregar nuevas versiones/casos:** media-baja

---

## 3. Hallazgos principales

## 3.1. Orquestacion principal excesivamente centralizada

### Evidencia

- `App.tsx` tiene aproximadamente **2329 lineas**.
- `games/InnovatecGame.tsx` tiene aproximadamente **1453 lineas**.
- `App.tsx` concentra responsabilidades heterogeneas:
  - bootstrap de version y content pack (`App.tsx:134`, `App.tsx:190`)
  - control de timer y avance de tiempo
  - manejo de reuniones y secuencias
  - comparacion expected/canonical (`App.tsx:311`)
  - aplicacion de resoluciones diarias (`App.tsx:790`, `App.tsx:957`)
  - persistencia y export (`App.tsx:1830`)
  - reglas especificas de CESFAM (`App.tsx:761`, `App.tsx:1085`, `App.tsx:1364`, `App.tsx:1651`)
  - enrutamiento manual de versiones (`App.tsx:2065`)

### Problema

El componente principal es simultaneamente:

- runtime del juego;
- coordinador de UI;
- coordinador de mecánicas;
- motor de secuencias;
- handler de persistencia;
- contenedor de reglas por version.

Eso rompe la cohesion. Cada nueva regla o mecanica tiende a terminar en el mismo archivo. La consecuencia es predecible: el costo de cambio sube de forma no lineal.

### Impacto

- Alto riesgo de regresiones cruzadas.
- Baja capacidad de razonamiento local sobre el sistema.
- Dificultad para incorporar nuevos casos sin tocar el runtime central.

---

## 3.2. Duplicacion estructural entre `App.tsx` e `InnovatecGame.tsx`

### Evidencia

`games/InnovatecGame.tsx` replica gran parte del mismo patron de `App.tsx`:

- `API_BASE_URL` (`games/InnovatecGame.tsx:47`)
- `resolveMechanics` (`games/InnovatecGame.tsx:88`)
- `SIMULATOR_CONFIGS.INNOVATEC` (`games/InnovatecGame.tsx:115`)
- multiples `setGameState(...)` distribuidos por todo el archivo (`games/InnovatecGame.tsx:197`, `379`, `476`, `641`, `735`, `1184`, etc.)

### Problema

Innovatec no extiende un runtime comun: usa un runtime paralelo. Eso implica que cada mejora transversal hay que hacerla dos veces o aceptar drift funcional.

### Impacto

- Toda capacidad transversal (persistencia, timers, comparaciones, debug, export, cierre de día) se vuelve mas cara de mantener.
- La arquitectura no escala por version; escala por bifurcacion de runtime.

### Juicio

Este es uno de los problemas mas importantes del repositorio. Mientras existan dos shells de juego con responsabilidades equivalentes, la modularidad por version sera solo parcial.

---

## 3.3. Los content packs existen, pero el comportamiento no esta realmente gobernado por ellos

### Evidencia

Existe una capa de contenido por version:

- `data/versions/index.ts`
- `data/versions/types.ts`
- `data/versions/<version>/*`

Eso es correcto como direccion general. Sin embargo, el runtime sigue dependiendo de condiciones explicitas como:

- `selectedVersion === 'CESFAM'` en multiples puntos de `App.tsx` (`761`, `1085`, `1106`, `1124`, `1364`, `1519`, `1560`, `1651`, etc.)
- `selectedVersion === 'INNOVATEC'` para derivar a una app aparte (`App.tsx:2065`)

### Problema

La version no define completamente su propio comportamiento. Parte del comportamiento esta en el pack, pero parte sigue codificada en el shell.

En otras palabras:

- **la configuracion describe contenido**;
- **el codigo central decide la mayor parte del flujo**.

### Impacto

Agregar una nueva version no consiste solo en crear `data/versions/nueva-version/*`. Tambien exige tocar `App.tsx`, potencialmente `registry.ts`, componentes y servicios especiales.

### Juicio

La arquitectura parece orientada a plugin, pero en la practica aun es un sistema con branching manual.

---

## 3.4. Las mecánicas no son plugins completos; son adaptadores de UI con mucha logica externa

### Evidencia

Los modulos de mecanica son delgados:

- `mechanics/modules/MapMechanic.tsx`
- `mechanics/modules/ScheduleMechanic.tsx`
- `mechanics/modules/OfficeMechanic.tsx`

Ejemplo:

- `MapMechanic` delega a `CesfamMap` y a `dispatch`.
- `ScheduleMechanic` calcula estados a partir de servicios externos y despacha acciones.
- `OfficeMechanic` depende de un `office` state ya armado por el contenedor y resuelve parcialmente participantes de escena en el modulo.

### Problema

La logica de mecanica no esta encapsulada. La mayor parte del comportamiento real sigue en:

- `App.tsx`
- `games/InnovatecGame.tsx`
- `services/*`
- componentes concretos (`components/CesfamMap.tsx`, `components/SchedulerInterface.tsx`, etc.)

El resultado es que la "mecanica" no es una unidad desplegable/aislable; es un conjunto disperso.

### Impacto

- Reusar una mecanica en otra version requiere conocer varios puntos del sistema.
- No hay contrato fuerte de lifecycle para mecánicas.
- No hay aislamiento claro entre estado core y estado propio de cada mecanica.

### Juicio

La modularidad de mecánicas es visual, no sistémica.

---

## 3.5. Duplicacion de registro/configuracion de mecánicas

### Evidencia

- Registro general: `mechanics/registry.ts`
- Registro Innovatec: `mechanics/innovatecRegistry.ts`
- Configuración por version: `data/simulatorConfigs.ts`

### Problema

La informacion de una mecanica esta distribuida en al menos tres lugares:

1. registro del modulo React;
2. configuracion de tabs/labels por simulador;
3. condicionales de filtrado/uso en `App.tsx` o `InnovatecGame.tsx`.

Eso aumenta la probabilidad de drift. Un sistema escalable deberia tener una sola fuente de verdad por capability.

### Impacto

- Mayor costo al agregar mecánicas nuevas.
- Riesgo de tabs registrados pero no usables, o usables pero no registrados.

---

## 3.6. Los escenarios estan separados por archivo, pero no desacoplados del motor

### Evidencia

- `data/versions/cesfam/scenarios.ts` tiene aproximadamente **2410 lineas**.
- `data/versions/innovatec/scenarios.ts` tiene aproximadamente **528 lineas**.
- Los nodos contienen simultaneamente:
  - narrativa;
  - tags psicometricos;
  - efectos sobre estado;
  - `expected_actions`;
  - `rule_id`;
  - metadata UI.

### Problema

El archivo de escenarios se transforma en una mezcla de:

- contenido narrativo;
- DSL de juego;
- configuracion de evaluacion;
- definicion de recompensas/castigos;
- hints de interfaz.

Eso tiene dos consecuencias:

1. el contenido es dificil de editar sin entender demasiado del motor;
2. cualquier evolucion del contrato tecnico obliga a tocar masivamente archivos de narrativa.

### Impacto

- Muy baja mantenibilidad editorial.
- Alto riesgo de errores semanticos silenciosos.
- Difusa separacion entre autoria de contenido y programacion del sistema.

### Juicio

La modularidad de escenarios existe a nivel de carpetas, pero no a nivel de responsabilidad.

---

## 3.7. El sistema de reglas y resolución esta duplicado entre frontend y backend

### Evidencia

En frontend:

- `services/comparisonRules.ts`
- `services/ComparisonEngine.ts`
- `services/localDayResolution.ts`
- `services/commitments_text_generator.ts`

En backend:

- `backend/main.py` contiene:
  - esquema DB (`backend/main.py:29`)
  - normalización de payload (`backend/main.py:676`)
  - handlers de reglas (`backend/main.py:575`, `588`, `613`)
  - efectos por regla (`backend/main.py:621`)
  - endpoints y queries

### Problema

El sistema mantiene dos implementaciones parciales del mismo dominio:

- matching de expected vs canonical;
- reglas por `rule_id`;
- efectos por outcome;
- normalización de días/slots.

Esto es un punto clasico de drift. Si una regla cambia en frontend y no en backend, el sistema deja de ser consistente.

### Impacto

- Resultados distintos segun donde se ejecute la evaluacion.
- Mayor dificultad para depurar promesas y resoluciones diarias.
- Riesgo operativo al persistir datos historicos inconsistentes.

### Juicio

Para escalar, la evaluacion debe tener una sola fuente de verdad.

---

## 3.8. El backend es monolitico y mezcla demasiadas capas

### Evidencia

`backend/main.py` tiene aproximadamente **1450 lineas** y combina:

- configuracion y env;
- conexion a DB;
- creacion/migracion de esquema;
- normalización de payload;
- reglas de comparacion;
- efectos;
- endpoints FastAPI;
- queries SQL;
- persistencia agregada.

### Problema

Este archivo es backend, migracion, ORM manual, rule engine y API en el mismo modulo.

### Impacto

- Baja testabilidad.
- Dificultad para introducir migraciones controladas.
- Cualquier cambio en persistencia arriesga endpoints y viceversa.

### Juicio

El backend actual no escala bien ni en complejidad ni en volumen de reglas.

---

## 3.9. Hay drift real entre tipos y datos; TypeScript no esta limpio

### Evidencia

`npx tsc --noEmit` falla. Entre los errores observados:

- contratos de `PlayerAction` no consistentes (`App.tsx:545`, `games/InnovatecGame.tsx:305`)
- uso de `import.meta.env` sin typing (`components/DataExport.tsx:32`)
- referencias DOM mal tipadas (`components/DecisionCardDeck.tsx:50`)
- estado inicial de versiones incompleto respecto a `GameState` (`data/versions/innovatec/defaults.ts:20`)
- valores de `TimeSlotType` corruptos (`data/versions/leykarin/defaults.ts:4`, `municipal/defaults.ts:4`, `sercotec/defaults.ts:4`)
- variable no definida en runtime de Innovatec (`games/InnovatecGame.tsx:551`)

### Problema

La base compila por Vite, pero no por contrato de tipos. Eso significa que el sistema esta funcionando con deuda estructural activa.

### Impacto

- Regresiones silenciosas.
- Refactors peligrosos.
- Menor confiabilidad de las herramientas del lenguaje.

---

## 3.10. Hay problemas sistemicos de encoding y normalización de texto

### Evidencia

- `types.ts:2` define `TimeSlotType = 'mañana' | 'tarde' | 'noche'`.
- pero varios defaults usan `mañana` (`data/versions/leykarin/defaults.ts:4`, `municipal/defaults.ts:4`, `sercotec/defaults.ts:4`).
- en otros puntos hay historico de `mañana`, `Mi??rcoles`, etc.

### Problema

El dominio usa texto human-readable como clave operacional, pero el encoding no es estable. Eso obliga a meter normalizaciónes defensivas repartidas por varios servicios.

### Impacto

- Reglas mas fragiles.
- Complejidad accidental en comparaciones de día/slot.
- Riesgo de errores de contenido muy costosos de detectar.

### Juicio

Hay que separar IDs internos estables de labels mostradas al usuario.

---

## 3.11. La validacion de contenido existe, pero es insuficiente para proteger el sistema

### Evidencia

- `scripts/validate_content.py` existe y pasa.
- valida duplicados basicos y referencias simples entre stakeholders, nodos y secuencias.

### Problema

No valida:

- consistencia de `rule_id`;
- shape de `expected_actions`;
- uso de `TimeSlotType` valido;
- referencias a mecánicas existentes;
- secuencias inevitables incompatibles entre si;
- efectos o constraints semanticamente mal formados.

### Impacto

Los errores mas costosos siguen entrando por contenido.

---

## 3.12. No hay una estrategia visible de tests automatizados por dominio

### Evidencia

- `package.json` no define script de `test`.
- no hay suite visible de pruebas unitarias/integracion para:
  - rule engine;
  - secuencias;
  - resolución diaria;
  - persistencia backend.

### Problema

El proyecto crecio mas alla del punto en que build manual + prueba exploratoria alcanza.

### Impacto

Cada cambio arquitectonico o narrativo complejo obliga a validacion manual cara.

---

## 4. Evaluacion frente a los principios pedidos

## 4.1. Modularidad de escenarios

### Estado actual

**Parcial**.

### Lo que si cumple

- El contenido esta segmentado por version (`data/versions/<version>`).
- Existen paquetes de contenido coherentes (`VersionContentPack`).
- Hay separacion entre stakeholders, scenarios, questions, emails, documents y defaults.

### Lo que no cumple

- El motor aun depende de IDs de secuencia y de version en codigo central.
- Los escenarios cargan demasiada semantica técnica.
- No existe una capa de DSL o schema suficientemente estricta.

### Veredicto

La estructura de carpetas es modular; la arquitectura de ejecucion no lo es del todo.

---

## 4.2. Modularidad de mecánicas

### Estado actual

**Parcial-baja**.

### Lo que si cumple

- Hay un `MechanicContext`.
- Hay registros por mecanica.
- Los componentes de UI de mecánicas estan separados.

### Lo que no cumple

- Las mecánicas no encapsulan su estado ni lifecycle.
- El runtime central conoce demasiados detalles de comportamiento.
- Hay duplicacion de registros y filtros por version.

### Veredicto

Las mecánicas son modulares como componentes, no como subsistemas.

---

## 4.3. Escalabilidad del sistema

### Estado actual

**Media-baja en frontend; baja en backend**.

### Bloqueadores principales

- shell principal sobredimensionado;
- runtime duplicado para Innovatec;
- rule engine duplicado frontend/backend;
- backend monolitico;
- tipos inconsistentes;
- ausencia de tests;
- contenido acoplado a detalles del motor.

---

## 5. Propuesta de rediseño consistente

La propuesta no consiste en "modularizar un poco mas". Eso no alcanza. La base necesita una separacion clara entre:

1. **runtime del juego**;
2. **contenido de versiones**;
3. **mecánicas**;
4. **reglas/evaluacion**;
5. **persistencia**.

## 5.1. Objetivo arquitectonico

Llevar el sistema a un modelo donde:

- agregar una nueva version sea principalmente agregar un pack;
- agregar una nueva mecanica sea registrar un plugin con contrato estable;
- cambiar una regla no requiera tocar frontend y backend por separado;
- el shell principal no conozca ids narrativos de casos particulares.

---

## 5.2. Arquitectura objetivo

### A. Core runtime unico

Crear un runtime comun, por ejemplo:

- `src/core/runtime/GameRuntime.ts`
- `src/core/runtime/useGameRuntime.ts`
- `src/core/runtime/runtimeReducer.ts`
- `src/core/runtime/sequenceEngine.ts`
- `src/core/runtime/timeEngine.ts`
- `src/core/runtime/sessionEngine.ts`

#### Responsabilidades del runtime

- cargar pack de version;
- mantener estado global;
- avanzar tiempo;
- iniciar/cerrar secuencias;
- despachar comandos a mecánicas;
- sincronizar expected/canonical actions;
- delegar resolución de reglas a un motor unico.

#### Resultado

- `App.tsx` pasa a ser shell visual.
- `InnovatecGame.tsx` desaparece como runtime paralelo.
- Innovatec pasa a ser otra configuracion/version sobre el mismo runtime.

---

### B. Version packs realmente ejecutables

Reemplazar el modelo actual de "pack de datos + condicionales en App" por un contrato de capacidad, por ejemplo:

```ts
interface VersionModule {
  id: SimulatorVersion;
  title: string;
  mechanics: VersionMechanicBinding[];
  content: VersionContentPack;
  ruleset: RulesetId;
  progression: ProgressionPolicy;
  transitions: TransitionPolicy;
}
```

#### Que debe salir de `App.tsx`

- `selectedVersion === 'CESFAM'`
- `selectedVersion === 'INNOVATEC'`
- ids hardcodeados de casos particulares

#### Que debe entrar al pack o a una policy

- reglas de desbloqueo;
- reglas de cierre del día;
- reglas de avance de caso;
- reglas de scheduler y submission;
- condiciones de finalizacion.

---

### C. Mecanicas como plugins con contrato fuerte

Unificar registro y configuracion en un solo contrato:

```ts
interface MechanicPlugin {
  id: string;
  tabs: TabDefinition[];
  reducer?: MechanicReducer;
  selectors?: MechanicSelectors;
  commands?: MechanicCommands;
  Component: React.ComponentType<MechanicProps>;
  capabilities: string[];
}
```

#### Principio

La mecanica no solo renderiza. Tambien declara:

- que comandos emite;
- que slice de estado usa;
- que capacidades requiere;
- como serializa acciones canónicas.

#### Beneficio

- Menos logica procedural en `App.tsx`.
- Reuso real entre versiones.
- Menor dependencia de componentes concretos del simulador CESFAM.

---

### D. DSL de escenarios y capa de interpretacion

Separar el contenido en dos niveles:

1. **Narrativa / authored content**
2. **Semantica de ejecucion**

#### Propuesta

Mantener TypeScript si quieres tipado y tooling, pero estructurarlo como DSL estricta:

- `nodes.ts`
- `sequences.ts`
- `effects.ts`
- `cases.ts`
- `bindings.ts`

O bien un solo archivo generado desde JSON/YAML validado por schema.

#### Regla importante

El authored content no deberia conocer detalles de infraestructura. Ejemplos de cosas que conviene sacar del escenario crudo:

- UI microcopy de tabs
- detalles de matching temporal duplicados
- efectos default por `rule_id`

Eso deberia vivir en un `ruleset` o `policy layer`.

---

### E. Motor de reglas unico

Hay dos caminos validos. Debes elegir uno, no mezclar ambos.

#### Opcion 1: backend autoritativo

- frontend solo captura expected/canonical actions
- backend resuelve comparaciones y daily effects
- frontend solo muestra resultados

#### Opcion 2: paquete compartido

- extraer reglas a `src/domain/rules/*`
- frontend y backend consumen la misma implementacion o una version generada del mismo schema

### Recomendacion

Para este proyecto, la opcion mas coherente es **backend autoritativo** si la persistencia ya es parte del producto. Si no quieres esa dependencia, entonces extrae un paquete compartido, pero no mantengas logica duplicada en archivos distintos.

---

### F. Backend por capas + migraciones reales

Separar `backend/main.py` en:

- `backend/api.py` o `backend/app.py`
- `backend/db.py`
- `backend/schema.py` o idealmente `backend/migrations/*`
- `backend/repositories/session_repository.py`
- `backend/services/normalization_service.py`
- `backend/services/rule_engine.py`
- `backend/routes/sessions.py`
- `backend/routes/health.py`

#### Principio

- rutas no hacen logica de dominio;
- servicios no conocen FastAPI;
- schema/migraciones no viven en el request path.

#### Beneficio

- testing mucho mas facil;
- despliegues mas previsibles;
- menos riesgo en cambios de datos.

---

### G. IDs estables para dominio; labels separadas para UI

Eliminar el uso de strings con acentos/encoding variable como claves del dominio.

#### Ejemplo

- interno: `MORNING`, `AFTERNOON`, `EVENING`
- UI: `mañana`, `tarde`, `noche`

- interno: `WEDNESDAY`
- UI: `Miércoles`

#### Beneficio

- menos normalización defensiva;
- menos errores por encoding;
- reglas mas simples y robustas.

---

### H. Quality gates obligatorios

Agregar como minimo:

1. `tsc --noEmit` limpio como requisito de merge
2. validacion de contenido ampliada
3. tests unitarios para ruleset
4. tests de integracion para sesiones backend
5. tests de smoke por version seleccionable

#### Validaciones nuevas recomendadas

- `rule_id` existente
- `mechanic_id` existente
- `target_ref` valido
- `TimeSlotType` y `DayOfWeek` validos
- referencias cruzadas entre cases/sequences/nodes
- detección de texto corrupto (`mañana`, `mañana`, etc.)

---

## 6. Plan de migracion propuesto

## Fase 1 - Estabilizacion técnica

Objetivo: eliminar drift y estabilizar contratos.

### Acciones

- dejar `npx tsc --noEmit` en verde;
- normalizar encoding en `types.ts`, defaults y contenido;
- extraer constantes de dominio (`TimeSlotId`, `WeekdayId`, `RuleId`, `MechanicId`);
- ampliar `validate_content.py`.

### Resultado esperado

Base consistente para refactor mayor.

---

## Fase 2 - Unificacion del runtime

Objetivo: eliminar la duplicacion `App.tsx` / `InnovatecGame.tsx`.

### Acciones

- crear `useGameRuntime`;
- mover timer, secuencias, transiciones y sync de logs a runtime comun;
- convertir Innovatec en un pack/config sobre ese runtime.

### Resultado esperado

Un solo shell operacional para todas las versiones.

---

## Fase 3 - Pluginizacion real de mecánicas

Objetivo: que las mecánicas sean unidades de extension y no solo componentes.

### Acciones

- unificar registros;
- definir contrato de plugin;
- mover comandos y serializacion canonica a cada plugin;
- reducir la dependencia del runtime central en detalles de cada mecanica.

### Resultado esperado

Mecanicas portables y menos acopladas.

---

## Fase 4 - Extracción del ruleset

Objetivo: tener una sola fuente de verdad para comparaciones y efectos.

### Acciones

- mover reglas a backend autoritativo o paquete compartido;
- eliminar duplicacion entre `services/localDayResolution.ts` y `backend/main.py`;
- hacer pruebas sobre fixtures de expected/canonical actions.

### Resultado esperado

Resolucion consistente entre frontend y backend.

---

## Fase 5 - Refactor editorial de escenarios

Objetivo: separar autoria de contenido y semantica de motor.

### Acciones

- definir schema/DSL de escenarios;
- dividir `scenarios.ts` gigantes en nodos/secuencias/casos por modulo;
- externalizar efectos default y metadatos tecnicos cuando corresponda.

### Resultado esperado

Sistema mas editable, mas auditable y mas escalable para contenido.

---

## 7. Prioridades concretas

## Prioridad 1 - Inmediata

- Corregir errores de TypeScript.
- Normalizar encoding del dominio.
- Sacar reglas/condicionales mas graves de CESFAM fuera de `App.tsx`.

## Prioridad 2 - Muy alta

- Unificar `App.tsx` e `InnovatecGame.tsx`.
- Definir una sola fuente de verdad para rules/effects.

## Prioridad 3 - Alta

- Modularizar backend.
- Ampliar validacion de contenido.
- Introducir pruebas automáticas.

## Prioridad 4 - Media

- Redise?ar DSL de escenarios.
- Introducir slices de estado por mecanica.

---

## 8. Conclusion

La base actual no esta mal orientada. Tiene ya varios conceptos correctos:

- content packs por version;
- registro de mecánicas;
- expected actions / canonical actions;
- validacion minima de contenido;
- separacion inicial entre narrativa y defaults.

Pero hoy esos conceptos conviven con una implementacion todavía demasiado centralizada y duplicada.

### Conclusi?n técnica

- **Si el objetivo es mantener solo CESFAM con cambios moderados**, la base actual puede sostenerse un tiempo con disciplina.
- **Si el objetivo es seguir agregando casos, versiones y mecánicas**, el rediseño ya no es opcional. Es necesario.

La prioridad correcta no es agregar mas features sobre `App.tsx`; es consolidar el runtime comun, extraer el motor de reglas y convertir versiones/mecánicas en extensiones reales del sistema.
