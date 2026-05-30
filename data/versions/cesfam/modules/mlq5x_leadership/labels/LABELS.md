# Etiquetado MLQ-5X del módulo Liderazgo (CESFAM)

Esta carpeta contiene la **matriz de etiquetado** que asigna puntajes MLQ-5X a cada alternativa del módulo. Es la **fuente de verdad** para los puntajes; el contenido narrativo (los archivos de secuencias) ya no debería cargar esos valores inline.

## Archivos

- `mlq_labels.csv` — la matriz **editable**. La llena el equipo de expertos (mediana de la evaluación). Tres columnas de identificación + una columna por variable MLQ.
- `mlq_labels.json` — generado automáticamente desde el CSV. **No editar a mano.** Lo consume el frontend y el backend.
- `LABELS.md` — este archivo.

Ambos (CSV y JSON) se commitean al repo (decisión del proyecto: trazabilidad durante el experimento).

## Cómo actualizar el etiquetado

**Paso 1.** Edita `mlq_labels.csv` (o reemplázalo completamente).

Encabezado esperado, en este orden:
```
secuencia,nodo_id,alternativa_id,IIA,IIC,MI,EI,CI,RC,DPE-A,DPE-P,LF
```

- **secuencia**: el `sequence_id` (ej: `MLQ5X_D1_SEQUENCE_1`).
- **nodo_id**: el `node_id` (ej: `MLQ5X_D1S1_N1_RIOS_CHOICE`).
- **alternativa_id**: el `option_id` (ej: `A`, `B`, `C`).
- Una columna por cada variable MLQ-5X. Valores numéricos (enteros o decimales — la mediana puede ser 3.5).
- Celda vacía o `0` = la alternativa no carga esa variable.

**Una fila por alternativa real**. No incluyas las opciones `NEXT` (avanzar narración) — esas no se etiquetan.

**Paso 2.** Regenera el JSON:
```
python scripts/build_mlq_labels.py
```

El script:
- Valida que toda fila del CSV corresponda a una alternativa real del módulo.
- Valida que toda alternativa real del módulo tenga una fila en el CSV.
- Valida que no haya filas duplicadas, columnas faltantes, ni valores no numéricos.
- Falla con mensaje claro si algo está mal y **no escribe el JSON**.

**Paso 3.** Commit ambos archivos (`mlq_labels.csv` y `mlq_labels.json`).

## Errores comunes del script

- **`Falta etiqueta para (sequence=..., node=..., option=...)`** — agregaste una alternativa nueva en el contenido y olvidaste agregarla al CSV.
- **`la tupla (...) no existe en el modulo`** — typo en algún ID del CSV, o renombraste un nodo en el contenido sin actualizar el CSV.
- **`fila duplicada`** — tienes dos filas para la misma `(sequence, node, option)`.
- **`columnas inesperadas` / `faltan columnas`** — el encabezado del CSV no coincide. Revisa que coincida exactamente con el formato esperado.

## Variables MLQ-5X soportadas

Hoy: `IIA, IIC, MI, EI, CI, RC, DPE-A, DPE-P, LF` (9 dimensiones).

Si necesitas agregar otra (p. ej. salidas como `EE`, `EFF`, `SAT`):
1. Súmala a la constante `MLQ_VARIABLES` en `scripts/build_mlq_labels.py`.
2. Súmala al tipo `MlqAcronym` en `data/versions/cesfam/modules/mlq5x_leadership/scenarios/tags.ts`.
3. Agrega su columna al CSV.

## Cómo se aplica en runtime

1. `data/versions/cesfam/modules/mlq5x_leadership/scenarios.ts` importa `mlq_labels.json`.
2. Construye un índice `(sequence_id, node_id, option_id) → scores`.
3. Recorre todos los nodos y, por cada alternativa real, reemplaza su `tags` con `mlqTags(scores)` desde el índice.
4. Si la alternativa no aparece en el índice, conserva sus `tags` inline (fallback durante la migración).

El motor de captura (`MechanicEngine`, `decisionLog`) lee `option.tags` **igual que antes**. Cero cambio downstream.

## Cómo se exporta a la base de datos

Al boot del backend (`backend/schema.py` → `create_schema`):
1. Se crea la tabla `mlq_labels` si no existe.
2. Se borran y repueblan las filas del módulo actual desde `mlq_labels.json`.

Esquema de la tabla:
```sql
mlq_labels (
    module_id     TEXT,   -- ej. "cesfam_mlq5x_leadership"
    sequence_id   TEXT,
    node_id       TEXT,
    option_id     TEXT,
    variable      TEXT,   -- "RC", "IIA", etc.
    score         DOUBLE PRECISION,
    PRIMARY KEY (module_id, sequence_id, node_id, option_id, variable)
)
```

Una fila **por puntaje** (variable). Permite consultas SQL/pandas directas para análisis (calcular máximos por variable, joins con `explicit_decisions`, etc.).

## Replicar este patrón en otro módulo

Cuando armes un módulo nuevo (por ej. `mlq5x_ethics`):

1. **Crea la carpeta `labels/`** dentro del módulo y pon ahí un `mlq_labels.csv` con la matriz inicial.
2. **Actualiza el script** (`scripts/build_mlq_labels.py`): ajusta `MODULE_DIR` y `SCENARIOS_DIR` para que apunten al módulo nuevo, o parametriza para aceptar el módulo como argumento.
3. **Wirea el loader** en el `scenarios.ts` del módulo nuevo (mismo patrón que el de liderazgo).
4. **Agrega la fuente al backend** en `backend/normalizers/labels.py`: añade una tupla `(module_id, ruta_al_json)` a `LABEL_SOURCES`. El boot se encarga del resto.
5. **Corre el script** y commitea CSV + JSON.

## Análisis post-experimento (referencia)

La normalización no se hace en runtime. Se hace después, en pandas/SQL:

```sql
-- Score crudo del jugador por variable
SELECT
  d.session_id,
  l.variable,
  SUM(l.score) AS score_total
FROM explicit_decisions d
JOIN mlq_labels l
  ON l.sequence_id = d.sequence_id
 AND l.node_id     = d.node_id
 AND l.option_id   = d.option_id
WHERE l.module_id = 'cesfam_mlq5x_leadership'
GROUP BY d.session_id, l.variable;

-- Máximo posible por variable (módulo completo)
SELECT
  variable,
  SUM(max_score) AS max_total
FROM (
  SELECT sequence_id, node_id, variable, MAX(score) AS max_score
  FROM mlq_labels
  WHERE module_id = 'cesfam_mlq5x_leadership'
  GROUP BY sequence_id, node_id, variable
) AS per_node
GROUP BY variable;
```

El `visited` flag se deriva por LEFT JOIN entre la matriz completa y `explicit_decisions` (si hay una `option_id` elegida para ese nodo → visitado; si no → no visitado).
