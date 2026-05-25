# Mapa De Archivos Del Proyecto

Este documento resume la responsabilidad principal de cada zona del proyecto.

## Raiz

| Archivo | Funcion |
|---|---|
| `App.tsx` | Launcher inicial: permite seleccionar version y renderiza la app correspondiente. |
| `index.tsx` | Punto de montaje React. |
| `index.html` | HTML base, favicons y mapa de imports del navegador. |
| `package.json` | Scripts y dependencias del frontend. |
| `types.ts` | Tipos globales del simulador: estado, escenarios, acciones, comparaciones y configuracion. |
| `constants.ts` | Re-export temporal de defaults CESFAM heredados. |
| `style.css` | Estilos globales. |

## Versiones

| Ruta | Funcion |
|---|---|
| `versions/configuration.ts` | Agrega las configuraciones de todas las versiones. |
| `versions/cesfam/GestionEnSalud_App.tsx` | Orquestador principal de la version Gestion en Salud/CESFAM. |
| `versions/innovatec/Innovatec_App.tsx` | Orquestador principal de Innovatec. |
| `versions/*/configuration.ts` | Declara mecánicas activas, labels, tabs y parametros por version. |
| `versions/*/services/*` | Reglas, efectos y resoluciones propias de una version. |
| `versions/*/components/*` | Componentes visuales propios de una version. |

## Datos Versionados

| Ruta | Funcion |
|---|---|
| `data/versions/index.ts` | Expone los paquetes de contenido por version. |
| `data/versions/types.ts` | Tipo comun de paquete de contenido versionado. |
| `data/versions/<version>/scenarios.ts` | Export agregado de escenarios de la version. |
| `data/versions/<version>/scenarios/dayXX/*` | Secuencias narrativas separadas por día. |
| `data/versions/<version>/stakeholders.ts` | NPCs, atributos internos y retratos. |
| `data/versions/<version>/emails.ts` | Plantillas de correos. |
| `data/versions/<version>/documents.ts` | Documentos consultables. |
| `data/versions/<version>/questions.ts` | Preguntas disponibles para NPCs. |
| `data/versions/<version>/defaults.ts` | Estado inicial y constantes de contenido. |

## Mecanicas

| Ruta | Funcion |
|---|---|
| `mechanics/registry.ts` | Catálogo global de mecánicas, componentes y reglas asociadas. |
| `mechanics/types.ts` | Contratos de modulos, dispatch, reglas y estado de mecánicas. |
| `mechanics/MechanicContext.tsx` | Contexto React compartido entre app y mecánicas. |
| `mechanics/modules/*` | Adaptadores enchufables que conectan una mecanica con el contexto. |
| `mechanics/<mechanic_id>/components/*` | UI autocontenida de una mecanica. |
| `mechanics/<mechanic_id>/services/*` | Servicios internos de una mecanica. |
| `mechanics/<mechanic_id>/rules.ts` | Reglas de comparacion y textos de compromisos de esa mecanica. |
| `mechanics/shared/components/*` | Visuales compartidos entre mecánicas. |

## Servicios Globales

| Archivo | Funcion |
|---|---|
| `services/MechanicEngine.ts` | Buffer central de datos crudos: eventos, acciones canónicas y expected actions. |
| `services/ComparisonEngine.ts` | Orquesta comparaciones expected vs canonical. |
| `services/comparisonRuleUtils.ts` | Helpers genericos de comparacion. La logica especifica vive en mecánicas. |
| `services/comparisonMode.ts` | Define si la comparacion se resuelve en frontend o backend. |
| `services/commitments_text_generator.ts` | Genera textos de compromisos usando templates entregados por mecánicas. |
| `services/dailyResolutionState.ts` | Aplica resoluciones diarias al estado. |
| `services/sessionExport.ts` | Construye el payload de sesión. |
| `services/sessionPersistence.ts` | Persiste o descarga sesiones. |
| `services/stakeholderResolver.ts` | Resuelve referencias entre nodos, secuencias y NPCs. |
| `services/Timelogger.ts` | Captura telemetria de proceso por nodo. |
| `services/developerAccess.ts` | Gestiona acceso local al modo desarrollador. |

## Hooks

| Archivo | Funcion |
|---|---|
| `hooks/useMechanicLogSync.ts` | Sincroniza buffers del `MechanicEngine` con `GameState`. |
| `hooks/useCommitmentsTracker.ts` | Construye y actualiza compromisos visibles al jugador. |

## Componentes Globales

| Ruta | Funcion |
|---|---|
| `components/Header.tsx` | Barra superior, estado global y resumen del día. |
| `components/Sidebar.tsx` | Navegacion lateral. |
| `components/SplashScreen.tsx` | Pantalla inicial. |
| `components/VersionSelector.tsx` | Selector de version COMPASS. |
| `components/EndGameScreen.tsx` | Cierre de simulacion. |
| `components/WarningPopup.tsx` | Popup de advertencias. |
| `components/ui/*` | Controles globales reutilizables. |

## Backend

| Ruta | Funcion |
|---|---|
| `backend/main.py` | API FastAPI, schema Postgres, ingesta y normalización de sesiones. |
| `backend/requirements.txt` | Dependencias Python del backend. |

## Assets Publicos

| Ruta | Funcion |
|---|---|
| `public/assets/common/*` | Logos, iconos y sonidos generales usados por varias versiones. |
| `public/data/versions/<version>/assets/*` | Assets especificos de cada version servidos estaticamente. |
