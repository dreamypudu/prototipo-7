try:
    from ..json_utils import as_record, first_present, int_or_none, to_jsonb
    from .common import ensure_decision_reference, ensure_mechanic, ensure_stakeholder, extract_stakeholder_id
    from .mechanics import upsert_canonical_action_detail
except ImportError:
    from json_utils import as_record, first_present, int_or_none, to_jsonb
    from normalizers.common import ensure_decision_reference, ensure_mechanic, ensure_stakeholder, extract_stakeholder_id
    from normalizers.mechanics import upsert_canonical_action_detail


COMMON_CANONICAL_KEYS = {
    "target_type",
    "target_id",
    "target_label",
    "day",
    "time_slot",
    "committed_day",
    "committed_time_slot",
    "source_node_id",
    "source_option_id",
    "summary",
}


def extract_canonical_common_and_payload(action: dict):
    value_final = as_record(action.get("value_final"))
    common = {
        key: action.get(key) if action.get(key) is not None else value_final.get(key)
        for key in COMMON_CANONICAL_KEYS
    }
    mechanic_payload = value_final.get("mechanic_payload")
    if isinstance(mechanic_payload, dict):
        return common, mechanic_payload
    if isinstance(action.get("value_final"), dict):
        return common, {
            key: value
            for key, value in value_final.items()
            if key not in COMMON_CANONICAL_KEYS
        }
    return common, action.get("value_final")


def _normalize_due_day(constraints: dict):
    return int_or_none(first_present(constraints.get("due_day"), constraints.get("day")))


def _normalize_due_time_slot(constraints: dict):
    return first_present(constraints.get("due_time_slot"), constraints.get("time_slot"), constraints.get("slot"))


def upsert_expected_action(conn, session_id: str, action: dict, version_id: str | None, fallback_id: str | None = None):
    source = as_record(action.get("source"))
    constraints = as_record(action.get("constraints"))
    effects = as_record(action.get("effects"))
    ui = as_record(action.get("ui"))
    expected_action_id = action.get("expected_action_id") or fallback_id
    if not expected_action_id:
        return None

    mechanic_id = action.get("mechanic_id")
    npc_id = action.get("stakeholder_id") or extract_stakeholder_id(action.get("target_ref"))
    ensure_mechanic(conn, mechanic_id, version_id)
    ensure_stakeholder(conn, npc_id)
    ensure_decision_reference(
        conn,
        node_id=source.get("node_id"),
        option_id=source.get("option_id"),
        version_id=version_id,
        npc_id=npc_id,
    )
    conn.execute(
        """
        INSERT INTO expected_actions (
            expected_action_id, session_id, source_node_id, source_option_id, npc_id,
            mechanic_id, action_type, target_ref, rule_id, created_at_ms, created_day,
            created_time_slot, due_day, due_time_slot, has_expected_action,
            raw_constraints, raw_effects, ui_title, ui_description
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (expected_action_id) DO UPDATE SET
            session_id = EXCLUDED.session_id,
            source_node_id = EXCLUDED.source_node_id,
            source_option_id = EXCLUDED.source_option_id,
            npc_id = EXCLUDED.npc_id,
            mechanic_id = EXCLUDED.mechanic_id,
            action_type = EXCLUDED.action_type,
            target_ref = EXCLUDED.target_ref,
            rule_id = EXCLUDED.rule_id,
            created_at_ms = EXCLUDED.created_at_ms,
            created_day = EXCLUDED.created_day,
            created_time_slot = EXCLUDED.created_time_slot,
            due_day = EXCLUDED.due_day,
            due_time_slot = EXCLUDED.due_time_slot,
            has_expected_action = EXCLUDED.has_expected_action,
            raw_constraints = EXCLUDED.raw_constraints,
            raw_effects = EXCLUDED.raw_effects,
            ui_title = EXCLUDED.ui_title,
            ui_description = EXCLUDED.ui_description
        """,
        (
            expected_action_id,
            session_id,
            source.get("node_id"),
            source.get("option_id"),
            npc_id,
            mechanic_id,
            action.get("action_type"),
            action.get("target_ref"),
            action.get("rule_id"),
            int_or_none(action.get("created_at")),
            int_or_none(action.get("created_day")),
            action.get("created_time_slot"),
            _normalize_due_day(constraints),
            _normalize_due_time_slot(constraints),
            True,
            to_jsonb(constraints),
            to_jsonb(effects),
            ui.get("title"),
            ui.get("description"),
        ),
    )
    return expected_action_id


def upsert_canonical_action(conn, session_id: str, action: dict, version_id: str | None, fallback_id: str | None = None):
    canonical_action_id = action.get("canonical_action_id") or fallback_id
    if not canonical_action_id:
        return None

    common, specific_value_final = extract_canonical_common_and_payload(action)
    mechanic_id = action.get("mechanic_id")
    ensure_mechanic(conn, mechanic_id, version_id)
    ensure_decision_reference(
        conn,
        node_id=common.get("source_node_id"),
        option_id=common.get("source_option_id"),
        version_id=version_id,
    )
    conn.execute(
        """
        INSERT INTO canonical_actions (
            canonical_action_id, session_id, mechanic_id, action_type, target_ref,
            target_type, target_id, target_label, day, time_slot, committed_day,
            committed_time_slot, source_node_id, source_option_id, summary,
            committed_at_ms, raw_value_final, raw_context, value_final, context
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (canonical_action_id) DO UPDATE SET
            session_id = EXCLUDED.session_id,
            mechanic_id = EXCLUDED.mechanic_id,
            action_type = EXCLUDED.action_type,
            target_ref = EXCLUDED.target_ref,
            target_type = EXCLUDED.target_type,
            target_id = EXCLUDED.target_id,
            target_label = EXCLUDED.target_label,
            day = EXCLUDED.day,
            time_slot = EXCLUDED.time_slot,
            committed_day = EXCLUDED.committed_day,
            committed_time_slot = EXCLUDED.committed_time_slot,
            source_node_id = EXCLUDED.source_node_id,
            source_option_id = EXCLUDED.source_option_id,
            summary = EXCLUDED.summary,
            committed_at_ms = EXCLUDED.committed_at_ms,
            raw_value_final = EXCLUDED.raw_value_final,
            raw_context = EXCLUDED.raw_context,
            value_final = EXCLUDED.value_final,
            context = EXCLUDED.context
        """,
        (
            canonical_action_id,
            session_id,
            mechanic_id,
            action.get("action_type"),
            action.get("target_ref"),
            common.get("target_type"),
            common.get("target_id"),
            common.get("target_label"),
            int_or_none(common.get("day")),
            common.get("time_slot"),
            int_or_none(common.get("committed_day")),
            common.get("committed_time_slot"),
            common.get("source_node_id"),
            common.get("source_option_id"),
            common.get("summary"),
            int_or_none(first_present(action.get("committed_at_ms"), action.get("committed_at"))),
            to_jsonb(specific_value_final),
            to_jsonb(action.get("context")),
            to_jsonb(specific_value_final),
            to_jsonb(action.get("context")),
        ),
    )
    upsert_canonical_action_detail(
        conn,
        session_id,
        {**action, **common, "canonical_action_id": canonical_action_id, "value_final": specific_value_final},
    )
    return canonical_action_id
