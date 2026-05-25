try:
    from ...json_utils import int_or_none
    from .utils import pick_detail_value
except ImportError:
    from json_utils import int_or_none
    from normalizers.mechanics.utils import pick_detail_value


TABLE_NAME = "map_action_details"
HANDLER_KEY = ("map", "visit_stakeholder")


CREATE_SQL = """
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


def upsert(conn, session_id: str, action: dict, value_final: dict, payload: dict):
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
            pick_detail_value(value_final, payload, "origin_room"),
            pick_detail_value(value_final, payload, "destination_room", "location_id"),
            pick_detail_value(value_final, payload, "npc_id", "staff_id"),
            int_or_none(pick_detail_value(value_final, payload, "visit_duration_ms", "movement_duration_ms")),
        ),
    )
