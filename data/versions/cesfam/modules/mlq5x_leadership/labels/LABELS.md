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

La tabla `mlq_labels` es **per-sesión, wide-format**: contiene **una fila por cada alternativa que el jugador efectivamente eligió**, con una columna por cada variable del MLQ-5X.

Esquema:
```sql
mlq_labels (
    session_id   TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    sequence_id  TEXT NOT NULL,
    node_id      TEXT NOT NULL,
    option_id    TEXT NOT NULL,
    iia          DOUBLE PRECISION NOT NULL DEFAULT 0,
    iic          DOUBLE PRECISION NOT NULL DEFAULT 0,
    mi           DOUBLE PRECISION NOT NULL DEFAULT 0,
    ei           DOUBLE PRECISION NOT NULL DEFAULT 0,
    ci           DOUBLE PRECISION NOT NULL DEFAULT 0,
    rc           DOUBLE PRECISION NOT NULL DEFAULT 0,
    dpe_a        DOUBLE PRECISION NOT NULL DEFAULT 0,
    dpe_p        DOUBLE PRECISION NOT NULL DEFAULT 0,
    lf           DOUBLE PRECISION NOT NULL DEFAULT 0,
    PRIMARY KEY (session_id, sequence_id, node_id, option_id)
)
```

Si la opción no carga una variable, la celda guarda **0** (no NULL — simplifica las agregaciones SUM/AVG).

Mapeo de variables MLQ-5X a columnas:

| Variable original | Columna en la tabla |
|-------------------|---------------------|
| IIA               | `iia`               |
| IIC               | `iic`               |
| MI                | `mi`                |
| EI                | `ei`                |
| CI                | `ci`                |
| RC                | `rc`                |
| DPE-A             | `dpe_a`             |
| DPE-P             | `dpe_p`             |
| LF                | `lf`                |

Cuándo se escribe: dentro de `normalize_session` ([`backend/normalizers/session.py`](../../../../../../backend/normalizers/session.py)), después de `insert_explicit_decisions`. Para cada decisión del usuario se consulta el JSON catalogo en memoria y se vuelca **una fila** con los 9 scores en columnas separadas. Re-normalizar la misma sesión borra primero las filas viejas (`DERIVED_TABLES_DELETE_ORDER`).

Cuándo se actualiza el catálogo: el JSON se carga **una vez por proceso** desde el backend. Si actualizas `medianas.csv` y corres `build_mlq_labels.py`, **reinicia el backend** para que el cache se refresque.

## Replicar este patrón en otro módulo

Cuando armes un módulo nuevo (por ej. `mlq5x_ethics`):

1. **Crea la carpeta `labels/`** dentro del módulo y pon ahí un CSV con la matriz (mismo formato).
2. **Actualiza el script** ([`scripts/build_mlq_labels.py`](../../../../../../scripts/build_mlq_labels.py)): ajusta `MODULE_DIR`, `SCENARIOS_DIR`, `CSV_PATH` y `JSON_PATH` para que apunten al módulo nuevo, o parametrízalo para aceptar el módulo como argumento.
3. **Wirea el loader** en el `scenarios.ts` del módulo nuevo (mismo patrón que el de liderazgo).
4. **Agrega la fuente al backend** en [`backend/normalizers/labels.py`](../../../../../../backend/normalizers/labels.py): añade la ruta al JSON nuevo en `LABEL_SOURCES`. El cache las combina todas y resuelve por `(sequence_id, node_id, option_id)`.
5. **Corre el script** y commitea CSV + JSON.

## Análisis post-experimento (referencia)

La tabla es wide-format, así que las consultas son directas — sin pivots ni unpivots:

```sql
-- Score total del jugador por dimension (suma de todas sus elecciones del modulo)
SELECT
  session_id,
  SUM(iia)   AS iia_total,
  SUM(iic)   AS iic_total,
  SUM(mi)    AS mi_total,
  SUM(ei)    AS ei_total,
  SUM(ci)    AS ci_total,
  SUM(rc)    AS rc_total,
  SUM(dpe_a) AS dpe_a_total,
  SUM(dpe_p) AS dpe_p_total,
  SUM(lf)    AS lf_total,
  COUNT(*)   AS decisiones
FROM mlq_labels
GROUP BY session_id;

-- Detalle nodo por nodo de lo que eligio un jugador
SELECT *
FROM mlq_labels
WHERE session_id = '<UUID>'
ORDER BY sequence_id, node_id;

-- Comparar todos los jugadores en una dimension (ej. RC)
SELECT session_id, SUM(rc) AS rc_total
FROM mlq_labels
GROUP BY session_id
ORDER BY rc_total DESC;

-- Perfil transformacional vs transaccional vs evitativo por jugador
SELECT
  session_id,
  SUM(iia + iic + mi + ei + ci) AS transformacional,
  SUM(rc + dpe_a)               AS transaccional,
  SUM(dpe_p + lf)               AS evitativo
FROM mlq_labels
GROUP BY session_id;

-- Cruzar con datos demograficos del usuario
SELECT u.user_id, l.session_id, SUM(l.rc) AS rc_total, SUM(l.lf) AS lf_total
FROM mlq_labels l
JOIN sessions s ON s.session_id = l.session_id
JOIN users u    ON u.user_id    = s.user_id
GROUP BY u.user_id, l.session_id;
```

**Máximo posible y normalización** son post-hoc, fuera de la base: se calculan a partir del JSON catalogo (`mlq_labels.json`) en pandas/notebooks. La base guarda los crudos del jugador, nada más.

**Flag `visited` por nodo**: si existe fila en `mlq_labels` para un `(session_id, sequence_id, node_id)`, el jugador pasó por ese nodo y eligió una alternativa real (no `NEXT`). Si no hay fila, no pasó o solo vio narración.
