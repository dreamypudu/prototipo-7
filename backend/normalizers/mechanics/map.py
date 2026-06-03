try:
    from ...json_utils import int_or_none
    from .utils import pick_detail_value
except ImportError:
    from json_utils import int_or_none
    from normalizers.mechanics.utils import pick_detail_value


TABLE_NAME = "map_action_details"
HANDLER_KEY = ("map", "visit_stakeholder")


# Click-stream de visitas: una fila por visita (canonical visit_stakeholder), enriquecida
# con dia/bloque, sector, rol y si habia reunion proactiva disponible. visit_order y user_id
# se completan en una pasada posterior (map_aggregates / stamp de user_id).
CREATE_SQL = """
CREATE TABLE IF NOT EXISTS map_action_details (
    canonical_action_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT,
    origin_room TEXT,
    destination_room TEXT,
    npc_id TEXT,
    npc_role TEXT,
    sector_id TEXT,
    day INTEGER,
    time_slot TEXT,
    available_proactive_meeting BOOLEAN,
    arrived_at_ms BIGINT,
    visit_order INTEGER,
    FOREIGN KEY (canonical_action_id) REFERENCES canonical_actions(canonical_action_id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
)
"""

ALTER_SQL = """
ALTER TABLE map_action_details
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS user_id TEXT,
ADD COLUMN IF NOT EXISTS origin_room TEXT,
ADD COLUMN IF NOT EXISTS destination_room TEXT,
ADD COLUMN IF NOT EXISTS npc_id TEXT,
ADD COLUMN IF NOT EXISTS npc_role TEXT,
ADD COLUMN IF NOT EXISTS sector_id TEXT,
ADD COLUMN IF NOT EXISTS day INTEGER,
ADD COLUMN IF NOT EXISTS time_slot TEXT,
ADD COLUMN IF NOT EXISTS available_proactive_meeting BOOLEAN,
ADD COLUMN IF NOT EXISTS arrived_at_ms BIGINT,
ADD COLUMN IF NOT EXISTS visit_order INTEGER,
DROP COLUMN IF EXISTS visit_duration_ms
"""


def _as_bool(value):
    if isinstance(value, bool):
        return value
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        return value.strip().lower() in ("true", "t", "1", "yes", "y")
    return None


def _pick_action_detail(action: dict, value_final: dict, payload: dict, *keys):
    value = pick_detail_value(value_final, payload, *keys)
    if value is not None:
        return value
    for key in keys:
        if action.get(key) is not None:
            return action.get(key)
    return None


def upsert(conn, session_id: str, action: dict, value_final: dict, payload: dict):
    conn.execute(
        """
        INSERT INTO map_action_details (
            canonical_action_id, session_id, origin_room, destination_room, npc_id,
            npc_role, sector_id, day, time_slot, available_proactive_meeting, arrived_at_ms
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (canonical_action_id) DO UPDATE SET
            session_id = EXCLUDED.session_id,
            origin_room = EXCLUDED.origin_room,
            destination_room = EXCLUDED.destination_room,
            npc_id = EXCLUDED.npc_id,
            npc_role = EXCLUDED.npc_role,
            sector_id = EXCLUDED.sector_id,
            day = EXCLUDED.day,
            time_slot = EXCLUDED.time_slot,
            available_proactive_meeting = EXCLUDED.available_proactive_meeting,
            arrived_at_ms = EXCLUDED.arrived_at_ms
        """,
        (
            action.get("canonical_action_id"),
            session_id,
            pick_detail_value(value_final, payload, "origin_room"),
            pick_detail_value(value_final, payload, "destination_room", "location_id"),
            pick_detail_value(value_final, payload, "npc_id", "staff_id"),
            pick_detail_value(value_final, payload, "npc_role"),
            pick_detail_value(value_final, payload, "sector_id", "location_sector"),
            int_or_none(_pick_action_detail(action, value_final, payload, "day", "committed_day")),
            _pick_action_detail(action, value_final, payload, "time_slot", "committed_time_slot"),
            _as_bool(pick_detail_value(value_final, payload, "available_proactive_meeting")),
            int_or_none(pick_detail_value(value_final, payload, "arrived_at_ms")),
        ),
    )
