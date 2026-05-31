from uuid import UUID

try:
    from ..json_utils import to_jsonb
    from ..timezone_utils import now_chile_iso
except ImportError:
    from json_utils import to_jsonb
    from timezone_utils import now_chile_iso


def resolve_anonymous_user_id(session_id, raw_user_id):
    if not raw_user_id:
        raise ValueError("session_metadata.user_id missing")
    try:
        user_uuid = UUID(str(raw_user_id))
    except (ValueError, TypeError, AttributeError):
        raise ValueError("session_metadata.user_id must be a valid UUID v4")
    if user_uuid.version != 4:
        raise ValueError("session_metadata.user_id must be a valid UUID v4")
    return str(user_uuid)


def extract_stakeholder_id(target_ref: str | None):
    if target_ref and target_ref.startswith("stakeholder:"):
        return target_ref.split(":", 1)[1]
    return None


def find_stakeholder_by_name(stakeholders: list, name: str | None):
    if not name:
        return None
    for stakeholder in stakeholders:
        if stakeholder.get("name") == name:
            return stakeholder
    return None


def ensure_user(conn, user_id: str | None):
    if not user_id:
        return
    conn.execute(
        """
        INSERT INTO users (user_id, created_at)
        VALUES (%s, %s)
        ON CONFLICT (user_id) DO NOTHING
        """,
        (user_id, now_chile_iso()),
    )


def ensure_version(conn, version_id: str | None, created_at: str):
    if not version_id:
        return
    conn.execute(
        """
        INSERT INTO versions (version_id, created_at)
        VALUES (%s, %s)
        ON CONFLICT (version_id) DO NOTHING
        """,
        (version_id, created_at),
    )


def ensure_mechanic(conn, mechanic_id: str | None, version_id: str | None):
    if not mechanic_id:
        return
    conn.execute(
        """
        INSERT INTO mechanics (mechanic_id, version_id)
        VALUES (%s, %s)
        ON CONFLICT (mechanic_id) DO UPDATE SET
            version_id = COALESCE(mechanics.version_id, EXCLUDED.version_id)
        """,
        (mechanic_id, version_id),
    )


def ensure_stakeholder(conn, stakeholder_id: str | None, name: str | None = None, role: str | None = None):
    if not stakeholder_id:
        return
    conn.execute(
        """
        INSERT INTO stakeholders (stakeholder_id, name, role)
        VALUES (%s, %s, %s)
        ON CONFLICT (stakeholder_id) DO UPDATE SET
            name = COALESCE(EXCLUDED.name, stakeholders.name),
            role = COALESCE(EXCLUDED.role, stakeholders.role)
        """,
        (stakeholder_id, name, role),
    )


def ensure_sequence(conn, sequence_id: str | None, version_id: str | None, _stakeholder_id_unused: str | None = None):
    """Asegura que exista una fila en scenario_sequences para la FK.

    El catalogo de narrativa (scenarios_catalog) ya rellena narrative_id,
    stakeholder_ids y node_ids al boot. Esta funcion es solo fallback por si
    una sesion referencia un sequence_id que el catalogo no conoce todavia.
    """
    if not sequence_id:
        return
    conn.execute(
        """
        INSERT INTO scenario_sequences (sequence_id, version_id)
        VALUES (%s, %s)
        ON CONFLICT (sequence_id) DO UPDATE SET
            version_id = COALESCE(scenario_sequences.version_id, EXCLUDED.version_id)
        """,
        (sequence_id, version_id),
    )


def ensure_decision_reference(
    conn,
    *,
    node_id: str | None,
    option_id: str | None = None,
    option_text: str | None = None,
    sequence_id: str | None = None,
    version_id: str | None = None,
    npc_id: str | None = None,  # deprecado, ignorado (catalogo lo maneja)
    npc_role: str | None = None,  # deprecado
    npc_name: str | None = None,  # deprecado
    day: int | None = None,
    time_slot: str | None = None,
    raw_node: dict | None = None,
    raw_option: dict | None = None,
):
    """Garantiza FK targets para una decision.

    El catalogo (scenarios_catalog) pre-llena scenario_sequences, decision_nodes
    y decision_options al boot. Esta funcion solo agrega filas stub si una
    sesion referencia IDs que el catalogo no conoce (raro pero defensivo).
    """
    if sequence_id:
        ensure_sequence(conn, sequence_id, version_id)
    if not node_id:
        return
    conn.execute(
        """
        INSERT INTO decision_nodes (
            node_id, sequence_id, day, time_slot, raw_node
        )
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (node_id) DO UPDATE SET
            sequence_id = COALESCE(decision_nodes.sequence_id, EXCLUDED.sequence_id),
            day = COALESCE(EXCLUDED.day, decision_nodes.day),
            time_slot = COALESCE(EXCLUDED.time_slot, decision_nodes.time_slot),
            raw_node = COALESCE(EXCLUDED.raw_node, decision_nodes.raw_node)
        """,
        (
            node_id,
            sequence_id,
            day,
            time_slot,
            to_jsonb(raw_node),
        ),
    )
    if option_id:
        conn.execute(
            """
            INSERT INTO decision_options (node_id, option_id, option_text, is_decision, raw_option)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (node_id, option_id) DO UPDATE SET
                option_text = COALESCE(EXCLUDED.option_text, decision_options.option_text),
                is_decision = COALESCE(EXCLUDED.is_decision, decision_options.is_decision),
                raw_option = COALESCE(EXCLUDED.raw_option, decision_options.raw_option)
            """,
            (node_id, option_id, option_text, option_id != "NEXT", to_jsonb(raw_option)),
        )


def upsert_stakeholders_from_state(conn, stakeholders_state: list):
    for stakeholder in stakeholders_state:
        stakeholder_id = stakeholder.get("id") or stakeholder.get("shortId") or stakeholder.get("name")
        if not stakeholder_id:
            continue
        ensure_stakeholder(
            conn,
            stakeholder_id,
            stakeholder.get("name"),
            stakeholder.get("role"),
        )
