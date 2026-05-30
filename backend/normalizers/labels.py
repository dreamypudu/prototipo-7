"""Tabla mlq_labels (wide-format): una fila por alternativa que el usuario EFECTIVAMENTE
ELIGIO, con una columna por cada variable del MLQ-5X.

Esquema:
    session_id, sequence_id, node_id, option_id,
    iia, iic, mi, ei, ci, rc, dpe_a, dpe_p, lf

Cuando una opcion no carga una variable (score = 0 segun el catalogo), la celda
guarda 0. La matriz completa (catalogo) vive en los JSON del modulo y se aplica
en runtime al decorar las opciones; la base solo guarda las trazas del jugador.
"""
from __future__ import annotations

import json
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent

# Fuentes JSON (catalogo) generadas por scripts/build_mlq_labels.py.
# Se cargan en memoria una vez para resolver scores cuando llega una decision.
LABEL_SOURCES: list[Path] = [
    BACKEND_ROOT
    / "data"
    / "versions"
    / "cesfam"
    / "modules"
    / "mlq5x_leadership"
    / "labels"
    / "mlq_labels.json",
]


# Orden canonico del MLQ-5X: dimensiones transformacionales -> transaccionales -> evitativas.
MLQ_COLUMNS: list[tuple[str, str]] = [
    # (clave en el JSON catalogo, nombre de columna en la tabla)
    ("IIA", "iia"),
    ("IIC", "iic"),
    ("MI", "mi"),
    ("EI", "ei"),
    ("CI", "ci"),
    ("RC", "rc"),
    ("DPE-A", "dpe_a"),
    ("DPE-P", "dpe_p"),
    ("LF", "lf"),
]

VARIABLE_TO_COLUMN: dict[str, str] = {variable: column for variable, column in MLQ_COLUMNS}
COLUMN_NAMES: list[str] = [column for _, column in MLQ_COLUMNS]


CREATE_SQL = f"""
CREATE TABLE IF NOT EXISTS mlq_labels (
    session_id TEXT NOT NULL,
    sequence_id TEXT NOT NULL,
    node_id TEXT NOT NULL,
    option_id TEXT NOT NULL,
    {", ".join(f"{col} DOUBLE PRECISION NOT NULL DEFAULT 0" for col in COLUMN_NAMES)},
    PRIMARY KEY (session_id, sequence_id, node_id, option_id)
)
"""

ALTER_SQL = f"""
ALTER TABLE mlq_labels
{", ".join(f"ADD COLUMN IF NOT EXISTS {col} DOUBLE PRECISION NOT NULL DEFAULT 0" for col in COLUMN_NAMES)}
"""


SKIPPED_OPTION_IDS = {"NEXT"}


_label_index_cache: dict[tuple[str, str, str], dict[str, float]] | None = None


def _build_label_index() -> dict[tuple[str, str, str], dict[str, float]]:
    """Carga los JSON declarados y arma {(seq_id, node_id, option_id): {var: score}}."""
    index: dict[tuple[str, str, str], dict[str, float]] = {}
    for json_path in LABEL_SOURCES:
        if not json_path.exists():
            continue
        entries = json.loads(json_path.read_text(encoding="utf-8"))
        for entry in entries:
            sequence_id = entry.get("sequence_id")
            node_id = entry.get("node_id")
            option_id = entry.get("option_id")
            scores = entry.get("scores") or {}
            if not (sequence_id and node_id and option_id):
                continue
            index[(sequence_id, node_id, option_id)] = {
                str(var): float(score) for var, score in scores.items()
            }
    return index


def _get_label_index() -> dict[tuple[str, str, str], dict[str, float]]:
    """Singleton con cache. Se construye al primer uso por proceso.

    Si actualizas el JSON con `build_mlq_labels.py`, reinicia el backend para refrescar.
    """
    global _label_index_cache
    if _label_index_cache is None:
        _label_index_cache = _build_label_index()
    return _label_index_cache


def reset_cache() -> None:
    """Limpia el cache del indice (utilizado en pruebas)."""
    global _label_index_cache
    _label_index_cache = None


_INSERT_SQL = f"""
INSERT INTO mlq_labels (
    session_id, sequence_id, node_id, option_id,
    {", ".join(COLUMN_NAMES)}
)
VALUES (%s, %s, %s, %s, {", ".join("%s" for _ in COLUMN_NAMES)})
ON CONFLICT (session_id, sequence_id, node_id, option_id) DO UPDATE SET
    {", ".join(f"{col} = EXCLUDED.{col}" for col in COLUMN_NAMES)}
"""


def upsert_decision_labels(conn, session_id: str, decision: dict) -> int:
    """Para UNA decision del usuario, escribe (o actualiza) una fila en mlq_labels
    con una columna por variable MLQ.

    Devuelve 1 si escribio fila, 0 si la decision no aplica (NEXT, sin IDs, sin catalogo).
    """
    sequence_id = decision.get("sequence_id") or decision.get("sequenceId")
    node_id = decision.get("node_id") or decision.get("nodeId")
    option_id = decision.get("option_id") or decision.get("choiceId")
    if not (sequence_id and node_id and option_id):
        return 0
    if option_id in SKIPPED_OPTION_IDS:
        return 0

    index = _get_label_index()
    scores = index.get((sequence_id, node_id, option_id))
    if not scores:
        return 0

    column_values = {column: 0.0 for column in COLUMN_NAMES}
    for variable, score in scores.items():
        column = VARIABLE_TO_COLUMN.get(variable)
        if column is None:
            continue  # variable desconocida; ignoramos en silencio
        column_values[column] = float(score)

    conn.execute(
        _INSERT_SQL,
        (
            session_id,
            sequence_id,
            node_id,
            option_id,
            *(column_values[col] for col in COLUMN_NAMES),
        ),
    )
    return 1


def insert_decision_labels_batch(conn, session_id: str, decisions: list) -> int:
    """Invoca upsert_decision_labels para cada decision en la lista."""
    total = 0
    for decision in decisions or []:
        total += upsert_decision_labels(conn, session_id, decision)
    return total
