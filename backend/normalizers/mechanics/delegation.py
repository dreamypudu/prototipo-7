try:
    from ...json_utils import int_or_none
    from .utils import pick_detail_value
except ImportError:
    from json_utils import int_or_none
    from normalizers.mechanics.utils import pick_detail_value


TABLE_NAME = "delegation_action_details"
HANDLER_KEY = ("delegation", "delegate_task")


CREATE_SQL = """
CREATE TABLE IF NOT EXISTS delegation_action_details (
    canonical_action_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    task_target_ref TEXT,
    task_title TEXT,
    task_description TEXT,
    related_stakeholder_id TEXT,
    delegated_day INTEGER,
    delegated_week INTEGER,
    FOREIGN KEY (canonical_action_id) REFERENCES canonical_actions(canonical_action_id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
)
"""

ALTER_SQL = """
ALTER TABLE delegation_action_details
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS task_target_ref TEXT,
ADD COLUMN IF NOT EXISTS task_title TEXT,
ADD COLUMN IF NOT EXISTS task_description TEXT,
ADD COLUMN IF NOT EXISTS related_stakeholder_id TEXT,
ADD COLUMN IF NOT EXISTS delegated_day INTEGER,
ADD COLUMN IF NOT EXISTS delegated_week INTEGER
"""


def upsert(conn, session_id: str, action: dict, value_final: dict, payload: dict):
    conn.execute(
        """
        INSERT INTO delegation_action_details (
            canonical_action_id, session_id, task_target_ref, task_title, task_description,
            related_stakeholder_id, delegated_day, delegated_week
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (canonical_action_id) DO UPDATE SET
            session_id = EXCLUDED.session_id,
            task_target_ref = EXCLUDED.task_target_ref,
            task_title = EXCLUDED.task_title,
            task_description = EXCLUDED.task_description,
            related_stakeholder_id = EXCLUDED.related_stakeholder_id,
            delegated_day = EXCLUDED.delegated_day,
            delegated_week = EXCLUDED.delegated_week
        """,
        (
            action.get("canonical_action_id"),
            session_id,
            pick_detail_value(value_final, payload, "task_target_ref"),
            pick_detail_value(value_final, payload, "task_title"),
            pick_detail_value(value_final, payload, "task_description"),
            pick_detail_value(value_final, payload, "related_stakeholder_id"),
            int_or_none(pick_detail_value(value_final, payload, "delegated_day")),
            int_or_none(pick_detail_value(value_final, payload, "delegated_week")),
        ),
    )
