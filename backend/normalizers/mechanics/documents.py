try:
    from ...json_utils import float_or_none, int_or_none
    from .utils import pick_detail_value
except ImportError:
    from json_utils import float_or_none, int_or_none
    from normalizers.mechanics.utils import pick_detail_value


TABLE_NAME = "document_action_details"
HANDLER_KEY = ("documents", "read_document")


CREATE_SQL = """
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

ALTER_SQL = """
ALTER TABLE document_action_details
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS document_id TEXT,
ADD COLUMN IF NOT EXISTS read_duration_ms BIGINT,
ADD COLUMN IF NOT EXISTS scroll_depth DOUBLE PRECISION
"""


def upsert(conn, session_id: str, action: dict, value_final: dict, payload: dict):
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
            pick_detail_value(value_final, payload, "document_id", "doc_id"),
            int_or_none(pick_detail_value(value_final, payload, "read_duration_ms")),
            float_or_none(pick_detail_value(value_final, payload, "scroll_depth")),
        ),
    )
