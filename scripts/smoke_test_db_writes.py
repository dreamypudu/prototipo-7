#!/usr/bin/env python3
"""Smoke test: simula una sesion completa y verifica que cada modulo de normalizacion
emite los INSERT/UPSERT esperados. Usa un MockConn (no toca la base real).

Cobertura:
  - mlq_labels.populate(): cuantas filas se insertarian
  - normalize_session() con payload sintetico: cobertura por tabla
  - reporta tablas alimentadas vs huerfanas

Uso:
    python scripts/smoke_test_db_writes.py
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))

# Imports del backend
from normalizers import normalize_session  # type: ignore
from normalizers import labels as labels_module  # type: ignore


class MockResult:
    def fetchall(self):
        return []

    def fetchone(self):
        return None


class MockConn:
    """Captura llamadas a execute() sin tocar PostgreSQL."""

    def __init__(self):
        self.calls: list[tuple[str, tuple]] = []

    def execute(self, sql: str, params: tuple | list | None = ()):
        self.calls.append((sql.strip(), tuple(params) if params else ()))
        return MockResult()

    def commit(self):
        pass

    def rollback(self):
        pass

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass


def first_statement_kind(sql: str) -> str:
    """Devuelve INSERT/UPSERT/DELETE/SELECT/ALTER/CREATE."""
    sql_upper = sql.lstrip().upper()
    for kind in ("INSERT", "UPDATE", "DELETE", "SELECT", "ALTER", "CREATE", "DROP", "DO"):
        if sql_upper.startswith(kind):
            return kind
    return "OTHER"


def table_targeted(sql: str) -> str | None:
    """Extrae el nombre de tabla del primer INSERT/UPDATE/DELETE/SELECT."""
    sql_clean = re.sub(r"\s+", " ", sql).strip().upper()
    patterns = [
        r"^INSERT\s+INTO\s+([A-Z_]+)",
        r"^UPDATE\s+([A-Z_]+)",
        r"^DELETE\s+FROM\s+([A-Z_]+)",
        r"^SELECT\s+.*?\s+FROM\s+([A-Z_]+)",
    ]
    for pat in patterns:
        m = re.search(pat, sql_clean)
        if m:
            return m.group(1).lower()
    return None


def summarize_calls(calls: list[tuple[str, tuple]]) -> Counter:
    """Cuenta (verbo, tabla) -> n."""
    counter: Counter = Counter()
    for sql, _ in calls:
        kind = first_statement_kind(sql)
        table = table_targeted(sql) or "<unknown>"
        counter[(kind, table)] += 1
    return counter


def synthetic_session() -> dict:
    """Sesion minima representativa: una decision con tags MLQ, una expected_action,
    una canonical_action, un evento, una comparison, log de procesos y preguntas."""
    return {
        "session_metadata": {
            "session_id": "test-session-smoke",
            "simulator_version_id": "CESFAM",
            "user_id": "00000000-0000-4000-8000-000000000001",
            "start_time": "2026-05-30T08:00:00Z",
            "end_time": "2026-05-30T08:25:00Z",
        },
        "explicit_decisions": [
            {
                "node_id": "MLQ5X_D1S1_N1_RIOS_CHOICE",
                "sequence_id": "MLQ5X_D1_SEQUENCE_1",
                "option_id": "A",
                "option_text": "Declarar principios",
                "stakeholder_id": "daniel-rios",
                "stakeholder": "Daniel Ríos",
                "day": 3,
                "time_slot": "mañana",
                "tags": [
                    {"tag_type": "MLQ-5X", "tag_value": "IIA", "tag_score": 4},
                    {"tag_type": "MLQ-5X", "tag_value": "IIC", "tag_score": 4},
                ],
                "consequences": {"trustChange": 5, "supportChange": 5},
            }
        ],
        "expected_actions": [
            {
                "expected_action_id": "test-session-smoke:expected:1",
                "mechanic_id": "delegation",
                "action_type": "delegate_task",
                "target_ref": "task:protocolo_urgencias",
                "rule_id": "delegate_task_rule_v1",
                "stakeholder_id": "marcela-soto",
                "source": {
                    "node_id": "MLQ5X_D1S4_N9_SOTO_REPORTE",
                    "option_id": "A",
                },
                "constraints": {"day": 5},
                "effects": {},
                "ui": {"title": "Delegar protocolo", "description": "..."},
                "created_at": 1717000000000,
                "created_day": 3,
                "created_time_slot": "tarde",
            }
        ],
        "canonical_actions": [
            {
                "canonical_action_id": "test-session-smoke:canonical:1",
                "mechanic_id": "delegation",
                "action_type": "delegate_task",
                "target_ref": "task:protocolo_urgencias",
                "value_final": {
                    "summary": "Delegacion a Sofia",
                    "mechanic_payload": {
                        "task_target_ref": "task:protocolo_urgencias",
                        "task_title": "Protocolo de urgencias",
                        "task_description": "Redaccion del protocolo",
                        "related_stakeholder_id": "marcela-soto",
                        "delegated_day": 3,
                        "delegated_week": 1,
                    },
                },
                "context": {"node_id": "MLQ5X_D1S4_N9_SOTO_REPORTE"},
                "committed_at": 1717000005000,
                "day": 3,
                "time_slot": "tarde",
                "source_node_id": "MLQ5X_D1S4_N9_SOTO_REPORTE",
                "source_option_id": "A",
            }
        ],
        "mechanic_events": [
            {
                "event_id": "test-session-smoke:event:1",
                "mechanic_id": "delegation",
                "event_type": "task_delegated",
                "timestamp": 1717000005000,
                "payload": {"target_ref": "task:protocolo_urgencias", "day": 3},
            }
        ],
        "comparisons": [
            {
                "comparison_id": "test-session-smoke:comparison:1",
                "expected_action_id": "test-session-smoke:expected:1",
                "canonical_action_id": "test-session-smoke:canonical:1",
                "outcome": True,
                "reason": "matched",
                "rule_id": "delegate_task_rule_v1",
                "resolved_day": 3,
                "resolved_at_ms": 1717000006000,
            }
        ],
        "process_log": [
            {
                "node_id": "MLQ5X_D1S1_N1_RIOS_CHOICE",
                "final_choice": "A",
                "startTime": 1717000000000,
                "endTime": 1717000003000,
                "totalDuration": 3000,
                "events": [
                    {
                        "type": "hover_enter",
                        "timestamp": 1717000001000,
                        "metadata": {"option_id": "A"},
                    },
                    {
                        "type": "hover_leave",
                        "timestamp": 1717000002000,
                        "metadata": {"option_id": "A"},
                    },
                ],
            }
        ],
        "question_log": [
            {
                "npc_id": "sofia-castro",
                "question_id": "mlq_sofia_pendientes",
                "day": 3,
                "time_slot": "mañana",
                "trust_at_ask": 80,
                "support_at_ask": 100,
                "reputation_at_ask": 50,
                "timestamp": 1717000010000,
                "was_locked": False,
            }
        ],
        "final_state": {
            "stakeholders": [
                {"id": "sofia-castro", "name": "Sofía Castro", "role": "Asistente Administrativa"},
                {"id": "daniel-rios", "name": "Daniel Ríos", "role": "Jefe Sector Amarillo"},
            ],
            "completedSequences": ["MLQ5X_D1_SEQUENCE_1"],
            "completedScenarios": ["MLQ5X_D1S1_N1_RIOS_CHOICE"],
            "global": {"day": 3, "timeSlot": "tarde", "budget": 100, "reputation": 55, "projectProgress": 20},
        },
    }


def main() -> int:
    print("=== SMOKE TEST: backend normalizers ===\n")

    # 1) MLQ Labels: cache del indice y simulacion de una decision aislada
    print(">>> labels.upsert_decision_labels(decision real)")
    labels_module.reset_cache()
    sample_decision = {
        "sequence_id": "MLQ5X_D1_SEQUENCE_1",
        "node_id": "MLQ5X_D1S1_N1_RIOS_CHOICE",
        "option_id": "A",
    }
    conn = MockConn()
    n_rows = labels_module.upsert_decision_labels(conn, "test-session-smoke", sample_decision)
    print(f"    Filas insertadas/actualizadas para 1 decision (alternativa A): {n_rows}  (esperado 1, wide-format)")
    for (kind, table), n in sorted(summarize_calls(conn.calls).items()):
        print(f"      {kind:7s} {table:30s} x {n}")
    # Confirma que el INSERT lleva las 9 columnas MLQ en la tupla de params.
    insert_call = next((c for c in conn.calls if c[0].lstrip().upper().startswith("INSERT")), None)
    if insert_call:
        sql, params = insert_call
        # params = (session_id, seq, node, opt, iia, iic, mi, ei, ci, rc, dpe_a, dpe_p, lf)
        score_columns = params[4:]
        print(f"      Columnas MLQ en la fila: {score_columns}")

    # 2) normalize_session
    print("\n>>> normalize_session(synthetic_session)")
    session = synthetic_session()
    conn = MockConn()
    counts = normalize_session(conn, "test-session-smoke", session, "2026-05-30T00:00:00Z")
    print(f"    Counts reportados: {counts}")
    by_table = summarize_calls(conn.calls)
    print("    Tablas tocadas:")
    for (kind, table), n in sorted(by_table.items()):
        print(f"      {kind:7s} {table:30s} x {n}")

    # 3) Verifica que las tablas criticas reciben datos
    expected_inserts = {
        "explicit_decisions",
        "expected_actions",
        "canonical_actions",
        "mechanic_events",
        "comparisons",
        "process_logs",
        "question_log",
        "final_states",
        "delegation_action_details",
        "mlq_labels",
        "sessions",
    }
    inserted_tables = {tbl for (kind, tbl), _ in by_table.items() if kind in ("INSERT", "UPDATE")}
    missing = sorted(expected_inserts - inserted_tables)
    print("\n>>> Cobertura de tablas criticas:")
    for tbl in sorted(expected_inserts):
        status = "OK" if tbl in inserted_tables else "FALTA"
        print(f"      [{status:5s}] {tbl}")
    if missing:
        print(f"\n!!! Tablas sin insercion: {missing}")
        return 1

    # 4) Verifica que el payload incluye campos exportados pero NO normalizados
    print("\n>>> Campos exportados sin normalizer dedicado (solo se guardan en sessions.payload):")
    session_payload_keys = set(session.keys())
    normalized_keys = {
        "session_metadata",
        "explicit_decisions",
        "expected_actions",
        "canonical_actions",
        "mechanic_events",
        "comparisons",
        "process_log",
        "question_log",
        "final_state",
    }
    not_normalized = sorted(session_payload_keys - normalized_keys)
    for key in not_normalized:
        print(f"      - {key}")
    # Lo que el frontend exporta tambien:
    frontend_extra = {"daily_resolutions", "player_actions_log", "comparison_mode"}
    print("\n      (Tambien exportados por el frontend pero NO normalizados a tabla propia:")
    for key in sorted(frontend_extra):
        print(f"        - {key} -> solo en sessions.payload (JSONB))")

    print("\n=== TODO OK ===")
    return 0


if __name__ == "__main__":
    sys.exit(main())
