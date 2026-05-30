# Etiquetado MLQ-5X del módulo Liderazgo (CESFAM)

Esta carpeta contiene la **matriz de etiquetado** que asigna puntajes MLQ-5X a cada alternativa del módulo. Es la **fuente de verdad** para los puntajes; el contenido narrativo (los archivos de secuencias) ya no debería cargar esos valores inline.

## Archivos

- `medianas.csv` — la matriz **editable**. La llena el equipo de expertos (mediana de la evaluación). Tres columnas de identificación + una columna por variable MLQ.
- `mlq_labels.json` — generado automáticamente desde el CSV por `scripts/build_mlq_labels.py`. **No editar a mano.** Lo consume el frontend y el backend.
- `LABELS.md` — este archivo.

Ambos (CSV y JSON) se commitean al repo (decisión del proyecto: trazabilidad durante el experimento).

> Si cambias el nombre del CSV o lo mueves de carpeta, actualiza la constante `CSV_PATH` en [`scripts/build_mlq_labels.py`](../../../../../../scripts/build_mlq_labels.py).

## Cómo actualizar el etiquetado

**Paso 1.** Edita `medianas.csv` (o reemplázalo completamente).

Formato:
- **Delimitador:** `;` (punto y coma).
- **Decimal:** `,` (coma) — ej. `3,5`. El script convierte a punto al parsear.
- **Codificación:** UTF-8.

Encabezado esperado (las columnas pueden venir en cualquier orden, pero deben existir todas):
```
secuencia;nodo_id;alternativa_id;IIA;IIC;MI;EI;CI;RC;DPE-A;DPE-P;LF
```

- **secuencia**: número (1, 3, 4, …). Corresponde al número final de `MLQ5X_D…_SEQUENCE_<n>`. Ej.: `1` → `MLQ5X_D1_SEQUENCE_1`; `8` → `MLQ5X_D2_SEQUENCE_8`.
- **nodo_id**: número (1, 2, …, 28). Corresponde al número del segmento `_N<n>_` dentro del `node_id`. Ej.: `1` → `MLQ5X_D1S1_N1_RIOS_CHOICE`; `22` → `MLQ5X_D3S16_N22_GUZMAN_CONVENIO_BOX1`.
- **alternativa_id**: letra `A`, `B`, `C`. El script lo mayúsculiza.
- Una columna por cada variable MLQ-5X. Valores numéricos (enteros o decimales — la mediana puede ser `3,5`).
- Celda vacía o `0` = la alternativa no carga esa variable.

**Una fila por alternativa real**. No incluyas las opciones `NEXT` (avanzar narración) — esas no se etiquetan.

**Paso 2.** Regenera el JSON:
```
python scripts/build_mlq_labels.py
```

El script:
- Mapea los IDs numéricos del CSV a los IDs completos del código (resolviendo `(secuencia, nodo_id)` a `(sequence_id, node_id)`).
- Valida que toda fila del CSV corresponda a una alternativa real del módulo.
- Valida que toda alternativa real del módulo tenga una fila en el CSV.
- Valida que no haya filas duplicadas, columnas faltantes, ni valores no numéricos.
- Falla con mensaje claro si algo está mal y **no escribe el JSON**.

**Paso 3.** Commit ambos archivos (`medianas.csv` y `mlq_labels.json`).

## Errores comunes del script

- **`Falta etiqueta para (sequence=..., node=..., option=...)`** — agregaste una alternativa nueva en el contenido y olvidaste agregarla al CSV.
- **`no existe el par (secuencia=X, nodo=Y) en el modulo`** — la numeración del CSV no coincide con ningún nodo de decisión real del código (typo, o renombraste un nodo).
- **`la opcion 'X' no existe para nodo Y de secuencia Z. Validas: [...]`** — la alternativa del CSV no existe en ese nodo.
- **`Conflicto: dos nodos comparten numeracion`** — bug en el código: dos nodos de decisión distintos comparten el mismo número `_N<n>_` dentro de la misma secuencia. Renombrar uno.
- **`fila duplicada`** — tienes dos filas para la misma `(secuencia, nodo, alternativa)`.
- **`columnas inesperadas` / `faltan columnas`** — el encabezado del CSV no coincide. Revisa nombres y delimitador (`;`).
- **`CSV mal formado: faltan columnas …` con todas las columnas listadas como faltantes** — probablemente el delimitador no es `;` (revisa si el CSV está separado por comas y conviértelo a `;`).

## Variables MLQ-5X soportadas

Hoy: `IIA, IIC, MI, EI, CI, RC, DPE-A, DPE-P, LF` (9 dimensiones).

Si necesitas agregar otra (p. ej. salidas como `EE`, `EFF`, `SAT`):
1. Súmala a la constante `MLQ_VARIABLES` en [`scripts/build_mlq_labels.py`](../../../../../../scripts/build_mlq_labels.py).
2. Súmala al tipo `MlqAcronym` en [`scenarios/tags.ts`](../scenarios/tags.ts).
3. Agrega su columna al CSV.

## Cómo se aplica en runtime

1. [`scenarios.ts`](../scenarios.ts) importa `mlq_labels.json`.
2. Construye un índice `(sequence_id, node_id, option_id) → scores`.
3. Recorre todos los nodos y, por cada alternativa real, reemplaza su `tags` con `mlqTags(scores)` desde el índice.
4. Si la alternativa no aparece en el índice, conserva sus `tags` inline (fallback durante la migración).

El motor de captura (`MechanicEngine`, `decisionLog`) lee `option.tags` **igual que antes**. Cero cambio downstream.

## Cómo se exporta a la base de datos

Al boot del backend ([`backend/schema.py`](../../../../../../backend/schema.py) → `create_schema`):
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

1. **Crea la carpeta `labels/`** dentro del módulo y pon ahí un CSV con la matriz (mismo formato).
2. **Actualiza el script** ([`scripts/build_mlq_labels.py`](../../../../../../scripts/build_mlq_labels.py)): ajusta `MODULE_DIR`, `SCENARIOS_DIR`, `CSV_PATH` y `JSON_PATH` para que apunten al módulo nuevo, o parametrízalo para aceptar el módulo como argumento.
3. **Wirea el loader** en el `scenarios.ts` del módulo nuevo (mismo patrón que el de liderazgo).
4. **Agrega la fuente al backend** en [`backend/normalizers/labels.py`](../../../../../../backend/normalizers/labels.py): añade una tupla `(module_id, ruta_al_json)` a `LABEL_SOURCES`. El boot se encarga del resto.
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
