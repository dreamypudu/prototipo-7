try:
    from ...json_utils import bool_or_none, int_or_none
    from .utils import pick_detail_value
except ImportError:
    from json_utils import bool_or_none, int_or_none
    from normalizers.mechanics.utils import pick_detail_value


TABLE_NAME = "email_action_details"
HANDLER_KEY = ("inbox", "read_email")


CREATE_SQL = """
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

ALTER_SQL = """
ALTER TABLE email_action_details
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS email_id TEXT,
ADD COLUMN IF NOT EXISTS opened_count INTEGER,
ADD COLUMN IF NOT EXISTS read_duration_ms BIGINT,
ADD COLUMN IF NOT EXISTS reopened BOOLEAN
"""


def upsert(conn, session_id: str, action: dict, value_final: dict, payload: dict):
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
            pick_detail_value(value_final, payload, "email_id"),
            int_or_none(pick_detail_value(value_final, payload, "opened_count")),
            int_or_none(pick_detail_value(value_final, payload, "read_duration_ms")),
            bool_or_none(pick_detail_value(value_final, payload, "reopened")),
        ),
    )
