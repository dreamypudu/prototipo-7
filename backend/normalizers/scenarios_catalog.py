"""Carga el catalogo estatico de narrativa (narratives, scenario_sequences, decision_nodes,
decision_options, stakeholders) desde los JSON generados por
scripts/build_scenarios_catalog.py y los UPSERTea al boot del backend.

El catalogo se construye al editar contenido y commitearse al repo. El backend lo
relee cada vez que arranca, asi la base siempre refleja el ultimo contenido.
"""
from __future__ import annotations

import json
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent

# Listado de JSON catalogo, generados por scripts/build_scenarios_catalog.py.
# Para agregar otro modulo (etica, etc.), agrega su ruta aqui.
CATALOG_SOURCES: list[Path] = [
    BACKEND_ROOT
    / "data"
    / "versions"
    / "cesfam"
    / "modules"
    / "mlq5x_leadership"
    / "scenarios_catalog.json",
]


def _load_catalogs() -> list[dict]:
    catalogs: list[dict] = []
    for path in CATALOG_SOURCES:
        if not path.exists():
            continue
        catalogs.append(json.loads(path.read_text(encoding="utf-8")))
    return catalogs


def _upsert_narrative(conn, narrative: dict) -> None:
    conn.execute(
        """
        INSERT INTO narratives (narrative_id, label)
        VALUES (%s, %s)
        ON CONFLICT (narrative_id) DO UPDATE SET label = EXCLUDED.label
        """,
        (narrative["narrative_id"], narrative.get("label")),
    )


def _upsert_sequence(conn, sequence: dict) -> None:
    conn.execute(
        """
        INSERT INTO scenario_sequences (
            sequence_id, narrative_id, version_id, stakeholder_ids, node_ids
        )
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (sequence_id) DO UPDATE SET
            narrative_id = EXCLUDED.narrative_id,
            version_id = COALESCE(EXCLUDED.version_id, scenario_sequences.version_id),
            stakeholder_ids = EXCLUDED.stakeholder_ids,
            node_ids = EXCLUDED.node_ids
        """,
        (
            sequence["sequence_id"],
            sequence.get("narrative_id"),
            sequence.get("version_id"),
            sequence.get("stakeholder_ids") or [],
            sequence.get("node_ids") or [],
        ),
    )


def _upsert_node(conn, node: dict) -> None:
    conn.execute(
        """
        INSERT INTO decision_nodes (
            node_id, sequence_id, narrative_id, node_text, day, time_slot
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (node_id) DO UPDATE SET
            sequence_id = COALESCE(EXCLUDED.sequence_id, decision_nodes.sequence_id),
            narrative_id = COALESCE(EXCLUDED.narrative_id, decision_nodes.narrative_id),
            node_text = COALESCE(EXCLUDED.node_text, decision_nodes.node_text),
            day = COALESCE(EXCLUDED.day, decision_nodes.day),
            time_slot = COALESCE(EXCLUDED.time_slot, decision_nodes.time_slot)
        """,
        (
            node["node_id"],
            node.get("sequence_id"),
            node.get("narrative_id"),
            node.get("node_text"),
            node.get("day"),
            node.get("time_slot"),
        ),
    )


def _upsert_option(conn, option: dict) -> None:
    conn.execute(
        """
        INSERT INTO decision_options (node_id, option_id, option_text, is_decision)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (node_id, option_id) DO UPDATE SET
            option_text = COALESCE(EXCLUDED.option_text, decision_options.option_text),
            is_decision = EXCLUDED.is_decision
        """,
        (
            option["node_id"],
            option["option_id"],
            option.get("option_text"),
            option.get("is_decision", False),
        ),
    )


def _upsert_stakeholder(conn, stakeholder_id: str) -> None:
    if not stakeholder_id:
        return
    conn.execute(
        "INSERT INTO stakeholders (stakeholder_id) VALUES (%s) ON CONFLICT (stakeholder_id) DO NOTHING",
        (stakeholder_id,),
    )


def populate(conn) -> dict[str, int]:
    """Carga todos los catalogos y los UPSERTea. Devuelve conteos por tabla."""
    counts = {"narratives": 0, "sequences": 0, "nodes": 0, "options": 0, "stakeholders": 0}
    for catalog in _load_catalogs():
        for narrative in catalog.get("narratives") or []:
            _upsert_narrative(conn, narrative)
            counts["narratives"] += 1
        for sequence in catalog.get("sequences") or []:
            _upsert_sequence(conn, sequence)
            counts["sequences"] += 1
            for sh_id in sequence.get("stakeholder_ids") or []:
                _upsert_stakeholder(conn, sh_id)
                counts["stakeholders"] += 1
        for node in catalog.get("nodes") or []:
            _upsert_node(conn, node)
            counts["nodes"] += 1
            if node.get("stakeholder_id"):
                _upsert_stakeholder(conn, node["stakeholder_id"])
        for option in catalog.get("options") or []:
            _upsert_option(conn, option)
            counts["options"] += 1
    return counts
