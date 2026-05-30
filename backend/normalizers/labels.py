"""Tabla mlq_labels: puntajes MLQ-5X de las alternativas QUE EL USUARIO EFECTIVAMENTE ELIGIO.

Una fila por (sesion, secuencia, nodo, opcion, variable) -- solo para opciones reales
del usuario en nodos visitados. La matriz completa (catalogo) vive en los JSON del modulo
y se aplica en runtime al decorar las opciones; la base solo guarda las trazas del jugador.
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


CREATE_SQL = """
CREATE TABLE IF NOT EXISTS mlq_labels (
    session_id TEXT NOT NULL,
    sequence_id TEXT NOT NULL,
    node_id TEXT NOT NULL,
    option_id TEXT NOT NULL,
    variable TEXT NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    PRIMARY KEY (session_id, sequence_id, node_id, option_id, variable)
)
"""

ALTER_SQL = """
ALTER TABLE mlq_labels
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS sequence_id TEXT,
ADD COLUMN IF NOT EXISTS node_id TEXT,
ADD COLUMN IF NOT EXISTS option_id TEXT,
ADD COLUMN IF NOT EXISTS variable TEXT,
ADD COLUMN IF NOT EXISTS score DOUBLE PRECISION
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


def upsert_decision_labels(conn, session_id: str, decision: dict) -> int:
    """Para UNA decision del usuario, escribe una fila por variable MLQ con su score.

    Devuelve el numero de filas insertadas/actualizadas. Si la decision no tiene IDs
    validos, es una opcion NEXT, o no existe en el catalogo, devuelve 0.
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

    rows = 0
    for variable, score in scores.items():
        conn.execute(
            """
            INSERT INTO mlq_labels (
                session_id, sequence_id, node_id, option_id, variable, score
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (session_id, sequence_id, node_id, option_id, variable) DO UPDATE SET
                score = EXCLUDED.score
            """,
            (session_id, sequence_id, node_id, option_id, variable, float(score)),
        )
        rows += 1
    return rows


def insert_decision_labels_batch(conn, session_id: str, decisions: list) -> int:
    """Invoca upsert_decision_labels para cada decision en la lista."""
    total = 0
    for decision in decisions or []:
        total += upsert_decision_labels(conn, session_id, decision)
    return total
