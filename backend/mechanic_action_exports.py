from psycopg.types.json import Jsonb


DETAIL_TABLE_NAMES = [
    "map_action_details",
    "email_action_details",
    "document_action_details",
    "scheduler_action_details",
]


def _as_record(value):
    return value if isinstance(value, dict) else {}


def _pick_detail_value(value_final: dict, payload: dict, *keys):
    for key in keys:
        if key in payload:
            return payload.get(key)
        if key in value_final:
            return value_final.get(key)
    return None


def _as_int_or_none(value):
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _as_float_or_none(value):
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _as_bool_or_none(value):
    if value is None:
        return None
    return bool(value)


def create_mechanic_export_schema(conn):
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS map_action_details (
            canonical_action_id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            origin_room TEXT,
            destination_room TEXT,
            npc_id TEXT,
            visit_duration_ms BIGINT,
            FOREIGN KEY (canonical_action_id) REFERENCES canonical_actions(canonical_action_id) ON DELETE CASCADE,
            FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS email_action_details (
            canonical_action_id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            email_id TEXT,
            opened_count INTEGER,
            read_duration_ms BIGINT,
            reopened BOOLEAN,
            FOREIGN KEY (canonical_action_id) REFERENCES canonical_actions(canonical_action_id) ON DELETE CASCADE,
            FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS document_action_details (
            canonical_action_id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            document_id TEXT,
            read_duration_ms BIGINT,
            scroll_depth DOUBLE PRECISION,
            FOREIGN KEY (canonical_action_id) REFERENCES canonical_actions(canonical_action_id) ON DELETE CASCADE,
            FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS scheduler_action_details (
            canonical_action_id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            schedule_scope TEXT,
            week_schedule JSONB,
            assignment_count INTEGER,
            conflict_count INTEGER,
            conflicts JSONB,
            load_summary JSONB,
            submitted_at_ms BIGINT,
            FOREIGN KEY (canonical_action_id) REFERENCES canonical_actions(canonical_action_id) ON DELETE CASCADE,
            FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
        )
        """
    )
    conn.execute(
        """
        ALTER TABLE scheduler_action_details
        ADD COLUMN IF NOT EXISTS week_schedule JSONB,
        ADD COLUMN IF NOT EXISTS conflicts JSONB,
        ADD COLUMN IF NOT EXISTS load_summary JSONB
        """
    )

    for table_name in DETAIL_TABLE_NAMES:
        conn.execute(f"CREATE INDEX IF NOT EXISTS idx_{table_name}_session ON {table_name}(session_id)")


def _upsert_map_visit(conn, session_id: str, action: dict, value_final: dict, payload: dict):
    conn.execute(
        """
        INSERT INTO map_action_details (
            canonical_action_id, session_id, origin_room, destination_room, npc_id, visit_duration_ms
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (canonical_action_id) DO UPDATE SET
            session_id = EXCLUDED.session_id,
            origin_room = EXCLUDED.origin_room,
            destination_room = EXCLUDED.destination_room,
            npc_id = EXCLUDED.npc_id,
            visit_duration_ms = EXCLUDED.visit_duration_ms
        """,
        (
            action.get("canonical_action_id"),
            session_id,
            _pick_detail_value(value_final, payload, "origin_room"),
            _pick_detail_value(value_final, payload, "destination_room", "location_id"),
            _pick_detail_value(value_final, payload, "npc_id", "staff_id"),
            _as_int_or_none(_pick_detail_value(value_final, payload, "visit_duration_ms", "movement_duration_ms")),
        ),
    )


def _upsert_email_read(conn, session_id: str, action: dict, value_final: dict, payload: dict):
    conn.execute(
        """
        INSERT INTO email_action_details (
            canonical_action_id, session_id, email_id, opened_count, read_duration_ms, reopened
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (canonical_action_id) DO UPDATE SET
            session_id = EXCLUDED.session_id,
            email_id = EXCLUDED.email_id,
            opened_count = EXCLUDED.opened_count,
            read_duration_ms = EXCLUDED.read_duration_ms,
            reopened = EXCLUDED.reopened
        """,
        (
            action.get("canonical_action_id"),
            session_id,
            _pick_detail_value(value_final, payload, "email_id"),
            _as_int_or_none(_pick_detail_value(value_final, payload, "opened_count")),
            _as_int_or_none(_pick_detail_value(value_final, payload, "read_duration_ms")),
            _as_bool_or_none(_pick_detail_value(value_final, payload, "reopened")),
        ),
    )


def _upsert_document_read(conn, session_id: str, action: dict, value_final: dict, payload: dict):
    conn.execute(
        """
        INSERT INTO document_action_details (
            canonical_action_id, session_id, document_id, read_duration_ms, scroll_depth
        )
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (canonical_action_id) DO UPDATE SET
            session_id = EXCLUDED.session_id,
            document_id = EXCLUDED.document_id,
            read_duration_ms = EXCLUDED.read_duration_ms,
            scroll_depth = EXCLUDED.scroll_depth
        """,
        (
            action.get("canonical_action_id"),
            session_id,
            _pick_detail_value(value_final, payload, "document_id", "doc_id"),
            _as_int_or_none(_pick_detail_value(value_final, payload, "read_duration_ms")),
            _as_float_or_none(_pick_detail_value(value_final, payload, "scroll_depth")),
        ),
    )


def _upsert_scheduler_execute_week(conn, session_id: str, action: dict, value_final: dict, payload: dict):
    canonical_action_id = action.get("canonical_action_id")
    conn.execute(
        """
        INSERT INTO scheduler_action_details (
            canonical_action_id, session_id, schedule_scope, week_schedule, assignment_count,
            conflict_count, conflicts, load_summary, submitted_at_ms
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (canonical_action_id) DO UPDATE SET
            session_id = EXCLUDED.session_id,
            schedule_scope = EXCLUDED.schedule_scope,
            week_schedule = EXCLUDED.week_schedule,
            assignment_count = EXCLUDED.assignment_count,
            conflict_count = EXCLUDED.conflict_count,
            conflicts = EXCLUDED.conflicts,
            load_summary = EXCLUDED.load_summary,
            submitted_at_ms = EXCLUDED.submitted_at_ms
        """,
        (
            canonical_action_id,
            session_id,
            _pick_detail_value(value_final, payload, "schedule_scope"),
            Jsonb(payload.get("week_schedule") or []),
            _as_int_or_none(_pick_detail_value(value_final, payload, "assignment_count")),
            _as_int_or_none(_pick_detail_value(value_final, payload, "conflict_count")),
            Jsonb(payload.get("conflicts") or []),
            Jsonb(payload.get("load_summary") or []),
            _as_int_or_none(_pick_detail_value(value_final, payload, "submitted_at_ms")),
        ),
    )


EXPORT_HANDLERS = {
    ("map", "visit_stakeholder"): _upsert_map_visit,
    ("inbox", "read_email"): _upsert_email_read,
    ("documents", "read_document"): _upsert_document_read,
    ("scheduler", "execute_week"): _upsert_scheduler_execute_week,
}


def upsert_canonical_action_detail(conn, session_id: str, action: dict):
    canonical_action_id = action.get("canonical_action_id")
    if not canonical_action_id:
        return

    value_final = _as_record(action.get("value_final"))
    payload = value_final.get("mechanic_payload")
    payload = payload if isinstance(payload, dict) else value_final
    handler = EXPORT_HANDLERS.get((action.get("mechanic_id"), action.get("action_type")))
    if not handler:
        return
    handler(conn, session_id, action, value_final, payload)
