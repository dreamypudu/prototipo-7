"""Tabla mlq_labels: matriz de etiquetado MLQ-5X por (modulo, secuencia, nodo, opcion, variable).

Se popula leyendo los JSON de etiquetado generados por scripts/build_mlq_labels.py.
La tabla es referencia: una fila por puntaje de cada variable MLQ para cada alternativa.
"""
from __future__ import annotations

import json
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent

# Cada entrada: (module_id, ruta al JSON generado por build_mlq_labels.py)
LABEL_SOURCES: list[tuple[str, Path]] = [
    (
        "cesfam_mlq5x_leadership",
        BACKEND_ROOT
        / "data"
        / "versions"
        / "cesfam"
        / "modules"
        / "mlq5x_leadership"
        / "labels"
        / "mlq_labels.json",
    ),
]


CREATE_SQL = """
CREATE TABLE IF NOT EXISTS mlq_labels (
    module_id TEXT NOT NULL,
    sequence_id TEXT NOT NULL,
    node_id TEXT NOT NULL,
    option_id TEXT NOT NULL,
    variable TEXT NOT NULL,
    score DOUBLE PRECISION NOT NULL,
    PRIMARY KEY (module_id, sequence_id, node_id, option_id, variable)
)
"""

ALTER_SQL = """
ALTER TABLE mlq_labels
ADD COLUMN IF NOT EXISTS module_id TEXT,
ADD COLUMN IF NOT EXISTS sequence_id TEXT,
ADD COLUMN IF NOT EXISTS node_id TEXT,
ADD COLUMN IF NOT EXISTS option_id TEXT,
ADD COLUMN IF NOT EXISTS variable TEXT,
ADD COLUMN IF NOT EXISTS score DOUBLE PRECISION
"""


def _load_module_rows(module_id: str, json_path: Path) -> list[tuple]:
    if not json_path.exists():
        return []
    entries = json.loads(json_path.read_text(encoding="utf-8"))
    rows: list[tuple] = []
    for entry in entries:
        sequence_id = entry.get("sequence_id")
        node_id = entry.get("node_id")
        option_id = entry.get("option_id")
        scores = entry.get("scores") or {}
        if not (sequence_id and node_id and option_id):
            continue
        for variable, score in scores.items():
            try:
                score_value = float(score)
            except (TypeError, ValueError):
                continue
            rows.append((module_id, sequence_id, node_id, option_id, variable, score_value))
    return rows


def populate(conn) -> int:
    """Reemplaza por completo el contenido de mlq_labels desde los JSON declarados.

    Devuelve el numero de filas insertadas.
    """
    all_rows: list[tuple] = []
    for module_id, json_path in LABEL_SOURCES:
        all_rows.extend(_load_module_rows(module_id, json_path))

    affected_modules = sorted({row[0] for row in all_rows})
    if affected_modules:
        placeholders = ",".join(["%s"] * len(affected_modules))
        conn.execute(
            f"DELETE FROM mlq_labels WHERE module_id IN ({placeholders})",
            tuple(affected_modules),
        )

    for row in all_rows:
        conn.execute(
            """
            INSERT INTO mlq_labels (module_id, sequence_id, node_id, option_id, variable, score)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (module_id, sequence_id, node_id, option_id, variable) DO UPDATE SET
                score = EXCLUDED.score
            """,
            row,
        )
    return len(all_rows)
