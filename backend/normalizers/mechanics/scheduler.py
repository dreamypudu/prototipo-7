from psycopg.types.json import Jsonb

try:
    from ...json_utils import int_or_none
    from .utils import pick_detail_value
except ImportError:
    from json_utils import int_or_none
    from normalizers.mechanics.utils import pick_detail_value


TABLE_NAME = "scheduler_action_details"
HANDLER_KEY = ("scheduler", "execute_week")


CREATE_SQL = """
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


def upsert(conn, session_id: str, action: dict, value_final: dict, payload: dict):
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
            action.get("canonical_action_id"),
            session_id,
            pick_detail_value(value_final, payload, "schedule_scope"),
            Jsonb(payload.get("week_schedule") or []),
            int_or_none(pick_detail_value(value_final, payload, "assignment_count")),
            int_or_none(pick_detail_value(value_final, payload, "conflict_count")),
            Jsonb(payload.get("conflicts") or []),
            Jsonb(payload.get("load_summary") or []),
            int_or_none(pick_detail_value(value_final, payload, "submitted_at_ms")),
        ),
    )
